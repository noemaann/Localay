import React from "react";

/**
 * Atomic skeleton box with subtle pulse animation.
 */
export function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-monsoon-200/70 rounded-lg ${className}`}
    />
  );
}

/**
 * PlaceCardSkeleton — matches PlaceCard dimensions with an image box skeleton
 * suitable for image loading.
 */
export function PlaceCardSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading spot..."
      className="flex flex-col h-full rounded-2xl border border-monsoon-200/80 bg-white shadow-xs overflow-hidden"
    >
      {/* Image Skeleton Box with Photo Placeholder SVG */}
      <div className="relative h-36 w-full bg-monsoon-100/90 animate-pulse flex items-center justify-center text-monsoon-300 ring-1 ring-black/5">
        <svg
          className="w-8 h-8 opacity-40"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </div>

      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div>
          {/* Category Pill Skeleton */}
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-20 rounded-md bg-monsoon-200/80" />
            <Skeleton className="h-4 w-12 rounded-md bg-monsoon-100" />
          </div>

          {/* Title Skeleton */}
          <Skeleton className="h-5 w-3/4 mb-2 bg-monsoon-200/90" />

          {/* Description Lines */}
          <div className="space-y-1.5 mt-2">
            <Skeleton className="h-3 w-full bg-monsoon-200/60" />
            <Skeleton className="h-3 w-4/5 bg-monsoon-200/60" />
          </div>
        </div>

        {/* Footer Meta Skeleton */}
        <div className="pt-3 border-t border-monsoon-100 flex items-center justify-between">
          <Skeleton className="h-4 w-24 bg-monsoon-200/60" />
          <Skeleton className="h-4 w-14 rounded-full bg-monsoon-200/70" />
        </div>
      </div>
    </div>
  );
}

/**
 * PlaceDetailSkeleton — matches PlaceDetailPage hero & details layout.
 */
export function PlaceDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading spot details..."
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8"
    >
      {/* Back link placeholder */}
      <Skeleton className="h-4 w-32" />

      {/* Hero Header Skeleton Box */}
      <div className="relative rounded-3xl overflow-hidden bg-monsoon-200/70 p-7 sm:p-12 h-64 sm:h-80 animate-pulse flex flex-col justify-end">
        <div className="relative z-10 space-y-3 max-w-xl">
          <Skeleton className="h-6 w-28 rounded-full bg-monsoon-300/80" />
          <Skeleton className="h-10 w-3/4 bg-monsoon-300/90" />
          <Skeleton className="h-4 w-full bg-monsoon-300/70" />
          <Skeleton className="h-4 w-2/3 bg-monsoon-300/70" />
        </div>
      </div>

      {/* Content Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-monsoon-200 bg-white p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="rounded-2xl border border-monsoon-200 bg-white p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-monsoon-200 bg-white p-6 space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
