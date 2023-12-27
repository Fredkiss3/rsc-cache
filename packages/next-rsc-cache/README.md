# @rsc-cache/next

`@rsc-cache/next` allows you to cache server components and avoid rerunning the logic of those components at runtime, for the moment it is only compatible with nextjs.
 
This is particularily useful if you got a component that executes a bunch of logic and you can't easily cache it.

Before using this package, please verify if you can use `unstable_cache` to cache your logic, or if you can generate statically your component.

## Installation 

You can install the package with : 

```shell
# if you use pnpm
pnpm add @rsc-cache/next

# if you use yarn
yarn add @rsc-cache/next

# if you use npm
npm install @rsc-cache/next
```

## Usage

1. Configure and export the cache component, only 2 functions are required to configure the component :

```tsx
// src/components/cache.tsx
import { createCacheComponent } from "@rsc-cache/next";

export const Cache = createCacheComponent({
  cacheFn(renderRSC, cacheKey, ttl) {
    return unstable_cache(renderRSC, [cacheKey], {
      tags: [cacheKey],
      revalidate: ttl
    })();
  },
  getBuildId: () => process.env.BUILD_ID!,
  defaultTTL: 604_800, // 7 days in seconds
});
```

1. Use it everywhere you need it : 

```tsx
import { Cache } from "~/components/cache";

export default async function Page() {
  return (
    <main className="container p-10">
       <Cache id="markdown">
          <Markdown content="..." />
       </Cache>
    </main>
  );
}
```

## Examples

1. With REDIS :

```tsx
import { Redis } from "@upstash/redis";
import { createCacheComponent } from "@rsc-cache/next";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const Cache = createCacheComponent({
  cacheFn(renderRSC, cacheKey, ttl) {
    const data = await redis.get<string>(cacheKey);
    if(!data) {
       data = await renderRSC();
       await redis.set(cacheKey, data, ttl);
    }
    return data;
  },
  getBuildId: () => process.env.BUILD_ID!,
  defaultTTL: 604_800, // 7 days in seconds
});
```

2. With Cloudflare KV : 

```tsx
import { createCacheComponent } from "@rsc-cache/next";

export interface KVNamespace {
    get: (key: string) => string,
    put: (key: string, value: string) => void,
}

const kv = process.env.KV as KVNamespace;

export const Cache = createCacheComponent({
  cacheFn(renderRSC, cacheKey, expirationTtl) {
    const data = await kv.get(cacheKey);
    if(!data) {
       data = await renderRSC();
       await kv.put(
         cacheKey,
         data, 
         {
           expirationTtl
         }
       );
    }
    return data;
  },
  getBuildId: () => process.env.BUILD_ID!,
  defaultTTL: 604_800, // 7 days in seconds
});
```

## Error handling and Suspense

You can wrap this component in an error boundary to catch any error that could happen inside of your server components. You can also provide a `Suspense` fallback to show when the component is rendering server side.

```tsx
"use client";
import { ErrorBoundary } from "react-error-boundary";

export function CacheErrorBoundary({
  children
}) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <>
            Error rendering the cached component : {props.error.toString()}
            <button onClick={props.resetErrorBoundary}>reset</button>
        </>
     )}
    >
      {children}
    </ErrorBoundary>
  );
}
```


```tsx
import * as React from 'react';
import { Cache } from "~/components/cache";

export default async function Page() {
  return (
    <main className="container p-10">
      <CacheErrorBoundary>
        <React.Suspense fallback={<MarkdownSkeleton />}>
          <Cache id="markdown">
              <Markdown content="..." />
          </Cache>
        </React.Suspense>
      </CacheErrorBoundary>
    </main>
  );
}
```

## Troubleshooting


### got error: "The BUILD ID must be defined in order for the cache to work..."

> TODO

### It doesn't work with edge runtime

> TODO

## How it works

> TODO

## API

This package only exports a single function : `createCacheComponent` which creates a `Cache` component.

> TODO
