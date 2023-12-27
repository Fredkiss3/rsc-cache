import { unstable_cache } from "next/cache";
import { CacheErrorBoundary } from "./cache-error-boundary";
import { CachedServerComponent } from "./cached-rsc";
import { createCacheComponent } from "@rsc-cache/next";
import fs from "fs/promises";

const Cache = createCacheComponent({
  async cacheFn(generatePayload, cacheKey, ttl) {
    const fn = unstable_cache(generatePayload, [cacheKey], {
      tags: [cacheKey],
      revalidate: ttl
    });

    return await fn();
  },
  getBuildId: async () => await fs.readFile(".next/BUILD_ID", "utf-8")
});

export default async function Page() {
  return (
    <main className="container p-10">
      <h1>Cache test</h1>
      <CacheErrorBoundary>
        <Cache id={"server-component-rsc"} cacheInDEV>
          <CachedServerComponent />
        </Cache>
      </CacheErrorBoundary>
    </main>
  );
}

export const revalidate = 0;
