"""Portable browser and evidence-path helpers for Windows and Linux CI."""
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]

def browser_path(explicit=None):
    candidates = [explicit, os.environ.get('NEMESIS_BROWSER'),
        r'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        r'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        r'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return str(candidate)
    return None

def launch_kwargs(explicit=None, headless=True):
    path = browser_path(explicit)
    kwargs = {'headless': headless}
    if path:
        kwargs['executable_path'] = path
    return kwargs

def evidence_dir(name='browser'):
    value = os.environ.get('NEMESIS_VALIDATION_DIR')
    out = Path(value) if value else ROOT / 'docs' / 'validation-current' / name
    out.mkdir(parents=True, exist_ok=True)
    return out
