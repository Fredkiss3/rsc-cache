"use client";
import * as React from "react";
import * as RSDWSSr from "react-server-dom-webpack/client.edge";
import * as RSDW from "react-server-dom-webpack/client";
import { ErrorBoundary } from "react-error-boundary";

type CacheClientProps = {
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
        if (pendingPromise.status === "pending") {
          const fulfilledThenable = pendingPromise as any;
          fulfilledThenable.status = "fulfilled";
          fulfilledThenable.value = value;
        }
        return value;
      })
      .catch((error) => {
        // @ts-expect-error
        if (pendingPromise.status === "pending") {
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
  return (
    <CacheErrorBoundary>
      <CacheClientRenderer promise={renderPromise} />
    </CacheErrorBoundary>
  );
}

function CacheClientRenderer(props: {
  promise: Promise<React.JSX.Element>;
}) {
  return React.use(props.promise);
}

export function CacheErrorBoundary({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => {
        if (typeof window === "undefined") {
          console.error(`Error SSR'ing the cached component :`, props.error);
        } else {
          console.error(
            `Error client rendering the cached component :`,
            props.error
          );
        }
        return (
          <div>
            <p>
              Error rendering the cached component : {props.error.toString()}
            </p>
            <button onClick={props.resetErrorBoundary}>reset</button>
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

async function renderPayloadToJSX(payload: string) {
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
}

function transformStringToReadableStream(input: string) {
  // Using Flight to deserialize the args from the string.
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(input));
      controller.close();
    }
  });
}

/**
 * the SSR manifest contains the references to all the client components that will be SSR'ed
 * And also how to import them.
 * React will use them to add `<meta preload>` tag on the <head> so that they are eagerly
 * loaded.
 * @returns
 */
export function getSSRManifest() {
  let rscManifest: RSCManifest = {};

  // we concatennate all the manifest for all pages
  if (globalThis.__RSC_MANIFEST) {
    const allManifests = Object.values(globalThis.__RSC_MANIFEST);
    for (const manifest of allManifests) {
      rscManifest = {
        ...rscManifest,
        ...manifest
      };
    }
  }

  return {
    ssrManifest: {
      moduleLoading: rscManifest?.moduleLoading,
      moduleMap: rscManifest?.ssrModuleMapping
    }
  };
}
