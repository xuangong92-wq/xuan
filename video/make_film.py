"""Almoço — a short cinematic film from still photos (vertical 1080x1920)."""
import subprocess, sys, os, math
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter

SCR = os.path.dirname(os.path.abspath(__file__))
UP = "/root/.claude/uploads/51cc2f11-7860-5d2a-91c3-045e34b0d081/"
FONTS = os.path.join(SCR, "fonts")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SCR, "almoco.mp4")

W, H, FPS = 1080, 1920, 30
PX, PY, PW, PH = 60, 250, 960, 1200          # picture window (4:5 film still)
BG = np.array([10, 9, 8], np.uint8)

def font(name, size, var=None):
    f = ImageFont.truetype(os.path.join(FONTS, name), size)
    if var: f.set_variation_by_name(var)
    return f

ZH_LIGHT = lambda s: font("NotoSerifSC-Light.otf", s)
ZH_REG = lambda s: font("NotoSerifSC-Regular.otf", s)
LAT = lambda s, v="Light": font("Cormorant.ttf", s, v)
LAT_I = lambda s, v="Light Italic": font("CormorantItalic.ttf", s, v)

CREAM = (238, 228, 212)
DIM = (176, 162, 142)
GOLD = (201, 164, 107)

# ---------------------------------------------------------------- grading
def make_lut():
    x = np.arange(256) / 255.0
    s = x + 0.06 * np.sin(2 * np.pi * x) * 0          # placeholder
    base = 0.035 + 0.93 * (1 / (1 + np.exp(-5.2 * (x - 0.5))) - 0.0691) / 0.8618  # soft S, lifted blacks, rolled highlights
    r = np.clip(base * 1.025 + 0.012, 0, 1)
    g = np.clip(base * 0.995 + 0.004, 0, 1)
    b = np.clip(base * 0.93 + 0.03 * (1 - x), 0, 1)   # teal shadows, warm highlights
    return [(c * 255).astype(np.uint8) for c in (r, g, b)]
LUT = make_lut()

