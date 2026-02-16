/**
 * Small 3D-style US flag icon for branding footers
 */
export default function USFlag3D({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-block ${className} rounded-sm overflow-hidden`}
      style={{
        boxShadow: '0 2px 6px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
        transform: 'perspective(200px) rotateY(-5deg)',
      }}
    >
      <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
        {/* Red and white stripes */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
          <rect key={i} x="0" y={i * (40/13)} width="60" height={40/13} fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'} />
        ))}
        {/* Blue canton */}
        <rect x="0" y="0" width="24" height={40 * 7/13} fill="#3C3B6E" />
        {/* Stars (simplified grid) */}
        {[
          [2,2],[6,2],[10,2],[14,2],[18,2],[22,2],
          [4,5],[8,5],[12,5],[16,5],[20,5],
          [2,8],[6,8],[10,8],[14,8],[18,8],[22,8],
          [4,11],[8,11],[12,11],[16,11],[20,11],
          [2,14],[6,14],[10,14],[14,14],[18,14],[22,14],
          [4,17],[8,17],[12,17],[16,17],[20,17],
          [2,20],[6,20],[10,20],[14,20],[18,20],[22,20],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.8" fill="#FFFFFF" />
        ))}
        {/* 3D shine overlay */}
        <defs>
          <linearGradient id="flag-shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="60" height="40" fill="url(#flag-shine)" />
      </svg>
    </span>
  );
}
