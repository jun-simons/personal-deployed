'use client';
import { motion, useAnimate } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import Instrument from "../components/instrument";
import Navbar from "../components/navbar"

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const pentatonicBaseScale = [1, 1.125, 1.25, 1.5, 1.875];

const pentatonicExtendedScale = [
  ...pentatonicBaseScale, // First octave
  ...pentatonicBaseScale.map((n) => n * 2), // Second octave
  ...pentatonicBaseScale.map((n) => n * 4), // Third octave
];

const cMajorBaseScale = [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8]; // One octave

// Extend across 3 octaves
const cMajorExtendedScale = [
  ...cMajorBaseScale, // First octave
  ...cMajorBaseScale.map((n) => n * 2), // Second octave
  ...cMajorBaseScale.map((n) => n * 4), // Third octave
  ...cMajorBaseScale.map((n) => n * 8), // Fourth octave
];

const bluesBaseScale = [1, 6 / 5, 4 / 3, 45 / 32, 3 / 2, 9 / 5];

// Extend across 4 octaves
const bluesExtendedScale = [
  ...bluesBaseScale, // First octave
  ...bluesBaseScale.map((n) => n * 2), // Second octave
  ...bluesBaseScale.map((n) => n * 4), // Third octave
  ...bluesBaseScale.map((n) => n * 8), // Fourth octave
];

type PitchMode = "pentatonic" | "just_c" | "blues";

const pitchModes: Record<PitchMode, { baseFrequency: number; frequencyStep?: number; scale?: number[] }> = {
  pentatonic: { baseFrequency: 100, scale: pentatonicExtendedScale },
  just_c: { baseFrequency: 130.81, scale: cMajorExtendedScale},
  blues: { baseFrequency: 130.81, scale: bluesExtendedScale},
};

export default function Home() {
  const [currentMode, setCurrentMode] = useState<PitchMode>("pentatonic");
  // const currentModeRef = useRef(currentModse);

  const [scope, animate] = useAnimate(); // useAnimate hook for controlling animations
  const [hasScrolled, setHasScrolled] = useState(false); // Tracks if the user has scrolled

  // Trigger initial animation on page load
  useEffect(() => {
    async function initialAnimation() {
      await animate(scope.current, { opacity: 1, y: -50 }, { delay: 0.5, duration: 0.7, ease: 'easeOut' });
    }

    initialAnimation();
  }, [animate, scope]);

  // Scroll event listener for triggering the second animation
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault(); // Prevent the default scroll behavior

      if (e.deltaY > 0 && !hasScrolled) {
        setHasScrolled(true); // Mark that the scroll animation has been triggered

        // Trigger scroll animation
        animate(
          scope.current,
          { y: -200, scale: 1, opacity: 0 },
          { duration: 0.5, ease: 'easeOut' }
        );
      }
    };

    // Add scroll event listener
    window.addEventListener('wheel', handleScroll, { passive: false });

    return () => {
      // Cleanup scroll event listener
      window.removeEventListener('wheel', handleScroll);
    };
  }, [animate, hasScrolled, scope]);

  useEffect(() => {
    const trigger = () => {
      if (!hasScrolled) {
        setHasScrolled(true)
        // your scroll-animation:
        animate(scope.current, { y: -200, scale: 1, opacity: 0 }, { duration: 0.5, ease: 'easeOut' })
      }
    }
  
    const onScroll = () => {
      if (window.scrollY > 10) trigger()
    }
  
    // listen for any scrolling
    window.addEventListener('scroll', onScroll, { passive: true })
  
    // optional: could add touch drags
    window.addEventListener('touchmove', onScroll, { passive: true })
  
    // fallback: after 6s, if nothing happened, auto-fire
    const timer = setTimeout(trigger, 5000)
  
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchmove', onScroll)
    }
  }, [hasScrolled, animate, scope])

  return (
    <main className="flex h-screen items-center justify-center bg-background dark:bg-black overflow-hidden">
      {/* Canvas for the grid background */}

      <Instrument currentMode={currentMode} pitchModes={pitchModes}  />

      {/* Navbar - Only render if scrolled */}
      <Navbar visible={hasScrolled} />

      {/* Header with animations */}
      <motion.h1
        ref={scope} // Connect to useAnimate
        initial={{ opacity: 0, y: -150 }} // Initial state
        className="text-[13vw] sm:text-[12vw] md:text-[10vw] lg:text-[7em] font-display tracking-widest text-center z-20"
      >
        Jun Simons
      </motion.h1>


      {/* About Me Section */}
      <motion.section
        initial={{ opacity: 0, y: 50, pointerEvents: 'none' }} // Start hidden
        animate={hasScrolled ? { opacity: 1, y: 0, pointerEvents: 'auto' } : {}} // Animate when scroll happens
        transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }} // Smooth transition
        className="absolute inset-0 flex items-center justify-center z-20"
      >
        <div className="w-4/5 max-w-[800px] text-center">
          <p className="text-xl text-gray-700 font-mono dark:text-gray-300 mb-6">
            I&rsquo;m a junior at RPI studying Computer Science. I currently work at&nbsp;
            <a 
              href="https://www.ll.mit.edu/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline decoration-gray-500 decoration-2 underline-offset-4 hover:decoration-blue-600 hover:text-blue-600 dark:decoration-gray-300 dark:hover:decoration-white transition-all"
            >
              MIT Lincoln Laboratory
            </a>{' '}
             on Software Engineering, Algorithm Design, and AI/ML research.
          </p>
          <p className="text-xl text-gray-700 font-mono dark:text-gray-300 mb-6">
              I previously did a co-op at&nbsp;
            <a 
              href="https://innovativemedicine.jnj.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline decoration-gray-500 decoration-2 underline-offset-4 hover:decoration-red-600 hover:text-red-600 dark:decoration-gray-300 dark:hover:decoration-white transition-all"
            >
              Johnson and Johnson
            </a>{' '}
            on the Advanced Computing team, doing software and cloud engineering.
          </p>
          <p className="text-xl text-gray-700 font-mono dark:text-gray-300 ">
              In my free time, I often play music, make art, and dance. I&rsquo;m interested in the 
              art-technology intersection. 
          </p>
        </div>
        
      </motion.section>

      {/* Link to Posts */}
      <motion.div
        initial={{ opacity: 0, y: 50, pointerEvents: 'auto' }}
        animate={hasScrolled ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1, duration: .75 }}
        className="absolute bottom-10 z-40"
      >
        <Link
          href="/blog"
          className="text-lg font-mono text-gray-600 hover:underline decoration-2 underline-offset-4 hover:decoration-green-700 hover:text-green-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
          Explore My Projects →
        </Link>
      </motion.div>


      <div className="mode-selector fixed bottom-4 right-4 z-50">
        <select
          value={currentMode}
          onChange={(e) => setCurrentMode(e.target.value as PitchMode)} // Update the state based on selection
          className="px-4 py-2 bg-gray-200 font-mono rounded-md shadow-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {(Object.keys(pitchModes) as PitchMode[]).map((mode) => (
            <option key={mode} value={mode} className="text-black font-mono dark:text-white">
              {mode}
            </option>
          ))}
        </select>
      </div>



      
    </main>
  );
}