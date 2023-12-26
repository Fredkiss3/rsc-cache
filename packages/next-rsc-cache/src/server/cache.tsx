import "server-only";

// components
import { CacheClient } from "../client/cache-client.js";

// utils
import React, { cache } from "react";
import { renderRSCtoString } from "./render-rsc-to-string.js";
import { unstable_cache } from "next/cache.js";

// types
export type CacheId = string | number | (string | number)[];
export type CacheProps = {
  id: CacheId;
  ttl?: number;
  bypassInDEV?: boolean;
  debugPayload?: boolean;
  children: React.ReactNode;
  cacheFn?: (
    renderRSC: () => Promise<string>,
    cacheKey: string
  ) => Promise<string>;
  getNextBuildId: () => Promise<string> | string;
};

export async function Cache({
  id,
  ttl,
  bypassInDEV,
  children,
  debugPayload = false,
  cacheFn,
  getNextBuildId
}: CacheProps) {
  if (
    bypassInDEV ||
    (bypassInDEV === undefined && process.env.NODE_ENV === "development")
  ) {
    return <>{children}</>;
  }

  const cacheKey = await computeCacheKey(id, getNextBuildId);

  const renderRSC = async () => {
    return await renderRSCtoString(children);
  };
  const defaultCacheFn = unstable_cache(renderRSC, [cacheKey], {
    tags: [cacheKey],
    revalidate: ttl
  });

  const cachedPayload = await (cacheFn?.(renderRSC, cacheKey) ??
    defaultCacheFn());

  if (debugPayload) {
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

  return <CacheClient payload={cachedPayload} />;
}

async function computeCacheKey(
  id: CacheId,
  getBuildId: () => Promise<string> | string
) {
  let fullKey = Array.isArray(id) ? id.join("-") : id.toString();

  // the build ID is necessary because the client references for one build
  // won't necessarily be the same for another build, especially if the component
  // changed in the meantime
  const buildId = await getBuildId();
  if (buildId) {
    fullKey += `-${buildId}`;
  }
  return fullKey;
}
