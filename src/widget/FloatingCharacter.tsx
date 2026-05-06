import { motion } from 'framer-motion';
import { RobotCharacter } from './RobotCharacter';

interface Props {
  open: boolean;
  onClick: () => void;
}

export function FloatingCharacter({ open, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={open ? '채팅 닫기' : '채팅 열기'}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #FFE9A8 0%, #FFD56B 100%)',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18), inset 0 -3px 6px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        outline: 'none',
      }}
    >
      <RobotCharacter size={44} />
    </motion.button>
  );
}
