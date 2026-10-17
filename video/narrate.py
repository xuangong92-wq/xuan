"""Voice-over (English narrator + Brazilian Portuguese words) and a fuller bossa nova score for Almoço."""
import io, os, sys, wave, subprocess
import numpy as np
from piper import PiperVoice, SynthesisConfig

SCR = os.path.dirname(os.path.abspath(__file__))
VO = os.path.join(SCR, "voices")
SR = 44100
TOTAL = 47.1
NARRATOR = sys.argv[1] if len(sys.argv) > 1 else "en_US-lessac-high"
MUSIC_LEVEL = 0.2   # soft background bed under the English voice

# (start seconds, voice, text)  N = English narrator, P = Brazilian Portuguese voice
LINES = [
    (0.7,  "N", "Saturday noon, by the Red Sea."),
    (3.1,  "N", "My Brazilian friends invited me over for lunch."),
    (6.2,  "N", "And this... is the real boss of the house. Super cute, right?"),
    (9.9,  "N", "Lunch, Brazilian style."),
    (12.6, "N", "They cooked me a really local Brazilian lunch."),
    (16.1, "N", "Rice."),
    (18.6, "N", "Beans. Every single day."),
    (21.1, "N", "And farofa. Toasted cassava flour. So crunchy!"),
    (23.8, "N", "Put it all together. Simple, but so Brazilian."),
    (27.1, "N", "And a little coffee, after lunch."),
    (29.8, "N", "Their home is full of little treasures,"),
    (32.0, "N", "a whole wall of places they've been,"),
    (34.8, "N", "Istanbul, Madrid, Bahia,"),
    (37.1, "N", "and a painting of the two of them."),
    (40.2, "N", "Far from home... you can still find a meal that feels like home."),
    (44.2, "N", "Thank you, my friends."),
]

def resample(x, sr_in):
    t_out = np.arange(int(len(x) * SR / sr_in)) / SR
    return np.interp(t_out, np.arange(len(x)) / sr_in, x).astype(np.float32)

voices = {"N": PiperVoice.load(os.path.join(VO, NARRATOR + ".onnx")),
          "P": PiperVoice.load(os.path.join(VO, "pt_BR-faber-medium.onnx"))}
cfg = {"N": SynthesisConfig(length_scale=0.93, noise_scale=0.6, noise_w_scale=0.75),
       "P": SynthesisConfig(length_scale=1.0, noise_scale=0.6, noise_w_scale=0.7)}

def synth(v, text):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voices[v].synthesize_wav(text, w, syn_config=cfg[v])
    buf.seek(0)
    with wave.open(buf) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
    x = resample(x.astype(np.float32), sr)
    nz = np.where(np.abs(x) > 0.01)[0]                    # trim silence
    return x[max(0, nz[0] - 400): nz[-1] + 2000] if len(nz) else x

voice = np.zeros(int((TOTAL + 2) * SR), np.float32)
cursor = 0.0
for start, v, text in LINES:
    clip = synth(v, text)
    t = max(start, cursor + 0.12)
    if t > start + 0.05: print(f"  shifted {text!r} {start}->{t:.2f}")
    s = int(t * SR); voice[s:s + len(clip)] += clip * (0.95 if v == "N" else 0.85)
    cursor = t + len(clip) / SR
print(f"voice ends at {cursor:.2f}s (video {TOTAL}s)")
voice = voice[:int(TOTAL * SR)]

# light voice polish: gentle high-pass + presence via simple filters
def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    # vectorised IIR via lfilter-free trick: process in python only once (short signal)
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
low = onepole_lp(voice, 90.0)
voice = voice - low                                           # remove rumble

# ---------------------------------------------------------------- score
rng = np.random.default_rng(11)
n = int(TOTAL * SR); mus = np.zeros(n + SR * 4, np.float32)

def ks(midi, length, decay, soft, vel):
    f = 440 * 2 ** ((midi - 69) / 12); N = max(2, int(SR / f)); L = int(length * SR)
    buf = rng.uniform(-1, 1, N).astype(np.float32)
    for _ in range(soft): buf = 0.5 * (buf + np.roll(buf, 1))
    out = np.zeros(L + 2 * N, np.float32); out[:N] = buf; k = N
    while k < L:
        lag = out[k - N - 1:k - 1] if k > N else np.concatenate([[0], out[:N - 1]])
        out[k:k + N] = decay * 0.5 * (out[k - N:k] + lag); k += N
    out = out[:L] * vel * np.minimum(1, np.arange(L) / (0.003 * SR))
    return out

def add(sig, t, gain=1.0, pan=0.0):
    s = int(t * SR); e = min(len(mus), s + len(sig))
    if s < len(mus): mus[s:e] += sig[:e - s] * gain

bpm = 100; beat = 60 / bpm; bar = 4 * beat
prog = [(50, [53, 57, 60, 64]), (43, [53, 59, 64, 69]), (48, [52, 55, 59, 62]), (45, [55, 61, 65]),
        (50, [53, 57, 60, 64]), (43, [53, 59, 64]), (52, [55, 59, 62, 64]), (45, [55, 61, 64, 67])]
