import Link from "next/link";

const NAV_LINKS = [
  { label: "New Arrivals", href: "#" },
  { label: "Shop All", href: "#" },
  { label: "Categories", href: "#" },
  { label: "About", href: "#" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight sm:text-xl">
          Metamen
        </Link>
        <nav aria-label="Primary" className="hidden gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
