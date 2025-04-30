'use client'

import { motion } from "framer-motion";
import Link from "next/link";

interface NavbarProps {
  visible: boolean;
}

const Navbar = ({ visible }: NavbarProps) => {
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
        duration: 0.2, // Short duration for an immediate effect
      },
    },
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ delay: 0.85, duration: 0.75, ease: 'easeOut' }}
      className="
        fixed top-0 left-0 w-full
        bg-transparent dark:bg-transparent
        font-mono
        p-2 sm:p-4        /* ↓ smaller padding on mobile */
        z-30
      "
    >
      <div
        className="
          max-w-3xl mx-auto
          flex justify-between items-center
          px-2 sm:px-4     /* ↓ smaller horizontal gutters on mobile */
          z-40
        "
      >
        {/* Animated Title */}
        <Link href="/" className="flex items-center no-underline">
          <motion.div
            className="
              flex items-center 
              space-x-0.5 sm:space-x-1   /* ↓ tighten up spacing on mobile */
              text-md sm:text-xl         /* ↓ smaller title on mobile */
            "
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            {[...'junsimons.com'].map((char, i) => (
              <motion.span key={i} variants={letterVariants}>
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.div>
        </Link>

        {/* Links */}
        <div
          className="
            flex items-center
            space-x-3 sm:space-x-6     /* ↓ smaller gap between links on mobile */
            text-md sm:text-xl         /* ↓ smaller link text on mobile */
          "
        >
          <Link
            href="/blog"
            className="
              hover:underline
              hover:decoration-green-700 hover:text-green-700
            "
          >
            projects
          </Link>
          <Link
            href="/contact"
            className="
              hover:underline
              hover:decoration-orange-500 hover:text-orange-500
            "
          >
            contact
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
