import "server-only";
import * as RSDW from "react-server-dom-webpack/server.edge";
import * as React from "react";
import { getClientManifest } from "../shared/rsc-manifest";

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
