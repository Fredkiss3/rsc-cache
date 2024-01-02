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
export function getClientManifest(debug?: boolean) {
  if (debug) {
    console.log(`🔄 getting the client manifest`);
  }
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

  if (debug) {
    console.log(`✅ finished getting the client manifest`);
    console.log(`🔍 Here is its value : `, { clientManifest });
  }
  return clientManifest;
}

export async function renderRSCtoString(
  component: React.ReactNode,
  debug?: boolean
) {
  if (debug) {
    console.log(`🔄 calling \`RSDW.renderToReadableStream()\``);
  }
  const rscStream = RSDW.renderToReadableStream(component, getClientManifest());

  if (debug) {
    console.log(`✅ finished calling \`RSDW.renderToReadableStream()\``);
    console.log(
      `🔄 calling \`transformStreamToString()\` to generate the payload string`
    );
  }

  const rscPayloadStr = await transformStreamToString(rscStream);
  if (debug) {
    console.log(`✅ finished calling \`transformStreamToString()\``);
  }

  return rscPayloadStr;
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
