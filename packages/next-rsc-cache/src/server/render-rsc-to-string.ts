import "server-only";
import * as RSDW from "react-server-dom-webpack/server.edge";
import * as React from "react";
/**
 * the client manifest is a map of `ID:chunk` required for react to resolve
 * all the clients components imported from the server component and where to import them
 * they will be inlined into the RSC payload as references.
 * React will use those references during SSR to resolve
 * the chunk (js files) corresponding to those client components
 * @returns
 */
export function getClientManifest() {
  let clientManifest: ClientManifest = {};

  // we concatennate all the manifest for all pages
  if (globalThis.__RSC_MANIFEST) {
    const allManifests = Object.values(globalThis.__RSC_MANIFEST);
    for (const rscManifest of allManifests) {
      clientManifest = {
        ...clientManifest,
        ...rscManifest.clientModules
      };
    }
  }
  return clientManifest;
}

export async function renderRSCtoString(component: React.ReactNode) {
  const rscPayload = RSDW.renderToReadableStream(
    component,
    getClientManifest()
  );
  return await transformStreamToString(rscPayload);
}

async function transformStreamToString(stream: ReadableStream) {
  const reader = stream.getReader();
  const textDecoder = new TextDecoder();
  let result = "";

  async function read() {
    const { done, value } = await reader.read();

    if (done) {
      return result;
    }

    result += textDecoder.decode(value, { stream: true });
    return read();
  }

  return read();
}
