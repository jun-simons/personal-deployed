'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/navbar";
import Theremin from "../../components/theremin";
import MuteButton from "../../components/mute-button";
import { copyToClipboard } from "../../lib/copy-to-clipboard";

export default function Contact() {
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = "jdsimons017@gmail.com";

  const handleCopy = async () => {
    const ok = await copyToClipboard(email);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Navbar visible={true} />
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        <h1 className="text-2xl font-monoreg font-semibold mb-8">
          Contact me &#x263A;
        </h1>
        <div className="text-xl font-monoreg">
          <p className="mb-6">
            Email me at
            <br />
            <span className="flex items-center gap-2 mt-2">
              <a href={`mailto:${email}`} className="group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="260"
                  height="30"
                  viewBox="0 0 260 24"
                  className="inline-block align-middle"
                >
                  <text
                    x="0"
                    y="18"
                    fontFamily="InputMonoRegular, monospace"
                    fontSize="16"
                    className="fill-neutral-900 dark:fill-neutral-100 transition-colors group-hover:fill-blue-600"
                  >
                    {email}
                  </text>
                </svg>
              </a>
              <button
                onClick={handleCopy}
                aria-label="Copy email"
                className="p-1 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
              >
                {copied ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </span>
          </p>
          <p>
            or find me on&nbsp;
            <a
              href="https://www.linkedin.com/in/jun-simons/"
              className="underline decoration-gray-500 decoration-2 underline-offset-4 hover:decoration-blue-600 hover:text-blue-600 dark:decoration-gray-300 dark:hover:decoration-white transition-all"
            >
              LinkedIn
            </a>
          </p>
        </div>
        <Theremin isMuted={isMuted} />
        <MuteButton isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />
      </motion.section>
    </main>
  );
}
