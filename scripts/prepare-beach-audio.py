import hashlib
import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RATE = 22050
DURATION = 24


def main():
    rng = np.random.default_rng(301)
    count = RATE * DURATION
    t = np.arange(count) / RATE
    frequencies = np.fft.rfftfreq(count, 1 / RATE)
    spectrum = rng.normal(size=len(frequencies)) + 1j * rng.normal(size=len(frequencies))
    spectrum *= np.sqrt(frequencies / (frequencies + 180)) / np.sqrt(frequencies + 180)
    spectrum *= np.exp(-(frequencies / 4200) ** 2)
    spectrum[0] = 0
    noise = np.fft.irfft(spectrum, n=count)
    noise /= np.std(noise)
    surf = noise * (0.045 + 0.085 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 6)) ** 2)
    for start, pitch in [(4.4, 1250), (12.6, 1420), (20.2, 1160)]:
        local = np.arange(round(RATE * 0.95)) / RATE
        frequency = pitch + 240 * np.sin(np.pi * local / 0.95) + 28 * np.sin(local * 45)
        phase = 2 * np.pi * np.cumsum(frequency) / RATE
        call = np.sin(phase) * np.sin(np.pi * local / 0.95) ** 3 * 0.02
        offset = round(start * RATE)
        surf[offset:offset + len(call)] += call
    samples = np.clip(surf, -0.8, 0.8)
    path = ROOT / 'public/assets/audio/seafront-afternoon.wav'
    with wave.open(str(path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes((samples * 32767).astype('<i2').tobytes())
    runtime = {'file': path.name, 'duration': DURATION}
    manifest = {'composition': 'Original deterministic surf and distant gull synthesis for Last Wave; no third-party samples.',
                'script': 'scripts/prepare-beach-audio.py', 'seed': 301, 'sampleRate': RATE, 'channels': 1,
                'file': path.relative_to(ROOT).as_posix(), 'duration': DURATION,
                'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    (ROOT / 'asset-library/audio/beach-preparation.json').write_text(json.dumps(manifest, indent=4) + '\n', encoding='utf-8')
    (ROOT / 'src/episodes/episode-01/beachAudio.json').write_text(json.dumps(runtime, indent=4) + '\n', encoding='utf-8')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    main()
