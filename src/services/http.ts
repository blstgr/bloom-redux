/** HTTP details every API client here shares. Each of plantApi, plantIdApi and plantCopyApi
 * previously declared its own copy of these, so a change to how a response body is read (or what
 * counts as forbidden) had to be made in three places to stay consistent. */

export const FORBIDDEN_STATUS = 403;
/** Perenual calls it rate-limited, Pl@ntNet calls it quota-exceeded — same status either way. */
export const TOO_MANY_REQUESTS_STATUS = 429;

/** Best-effort body read for an error path: a body that cannot be read must not mask the status
 * code that actually explains the failure, so this never throws. */
export async function readResponseBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
