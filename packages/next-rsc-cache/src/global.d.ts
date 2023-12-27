declare global {
  type ClientReferenceManifestEntry = {
    id: string;
    // chunks is a double indexed array of chunkId / chunkFilename pairs
    chunks: Array<string>;
    name: string;
  };

  type ClientManifest = {
    [id: string]: ClientReferenceManifestEntry;
  };

  type RSCManifest = {
    clientModules?: ClientManifest;
    moduleLoading?: Record<string, any>;
    ssrModuleMapping?: Record<string, any>;
  };

  var __RSC_MANIFEST: Record<string, RSCManifest> | null;
  var RSC_CACHE_CONFIG: {
    cacheFn?: (
      renderRSC: () => Promise<string>,
      cacheKey: string
    ) => Promise<string>;
    getNextBuildId?: () => Promise<string> | string;
  };
}

export {};
