import { createCacheComponent, computeCacheKey } from "@rsc-cache/next";
import { cache } from "react";
import fs from "fs/promises";
import { unstable_cache } from "next/cache";

const getBuildId = cache(async () => {
  // by default `.next/BUILD_ID` doesn't exists on DEV
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.NODE_ENV === "development") {
    return Date.now().toString();
  }
  return await fs.readFile(".next/BUILD_ID", "utf-8");
});

export const Cache = createCacheComponent({
  cacheFn(generatePayload, cacheKey, ttl) {
    return unstable_cache(generatePayload, [cacheKey], {
      tags: [cacheKey],
      revalidate: ttl
    })();
  },
  getBuildId
});
export const getCacheKey = async (id: string) =>
  computeCacheKey(id, getBuildId);
