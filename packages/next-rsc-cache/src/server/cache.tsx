import "server-only";

// components
import { CacheClient } from "../client/cache-client.js";

// utils
import * as React from "react";
import { renderRSCtoString } from "./render-rsc-to-string.js";

// types
export type CacheId = string | number | (string | number)[];
export type CacheProps = {
  id: CacheId;
  ttl?: number;
  bypassInDEV?: boolean;
  debugPayload?: boolean;
  children: React.ReactNode;
  cacheFn: (
    renderRSC: () => Promise<string>,
    cacheKey: string,
    ttl?: number
  ) => Promise<string>;
  getNextBuildID: () => Promise<string> | string;
};

export async function Cache({
  id,
  ttl,
  bypassInDEV,
  children,
  debugPayload = false,
  cacheFn,
  getNextBuildID: getNextBuildId
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
  const cachedPayload = await cacheFn(renderRSC, cacheKey, ttl);

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

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
type CreateCacheComponentArgs = Prettify<
  Pick<CacheProps, "cacheFn" | "getNextBuildID"> & {
    defaultTTL?: number;
  }
>;

export function createCacheComponent({
  cacheFn,
  getNextBuildID,
  defaultTTL
}: CreateCacheComponentArgs) {
  return (props: Omit<CacheProps, "cacheFn" | "getNextBuildID">) => (
    <Cache
      {...props}
      cacheFn={cacheFn}
      getNextBuildID={getNextBuildID}
      ttl={props.ttl ?? defaultTTL}
    />
  );
}
