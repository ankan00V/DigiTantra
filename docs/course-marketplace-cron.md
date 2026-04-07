# Course Marketplace Refresh Cron

The catalog endpoint is split into two behaviors:

- `GET /api/course-marketplace` returns the current cached catalog.
- `POST /api/course-marketplace` forces a refresh and is protected by `COURSE_MARKETPLACE_REFRESH_TOKEN`.

## 1. Add the refresh token

Set this in your local or hosted environment:

```bash
COURSE_MARKETPLACE_REFRESH_TOKEN=replace-with-a-long-random-secret
```

## 2. Run DigiTantra with Slim

For local HTTPS:

```bash
slim start digitantra --port 9002
```

This gives you:

```text
https://digitantra.test
```

If an external cron service needs to reach your machine, expose the app with a public Slim URL:

```bash
slim share --port 9002
```

On the free plan this gives you a random public endpoint like:

```text
https://fond-sage.slim.show
```

Use this refresh URL in the scheduler:

```text
https://fond-sage.slim.show/api/course-marketplace
```

## 3. Configure the external cron

Run it every 30 minutes with:

- Method: `POST`
- URL: `https://fond-sage.slim.show/api/course-marketplace`
- Header: `Authorization: Bearer <COURSE_MARKETPLACE_REFRESH_TOKEN>`

Equivalent `curl`:

```bash
curl -X POST https://fond-sage.slim.show/api/course-marketplace \
  -H "Authorization: Bearer $COURSE_MARKETPLACE_REFRESH_TOKEN"
```

`x-refresh-token: <token>` is also accepted if your cron provider cannot send bearer auth.

## Free-plan Slim caveat

The free Slim share URL shows a tunnel warning page until the visitor has the `__slim_visit` cookie.

For machine-to-machine cron calls, that means your worker must either:

- support cookies and send `Cookie: __slim_visit=<value>` on the request, or
- first `POST` to `/__slim/visit` and then reuse the returned cookie.

Example bootstrap request:

```bash
curl -i -X POST https://fond-sage.slim.show/__slim/visit \
  -d "redirect=/api/course-marketplace"
```

That responds with a header like:

```text
Set-Cookie: __slim_visit=...; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax
```

Then the actual refresh request becomes:

```bash
curl -X POST https://fond-sage.slim.show/api/course-marketplace \
  -H "Cookie: __slim_visit=<value>" \
  -H "Authorization: Bearer $COURSE_MARKETPLACE_REFRESH_TOKEN"
```

## 4. Expected response

Successful refresh returns a compact summary:

```json
{
  "ok": true,
  "refreshedAt": "2026-04-06T14:30:00.000Z",
  "nextSuggestedRefreshAt": "2026-04-06T15:00:00.000Z",
  "refreshIntervalMinutes": 30,
  "summary": {
    "trackedListings": 42,
    "liveProviders": 5,
    "blockedProviders": 0
  }
}
```

## Notes

- The public Slim URL must stay active for the external cron to keep working.
- Free-plan random tunnel URLs and `__slim_visit` cookies can change when the tunnel is restarted.
- `.test` domains are local-only and cannot be reached by outside schedulers.
