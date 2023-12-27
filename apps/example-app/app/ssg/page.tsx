import { CachedServerComponent } from "../cached-rsc";
import { Cache } from "../cache";

export default function Page() {
  return (
    <main className="container p-10 flex flex-col gap-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Cache test (with SSG)</h1>
      <Cache id="ssg-test">
        <CachedServerComponent id="ssg" />
      </Cache>
    </main>
  );
}
