'use client'

import { useRef, useEffect } from "react";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface ThereminProps {
  isMuted: boolean;
}

export default function Theremin({ isMuted }: ThereminProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const isPressedRef = useRef(false);

  const getFrequency = (y: number, rect: DOMRect) => {
    const min = 100;
    const max = 1000;
    const relative = 1 - (y - rect.top) / rect.height;
    return min + relative * (max - min);
  };

  const getVolume = (x: number, rect: DOMRect) => {
    const min = 0;
    const max = 0.25;
    const relative = Math.min(Math.max((x - rect.left) / rect.width, 0), 1);
    return min + relative * (max - min);
  };

  const start = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMuted) return;
    isPressedRef.current = true;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const rect = e.currentTarget.getBoundingClientRect();
    gain.gain.value = getVolume(e.clientX, rect);
    osc.frequency.value = getFrequency(e.clientY, rect);
    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
  };

  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPressedRef.current || !oscRef.current || !audioCtxRef.current || !gainRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const freq = getFrequency(e.clientY, rect);
    const vol = getVolume(e.clientX, rect);
    oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    gainRef.current.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
  };

  const stop = () => {
    isPressedRef.current = false;
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
    }
    if (gainRef.current) {
      gainRef.current.disconnect();
      gainRef.current = null;
    }
  };

  useEffect(() => {
    if (isMuted) {
      stop();
    }
  }, [isMuted]);

  return (
    <div
      className="w-full h-64 my-8 border border-gray-300 rounded"
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={stop}
      onMouseLeave={stop}
    />
  );
}

