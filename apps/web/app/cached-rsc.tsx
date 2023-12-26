import { CachedClient } from "./cached-client";

export async function CachedServerComponent() {
  const currentDate = new Date();
  console.log("COMPUTING CACHED COMPONENT !", currentDate);
  return (
    <div className="gap-4 p-4 border border-red-400 rounded-md">
      <p>
        Hello, this is a cached{" "}
        <span className="text-red-400">server component.</span>
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
      <br />
      <br />
      <CachedClient />
    </div>
  );
}
