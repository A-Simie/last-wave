"""Render the café music; optionally regenerate the reserved synthetic bulletin."""

import argparse
import hashlib
import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RATE = 22050


def write_wave(path, samples):
    samples = np.clip(samples, -1, 1)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1 if samples.ndim == 1 else samples.shape[1])
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes((samples * 32767).astype("<i2").tobytes())


def narrate(piper, model, sentences, output):
    parts = [np.zeros(int(RATE * 0.6))]
    cues = []
    with tempfile.TemporaryDirectory(prefix="last-wave-voice-") as directory:
        for index, text in enumerate(sentences):
            path = Path(directory) / f"sentence-{index}.wav"
            subprocess.run(
                [str(piper), "--model", str(model), "--output_file", str(path),
                 "--length_scale", "1.03", "--noise_scale", "0.45"],
                input=text + "\n", text=True, check=True,
            )
            with wave.open(str(path), "rb") as source:
                if source.getframerate() != RATE or source.getnchannels() != 1:
                    raise ValueError("The LJ Speech medium voice must output 22050 Hz mono.")
                samples = np.frombuffer(source.readframes(source.getnframes()), dtype="<i2") / 32768
            start = sum(len(part) for part in parts) / RATE
            cues.append({"start": round(start, 3), "end": round(start + len(samples) / RATE, 3), "text": text})
            parts.extend([samples, np.zeros(int(RATE * 0.3))])
    speech = np.concatenate(parts)
    speech = (speech + np.roll(speech, 1) + np.roll(speech, 2)) / 3
    speech *= 0.88 / max(np.max(np.abs(speech)), 0.01)
    write_wave(output, speech)
    return cues, len(speech) / RATE


def music(output):
    beat = 60 / 76
    duration = beat * 32
    count = round(duration * RATE)
    mix = np.zeros((count, 2))
    rng = np.random.default_rng(1701)

    def add(samples, when, pan=0):
        indices = (round(when * RATE) + np.arange(len(samples))) % count
        mix[indices, 0] += samples * np.sqrt((1 - pan) / 2)
        mix[indices, 1] += samples * np.sqrt((1 + pan) / 2)

    def note(midi, length, strength, bass=False):
        t = np.arange(round(length * RATE)) / RATE
        frequency = 440 * 2 ** ((midi - 69) / 12)
        phase = 2 * np.pi * frequency * t
        sound = np.sin(phase + 0.7 * np.exp(-t * 3) * np.sin(phase * 2))
        sound += 0.12 * np.sin(phase * 3) * np.exp(-t * 4)
        envelope = (1 - np.exp(-t * 90)) * np.exp(-t / (0.8 if bass else 1.7))
        envelope *= np.minimum(1, np.maximum(0, length - t) * 12)
        return strength * envelope * sound

    chords = [(50, [62, 66, 69, 73]), (47, [62, 66, 69, 71]),
              (52, [62, 64, 67, 71]), (45, [61, 64, 67, 71])]
    melody = [78, 76, 73, 69, 74, 73, 71, 69]
    for bar in range(8):
        bass, chord = chords[bar % 4]
        start = bar * 4 * beat
        for offset in [0, 1.5, 3]:
            for index, midi in enumerate(chord):
                add(note(midi, beat * 2.7, 0.082), start + (offset + index * 0.035) * beat, (index - 1.5) * 0.2)
        for offset in [0, 2.5]:
            add(note(bass - 12, beat * 1.7, 0.19, bass=True), start + offset * beat, -0.08)
        add(note(melody[bar], beat * 2, 0.052), start + 2.75 * beat, 0.32)
        for offset in np.arange(0, 4, 0.5):
            t = np.arange(round(RATE * 0.11)) / RATE
            noise = rng.standard_normal(len(t))
            brush = np.diff(noise, prepend=0) * np.exp(-t * 55) * (1 - np.exp(-t * 1200))
            add(brush * (0.007 if offset % 1 else 0.011), start + offset * beat, -0.22)
    dry = mix.copy()
    for delay, gain in [(0.073, 0.11), (0.149, 0.07), (0.227, 0.04)]:
        mix += np.roll(dry[:, ::-1], round(delay * RATE), axis=0) * gain
    mix *= 0.7 / max(np.max(np.abs(mix)), 0.01)
    write_wave(output, mix)
    return duration


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--piper", type=Path)
    parser.add_argument("--model", type=Path)
    args = parser.parse_args()
    if bool(args.piper) != bool(args.model):
        parser.error("Supply both --piper and --model to regenerate the reserved bulletin.")
    folder = ROOT / "public/assets/audio"
    folder.mkdir(parents=True, exist_ok=True)
    voice_path = ROOT / "asset-library/audio/coastal-bulletin.wav"
    music_path = folder / "tideline-afternoon.wav"
    manifest_path = ROOT / "asset-library/audio/preparation.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    if args.piper:
        source = json.loads((ROOT / "asset-library/audio/opening-script.json").read_text(encoding="utf-8"))
        cues, duration = narrate(args.piper.resolve(), args.model.resolve(), source["sentences"], voice_path)
        manifest.update({
            "tool": "Piper 2023.11.14-2 (MIT), offline asset preparation only",
            "toolUrl": "https://github.com/rhasspy/piper/releases/tag/2023.11.14-2",
            "voice": source["voice"],
            "voiceUrl": "https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/medium",
            "voiceSha256": hashlib.sha256(args.model.read_bytes()).hexdigest(),
            "dataset": "LJ Speech / LibriVox, public domain",
            "datasetUrl": "https://keithito.com/LJ-Speech-Dataset/",
            "bulletin": {"file": voice_path.name, "duration": round(duration, 3), "cues": cues}
        })
    music_duration = music(music_path)
    runtime = {"music": {"file": music_path.name, "duration": round(music_duration, 3)}}
    (ROOT / "src/episodes/episode-01/openingAudio.json").write_text(json.dumps(runtime, indent=4) + "\n", encoding="utf-8")
    manifest.update({
        "composition": "Original deterministic synthesis for Last Wave; no third-party samples.",
        "bulletinUsage": "Reserved outside runtime assets. The TV uses the credited original video and voice.",
        "assets": [{"file": path.relative_to(ROOT).as_posix(), "bytes": path.stat().st_size,
                    "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
                   for path in [voice_path, music_path] if path.exists()],
        **runtime,
    })
    manifest_path.write_text(json.dumps(manifest, indent=4) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
