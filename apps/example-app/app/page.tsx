import { unstable_cache } from "next/cache";
import { CacheErrorBoundary } from "./cache-error-boundary";
import { CachedServerComponent } from "./cached-rsc";
import { createCacheComponent } from "@rsc-cache/next";

const Cache = createCacheComponent({
  async cacheFn(generatePayload, cacheKey, ttl) {
    const fn = unstable_cache(generatePayload, [cacheKey], {
      tags: [cacheKey],
      revalidate: ttl
    });

    return await fn();
  },
  getBuildId() {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    return process.env.BUILD_ID!;
  }
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

// export const dynamic = "force-dynamic";
export const runtime = "edge";
