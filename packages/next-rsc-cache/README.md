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

1. Configure and export the cache component :

```tsx
// src/components/cache.tsx
import { createCacheComponent } from "@rsc-cache/next";
import fs from "fs/promises";

export const Cache = createCacheComponent({
  cacheFn(generatePayload, cacheKey, ttl) {
    return unstable_cache(generatePayload, [cacheKey], {
      tags: [cacheKey],
      revalidate: ttl
    })();
  },
  getBuildId: async () => await fs.readFile(".next/BUILD_ID", "utf-8"),
  defaultTTL: 604_800, // 7 days in seconds
});
```

1. Use it everywhere you need it : 

```tsx
import { Cache } from "~/components/cache";

export default async function Page() {
  const TEN_MINUTES_IN_SECONDS = 600;
  return (
    <main className="container p-10">
       <Cache id="markdown">
          <Markdown content="..." />
       </Cache>
       <Cache id="expensive-rsc" ttl={TEN_MINUTES_IN_SECONDS}>
          <ExpensiveRSC />
       </Cache>
    </main>
  );
}
```

## Examples

### 0. demos :

- You can find a live demo here : https://rsc-cache-example-app.vercel.app, the code source of this component is located [here](https://github.com/Fredkiss3/rsc-cache/tree/main/apps/example-app)

### 1. With REDIS :

```tsx
import { Redis } from "@upstash/redis";
import { createCacheComponent } from "@rsc-cache/next";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const Cache = createCacheComponent({
  async cacheFn(generatePayload, cacheKey, ttl) {
    let data = await redis.get<string>(cacheKey);
    if (!data) {
      data = await generatePayload();
      if (ttl) {
        await redis.setex(cacheKey, ttl, data);
      } else {
        await redis.set(cacheKey, data);
      }
    }
    return data;
  },
  // ... rest of arguments
});
```

### 2. With the file system : 


```tsx
import { createCacheComponent } from "@rsc-cache/next";
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = `.next/cache/fs-cache`
type CacheEntry = { value: string; expiry: number | null };

export const Cache = createCacheComponent({
  async cacheFn(generatePayload, cacheKey, ttl) {
    await fs.mkdir(CACHE_DIR, { recursive: true }).catch(() => {}) // do nothing if the folder already exists
    const filePath = path.join(CACHE_DIR, `${key}.json`);

    let data: string |null = null;
    try {
      const cacheEntry: CacheEntry = JSON.parse(await fs.readFile(filePath, "utf-8"));
      if (cacheEntry.expiry === null || Date.now() < cacheEntry.expiry) {
        data = cacheEntry.value;  
      }
    } catch (e) {
      // consider the data as not in cache
    }

    if(!data) {
       data = await generatePayload();
       const cacheEntry = {
          value: data,
          expiry: ttl ? Date.now() + ttl * 1000 : null,
       } satisfies CacheEntry;
       await fs.writeFile(filePath, JSON.stringify(cacheEntry), "utf-8");
    }
    return data;
  },
  // ... rest of arguments
});
```

### 2. With Cloudflare KV : 

```tsx
import { createCacheComponent } from "@rsc-cache/next";

export interface KVNamespace {
    get: (key: string) => string,
    put: (key: string, value: string) => void,
}

const kv = process.env.KV as KVNamespace;

export const Cache = createCacheComponent({
  async cacheFn(generatePayload, cacheKey, expirationTtl) {
    let data = await kv.get(cacheKey);
    if(!data) {
       data = await generatePayload();
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
  // ... rest of arguments
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

## Manually revalidating the cache

The goal of this library is to give you full control of how the components are cached with no implicit caching. If you want to manually revalidate a cached component, you can use the function `computeCacheKey` with the same ID for the component you want to revalidate : 

1. export a Higher order function to not repeat the BUILD ID logic :

```tsx
// src/components/cache.tsx
import { createCacheComponent, computeCacheKey } from "@rsc-cache/next";
import { cache } from 'react';
import fs from "fs/promises";
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const getBuildId = cache(async () => {
  // by default `.next/BUILD_ID` doesn't exists on DEV
  // so we return an ever changing build ID instead
  if (process.env.NODE_ENV === "development") {
    return Date.now().toString();
  }
  return await fs.readFile(".next/BUILD_ID", "utf-8");
});