comp = [0, 3, 6, 10, 13]            # bossa comping over 2 bars (eighths)
clave = [0, 3, 6, 10, 12]           # rim-click pattern (bossa clave, eighths over 2 bars)
t0 = 0.4
bars = int((TOTAL - t0) / bar) + 1
click = np.exp(-np.arange(int(0.03 * SR)) / (0.004 * SR)).astype(np.float32)
click = click * np.sin(2 * np.pi * 1700 * np.arange(len(click)) / SR)
kick_t = np.arange(int(0.25 * SR)) / SR
kick = (np.sin(2 * np.pi * (55 + 40 * np.exp(-kick_t * 30)) * kick_t) * np.exp(-kick_t * 14)).astype(np.float32)

for b in range(bars):
    root, chord = prog[b % len(prog)]; tb = t0 + b * bar
    intro = b < 2                                   # guitar alone for the first two bars
    # bass (low, round): root on 1, fifth on 3 with dotted pickup
    if not intro:
        add(ks(root - 12, 1.2, 0.997, 12, 0.7), tb)
        add(ks(root - 5, 0.6, 0.997, 12, 0.35), tb + 1.5 * beat)
        add(ks(root - 5, 1.2, 0.997, 12, 0.6), tb + 2 * beat)
        add(ks(root - 12, 0.6, 0.997, 12, 0.35), tb + 3.5 * beat)
    # nylon guitar comping
    for e8 in comp:
        if e8 // 8 != b % 2: continue
        tc = tb + (e8 % 8) * beat / 2 + rng.uniform(-0.005, 0.005)
        for j, m in enumerate(chord):
            add(ks(m, 1.3, 0.9965, 4, 0.17 + rng.uniform(0, 0.03)), tc + j * 0.010)
    if intro: continue
    # percussion: shaker 16ths, rim clave, soft surdo-style kick
    for s16 in range(16):
        L = int(0.05 * SR); nz = rng.normal(0, 1, L).astype(np.float32)
        nz = np.diff(nz, prepend=0) * np.exp(-np.arange(L) / (0.012 * SR))
        add(nz, tb + s16 * beat / 4, 0.022 * (1.6 if s16 % 4 == 2 else 1.0))
    for e8 in clave:
        if e8 // 8 != b % 2: continue
        add(click, tb + (e8 % 8) * beat / 2, 0.12)
    add(kick, tb, 0.25); add(kick, tb + 2 * beat, 0.18)

# melody: sparse high guitar line (a simple, singable bossa phrase)
phrase = [(0, 74, 1.5), (1.5, 72, 0.5), (2, 69, 2), (4, 71, 1.5), (5.5, 72, 0.5), (6, 74, 2),
          (8, 76, 1.5), (9.5, 74, 0.5), (10, 72, 2), (12, 71, 1), (13, 69, 1), (14, 67, 2)]
for rep in (4, 12):
    for bt, m, dur in phrase:
        t = t0 + rep * bar + bt * beat
        if t < TOTAL - 3: add(ks(m, dur * beat + 0.8, 0.998, 2, 0.24), t)

# room reverb
ir_len = int(1.6 * SR); ir = rng.normal(0, 1, ir_len).astype(np.float32)
ir *= np.exp(-np.arange(ir_len) / (0.35 * SR)); ir[0] = 0; ir /= np.sqrt((ir ** 2).sum())
nfft = 1 << int(np.ceil(np.log2(len(mus) + ir_len)))
wet = np.fft.irfft(np.fft.rfft(mus, nfft) * np.fft.rfft(ir, nfft), nfft)[:len(mus)].astype(np.float32)
mus = (mus * 0.85 + wet * 0.3)[:n]
mus /= np.abs(mus).max() + 1e-9

# duck music under the voice
envv = np.abs(voice); k = int(0.25 * SR)
envv = np.convolve(envv, np.ones(k, np.float32) / k, mode="same")
duck = 1 - 0.6 * np.clip(envv / 0.04, 0, 1)
k2 = int(0.15 * SR); duck = np.convolve(duck, np.ones(k2) / k2, mode="same").astype(np.float32)
fade = np.ones(n, np.float32); fade[:int(1.2 * SR)] = np.linspace(0, 1, int(1.2 * SR))
fade[-int(3 * SR):] = np.linspace(1, 0, int(3 * SR)) ** 1.5
mix = mus * MUSIC_LEVEL * duck * fade + voice * 0.9
mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
stereo = np.stack([mix, mix], -1)
out = os.path.join(SCR, f"mix_{NARRATOR}.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
with wave.open(os.path.join(SCR, f"voice_{NARRATOR}.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(voice, -1, 1) * 32767).astype(np.int16).tobytes())
with wave.open(os.path.join(SCR, "music_only.wav"), "wb") as w:
    m = mus * fade * 0.89
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.stack([m, m], -1) * 32767).astype(np.int16).tobytes())
print("wrote", out)
