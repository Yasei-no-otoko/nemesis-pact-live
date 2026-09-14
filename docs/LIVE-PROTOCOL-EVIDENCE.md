# GPT-Live-1 protocol evidence

Retrieved 2026-09-14 (Asia/Tokyo) from the official OpenAI developer documentation. This file records documented protocol facts only; no API key or billable request was used during this review.

## Initial browser connection (WebRTC)

Primary source: [OpenAI WebRTC guide](https://developers.openai.com/api/docs/guides/voice-webrtc), especially the GPT-Live connection sequence and Node example.

The Live WebRTC server receives a browser SDP offer and calls the official Node SDK method `client.live.create`:

```js
const result = await client.live.create({
  session: {
    model: "gpt-live-1",
    instructions: "...",
    delegation: {
      type: "responses",
      responses: {
        model: "gpt-5.6-terra",
        instructions: "...",
        tools: [{ type: "web_search" }],
        tool_choice: "auto",
      },
    },
  },
  transport: {
    type: "webrtc",
    sdp: request.body.sdp,
  },
});
```

The corresponding HTTP call is `POST /v1/live/sessions`, authenticated with the server-side project API key. The request body is JSON containing `session` and `transport: { type: "webrtc", sdp }`. The documented successful result is HTTP 201 JSON:

```json
{
  "session": { "id": "live_123" },
  "transport": { "type": "webrtc", "sdp": "<SDP answer>" }
}
```

The browser sends its offer to the application server as `{ "sdp": "..." }`, applies `result.transport.sdp` as the remote SDP answer, and waits for `session.started` on the `oai-events` DataChannel. The HTTP request starts the session; the browser must not send `session.start`. WebRTC negotiates audio format through SDP, so `audio.format` is omitted. Audio travels on media tracks; JSON events travel on the DataChannel.

The guide requires microphone permission and HTTPS or localhost. It says Node.js 22.6+ is required for its Node example. The application server must add authentication, authorization, origin checks, and request limits before public exposure.

## Authentication distinction

The Live WebRTC guide's primary GPT-Live route uses the trusted server to call `client.live.create` with the project key. The same page also contains a separate legacy/Realtime “ephemeral token” section using `POST https://api.openai.com/v1/realtime/client_secrets`, a `type: "realtime"` session, and `gpt-realtime-2.1`; that is not the GPT-Live-1 initial-session payload and must not be substituted for the Live route.

## Delegation and transcript events

Primary sources: [Live delegation guide](https://developers.openai.com/api/docs/guides/live-delegation) and [Live sessions guide](https://developers.openai.com/api/docs/guides/live-conversations).

For client delegation, the startup configuration is:

```json
{ "model": "gpt-live-1", "delegation": { "type": "client" } }
```

When the model asks the application to handle work, the event is `session.delegation.created`; its metadata includes `delegation.id` and `delegation.target`, but not the user's task text. The application must combine that opaque ID with accumulated `session.input_transcript.delta` and application state.

Transcript events are `session.input_transcript.delta` and `session.output_transcript.delta`, each carrying `delta`, `start_ms`, and `end_ms`. Deltas are fragments on the session timeline, not complete turns or wall-clock arrival times. Captions should preserve fragments exactly and keep speaker rows independently revisable.

To return verified client-delegation results, send a JSON event with one of these types:

* `session.thinking.append` for quiet context/progress.
* `session.commentary.append` for content GPT-Live should speak (it may paraphrase).
* `session.instructions.append` for trusted behavior changes or redirection.

Each append has `event_id`, `delegation_id` (the original opaque delegation ID, or `null` for session-wide context), and plain-string `content` limited to 500 tokens. The acknowledgment (`session.*.appended`) only confirms estimated context injection. It does not prove speech, playback, or external-action success.

For Responses delegation, `session.delegation.created` has `target: "responses"` and a `response_id`; nested backend events arrive in a `response.event` envelope. This backend path remains separate from the game's canonical contract validation and explicit Sign action.

## Interruption versus cancellation

GPT-Live handles speech interruption, but the official guide explicitly says an interruption does not automatically cancel backend work. Application state must cancel or supersede stale contract work independently, and delayed results must be discarded by run/delegation/request generation checks. A transcript grouping or acknowledgment alone must not trigger cancellation.

## Close and hangup

For a normal browser close, register the `session.closed` listener first, send `{ "type": "session.close" }`, keep the DataChannel/WebRTC connection alive while events drain, then release PeerConnection and microphone tracks after `session.closed`. A socket close alone is not finalization.

The official TypeScript API reference documents the server-side hangup endpoint as `POST /live/sessions/{session_id}/hangup`, exposed by `client.live.sessions.hangup(sessionID)`. This is distinct from the browser's `session.close` event and should be used by the server when it must terminate an existing session.

`session.closed.reason` values documented by OpenAI include `close_requested`, `expired`, `content`, `remote_hangup`, and `connection_lost`. `session.usage.updated` reports cumulative voice duration seconds; snapshots must not be added together. The docs do not publish a numeric maximum session duration in the retrieved pages. `expired` is the provider-side duration-limit signal; the application must enforce its own shorter hard cap.

## Cost evidence

The WebRTC guide states that creating a Live WebRTC session bills 15 seconds of voice duration during initialization, credited against duration charges once the session starts. The GPT-Live launch announcement states the front-end voice layer price as $0.05/minute; backend model and tool usage are separate. This review performed no billable initialization.

## Unverified in this workspace

* Access to `gpt-live-1` for the user's OpenAI project.
* Runtime response and event behavior from that project.
* Project/account rate limits, maximum duration value, and billing balance.
* Whether the current deployed Vercel runtime supports the required long-lived WebRTC/server control path.

