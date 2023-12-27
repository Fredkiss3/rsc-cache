import { createCacheComponent, computeCacheKey } from "@rsc-cache/next";
import { cache } from "react";
import fs from "fs/promises";
import { kv } from "@vercel/kv";

const getBuildId = cache(async () => {
  // by default `.next/BUILD_ID` doesn't exists on DEV
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.NODE_ENV === "development") {
    return Date.now().toString();
  }
  return await fs.readFile(".next/BUILD_ID", "utf-8");
});

export const Cache = createCacheComponent({
  async cacheFn(generatePayload, cacheKey, ttl) {
    let data = await kv.get<string>(cacheKey);
    if (!data) {
      data = await generatePayload();
      if (ttl) {
        await kv.setex(cacheKey, ttl, data);
      } else {
        await kv.set(cacheKey, data);
      }
    }
    return data;
  },
  getBuildId
});
export const getCacheKey = async (id: string) =>
  computeCacheKey(id, getBuildId);
