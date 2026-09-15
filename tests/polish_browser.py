"""v0.9.9 polish pass: local Edge UI/interaction QA, no model or API calls."""
from pathlib import Path
from urllib.parse import urlsplit
import hashlib, json, os
import sys
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('NEMESIS_POLISH_OUT', ROOT / 'docs' / ('validation-v'+json.loads((ROOT/'package.json').read_text(encoding='utf-8'))['version']) / 'polish-browser'))
OUT.mkdir(parents=True, exist_ok=True)
URL = os.environ.get('NEMESIS_TEST_URL', 'http://127.0.0.1:8100/?test=1')
VIEWPORTS = [("desktop-1440", 1440, 900, False), ("desktop-1366", 1366, 768, False),
             ("desktop-960", 960, 600, False), ("phone-390", 390, 844, True),
             ("phone-320", 320, 568, True)]

def rect(p, selector):
    return p.locator(selector).bounding_box()

def overlap(a, b):
    return bool(a and b and a["x"] < b["x"] + b["width"] and b["x"] < a["x"] + a["width"] and
                a["y"] < b["y"] + b["height"] and b["y"] < a["y"] + a["height"])

def wait_enabled(page, selector):
    for _ in range(80):
        if not page.locator(selector).is_disabled():
            return
        page.wait_for_timeout(50)
    status = page.locator("#cv-status").inner_text() if page.locator("#cv-status").count() else ""
    provider = page.locator("#cv-provider").inner_text() if page.locator("#cv-provider").count() else ""
    raise AssertionError(f"timeout waiting for enabled: {selector}; status={status!r}; provider={provider!r}")

