import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FloatingCharacter } from './FloatingCharacter';
import { ChatPanel } from './ChatPanel';
import { HintBubble } from './HintBubble';
import { mockChat } from './mockApi';
import type { Message } from './types';

const HINT_TEXT = '안녕하세요! 무엇이든 물어보세요 🤖';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function App() {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: 'assistant',
      content: '안녕하세요! AI 도우미예요. 궁금한 게 있으면 편하게 물어보세요.',
      createdAt: Date.now(),
    },
  ]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setHint(true), 1200);
    return () => clearTimeout(t);
  }, [open]);

  const handleSend = async (text: string) => {
    const userMsg: Message = { id: uid(), role: 'user', content: text, createdAt: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setPending(true);
    try {
      const reply = await mockChat(text);
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'assistant', content: reply, createdAt: Date.now() },
      ]);
    } finally {
      setPending(false);
    }
  };

  const toggleOpen = () => {
    setOpen((v) => !v);
    setHint(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2147483000,
      }}
    >
      <AnimatePresence>
        {open && (
          <ChatPanel
            messages={messages}
            pending={pending}
            onSend={handleSend}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {!open && (
        <HintBubble show={hint} text={HINT_TEXT} onDismiss={() => setHint(false)} />
      )}

      <FloatingCharacter open={open} onClick={toggleOpen} />
    </div>
  );
}
