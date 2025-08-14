interface MuteButtonProps {
  isMuted: boolean;
  onToggle: () => void;
}

export default function MuteButton({ isMuted, onToggle }: MuteButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isMuted ? "Unmute" : "Mute"}
      className="fixed bottom-4 left-4 z-30 p-2 text-black dark:text-white"
    >
      {isMuted ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <polygon points="3 9 7 9 11 5 11 19 7 15 3 15 3 9" />
          <line x1="16" y1="9" x2="22" y2="15" />
          <line x1="22" y1="9" x2="16" y2="15" />
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
          <polygon points="3 9 7 9 11 5 11 19 7 15 3 15 3 9" />
          <path d="M15 9a5 5 0 0 1 0 6" />
          <path d="M18 6a9 9 0 0 1 0 12" />
        </svg>
      )}
    </button>
  );
}

