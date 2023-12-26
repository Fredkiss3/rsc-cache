import { CacheErrorBoundary } from "./cache-error-boundary";
import { CachedServerComponent } from "./cached-rsc";
import { Cache } from "@rsc-cache/next";

export default function Page() {
  return (
    <main className="container p-10">
      <h1>Cache test</h1>
      <CacheErrorBoundary>
        <Cache
          id={"server-component"}
          bypassInDEV={false}
          cacheFn={async (renderRSC, cacheKey) => {
            let payload = cache.get(cacheKey);
            const cacheHit = !!payload;
            if (!payload) {
              payload = await renderRSC();
              cache.set(cacheKey, payload);
            }

            if (cacheHit) {
              console.log(
                `\x1b[32mCACHE HIT \x1b[37mFOR key \x1b[90m"\x1b[33m${cacheKey}\x1b[90m"\x1b[37m`
              );
            } else {
              console.log(
                `\x1b[31mCACHE MISS \x1b[37mFOR key \x1b[90m"\x1b[33m${cacheKey}\x1b[90m"\x1b[37m`
              );
            }
            return payload;
          }}
        >
          <CachedServerComponent />
        </Cache>
      </CacheErrorBoundary>
    </main>
  );
}

const cache = new Map<string, string>();