results = []
with sync_playwright() as pw:
    # Edge executable is selected by browser_env; headless keeps the five-viewport
    # matrix bounded in CI while screenshots remain real renderer captures.
    browser = pw.chromium.launch(**launch_kwargs(headless=True), args=[
        "--no-sandbox", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader"])
    for name, width, height, mobile in VIEWPORTS:
        page = None; errors = []; requests = []; checks = []; overlap_report = []; step = "startup"
        try:
            context = browser.new_context(viewport={"width": width, "height": height},
                                          has_touch=mobile, is_mobile=mobile, device_scale_factor=1)
            # Freeze the render loop before navigation; all combat progression below
            # then comes from the explicit legal __PACT_TEST__.advance helper.
            context.add_init_script("window.__PACT_TEST_MODE__=true; window.requestAnimationFrame=()=>0;")
            page = context.new_page(); page.set_default_timeout(8000)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("request", lambda r: requests.append(r.url) if r.url.startswith(("http:", "https:", "ws:", "wss:")) and urlsplit(r.url).netloc != urlsplit(URL).netloc else None)
            page.goto(URL, wait_until="domcontentloaded")
            page.wait_for_timeout(900)
            assert page.evaluate("typeof window.NEMESIS_RENDERER !== 'undefined'")
            page.screenshot(path=str(OUT / f"{name}-01-title.png"))
            step = "initial-local-proposal"
            page.click("#first-contact")
            # Hosted builds may default to the consent gate; force the explicitly
            # offline/local provider through its normal dialog, never by state injection.
            page.click("#cv-open-connection")
            page.locator("#cv-mode").select_option("local")
            page.click("#cv-use-local")
            page.click("#cv-propose"); wait_enabled(page, "#cv-sign")
            page.screenshot(path=str(OUT / f"{name}-02-proposal.png"))
            checks.append("local proposal rendered without mutating pre-sign world")
            # Mobile text negotiation has a two-step editor/review flow; voice keeps negotiate visible.
            if mobile:
                tabs = ["#cv-tab-negotiate", "#cv-tab-review"]
                assert all(page.locator(s).count() == 1 for s in tabs), "mobile covenant tabs missing"
                page.click("#cv-tab-review")
                assert page.locator("#cv-sign").is_visible()
                page.click("#cv-tab-negotiate")
                assert page.locator("#cv-propose").is_visible()
                page.click("#cv-tab-review")
                checks.append("mobile negotiate/review tabs and fixed review Sign visible")
            else:
                # Desktop action cards are keyboard equivalents exposed as buttons in v0.9.9.
                for s in ["#dash-ability", "#parry-ability", "#nova-ability", "#breach-ability"]:
                    assert page.locator(s).count() == 1
                checks.append("desktop action ability controls present")
            page.click("#cv-sign")
            step = "signed-combat"
            assert page.evaluate("__PACT_TEST__.world.revision") == 1
            page.screenshot(path=str(OUT / f"{name}-03-combat.png"))
            if not mobile:
                # Exercise the actual desktop click bindings, then advance one legal
                # frame through the public helper to observe the resulting action.
                page.click("#dash-ability"); page.evaluate("window.advanceTime(9)")
                dash_cd = page.evaluate("__PACT_TEST__.world.p.dashCd")
                page.click("#parry-ability"); page.evaluate("window.advanceTime(9)")
                parry_cd = page.evaluate("__PACT_TEST__.world.p.parryCd")
                assert dash_cd > 0, {"dashCd": dash_cd}
                assert parry_cd > 0, {"parryCd": parry_cd}
                checks.append("desktop DASH/PARRY clicks trigger combat cooldowns")
            # Advance only through the public deterministic helper; no state injection.
            page.evaluate("__PACT_TEST__.advance(2210,{shoot:true,autoAim:true,parry:true,mx:.2})")
            step = "parley-open"
            assert page.evaluate("__PACT_TEST__.world.phase") == "parley"
            hp_time = page.evaluate("[__PACT_TEST__.world.time,__PACT_TEST__.world.p.hp,__PACT_TEST__.world.enemies.find(e=>e.type==='boss').hp]")
            page.screenshot(path=str(OUT / f"{name}-04-parley.png"))
            page.click("#cv-close")
            step = "parley-cancel"
            assert page.evaluate("__PACT_TEST__.world.phase") == "combat"
            assert page.evaluate("__PACT_TEST__.world.revision") == 1
            checks.append("parley cancel resumes original signed rules")
            page.evaluate("__PACT_TEST__.openParley()")
            step = "amendment-proposal"
            page.fill("#cv-prompt", "Amplify my reflected bullets and slow your fire. My gun can be weaker.")
            page.click("#cv-propose"); wait_enabled(page, "#cv-sign")
            page.click("#cv-sign")
            step = "amendment-continuity"
            after = page.evaluate("[__PACT_TEST__.world.time,__PACT_TEST__.world.p.hp,__PACT_TEST__.world.enemies.find(e=>e.type==='boss').hp]")
            assert page.evaluate("__PACT_TEST__.world.revision") == 2
            assert hp_time == after, {"before": hp_time, "after": after}
            checks.append("amendment Sign preserves time, HP and boss HP")
            page.screenshot(path=str(OUT / f"{name}-05-amended.png"))
            if mobile:
                for a, b in [("#touch-controls", "#playfield"), ("#touch-controls", "#hud")]:
                    if page.locator(a).count() and page.locator(b).count():
                        overlap_report.append({"a": a, "b": b, "overlap": overlap(rect(page, a), rect(page, b))})
                # Captions are scrollable rather than ellipsized.
                cap = page.locator("#cv-caption-notary")
                overlap_report.append({"captionScrollHeight": page.evaluate("e=>e.scrollHeight", cap.element_handle()),
                                       "captionClientHeight": page.evaluate("e=>e.clientHeight", cap.element_handle())})
            assert not errors, errors
            assert not requests, requests
            results.append({"name": name, "viewport": [width, height], "mobileEmulation": mobile,
                            "checks": checks, "overlap": overlap_report, "errors": errors,
                            "externalRequests": requests})
            print(name, "OK", flush=True)
        except Exception as exc:
            state = None
            try:
                state = page.evaluate("window.render_game_to_text && window.render_game_to_text()") if page else None
            except Exception as state_exc:
                state = "state-read-failed: " + repr(state_exc)
            results.append({"name": name, "viewport": [width, height], "mobileEmulation": mobile,
                            "checks": checks, "overlap": overlap_report, "errors": errors,
                            "externalRequests": requests, "failure": repr(exc), "step": step,
                            "renderGameToText": state})
            if page:
                page.screenshot(path=str(OUT / f"{name}-ERROR.png"))
            print(name, "FAIL", repr(exc).encode("ascii", "backslashreplace").decode("ascii"), flush=True)
        finally:
            if page:
                page.context.close()
    report = {"url": URL, "browser": browser.version, "renderer": "Edge / WebGL2 ANGLE SwiftShader",
              "apiCalls": 0, "scope": "automated local rules; RAF frozen before navigation; explicit deterministic ticks; phone sizes are emulation, not hardware",
              "htmlSha256": hashlib.sha256((ROOT / "dist" / "NEMESIS-PACT.html").read_bytes()).hexdigest(),
              "results": results}
    (OUT / "results.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    browser.close()
    summary = {"passed": sum("failure" not in x for x in results), "total": len(results),
               "errors": sum(len(x["errors"]) for x in results), "externalRequests": sum(len(x["externalRequests"]) for x in results)}
    print(json.dumps(summary), flush=True)
    if summary["passed"] != summary["total"] or summary["errors"] or summary["externalRequests"]:
        sys.exit(1)
