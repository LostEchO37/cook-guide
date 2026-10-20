/** Shared fetch with short retries for cold starts / transient 5xx. */

const RETRY_STATUS = new Set([429, 502, 503, 504]);

export async function fetchApi(url, opts = {}, { tries = 3 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const res = await fetch(url, opts);
      if (RETRY_STATUS.has(res.status) && attempt < tries - 1) {
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < tries - 1) {
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}
