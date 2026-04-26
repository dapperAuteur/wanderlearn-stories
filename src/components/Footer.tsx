import Link from "next/link";
import { ecosystemProducts, PARENT_TAGLINE } from "@/lib/ecosystem";

const linkClasses =
  "inline-flex items-center min-h-[32px] py-1 hover:text-white transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-24">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:justify-between gap-10 text-sm text-slate-300">
        <div>
          <p className="font-semibold text-white mb-1">
            Wanderlearn <span className="text-indigo-400">Stories</span>
          </p>
          <p className="mb-3">{PARENT_TAGLINE}</p>
          <p className="text-slate-400">
            A B4C LLC /{" "}
            <a
              href="https://awesomewebstore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
            >
              AwesomeWebStore.com
              <span className="sr-only"> (opens in new tab)</span>
            </a>{" "}
            brand
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full sm:w-auto">
          <div>
            <p className="text-white font-medium mb-2">Ecosystem</p>
            <ul className="space-y-1">
              {ecosystemProducts.map((product) => (
                <li key={product.slug}>
                  <a
                    href={product.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClasses}
                  >
                    {product.name}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white font-medium mb-2">Stories</p>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className={linkClasses}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/library" className={linkClasses}>
                  Library
                </Link>
              </li>
              <li className="text-slate-400 italic">Alice (coming soon)</li>
            </ul>
          </div>
          <div>
            <p className="text-white font-medium mb-2">Parents</p>
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard" className={linkClasses}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/account" className={linkClasses}>
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/safety" className={linkClasses}>
                  Child safety
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white font-medium mb-2">Legal</p>
            <ul className="space-y-1">
              <li>
                <Link href="/terms" className={linkClasses}>
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={linkClasses}>
                  Privacy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:privacy@witus.online"
                  className={linkClasses}
                >
                  privacy@witus.online
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
