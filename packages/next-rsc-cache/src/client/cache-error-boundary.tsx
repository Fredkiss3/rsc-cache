"use client";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

export function CacheErrorBoundary({
  children,
  fallback
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
}) {
  const defaultFallback = (props: FallbackProps) => {
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
        <p>Error rendering the cached component : {props.error.toString()}</p>
        <button onClick={props.resetErrorBoundary}>reset</button>
      </div>
    );
  };
  return (
    <ErrorBoundary FallbackComponent={fallback ?? defaultFallback}>
      {children}
    </ErrorBoundary>
  );
}
