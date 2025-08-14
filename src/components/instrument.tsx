// import { i } from "framer-motion/client";
import { useEffect, useRef } from "react";

declare global {
    interface Window {
      webkitAudioContext: typeof AudioContext;
    }
  }


type PitchMode = "pentatonic" | "just_c" | "blues";

interface MusicalGridProps {
  currentMode: PitchMode; // Pass the currentMode as a prop
  pitchModes: Record<PitchMode, { baseFrequency: number; frequencyStep?: number; scale?: number[] }>;
  isMuted: boolean;
}

export default function Instrument({ currentMode, pitchModes, isMuted }: MusicalGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up constants
    const lineSpacing = 100;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const numLinesX = Math.ceil(canvas.width / lineSpacing);
    let mouseX = -1;

    // Sound logic
    function playSound(frequency: number) {
      if (isMuted) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.07, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 2);
    }

    function getFrequencyForLine(lineIndex: number): number {
      const mode = pitchModes[currentMode];
      if (mode.scale) {
        const scaleIndex = lineIndex % mode.scale.length;
        return mode.baseFrequency * mode.scale[scaleIndex];
      } else {
        return mode.baseFrequency + lineIndex * (mode.frequencyStep || 0);
      }
    }

    function drawGrid(animate = false, updatedNumLinesX = numLinesX) {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      
        let animationProgress = 0;
        const duration = 1000;
        const startTime = performance.now();
      
        function drawLines(timestamp: DOMHighResTimeStamp) {
            if (animate) {
            animationProgress = Math.min((timestamp - startTime) / duration, 1);
            } else {
            animationProgress = 1;
            }
        
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        
            for (let i = 0; i <= updatedNumLinesX; i++) {
                const offset = i * lineSpacing;
                const leftX = centerX - offset;
                const rightX = centerX + offset;
        
                if (i / updatedNumLinesX <= animationProgress) {
                    const isBoldLeft = Math.abs(mouseX - leftX) < lineSpacing / 2;
                    const isBoldRight = Math.abs(mouseX - rightX) < lineSpacing / 2;
            
                    if (leftX >= 0) {
                        ctx.beginPath();
                        ctx.moveTo(leftX, 0);
                        ctx.lineTo(leftX, canvas.height);
                        ctx.strokeStyle = isBoldLeft ? "#b4bfb2" : "#d4d4d4";
                        ctx.lineWidth = isBoldLeft ? 3 : 1;
                        ctx.stroke();
                    }

                    if (rightX <= canvas.width) {
                        ctx.beginPath();
                        ctx.moveTo(rightX, 0);
                        ctx.lineTo(rightX, canvas.height);
                        ctx.strokeStyle = isBoldRight ? "#b4bfb2" : "#d4d4d4";
                        ctx.lineWidth = isBoldRight ? 3 : 1;
                        ctx.stroke();
                    }
                }
            }
      
            if (animate && animationProgress < 1) {
                requestAnimationFrame(drawLines);
            }
        }
      
        if (animate) {
          requestAnimationFrame(drawLines);
        } else {
          drawLines(performance.now());
        }
      }
      

    function handleMouseMove(e: MouseEvent) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        drawGrid(false);
    }

    function handleClick() {
        const nearestLineIndex = Math.round((mouseX - centerX) / lineSpacing + numLinesX / 2);
        const frequency = getFrequencyForLine(nearestLineIndex);
        playSound(frequency);
    }

    function handleResize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // const updatedNumLinesX = Math.ceil(canvas.width / lineSpacing);
        drawGrid(false);
    }

    drawGrid(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);

    return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("click", handleClick);
        window.removeEventListener("resize", handleResize);
    };
  }, [currentMode, pitchModes, isMuted]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-10" />;
}
