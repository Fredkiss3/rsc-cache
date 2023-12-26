import "server-only";

// components
import { CacheErrorBoundary } from "../client/cache-error-boundary";
import { CacheClient } from "../client/cache-client";

// utils
import React, { cache } from "react";
import { renderRSCtoString } from "./render-rsc-to-string";
import { InMemoryKV, type KV } from "./kv-interface";
import { unstable_cache } from "next/cache";

// types
export type CacheId = string | number | (string | number)[];
export type CacheProps = {
  id: CacheId;
  ttl?: number;
  bypassInDEV?: boolean;
  debug?: boolean;
  children: React.ReactNode;
  updatedAt?: Date | number;
  cacheInterface?: KV;
};

/**
 * Component for caching RSCs
 * it uses REDIS to cache the payload.
 *
 * **⚠️⚠️ WARNING ⚠️⚠️** : this uses React experimental APIs, use this at your own risk
 */
export async function Cache({
  id,
  ttl,
  bypassInDEV,
  children,
  updatedAt,
  debug = false,
  cacheInterface: kv = new InMemoryKV()
}: CacheProps) {
  try {
    if (
      bypassInDEV ||
      (bypassInDEV === undefined && process.env.NODE_ENV === "development")
    ) {
      return <>{children}</>;
    }

    const fullKey = await computeCacheKey(id, updatedAt);

    let cachedPayload = await kv.get(fullKey);

    const cacheHit = !!cachedPayload;

    if (!cachedPayload) {
      cachedPayload = await renderRSCtoString(children);
      await kv.set(fullKey, cachedPayload, ttl);
    }

    if (cacheHit) {
      console.log(
        `\x1b[32mCACHE HIT \x1b[37mFOR key \x1b[90m"\x1b[33m${fullKey}\x1b[90m"\x1b[37m`
      );
    } else {
      console.log(
        `\x1b[31mCACHE MISS \x1b[37mFOR key \x1b[90m"\x1b[33m${fullKey}\x1b[90m"\x1b[37m`
      );
    }

    if (debug) {
      return (
        <pre
          style={{
            maxWidth: "100%",
            overflow: "auto"
          }}
        >
          {cachedPayload}
        </pre>
      );
    }

    return (
      <CacheErrorBoundary>
        <CacheClient payload={cachedPayload} />
      </CacheErrorBoundary>
    );
  } catch (error) {
    console.error(
      `Error generating the payload for cache, failing back to rendering the component as is.`,
      error
    );
    return <>{children}</>;
  }
}

type Callback = (...args: any[]) => Promise<any>;
export function nextCache<T extends Callback>(
  cb: T,
  options: {
    tags: string[];
    revalidate?: number;
  }
) {
  return cache(unstable_cache(cb, options.tags, options));
}

export const getBuildId = cache(async () => {
  return process.env.BUILD_ID ?? "";
});

async function computeCacheKey(id: CacheId, updatedAt?: Date | number) {
  let fullKey = Array.isArray(id) ? id.join("-") : id.toString();
  if (updatedAt) {
    fullKey += `-${new Date(updatedAt).getTime()}`;
  }

  // the build ID is necessary because the client references for one build
  // won't necessarily be the same for another build, especially if the component
  // changed in the meantime
  const buildId = await getBuildId();
  if (buildId) {
    fullKey += `-${buildId}`;
  }
  return fullKey;
}
