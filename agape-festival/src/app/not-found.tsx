import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-neutral-600 text-xs tracking-[0.3em] mb-4">
          404 — PAGE NOT FOUND
        </p>
        <Link
          href="/"
          className="text-xs tracking-[0.3em] text-neutral-400 border border-white/10 px-6 py-3 hover:text-white hover:border-white/30 transition-colors"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
