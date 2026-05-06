import { useEffect, useRef } from 'react';
import { Bubble } from './Bubble';
import type { Message } from './types';

interface Props {
  messages: Message[];
  pending: boolean;
}

export function MessageList({ messages, pending }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, pending]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 14px 6px',
        background: '#FFFFFF',
      }}
    >
      {messages.map((m) => (
        <Bubble key={m.id} role={m.role}>
          {m.content}
        </Bubble>
      ))}
      {pending && <Bubble role="assistant" pending />}
      <div ref={endRef} />
    </div>
  );
}
