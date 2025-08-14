interface MuteButtonProps {
  isMuted: boolean;
  onToggle: () => void;
}

export default function MuteButton({ isMuted, onToggle }: MuteButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isMuted ? "Unmute" : "Mute"}
      className="fixed bottom-4 left-4 z-30 rounded-full bg-white/70 dark:bg-gray-800/70 p-2 shadow text-black dark:text-white"
    >
      {isMuted ? "🔇" : "🔊"}
    </button>
  );
}

