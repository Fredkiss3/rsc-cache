import { revalidateTag } from "next/cache";
import { Cache, getCacheKey } from "./cache";
import { CacheErrorBoundary } from "./cache-error-boundary";
import { CachedServerComponent } from "./cached-rsc";
import { SubmitButton } from "./submit-button";

export default async function Page() {
  return (
    <main className="container p-10 flex flex-col gap-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Cache test</h1>
      <h2 className="text-2xl font-semibold">Manually revalidated component</h2>
      <CacheErrorBoundary>
        <Cache id="manual-revalidate">
          <CachedServerComponent id="manual-revalidate" />
        </Cache>
      </CacheErrorBoundary>

      <form
        action={async () => {
          "use server";
          const id = await getCacheKey("manual-revalidate");
          revalidateTag(id);
        }}
      >
        <SubmitButton>Revalidate "manual-revalidate"</SubmitButton>
      </form>

      <h2 className="text-2xl font-semibold">
        Auto revalidated component (every 5s)
      </h2>
      <CacheErrorBoundary>
        <Cache id="auto-revalidate" ttl={5}>
          <CachedServerComponent id="auto-revalidate" />
        </Cache>
      </CacheErrorBoundary>
    </main>
  );
}

export const revalidate = 0;
