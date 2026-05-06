import { useState, type FormEvent } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function Composer({ onSend, disabled }: Props) {
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display: 'flex',
        gap: 8,
        padding: 12,
        borderTop: '1px solid #ECEEF3',
        background: '#FFFFFF',
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="무엇이든 물어보세요"
        disabled={disabled}
        style={{
          flex: 1,
          padding: '10px 14px',
          border: '1px solid #E1E4EB',
          borderRadius: 999,
          fontSize: 14,
          outline: 'none',
          background: '#F8F9FB',
          color: '#2B2D42',
        }}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        style={{
          width: 40,
          height: 40,
          border: 'none',
          borderRadius: '50%',
          background: text.trim() && !disabled ? '#FFD56B' : '#E1E4EB',
          cursor: text.trim() && !disabled ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        aria-label="보내기"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 12L21 4L13 21L11 13L3 12Z" stroke="#2B2D42" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}
