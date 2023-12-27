import Link from "next/link";

export default async function Page() {
  return (
    <main className="container p-10 flex flex-col gap-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">
        Cache test, click on one link for a demo :
      </h1>
      <ol className="list-decimal pl-10 [&_ol]:list-[lower-roman]">
        <li>
          <Link href="/auto-revalidate" className="underline text-blue-600">
            Cached components every 5s
          </Link>
        </li>
        <li>
          <Link href="/manual-revalidate" className="underline text-blue-600">
            Manual revalidated component
          </Link>
        </li>
        <li>
          <Link href="/ssg" className="underline text-blue-600">
            With SSG
          </Link>
        </li>
        <li>
          <Link href="/tweet" className="underline text-blue-600">
            React tweet
          </Link>
        </li>
      </ol>
    </main>
  );
}

export const revalidate = 0;
