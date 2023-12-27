"use client";
import { ErrorBoundary } from "react-error-boundary";

export function CacheErrorBoundary({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => {
        if (typeof window === "undefined") {
          console.error(`Error SSR'ing the cached component :`, props.error);
        } else {
          console.error(
            `Error client rendering the cached component :`,
            props.error
          );
        }
        return (
          <div>
            <p>
              Error rendering the cached component : {props.error.toString()}
            </p>
            <button
              className="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-sky-500 dark:highlight-white/20 dark:hover:bg-sky-400"
              onClick={props.resetErrorBoundary}
            >
              reset
            </button>
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
