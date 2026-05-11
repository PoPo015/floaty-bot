import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  onOpenMenu?: () => void;
  children?: ReactNode;
}

interface PanelSize {
  width: number;
  height: number;
}

const STORAGE_KEY = 'floaty-bot:panel-size';
const DEFAULT_SIZE: PanelSize = { width: 360, height: 520 };
const MIN: PanelSize = { width: 320, height: 400 };
const MAX: PanelSize = { width: 800, height: 900 };

function loadSize(): PanelSize {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.width === 'number' &&
        typeof parsed.height === 'number' &&
        parsed.width >= MIN.width &&
        parsed.height >= MIN.height
      ) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_SIZE;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ChatPanel({ messages, pending, onSend, onClose, onOpenMenu, children }: Props) {
  const [size, setSize] = useState<PanelSize>(() => loadSize());
  const dragStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
    } catch {
      // ignore
    }
  }, [size]);

  const onGripDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = dragStart.current.x - ev.clientX;
      const dy = dragStart.current.y - ev.clientY;
      setSize({
        width: clamp(dragStart.current.w + dx, MIN.width, MAX.width),
        height: clamp(dragStart.current.h + dy, MIN.height, MAX.height),
      });
    };
    const onUp = () => {
      dragStart.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

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
        width: size.width,
        height: size.height,
        background: '#FFFFFF',
        borderRadius: 18,
        boxShadow: '0 14px 40px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 좌상단 리사이즈 grip */}
      <div
        onMouseDown={onGripDown}
        role="separator"
        aria-label="패널 크기 조절"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 18,
          height: 18,
          cursor: 'nwse-resize',
          zIndex: 20,
          background:
            'linear-gradient(135deg, transparent 0%, transparent 55%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.18) 65%, transparent 65%, transparent 75%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0.18) 85%, transparent 85%)',
          borderTopLeftRadius: 18,
        }}
      />

      <div
        style={{
          padding: '14px 16px',
          paddingLeft: 22,
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
          <div style={{ fontSize: 11, color: '#5A5E73' }}>● 대기중</div>
        </div>
        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            aria-label="대화 목록"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 18,
              color: '#2B2D42',
              padding: 4,
              lineHeight: 1,
            }}
          >
            ☰
          </button>
        )}
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

      {children}
    </motion.div>
  );
}
