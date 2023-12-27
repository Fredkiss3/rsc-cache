import { CachedServerComponent } from "../cached-rsc";
import { Cache } from "../cache";

export default function Page() {
  return (
    <main className="container p-10 flex flex-col gap-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold">
        Auto revalidated component (every 5s)
      </h1>
      <Cache id="auto-revalidate" ttl={5}>
        <CachedServerComponent id="auto-revalidate" />
      </Cache>
    </main>
  );
}

export const revalidate = 0;