yy, xx = np.mgrid[0:PH, 0:PW]
d = np.sqrt(((xx - PW / 2) / (PW / 2)) ** 2 + ((yy - PH / 2) / (PH / 2)) ** 2)
VIGNETTE = (1 - 0.38 * np.clip((d - 0.55) / 0.85, 0, 1) ** 1.6)
VIGNETTE = VIGNETTE * (1 - 0.6 * np.clip((yy - (PH - 340)) / 340, 0, 1) ** 1.4)   # floor for subtitles
VIGNETTE = VIGNETTE[..., None].astype(np.float32)
rng = np.random.default_rng(7)
GRAIN = [rng.normal(0, 6.5, (PH // 2, PW // 2)).astype(np.float32) for _ in range(12)]
GRAIN = [np.kron(g, np.ones((2, 2), np.float32))[..., None] for g in GRAIN]

def grade(arr, fi):
    arr = np.stack([LUT[c][arr[..., c]] for c in range(3)], -1).astype(np.float32)
    lum = arr @ np.array([0.299, 0.587, 0.114], np.float32)
    arr = arr * 0.86 + lum[..., None] * 0.14        # gentle desaturation
    arr = arr * VIGNETTE + GRAIN[fi % len(GRAIN)]
    return np.clip(arr, 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- images
_cache = {}
def load(fid):
    if fid not in _cache:
        im = ImageOps.exif_transpose(Image.open(UP + fid + "-image.jpg")).convert("RGB")
        # scale so a 4:5 cover window at zoom 1 is ~1.35x the picture width
        iw, ih = im.size
        cover_w = min(iw, ih * PW / PH)
        s = PW * 1.35 / cover_w
        if s < 1: im = im.resize((round(iw * s), round(ih * s)), Image.LANCZOS)
        _cache[fid] = im
    return _cache[fid]

def ease(t): return t * t * (3 - 2 * t)

def picture(fid, u, a, b):
    """a,b = (cx, cy, zoom) normalised; u in [0,1]."""
    im = load(fid); iw, ih = im.size
    e = ease(u) * 0.85 + u * 0.15
    cx, cy, z = [a[i] + (b[i] - a[i]) * e for i in range(3)]
    cw = min(iw, ih * PW / PH) / z; ch = cw * PH / PW
    x0 = min(max(cx * iw - cw / 2, 0), iw - cw); y0 = min(max(cy * ih - ch / 2, 0), ih - ch)
    return np.asarray(im.resize((PW, PH), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch)))

# ---------------------------------------------------------------- text layers
def text_layer(items):
    """items: list of (text, font, color, y, tracking). Centered. Returns RGBA array."""
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(lay)
    for text, f, col, y, tr in items:
        widths = [dr.textlength(ch, font=f) for ch in text]
        total = sum(widths) + tr * (len(text) - 1)
        x = (W - total) / 2
        for ch, w in zip(text, widths):
            dr.text((x, y), ch, font=f, fill=col + (255,), anchor="ls"); x += w + tr
    return np.asarray(lay).astype(np.float32)

def sub_layer(zh, en):
    # film subtitle sitting inside the lower part of the still, with soft shadow
    lay = text_layer([(zh, ZH_LIGHT(44), CREAM, PY + PH - 112, 3),
                      (en, LAT_I(36), (226, 214, 196), PY + PH - 58, 1)])
    a = Image.fromarray(lay[..., 3].astype(np.uint8)).filter(ImageFilter.GaussianBlur(9))
    sh = np.asarray(a).astype(np.float32)[..., None] / 255 * 0.85
    return lay, sh

def chapter_layer(num, word, zh):
    return text_layer([(f"{num}  ·  {word}", LAT_I(50, "Italic"), GOLD, 175, 2),
                       (zh, ZH_LIGHT(30), DIM, 222, 14)])

# ---------------------------------------------------------------- shots
SHOTS = []
def photo(fid, dur, a, b, zh, en, chap=None):
    SHOTS.append(dict(kind="photo", fid=fid, dur=dur, a=a, b=b,
                      sub=sub_layer(zh, en), chap=chapter_layer(*chap) if chap else None))
def card(dur, items):
    SHOTS.append(dict(kind="card", dur=dur, lay=text_layer(items)))

card(3.4, [("Thuwal, Saudi Arabia", LAT_I(46), DIM, 900, 3),
           ("红海边，一个周末的中午。", ZH_LIGHT(46), CREAM, 1000, 6)])
photo("6874c973", 3.8, (0.5, 0.42, 1.0), (0.5, 0.36, 1.12),
      "朋友邀请我，去他们家吃午饭。", "Some friends invited me over for lunch.")
photo("3517581d", 4.0, (0.5, 0.45, 1.0), (0.52, 0.58, 1.16),
      "这个家真正的主人，是它。", "The real head of the house.")
card(3.6, [("ALMOÇO", LAT(132), CREAM, 930, 26),
           ("午   饭", ZH_LIGHT(44), GOLD, 1030, 8),
           ("a Brazilian lunch by the Red Sea", LAT_I(38), DIM, 1110, 2)])
photo("dc8072c5", 4.4, (0.36, 0.5, 1.0), (0.62, 0.5, 1.06),
      "米饭，豆子，炖肉，木薯粉。", "Rice, beans, stew, farofa.")
photo("4715f52b", 3.2, (0.5, 0.5, 1.05), (0.5, 0.48, 1.2),
      "粒粒分明。", "Every grain on its own.", ("I", "Arroz", "米 饭"))
photo("c26beccf", 3.2, (0.48, 0.5, 1.18), (0.5, 0.46, 1.04),
      "巴西人几乎每天都要吃。", "Eaten almost every day in Brazil.", ("II", "Feijão", "豆 子"))
photo("27989073", 3.2, (0.5, 0.42, 1.0), (0.48, 0.4, 1.15),
      "炒香的木薯粉，撒在饭上。", "Toasted cassava flour, sprinkled on top.", ("III", "Farofa", "木 薯 粉"))
photo("0b5702df", 4.2, (0.45, 0.48, 1.22), (0.5, 0.5, 1.0),
      "简单，却是一个国家的味道。", "Simple — and the taste of a whole country.", ("IV", "O Prato", "一 盘"))
photo("77fbbc17", 3.2, (0.42, 0.55, 1.0), (0.4, 0.55, 1.12),
      "饭后，一小杯咖啡。", "And after lunch, a little coffee.", ("V", "Cafezinho", "小 咖 啡"))
photo("93a33454", 3.0, (0.5, 0.4, 1.0), (0.48, 0.42, 1.14),
      "屋子里的小物件，", "Little things around the house,")
photo("75d2ce07", 3.6, (0.42, 0.48, 1.25), (0.55, 0.45, 1.02),
      "一整面墙，是他们走过的世界。", "a whole wall of places they have been,")
photo("e85bd0fc", 3.0, (0.42, 0.5, 1.08), (0.4, 0.62, 1.2),
      "伊斯坦布尔，马德里，巴伊亚……", "Istanbul, Madrid, Bahia…")
photo("e15d1133", 3.8, (0.5, 0.62, 1.0), (0.5, 0.6, 1.18),
      "还有，他们自己。", "and the two of them.")
card(4.4, [("离家很远的地方，", ZH_LIGHT(50), CREAM, 900, 6),
           ("也有一顿像家一样的饭。", ZH_LIGHT(50), CREAM, 990, 6)])
card(3.6, [("Obrigado.", LAT_I(110, "Light Italic"), CREAM, 960, 2),
           ("午饭  ·  ALMOÇO  ·  2026", LAT(32, "Regular"), DIM, 1060, 6)])

XF = 0.7  # crossfade between consecutive shots

# ---------------------------------------------------------------- rendering
def alpha_env(t, dur, start, fade=0.7, out=0.55):
    if t < start: return 0.0
    v = min(1.0, (t - start) / fade)
    v = min(v, max(0.0, (dur - t) / out))
    return ease(max(0.0, min(1.0, v)))

def over(base, lay, a, dy=0):
    if a <= 0: return base
    if dy:
        lay = np.roll(lay, int(round(dy)), axis=0)
    al = lay[..., 3:4] / 255 * a
    return base * (1 - al) + lay[..., :3] * al

def render(shot, t, fi):
    fr = np.empty((H, W, 3), np.float32); fr[:] = BG
    dur = shot["dur"]
    if shot["kind"] == "card":
        a = alpha_env(t, dur, 0.35, fade=1.0, out=0.8)
        return over(fr, shot["lay"], a, dy=(1 - a) * 14)
    pic = grade(picture(shot["fid"], t / dur, shot["a"], shot["b"]), fi).astype(np.float32)
    lay, sh = shot["sub"]
    a = alpha_env(t, dur, 0.55)
    if a > 0:
        region = lay[PY:PY + PH, PX:PX + PW]
        pic = pic * (1 - sh[PY:PY + PH, PX:PX + PW] * a)
        al = region[..., 3:4] / 255 * a
        pic = pic * (1 - al) + region[..., :3] * al
    fr[PY:PY + PH, PX:PX + PW] = pic
    if shot["chap"] is not None:
        fr = over(fr, shot["chap"], alpha_env(t, dur, 0.15, fade=0.9))
    return fr

starts, t0 = [], 0.0
for i, s in enumerate(SHOTS):
    starts.append(t0); t0 += s["dur"] - (XF if i < len(SHOTS) - 1 else 0)
TOTAL = t0
NF = int(TOTAL * FPS)

def frame(fi):
    t = fi / FPS
    active = [i for i, st in enumerate(starts) if st <= t < st + SHOTS[i]["dur"]]
    out = None
    for i in active:
        lt = t - starts[i]; s = SHOTS[i]
        img = render(s, lt, fi)
        w = 1.0
        if i > 0 and lt < XF: w = ease(lt / XF)               # fade in over previous
        out = img if out is None else out * (1 - w) + img * w
    if out is None: out = np.zeros((H, W, 3), np.float32) + BG
    if fi < FPS * 0.8: out = out * ease(fi / (FPS * 0.8))
    if fi > NF - FPS * 1.2: out = out * ease(max(0, NF - fi) / (FPS * 1.2))
    return np.clip(out, 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- score
def score(seconds, sr=44100):
    rng = np.random.default_rng(3)
    n = int(seconds * sr); mix = np.zeros(n + sr * 4, np.float32)
    def pluck(midi, t, vel, length=2.6, bright=0.5):
        f = 440 * 2 ** ((midi - 69) / 12); N = max(2, int(sr / f))
        L = int(length * sr); buf = rng.uniform(-1, 1, N).astype(np.float32)
        for _ in range(int(3 + (1 - bright) * 6)):        # soften the excitation (nylon)
            buf = 0.5 * (buf + np.roll(buf, 1))
        decay = 0.9965 if midi > 52 else 0.998
        out = np.zeros(L + 2 * N, np.float32); out[:N] = buf
        k = N
        while k < L:                                       # Karplus-Strong, one period per step
            prev = out[k - N:k]
            lag = out[k - N - 1:k - 1] if k > N else np.concatenate([[0], out[:N - 1]])
            out[k:k + N] = decay * 0.5 * (prev + lag)
            k += N
        out = out[:L]
        out *= vel * np.minimum(1, np.arange(L) / (0.004 * sr))
        s = int(t * sr); e = min(len(mix), s + L); mix[s:e] += out[:e - s]
    bpm = 92; beat = 60 / bpm; bar = 4 * beat
    prog = [(50, [53, 57, 60, 64]), (43, [53, 59, 64]), (48, [52, 55, 59, 62]), (45, [55, 61, 65]),
            (50, [53, 57, 60, 64]), (43, [53, 59, 64]), (52, [55, 59, 62, 64]), (45, [55, 61, 64])]
    comp = [0, 3, 6, 10, 13]                                # bossa comping, eighths over 2 bars
    bars = int(seconds / bar) + 1
    for b in range(bars):
        root, chord = prog[b % len(prog)]; tb = b * bar + 0.6
        if tb > seconds: break
        pluck(root - 12 if root > 47 else root, tb, 0.55)
        pluck((root + 7) - 12 if root > 47 else root + 7, tb + 2 * beat, 0.45)
        for e8 in comp:
            if e8 // 8 != b % 2: continue
            tc = tb + (e8 % 8) * beat / 2 + rng.uniform(-0.006, 0.006)
            for j, m in enumerate(chord):
                pluck(m, tc + j * 0.011, 0.16 + rng.uniform(0, 0.03), length=1.4, bright=0.35)
    # a few sparse melody notes (harmonic-like, high & soft)
    mel = [(2, 76), (3.5, 74), (6, 72), (7.5, 71), (10, 69), (12, 76), (13.5, 77), (16, 74)]
    for bb, m in mel:
        if bb * bar < seconds - 4: pluck(m, bb * bar + 0.6 + beat, 0.22, length=3.0, bright=0.6)
    # room reverb
    ir_len = int(1.9 * sr); ir = rng.normal(0, 1, ir_len).astype(np.float32)
    ir *= np.exp(-np.arange(ir_len) / (0.42 * sr)); ir[0] = 0; ir /= np.sqrt((ir ** 2).sum())
    nfft = 1 << int(np.ceil(np.log2(len(mix) + ir_len)))
    wet = np.fft.irfft(np.fft.rfft(mix, nfft) * np.fft.rfft(ir, nfft), nfft)[:len(mix)].astype(np.float32)
    y = (mix * 0.8 + wet * 0.35)[:n]
    env = np.ones(n, np.float32); fi_, fo = int(1.5 * sr), int(3.5 * sr)
    env[:fi_] = np.linspace(0, 1, fi_); env[-fo:] = np.linspace(1, 0, fo) ** 1.5
    y = y * env; y = y / (np.abs(y).max() + 1e-9) * 0.6
    return np.stack([y, np.roll(y, int(0.012 * sr)) * 0.96], -1)  # light stereo width

if __name__ == "__main__" and os.environ.get("PREVIEW"):
    for sec in map(float, os.environ["PREVIEW"].split(",")):
        Image.fromarray(frame(int(sec * FPS))).save(os.path.join(SCR, f"prev_{sec:05.1f}.png"))
    print("total", TOTAL); sys.exit()

if __name__ == "__main__":
    import wave
    wav = os.path.join(SCR, "score.wav")
    a = (score(TOTAL) * 32767).astype(np.int16)
    with wave.open(wav, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(44100); w.writeframes(a.tobytes())
    print(f"total {TOTAL:.1f}s, {NF} frames", flush=True)
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", wav,
                          "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
                          "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT],
                         stdin=subprocess.PIPE)
    for fi in range(NF):
        p.stdin.write(frame(fi).tobytes())
        if fi % 150 == 0: print(fi, flush=True)
    p.stdin.close(); p.wait()
    print("done", OUT)
