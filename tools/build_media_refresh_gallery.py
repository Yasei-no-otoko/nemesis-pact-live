"""Build the refreshed demo gallery from the verified full-campaign captures."""
from __future__ import annotations

import hashlib
import io
import json
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "docs/validation-media-refresh-20260915/full-campaign"
ASSETS = ROOT / "site/demo/assets"
PROVENANCE = ROOT / "site/demo/gallery-provenance.json"
RAW = ROOT / ".artifacts/media-refresh-20260915/NEMESIS-PACT-latest-full-campaign-original.webm"
FFMPEG = ROOT / ".work/browser-venv/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe"
RECORDING = "NEMESIS-PACT-latest-full-campaign-original.webm"
RECORDING_SHA = "87535f9290bd87430f8186ab92741071dad17b9fae1e8d3026467617bc1a735e"
RAW_FRAMES = ROOT / ".artifacts/gallery-source"

CAPTURES = {
    "boss-unwritten.webp": (613.0, "pc-gameplay"),
    "wave-unwritten-sky.webp": (578.0, "pc-gameplay"),
    "wave-prism-orchard.webp": (472.0, "pc-gameplay"),
    "boss-weaver.webp": (499.0, "pc-gameplay"),
    "boss-leviathan.webp": (394.0, "pc-gameplay"),
    "voice-contract.webp": ("voice-sector-6.png", "pc-interface"),
    "adaptive-review.webp": ("analysis-5-1.png", "pc-interface"),
    "flight-debrief.webp": ("flight-debrief-luna.png", "pc-interface"),
}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    old = json.loads(PROVENANCE.read_text(encoding="utf-8"))
    old_by_file = {item["file"]: item for item in old["images"]}
    refreshed = []
    RAW_FRAMES.mkdir(parents=True, exist_ok=True)
    for output_name, (source, kind) in CAPTURES.items():
        if isinstance(source, (int, float)):
            source_name = output_name.replace(".webp", ".png")
            source_path = RAW_FRAMES / source_name
            subprocess.run([str(FFMPEG), "-y", "-ss", str(source), "-i", str(RAW), "-frames:v", "1", str(source_path)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            recording_seconds = source
        else:
            source_name = source
            source_path = EVIDENCE / source_name
            recording_seconds = None
        with Image.open(source_path) as image:
            image = image.convert("RGB")
            source_rgb = image.tobytes()
            encoded_buffer = io.BytesIO()
            image.save(encoded_buffer, format="WEBP", lossless=True, method=6)
            (ASSETS / output_name).write_bytes(encoded_buffer.getvalue())
            with Image.open(ASSETS / output_name) as encoded:
                encoded_rgb = encoded.convert("RGB").tobytes()
                if encoded.size != (1920, 1080) or encoded_rgb != source_rgb:
                    raise RuntimeError(f"RGB identity check failed: {output_name}")
                entry = {
                    "file": f"assets/{output_name}",
                    "kind": kind,
                    "width": encoded.width,
                    "height": encoded.height,
                    "bytes": (ASSETS / output_name).stat().st_size,
                    "sha256": sha256_bytes((ASSETS / output_name).read_bytes()),
                    "pixelIdentityVerified": True,
                    "processing": "Lossless WebP encoding only; original dimensions, complete frame, no crop, recoloring, retouching or added objects.",
                    "source": f"docs/validation-media-refresh-20260915/full-campaign/{source_name}",
                    "sourceSha256": sha256_bytes(source_path.read_bytes()),
                }
                if recording_seconds is not None:
                    entry["recordingSeconds"] = recording_seconds
                    entry["source"] = RECORDING
                    entry["sourceSha256"] = RECORDING_SHA
                elif source_name == "voice-sector-6.png":
                    entry["recordingTimeBracketSeconds"] = [532.376, 534.924]
                elif source_name == "analysis-5-1.png":
                    entry["recordingTimeBracketSeconds"] = [591.883, 597.453]
                elif source_name == "flight-debrief-luna.png":
                    entry["recordingTimeBracketSeconds"] = [625.248, 634.740]
                refreshed.append(entry)

    concepts = [old_by_file[name] for name in ("assets/concept-v099.webp", "assets/concept-v100.webp")]
    result = {
        "version": "demo-gallery-media-refresh-2026-09-15",
        "gameVersion": "latest deployed campaign",
        "deployedGameCommit": "795e39efe609fe188646ed354268b560ea432486",
        "captureHarnessCommit": "d650d3728a4d3c7655bfed7435c5ce5ad617198d",
        "gameplayCapture": {
            "origin": "https://nemesis-pact-live.vercel.app/",
            "platform": "Windows / native Microsoft Edge 153.0.4234.32 / AMD Radeon RX 6900 XT / WebGPU",
            "operation": "Automated full campaign using ordinary game inputs and tab capture",
            "speech": "Original Microsoft Zira synthetic English player speech sent to real GPT-Live-1; GPT-5.6 Luna contract, adaptive and flight-debrief responses",
            "evidence": "docs/validation-media-refresh-20260915/full-campaign/result.json",
            "note": "These refreshed PC screenshots are from the successful current-deployment rerecord, not human operation.",
        },
        "concepts": "Previously generated imagegen visual-development boards for v0.9.9 and v1.0.0. Not game screenshots.",
        "paidApiCallsForGallery": 0,
        "totalImageBytes": sum(item["bytes"] for item in refreshed + concepts),
        "images": refreshed + concepts,
    }
    PROVENANCE.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"images": len(result["images"]), "rgbIdentityVerified": True, "assets": [x["file"] for x in refreshed]}, indent=2))


if __name__ == "__main__":
    main()
