export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      {/* outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] opacity-25 blur-[6px]" />
      <svg viewBox="0 0 40 40" width={size} height={size} className="relative drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
        <defs>
          <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="55%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        {/* circular loop */}
        <circle cx="20" cy="20" r="16.5" fill="none" stroke="url(#lg)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="78 26" transform="rotate(-38 20 20)" />
        <circle cx="20" cy="20" r="16.5" fill="none" stroke="url(#lg2)" strokeWidth="1.1" opacity="0.35" strokeLinecap="round" strokeDasharray="20 84" transform="rotate(142 20 20)" />
        {/* git branch nodes */}
        <circle cx="20" cy="10.5" r="3.1" fill="#0B1020" stroke="url(#lg)" strokeWidth="1.9" />
        <circle cx="20" cy="10.5" r="1.15" fill="#A855F7" />
        <circle cx="12.5" cy="27.5" r="3.1" fill="#0B1020" stroke="#3B82F6" strokeWidth="1.9" />
        <circle cx="12.5" cy="27.5" r="1.15" fill="#3B82F6" />
        <circle cx="27.5" cy="27.5" r="3.1" fill="#0B1020" stroke="#22D3EE" strokeWidth="1.9" />
        <circle cx="27.5" cy="27.5" r="1.15" fill="#22D3EE" />
        {/* branch paths */}
        <path d="M20 13.6 V20 M20 20 L12.5 24.4 M20 20 L27.5 24.4" stroke="url(#lg)" strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M12.5 27.5 C 12.5 20, 20 18, 20 13.6" stroke="#3B82F6" strokeWidth="1.1" opacity="0.45" fill="none" strokeDasharray="2.5 2.5" />
      </svg>
    </div>
  );
}
