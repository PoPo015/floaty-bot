import { motion } from 'framer-motion';
import type { Role } from './types';

interface Props {
  role: Role;
  children: React.ReactNode;
  pending?: boolean;
}

export function Bubble({ role, children, pending }: Props) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          padding: '9px 13px',
          borderRadius: 14,
          fontSize: 14,
          lineHeight: 1.45,
          background: isUser ? '#FFD56B' : '#F1F3F7',
          color: '#2B2D42',
          borderBottomRightRadius: isUser ? 4 : 14,
          borderBottomLeftRadius: isUser ? 14 : 4,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {pending ? <TypingDots /> : children}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, padding: '2px 4px' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#8A8FA3',
            display: 'inline-block',
          }}
        />
      ))}
    </span>
  );
}
