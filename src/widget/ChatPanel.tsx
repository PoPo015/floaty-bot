import { motion } from 'framer-motion';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { RobotCharacter } from './RobotCharacter';
import type { Message } from './types';

interface Props {
  messages: Message[];
  pending: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, pending, onSend, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{
        position: 'absolute',
        bottom: 80,
        right: 0,
        width: 360,
        height: 520,
        background: '#FFFFFF',
        borderRadius: 18,
        boxShadow: '0 14px 40px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          background: 'linear-gradient(135deg, #FFE9A8 0%, #FFD56B 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RobotCharacter size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#2B2D42' }}>AI 도우미</div>
          <div style={{ fontSize: 11, color: '#5A5E73' }}>● 대기중 (mock)</div>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 20,
            color: '#2B2D42',
            padding: 4,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <MessageList messages={messages} pending={pending} />
      <Composer onSend={onSend} disabled={pending} />
    </motion.div>
  );
}
