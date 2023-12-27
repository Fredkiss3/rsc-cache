import { CachedClient } from "./cached-client";

export async function CachedServerComponent({ id }: { id: string }) {
  const currentDate = new Date();
  console.log(`COMPUTING CACHED COMPONENT (ID=${id}) @`, currentDate);
  return (
    <div className="p-4 border border-red-400 rounded-md flex flex-col gap-4">
      <div>
        <p>
          Hello, this is a cached{" "}
          <span className="text-red-400">server component.</span>
          <strong>(ID={id})</strong>
        </p>

        <time dateTime={currentDate.toISOString()}>
          Cached at :&nbsp;
          <b className="text-violet-400">
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "long",
              timeStyle: "long",
              hour12: true,
              timeZone: "Europe/Paris"
            }).format(currentDate)}
          </b>
        </time>
      </div>

      <CachedClient />
    </div>
  );
}
