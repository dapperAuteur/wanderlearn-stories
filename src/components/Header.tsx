import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/ecosystem";

const navLinkClasses =
  "inline-flex items-center min-h-11 px-3 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded";

export default function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label={`${PRODUCT_NAME} home`}
          className="inline-flex items-baseline gap-2 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
        >
          <span className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
            Wanderlearn
          </span>
          <span className="text-base sm:text-lg font-semibold text-primary tracking-tight">
            Stories
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link href="/about" className={navLinkClasses}>
            About
          </Link>
          <Link href="/library" className={navLinkClasses}>
            Library
          </Link>
          <Link href="/dashboard" className={navLinkClasses}>
            Parents
          </Link>
        </nav>
      </div>
    </header>
  );
}
