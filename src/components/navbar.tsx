'use client'

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavbarProps {
  visible: boolean;
}

const links = [
  { href: '/blog', label: 'projects', hoverColor: 'green-700' },
  { href: '/art', label: 'art', hoverColor: 'rose-500' },
  { href: '/contact', label: 'contact', hoverColor: 'orange-500' },
] as const;

// hover colors need to appear verbatim in the source for tailwind's JIT to pick
// them up — kept as static classes below rather than templated from the array.

const Navbar = ({ visible }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // close the mobile menu on any route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Framer Motion animation variants
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
        staggerChildren: 0.05,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
        duration: 0.2,
      },
    },
  };

  const linkClassName = (label: string) => {
    switch (label) {
      case 'projects':
        return 'hover:underline hover:decoration-green-700 hover:text-green-700';
      case 'art':
        return 'hover:underline hover:decoration-rose-500 hover:text-rose-500';
      case 'contact':
        return 'hover:underline hover:decoration-orange-500 hover:text-orange-500';
      default:
        return '';
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ delay: 0.85, duration: 0.75, ease: 'easeOut' }}
      className="
        fixed top-0 left-0 w-full
        font-mono
        bg-background
        p-2 sm:p-4
        z-30
      "
    >
      <div
        className="
          max-w-3xl mx-auto
          flex justify-between items-center
          px-2 sm:px-4
          z-40
        "
      >
        {/* Animated Title */}
        <Link href="/" className="flex items-center no-underline">
          <motion.div
            className="
              flex items-center
              space-x-0.5 sm:space-x-1
              text-md sm:text-xl
            "
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            {[...'junsimons.com'].map((char, i) => (
              <motion.span key={i} variants={letterVariants}>
                {char === ' ' ? ' ' : char}
              </motion.span>
            ))}
          </motion.div>
        </Link>

        {/* Desktop links */}
        <div
          className="
            hidden sm:flex items-center
            space-x-6
            text-xl
          "
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClassName(l.label)}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="sm:hidden relative w-6 h-6 flex items-center justify-center"
        >
          <span className="sr-only">Menu</span>
          <span
            aria-hidden
            className={`absolute block w-5 h-px bg-current transition-transform duration-200 ${
              menuOpen ? 'rotate-45' : '-translate-y-1.5'
            }`}
          />
          <span
            aria-hidden
            className={`absolute block w-5 h-px bg-current transition-opacity duration-200 ${
              menuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            aria-hidden
            className={`absolute block w-5 h-px bg-current transition-transform duration-200 ${
              menuOpen ? '-rotate-45' : 'translate-y-1.5'
            }`}
          />
        </button>
      </div>

      {/* Mobile links panel */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            key="mobile-links"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="sm:hidden max-w-3xl mx-auto px-4 pt-2 pb-1 flex flex-col items-end gap-3 text-lg"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={linkClassName(l.label)}
              >
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
