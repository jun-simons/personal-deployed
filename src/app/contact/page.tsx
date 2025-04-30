'use client'

import Navbar from "../../components/navbar"

export default function Blog() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
    <Navbar visible={true} />

      <br></br>
      <h1 className="text-4xl  font-monoreg font-semibold mb-8">Contact me &#x263A;</h1>
      <div className="text-2xl font-monoreg"> 

      <p>Email me at jdsimons017@gmail.com,<br></br><br></br>
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
