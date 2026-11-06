"""Prepare the credited, locally served café TV clip (requires FFmpeg)."""

import argparse
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def timestamp(seconds):
    milliseconds = round(seconds * 1000)
    return f'{milliseconds // 3600000:02}:{milliseconds // 60000 % 60:02}:{milliseconds // 1000 % 60:02}.{milliseconds % 1000:03}'


def record(path):
    return {'file': path.relative_to(ROOT).as_posix(), 'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--source', type=Path, default=ROOT / 'asset-library/video/climate-reporter-source.mp4')
    args = parser.parse_args()
    specification = json.loads((ROOT / 'asset-library/video/climate-reporter.json').read_text(encoding='utf-8'))
    folder = ROOT / 'public/assets/video'
    folder.mkdir(parents=True, exist_ok=True)
    video, poster, captions = [folder / ('climate-reporter.' + extension) for extension in ['mp4', 'jpg', 'vtt']]
    subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(specification['inPoint']), '-i', str(args.source),
                    '-t', str(specification['duration']), '-vf', 'scale=960:540', '-c:v', 'libx264',
                    '-preset', 'medium', '-crf', '25', '-profile:v', 'main', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '80k', '-movflags', '+faststart', '-map_metadata', '-1', str(video)], check=True)
    subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1.2', '-i', str(video),
                    '-frames:v', '1', '-update', '1', '-q:v', '3', str(poster)], check=True)
    captions.write_text('WEBVTT\n\n' + '\n\n'.join(
        f"{timestamp(cue['start'])} --> {timestamp(cue['end'])}\n{cue['text']}"
        for cue in specification['cues']) + '\n', encoding='utf-8')
    runtime = {'file': video.name, 'poster': poster.name, 'captions': captions.name, 'label': specification['label'],
               'duration': specification['duration'], 'cues': specification['cues']}
    (ROOT / 'src/episodes/episode-01/openingBroadcast.json').write_text(json.dumps(runtime, indent=4) + '\n', encoding='utf-8')
    manifest = {'sourceFile': record(args.source.resolve()), 'assets': [record(path) for path in [video, poster, captions]],
                'ffmpeg': subprocess.check_output([args.ffmpeg, '-version'], text=True).splitlines()[0], **specification}
    (ROOT / 'asset-library/video/preparation.json').write_text(json.dumps(manifest, indent=4) + '\n', encoding='utf-8')
    print(json.dumps(manifest['assets'], indent=2))


if __name__ == '__main__':
    main()
