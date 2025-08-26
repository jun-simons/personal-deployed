'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/navbar";
import Theremin from "../../components/theremin";
import MuteButton from "../../components/mute-button";

export default function Blog() {
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = "jdsimons017@gmail.com";

  const copyEmail = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Navbar visible={true} />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <br />
        <h1 className="text-2xl  font-monoreg font-semibold mb-8">Contact me &#x263A;</h1>
        <div className="text-xl font-monoreg space-y-4">
          <p>Email me at</p>
          <div className="flex items-center space-x-2">
            <a
              href={`mailto:${email}`}
              className="group text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="260"
                height="30"
                viewBox="0 0 260 24"
                className="inline-block align-middle"
                fill="currentColor"
              >
                <text
                  x="0"
                  y="18"
                  fontFamily="InputMonoRegular, monospace"
                  fontSize="16"
                >
                  {email}
                </text>
              </svg>
            </a>
            <button
              onClick={copyEmail}
              className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              aria-label="Copy email"
            >
              {copied ? (
                "Copied"
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
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
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-monoreg">
          ^this box is a theramin (click to play)
        </p>
        <MuteButton isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />
      </motion.section>
    </main>
  );
}
