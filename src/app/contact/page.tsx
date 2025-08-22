'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Navbar from "../../components/navbar"

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    await navigator.clipboard.writeText("jdsimons017@gmail.com")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Navbar visible={true} />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 text-xl font-monoreg space-y-6"
      >
        <h1 className="text-2xl font-monoreg font-semibold">Contact me &#x263A;</h1>
        <div className="flex items-center gap-2">
          <a
            href="mailto:jdsimons017@gmail.com"
            className="underline decoration-gray-500 decoration-2 underline-offset-4 hover:decoration-green-600 hover:text-green-600 dark:decoration-gray-300 dark:hover:decoration-white transition-colors"
          >
            jdsimons017@gmail.com
          </a>
          <button
            onClick={copyEmail}
            aria-label="Copy email"
            className="text-gray-500 hover:text-green-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/>
            </svg>
          </button>
          {copied && <span className="text-sm text-gray-500">Copied!</span>}
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
      </motion.section>
    </main>
  )
}

