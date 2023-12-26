"use client";

import * as React from "react";

export function CachedClient() {
  const [count, setCount] = React.useState(0);
  return (
    <div className="flex flex-col gap-4 p-4 border border-blue-400 rounded-md">
      <strong>
        Hello, this is a child&nbsp;
        <span className="text-blue-400">client component</span>
        &nbsp;from a cached server component
      </strong>
      <button
        onClick={() => setCount(count + 1)}
        className="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-sky-500 dark:highlight-white/20 dark:hover:bg-sky-400"
      >
        Count: {count}
      </button>
    </div>
  );
}
