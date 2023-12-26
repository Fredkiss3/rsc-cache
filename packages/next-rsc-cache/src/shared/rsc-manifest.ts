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