export const Cache = createCacheComponent({
    async cacheFn(generatePayload, cacheKey, ttl) {
      let data = await redis.get<string>(cacheKey);
      if (!data) {
        data = await generatePayload();
        if (ttl) {
          await redis.setex(cacheKey, ttl, data);
        } else {
          await redis.set(cacheKey, data);
        }
      }
      return data;
    },
    getBuildId,
});
export const getCacheKey = async (id: string) => computeCacheKey(id, getBuildId);
```

1. You can revalidate on user input :

```tsx
import { Cache, getCacheKey, redis } from "~/components/cache";

export default async function Page() {
  return (
    <main className="container p-10">
       <Cache id="markdown">
          <Markdown content="..." />
       </Cache>

       <form action={async () => {
         "use server";
          const id = await getCacheKey("markdown");
          await redis.del(id);
       }}>
         <button>Revalidate</button>
       </form>
    </main>
  );
}
```


## API

This package exports 3 elements : a `createCacheComponent` which is factory that setup the `Cache` component and a `computeCacheKey` function for manually revalidating the component.

### `createCacheComponent({ cacheFn, getBuildId, defaultTTL })`

Higher order function that setup the cache component.

###### Parameters

*   `cacheFn` The function to handle caching logic.

*   `getBuildId` Function to get the `BUILD_ID` generated by nextjs
  
*   `defaultTTL` The default TTL that will be used by all the `Cache` components

###### Returns

the `Cache` component

### `<Cache>`

Component used for caching.

###### Props

*    `id`: the cache id corresponding to the component;

*    `ttl`?: number | undefined;

*    `debugPayload`?: show the cached payload inside a `<pre>` tag

*    `cacheInDEV`?: whether to cache in DEV or not, defaults to false, not recommended, but can be useful this for debugging

*    `children`: the component to cache

### `computeCacheKey`

Function used to compute the cacheKey, you can use it to revalidate the cache.

###### Parameters

*   `id` : the cache ID, you can use it to revalidate the cache

*   `getBuildId` : Function to get the `BUILD_ID` generated by nextjs

###### Returns

a `string` corresponding to the cache ID.


## Troubleshooting

### got error: "The BUILD ID must be defined in order for the cache to work..."

This error happens because the `Cache` components needs a stable `BUILD_ID` generated by nextjs for new changes. The simplest way to fix this is by reading directly the `BUILD_ID` file content generated by next after each build : 

```tsx
// src/components/cache.tsx
import { createCacheComponent } from "@rsc-cache/next";
import fs from 'fs/promises';

export const Cache = createCacheComponent({
  // ... rest of arguments
  getBuildId: async () => await fs.readFile(".next/BUILD_ID", "utf-8"),
});
```

If you define your build ID differently, you can use a package like [`next-build-id`](https://github.com/nexdrew/next-build-id) to generate your build ID, and pass the build ID as an environment variable : 

```js
// next.config.js
const nextBuildId = require("next-build-id");

/** @type {import('next').NextConfig} */
module.exports = {
  generateBuildId: () => nextBuildId({ dir: __dirname }),
  env: {
    BUILD_ID: nextBuildId.sync({ dir: __dirname })
  }
};
```

```tsx
// src/components/cache.tsx
import { createCacheComponent } from "@rsc-cache/next";

export const Cache = createCacheComponent({
  // ... rest of arguments
  getBuildId: () => process.env.BUILD_ID!,
});
```

### It doesn't work with edge runtime

Unfortunately this is expected, the package doesn't work yet with edge runtime and I've not been able 
to find out why, if you have a better idea, feel free to [contribute](../../CONTRIBUTING.md).

## License

MIT License © 2023-Present [Adrien KISSIE](https://github.com/fredkiss3)

## Credits 

- https://github.com/gregberge/twc : for giving us content for the contributions templates (issues, pull requests, contribution guidelines).
- https://github.com/huozhi/bunchee : It is just a very cool and simple bundler, what's not to love ?
- https://github.com/vercel/react-tweet : For inspiration 


