import { CachedServerComponent } from "../cached-rsc";
import { Cache, getCacheKey } from "../cache";
import { revalidateTag } from "next/cache";
import { CacheErrorBoundary } from "../cache-error-boundary";
import { SubmitButton } from "../submit-button";

export default function Page() {
  return (
    <main className="container p-10 flex flex-col gap-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold">Manually revalidated component</h1>
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
    </main>
  );
}

export const revalidate = 0;
