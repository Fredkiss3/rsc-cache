"use client";
import * as React from "react";
import * as RSDWSSr from "react-server-dom-webpack/client.edge";
import * as RSDW from "react-server-dom-webpack/client";

import { getSSRManifest } from "../shared/rsc-manifest";

export type CacheClientProps = {
  payload: string;
};

export function CacheClient({ payload }: CacheClientProps) {
  const renderPromise = React.useMemo(() => {
    /**
     * This is to fix a bug that happens sometimes in the SSR phase,
     * calling `use` seems to suspend indefinitely resulting in
     * your app not responding.
     *
     * We override the promise result and add `status` & `value`,
     * these fields are used internally by `use` and are what's
     * prevent `use` from suspending indefinitely.
     */
    const pendingPromise = renderPayloadToJSX(payload)
      .then((value) => {
        // @ts-expect-error
        if (pending.status === "pending") {
          const fulfilledThenable = pendingPromise as any;
          fulfilledThenable.status = "fulfilled";
          fulfilledThenable.value = value;
        }
        return value;
      })
      .catch((error) => {
        // @ts-expect-error
        if (pending.status === "pending") {
          const rejectedThenable = pendingPromise as any;
          rejectedThenable.status = "rejected";
          rejectedThenable.reason = error;
        }
        throw error;
      });
    // @ts-expect-error
    pendingPromise.status = "pending";
    return pendingPromise;
  }, [payload]);
  return <CacheClientRenderer promise={renderPromise} />;
}

export function CacheClientRenderer(props: {
  promise: Promise<React.JSX.Element>;
}) {
  return React.use(props.promise);
}

export const renderPayloadToJSX = async function resolveElement(
  payload: string
) {
  console.log("Render payload to JSX");
  const rscStream = transformStringToReadableStream(payload);
  let rscPromise: Promise<React.JSX.Element> | null = null;

  // Render to HTML
  if (typeof window === "undefined") {
    // the SSR manifest contains all the client components that will be SSR'ed
    // And also how to import them
    rscPromise = RSDWSSr.createFromReadableStream(rscStream, getSSRManifest());
  }

  // Hydrate or CSR
  if (rscPromise === null) {
    rscPromise = RSDW.createFromReadableStream(rscStream, {});
  }

  return await rscPromise;
};

export function transformStringToReadableStream(input: string) {
  // Using Flight to deserialize the args from the string.
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(input));
      controller.close();
    }
  });
}
