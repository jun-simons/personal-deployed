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
      initial={{ y: -100, opacity: 0 }} // Start off-screen
      animate={visible ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }} // Slide down when visible
      transition={{ delay: .85, duration: .75, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full bg-transparent font-mono dark:bg-transparent p-4 z-30"
    >
      <div className="max-w-3xl mx-auto flex justify-between px-4 z-40">
        {/* Animated Title */}
        <Link href="/" className="flex space-x-1 text-lg no-underline">
          <motion.div
            className="flex space-x-1 text-xl"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover" // Trigger animation immediately on hover
          >
            {[..."junsimons.com"].map((char, index) => (
              <motion.span key={index} variants={letterVariants}>
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
        </Link>

        {/* Other Links */}
        <div className="space-x-6 text-xl">
          <Link
            href="/blog"
            className="pl-2 hover:underline hover:decoration-green-700 hover:text-green-700"
          >
            projects
          </Link>
          <Link
            href="/contact"
            className="hover:underline hover:decoration-orange-500 hover:text-orange-500"
          >
            contact
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
