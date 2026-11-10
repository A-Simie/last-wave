"""Bake synchronized offline Kokoro dialogue and CC0/synthesized forest foley."""
import argparse
import hashlib
import json
import sys
import subprocess
import wave
import zipfile
import io
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / 'asset-library/forest'
RATE = 22050


def read_wave(path):
    with wave.open(str(path) if isinstance(path, Path) else path, 'rb') as source:
        raw = source.readframes(source.getnframes())
        if source.getsampwidth() == 3:
            parts = np.frombuffer(raw, np.uint8).reshape(-1, 3).astype(np.int32)
            packed = parts[:, 0] | parts[:, 1] << 8 | parts[:, 2] << 16
            data = ((packed ^ 0x800000) - 0x800000).astype(float) / 8388608
        else:
            width = source.getsampwidth()
            data = np.frombuffer(raw, '<i2' if width == 2 else '<i4').astype(float) / (2 ** (width * 8 - 1))
        data = data.reshape(-1, source.getnchannels()).mean(axis=1)
        if source.getframerate() != RATE:
            data = np.interp(np.arange(round(len(data) * RATE / source.getframerate())) * source.getframerate() / RATE, np.arange(len(data)), data)
        return data


def write_wave(path, data):
    with wave.open(str(path), 'wb') as output:
        output.setnchannels(1 if data.ndim == 1 else 2)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes((np.clip(data, -1, 1) * 32767).astype('<i2').tobytes())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=Path, default=ROOT / 'asset-library/source-packs/kokoro/kokoro-v1.0.int8.onnx')
    parser.add_argument('--voices', type=Path, default=ROOT / 'asset-library/source-packs/kokoro/voices-v1.0.bin')
    parser.add_argument('--ffmpeg', type=Path, required=True)
    args = parser.parse_args()
    sys.path.insert(0, str(ROOT / 'asset-library/source-packs/forest-voice-tools'))
    from kokoro_onnx import Kokoro
    engine = Kokoro(str(args.model), str(args.voices))
    script = json.loads((LIB / 'dialogue-script.json').read_text())
    output = LIB / 'audio'
    output.mkdir(exist_ok=True)
    mix = np.zeros((RATE * script['duration'], 2))
    cues = []
    previous_end = 0

    def add(samples, start, volume=1, pan=0):
        offset = round(start * RATE)
        count = min(len(samples), len(mix) - offset)
        if count <= 0:
            return
        mix[offset:offset + count, 0] += samples[:count] * volume * np.sqrt((1 - pan) / 2)
        mix[offset:offset + count, 1] += samples[:count] * volume * np.sqrt((1 + pan) / 2)

    for i, line in enumerate(script['lines']):
        target = output / f'line-{i:02}.wav'
        voice = 'af_bella' if line['speaker'] == 'Woman' else 'am_michael'
        samples, sample_rate = engine.create(line['text'], voice=voice, speed=1.0, lang='en-us')
        samples = np.interp(np.arange(round(len(samples) * RATE / sample_rate)) * sample_rate / RATE, np.arange(len(samples)), samples)
        write_wave(target, samples)
        audible = np.flatnonzero(np.abs(samples) > 0.006)
        if not len(audible):
            raise ValueError(f'Empty speech: {line["text"]}')
        samples = samples[max(0, audible[0] - 300):min(len(samples), audible[-1] + 500)]
        samples *= 0.75 / max(0.01, np.max(np.abs(samples)))
        start = max(line['start'], previous_end + 0.12)
        end = start + len(samples) / RATE
        if i == 7 and start < 19.5 or i == 9 and start < 25:
            raise ValueError('Dialogue crossed a cinematic boundary')
        if i == 6 and end > 19.5 or i == 7 and end > 22.2 or end > 34:
            raise ValueError(f'Speech needs more room: {line["text"]} ends at {end:.2f}')
        previous_end = end
        pan = max(-0.7, min(0.7, (-9 + max(0, start - 3) * 1.05 if start < 9.7 else -2 if start < 32 else -2 + (start - 32) * 2) / 12))
        add(samples, start, 0.85, pan + (-0.06 if line['speaker'] == 'Woman' else 0.06))
        cue = {'start': round(start, 3), 'end': round(end, 3), 'speaker': line['speaker'], 'text': line.get('caption', f'{line["speaker"]}: {line["text"]}')}
        cues.append(cue)
        print(f'{start:.2f}–{end:.2f}: {line["speaker"]}: {line["text"]}', flush=True)

    rng = np.random.default_rng(10112026)
    def noise(duration):
        return rng.standard_normal(round(duration * RATE))
    crack = noise(.16)
    add(crack * np.exp(-np.arange(len(crack)) / RATE * 38), 22.3, .21, -.25)
    wings = noise(3.8)
    time = np.arange(len(wings)) / RATE
    wings = np.convolve(wings, np.ones(8) / 8, 'same') * (0.25 + 0.75 * np.sin(time * 43) ** 2) * np.sin(np.pi * time / 3.8)
    add(wings, 24, .24, -.2)
    time = np.arange(round(RATE * 1.3)) / RATE
    impact = (np.sin(2 * np.pi * (82 * time - 18 * time * time)) * np.exp(-time * 4.5)
              + noise(1.3) * np.exp(-time * 15) * .55
              + .35 * np.sin(2 * np.pi * (1300 * time - 420 * time * time)) * np.exp(-time * 16))
    add(impact, 24, .6)
    scratch = noise(.7)
    add(np.diff(scratch, prepend=0) * np.exp(-np.arange(len(scratch)) / RATE * 6), 18.8, .018, .5)
    time = np.arange(RATE * 5) / RATE
    rumble = (np.sin(time * 2 * np.pi * 41) + .6 * np.sin(time * 2 * np.pi * 57)) * np.sin(np.pi * time / 5) * np.exp(-time * .3)
    add(rumble, 38, .16)
    for i in range(8):
        time = np.arange(round(RATE * .23)) / RATE
        chain = (np.sin(time * 2 * np.pi * (760 + i * 61)) + .4 * np.sin(time * 2 * np.pi * 1371)) * np.exp(-time * 25)
        add(chain, 38.4 + i * .23, .04, (-1) ** i * .4)
    with zipfile.ZipFile(LIB / 'originals/43344__tuneseeker__forest-pack-01.zip') as archive:
        steps = read_wave(io.BytesIO(archive.read('802062__tuneseeker__forest-ambience-with-footsteps-01.wav')))
    for start, duration in [(3, 6.7), (12.8, 2.6), (32, 6)]:
        samples = np.resize(steps, round(duration * RATE)).copy()
        fade = np.minimum(1, np.arange(len(samples)) / (RATE * .2)) * np.minimum(1, np.arange(len(samples))[::-1] / (RATE * .2))
        add(samples * fade, start, .16)
    mix *= min(1, .94 / np.max(np.abs(mix)))
    raw_mix = output / 'forest-story.wav'
    write_wave(raw_mix, mix)
    target = ROOT / 'public/assets/forest/forest-story.mp3'
    subprocess.run([str(args.ffmpeg), '-y', '-loglevel', 'error', '-i', str(raw_mix), '-codec:a', 'libmp3lame', '-b:a', '128k', str(target)], check=True)
    metadata = {'duration': script['duration'], 'file': target.name, 'rate': RATE, 'cues': cues,
                'voices': [{'role': 'Woman', 'voice': 'af_bella', 'gender': 'female'}, {'role': 'Man', 'voice': 'am_michael', 'gender': 'male'}],
                'model': {'name': args.model.name, 'license': 'Apache-2.0', 'sha256': hashlib.sha256(args.model.read_bytes()).hexdigest(), 'voicesSha256': hashlib.sha256(args.voices.read_bytes()).hexdigest()},
                'scare': {'start': 24, 'duration': 1.3, 'description': 'Original layered impact, metallic transient, descending sting and spatial wing burst'},
                'bytes': target.stat().st_size, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                'tool': 'kokoro-onnx 0.6.1 / Kokoro 1.0, MIT tool and Apache-2.0 weights; models are not deployed; speech is synthetic.'}
    (LIB / 'audio-preparation.json').write_text(json.dumps(metadata, indent=2) + '\n')
    (ROOT / 'src/entry/forestDialogue.ts').write_text('export const FOREST_SPEECH = ' + json.dumps(cues, indent=4, ensure_ascii=False) + ' as const;\n')
    print(f'Wrote {target.name}, {metadata["bytes"]} bytes', flush=True)


if __name__ == '__main__':
    main()
