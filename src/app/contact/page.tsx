'use client'

import Navbar from "../../components/navbar"

export default function Blog() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
    <Navbar visible={true} />
      <br></br>
      <h1 className="text-2xl  font-monoreg font-semibold mb-8">Contact me &#x263A;</h1>
      <div className="text-xl font-monoreg"> 
        <p>
          Email me at<br></br>

          <a href="mailto:jdsimons017@gmail.com">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="260" height="30"
            viewBox="0 0 260 24"
            className="inline-block align-middle"
          >
            <text
              x="0" y="18"
              fontFamily="InputMonoRegular, monospace"
              fontSize="16"
              fill="#171717"
            >
              jdsimons017@gmail.com
            </text>
          </svg>
        </a>
          
          <br></br><br></br>
          or find me on&nbsp;
          <a 
            href="https://www.linkedin.com/in/jun-simons/"
            className="underline decoration-gray-500 decoration-2 underline-offset-4 hover:decoration-blue-600 hover:text-blue-600 dark:decoration-gray-300 dark:hover:decoration-white transition-all">
              LinkedIn
          </a>
        </p>
      </div>
    </main>
  )
}
