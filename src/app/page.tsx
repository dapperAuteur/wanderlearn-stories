import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
      <section>
        <p className="text-sm font-medium text-indigo-400 tracking-wide uppercase">
          Coming soon
        </p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-semibold tracking-tight text-white">
          Step inside a story.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Wanderlearn{" "}
          <span className="text-indigo-400 font-medium">Stories</span> rebuilds
          public-domain children&apos;s books as 360° worlds, with
          kindergarten-readiness curriculum mapped to Indiana K standards.
          Built for ages 4–7. Plays in any browser.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/library"
            className="inline-flex items-center min-h-11 px-5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Browse the library
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center min-h-11 px-5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            How it works
          </Link>
        </div>
      </section>

      <section
        aria-label="At a glance"
        className="mt-20 grid gap-6 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
            Books we know
          </p>
          <p className="mt-2 text-base text-slate-200">
            Public-domain literature only. The first world is{" "}
            <em>Alice&apos;s Adventures in Wonderland</em>.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
            Standards-aligned
          </p>
          <p className="mt-2 text-base text-slate-200">
            Every learning moment maps to an Indiana Kindergarten standard.
            Reviewed by a licensed K teacher before launch.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
            Parent-first
          </p>
          <p className="mt-2 text-base text-slate-200">
            Verifiable parental consent before any data collection. No ads,
            no behavioral tracking, no third-party SDKs.
          </p>
        </div>
      </section>
    </div>
  );
}
