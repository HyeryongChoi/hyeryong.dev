'use client';

interface FolderIconProps {
  label: string;
  color?: 'green' | 'amber' | 'cyan';
  onClick?: () => void;
}

export default function FolderIcon({ label, color = 'amber', onClick }: FolderIconProps) {
  const colorClasses = {
    green: 'text-crt-green border-crt-green hover:bg-crt-green',
    amber: 'text-crt-amber border-crt-amber hover:bg-crt-amber',
    cyan: 'text-crt-cyan border-crt-cyan hover:bg-crt-cyan',
  };

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center gap-4 p-6 
        transition-all duration-200 hover:scale-110
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      type="button"
    >
      {/* 폴더 아이콘 */}
      <div className={`
        relative w-32 h-24 border-4 ${colorClasses[color]} 
        transition-all duration-200
        group-hover:shadow-[0_0_30px_currentColor]
      `}>
        {/* 폴더 탭 */}
        <div className={`
          absolute -top-3 left-4 w-12 h-3 border-4 border-b-0 
          ${colorClasses[color]}
        `} />
        
        {/* 폴더 내부 그림자 */}
        <div className="absolute inset-2 bg-black opacity-20" />
      </div>

      {/* 라벨 */}
      <span className={`
        text-2xl font-retro text-glow uppercase tracking-wider
        ${colorClasses[color].split(' ')[0]}
        group-hover:animate-pulse
      `}>
        {label}
      </span>
    </button>
  );
}
