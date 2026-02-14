"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-neutral-600 text-xs tracking-[0.3em] mb-4">
          SOMETHING WENT WRONG
        </p>
        <button
          onClick={reset}
          className="text-xs tracking-[0.3em] text-neutral-400 border border-white/10 px-6 py-3 hover:text-white hover:border-white/30 transition-colors"
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}
