# Notary caption scrolling

User request: keep the current size and allow scrolling when THE NOTARY speech becomes long.

The Notary caption is now a focusable, selectable scroll region with the same two-line maximum height, vertical touch panning and thin scrollbar. The previous 300-character tail trimming was removed so earlier text from the current bounded voice session remains available. Existing session/negotiation resets still clear the caption. Scrolling does not sign or edit a contract; appended captions preserve the reader's position.

`local/result.json` and `production/result.json` use synthetic caption events through the actual game UI callback; no microphone or API is used. 1034 characters remain intact. Width, height and containing panel height exactly match the former two-line-clamped presentation at 1280x800, 1920x1080 and emulated 390x844. Mouse wheel and keyboard Home/End reach the whole content; the complete Transcript dialog still works. Numbered screenshots show the text at the beginning/end. These are Windows Edge 153 automated checks; mobile is emulation.

`layout-regression.json` is the existing seven-viewport local regression, including modal focus, long prose and ordinary local Sign controls. The supplied game helper ran; its canvas-only capture is black behind the HTML overlay, so the full-page screenshots here supply the visual evidence. Source build and 34 syntax files passed. Prior unit evidence is 207/207; no new tests were added or paid model requests made for this display change.
