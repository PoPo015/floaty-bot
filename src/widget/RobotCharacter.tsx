import { motion } from 'framer-motion';

export function RobotCharacter({ size = 44 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <motion.g
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 60px' }}
      >
        <line x1="50" y1="22" x2="50" y2="12" stroke="#3D3D3D" strokeWidth="2.5" strokeLinecap="round" />
        <motion.circle
          cx="50"
          cy="9"
          r="4"
          fill="#FFD56B"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </motion.g>

      <rect x="22" y="28" width="56" height="48" rx="14" fill="#F4F6FA" stroke="#2B2D42" strokeWidth="3" />

      <rect x="32" y="40" width="36" height="22" rx="8" fill="#2B2D42" />

      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{
          duration: 0.25,
          repeat: Infinity,
          repeatDelay: 2.6,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '50px 51px' }}
      >
        <circle cx="42" cy="51" r="3.4" fill="#7CE4FF" />
        <circle cx="58" cy="51" r="3.4" fill="#7CE4FF" />
        <circle cx="43" cy="50" r="1" fill="#FFFFFF" />
        <circle cx="59" cy="50" r="1" fill="#FFFFFF" />
      </motion.g>

      <circle cx="29" cy="62" r="3.5" fill="#FFB3C1" opacity="0.75" />
      <circle cx="71" cy="62" r="3.5" fill="#FFB3C1" opacity="0.75" />

      <path d="M44 68 Q50 72 56 68" stroke="#2B2D42" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      <rect x="38" y="76" width="24" height="6" rx="2" fill="#D7DCE5" stroke="#2B2D42" strokeWidth="2" />

      <circle cx="18" cy="55" r="4" fill="#F4F6FA" stroke="#2B2D42" strokeWidth="2.5" />
      <circle cx="82" cy="55" r="4" fill="#F4F6FA" stroke="#2B2D42" strokeWidth="2.5" />
    </motion.svg>
  );
}
