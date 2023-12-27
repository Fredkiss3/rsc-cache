import { Cache } from "../cache";
import { Tweet } from "react-tweet";

export default function Page() {
  const THIRTY_MINUTES_IN_SECONDS = 30 * 60;
  return (
    <main className="container p-10 flex flex-col gap-5 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Usage with react-tweet</h1>
      <p className="text-lg">
        This tweet component is revalidated every 30 minutes
      </p>
      <Cache id="tweet" ttl={THIRTY_MINUTES_IN_SECONDS}>
        <CachedTweet />
      </Cache>
    </main>
  );
}

function CachedTweet() {
  const currentDate = new Date();
  return (
    <div>
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
      <Tweet id="1739905872413724966" />
    </div>
  );
}

export const revalidate = 0;
