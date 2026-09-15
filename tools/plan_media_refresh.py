"""Write the frame-accurate plan and English caption sidecar for the new run."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/validation-media-refresh-20260915/full-campaign'
ART = ROOT / '.artifacts/media-refresh-20260915'


def stamp(frame):
    ms = round(frame * 1000 / 60)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'


def main():
    capture = json.loads((OUT / 'result.json').read_text('utf-8'))
    assert capture['success'] and capture['reviewProviders'] == {'openai': 18, 'localRules': 0}
    assert capture['video']['sha256'] == '87535f9290bd87430f8186ab92741071dad17b9fae1e8d3026467617bc1a735e'
    entries = [
        (8, 13.5, 'Voice negotiation', 'NEMESIS PACT / Negotiate with your enemy\nAutomated demo, synthetic player speech, real GPT-Live-1 + Luna'),
        (13.5, 24.5, 'Interrupt and correct', 'Interrupt the rival and change the terms\nThe spoken correction asks for stronger reflections, with weaker normal shots'),
        (24.5, 32, 'Validate and sign', 'Luna validates Return to Sender; the pilot explicitly signs\nReflected damage x2.2 / normal shot damage -25%'),
        (38, 41, 'Contract in combat', 'The signed contract changes live combat\nOriginal game timing and synchronized game audio'),
        (90, 92, 'Sector 01 boss', 'Sector 01 / Verdigris Bastion\nThe first boss tests the reflection pact'),
        (99.5, 102.5, 'Adaptive review', 'Luna reviews the completed sector and raises pressure: 0 to 1\n28 eliminations / 16 reflected bullets / no hull damage'),
        (187, 190, 'Sector 02 boss', 'Sector 02 / Violet Foundry\nSix sectors, six signed voice contracts'),
        (291, 294, 'Sector 03 boss', 'Sector 03 / Crown of Ash\nFight through the same continuous campaign'),
        (394, 397, 'Sector 04 boss', 'Sector 04 / Tidal Archive\nPressure has reached adaptive level 2'),
        (499, 502, 'Sector 05 boss', 'Sector 05 / Prism Orchard\nEarned upgrades carry forward between encounters'),
        (613, 619, 'Final boss defeated', 'Sector 06 / Unwritten Sky\nThe sixth boss falls in the recorded run'),
        (626, 630, 'Campaign victory', 'Campaign complete / 6 bosses / 18 encounter reviews\n242 eliminations / 80 reflected bullets / 2 hull damage'),
        (634.5, 639.5, 'Flight debrief', 'Flight debrief / GPT-5.6 Luna reviews the recorded flight\nPlay NEMESIS PACT: nemesis-pact-live.vercel.app'),
    ]
    clips, offset = [], 0
    for begin, end, label, caption in entries:
        start, finish = round(begin * 60), round(end * 60)
        frames = finish - start
        clips.append({'label': label, 'sourceInFrame': start, 'sourceOutFrameExclusive': finish,
                      'recordOffset': offset, 'frames': frames, 'speed': 1, 'caption': caption})
        offset += frames
    assert offset == 3540
    assert all(a['sourceOutFrameExclusive'] <= b['sourceInFrame'] for a, b in zip(clips, clips[1:]))
    plan = {'sourceFile': capture['video']['filename'], 'sourceSha256': capture['video']['sha256'],
            'fps': 60, 'frames': offset, 'seconds': 59, 'clipCount': len(clips),
            'editMethod': 'Native DaVinci Resolve linked video and original audio, chronological normal-speed cuts, English TextPlus captions.',
            'sourceFrameConvention': 'CFR compatibility source; AppendToTimeline endFrame is exclusive in this Resolve runtime.',
            'clips': clips}
    (OUT / 'edit-plan.json').write_text(json.dumps(plan, indent=2) + '\n', encoding='utf-8')
    srt = '\n\n'.join(f"{i}\n{stamp(c['recordOffset'])} --> {stamp(c['recordOffset'] + c['frames'])}\n{c['caption']}" for i, c in enumerate(clips, 1))
    (ART / 'NEMESIS-PACT-latest-59s-60fps-en.srt').write_text(srt + '\n', encoding='utf-8')
    print(json.dumps({'clips': len(clips), 'frames': offset, 'seconds': offset / 60}))


if __name__ == '__main__':
    main()
