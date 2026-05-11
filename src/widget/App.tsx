import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FloatingCharacter } from './FloatingCharacter';
import { ChatPanel } from './ChatPanel';
import { ConversationList } from './ConversationList';
import { HintBubble } from './HintBubble';
import { mockChat } from './mockApi';
import {
  streamChat,
  listConversations,
  getMessages,
  toggleStar,
  type ConversationSummary,
} from './apiClient';
import type { Message, WidgetConfig } from './types';

const HINT_TEXT = '안녕하세요! 무엇이든 물어보세요 🤖';
const INITIAL_GREETING = '안녕하세요! AI 도우미예요. 궁금한 게 있으면 편하게 물어보세요.';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function freshGreeting(): Message[] {
  return [{ id: uid(), role: 'assistant', content: INITIAL_GREETING, createdAt: Date.now() }];
}

function parseSqliteIso(iso: string): number {
  const normalized = iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z';
  const t = new Date(normalized).getTime();
  return Number.isNaN(t) ? Date.now() : t;
}

interface AppProps {
  config?: WidgetConfig;
}

export function App({ config }: AppProps = {}) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const [messages, setMessages] = useState<Message[]>(freshGreeting);
  const [pending, setPending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);

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
      if (!config?.apiUrl) {
        const reply = await mockChat(text);
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: 'assistant', content: reply, createdAt: Date.now() },
        ]);
        return;
      }

      const assistantId = uid();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', createdAt: Date.now() },
      ]);

      try {
        for await (const evt of streamChat({
          apiUrl: config.apiUrl,
          message: text,
          conversationId,
        })) {
          if (evt.event === 'conversation') {
            setConversationId(evt.data.conversation_id);
          } else if (evt.event === 'text') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + evt.data.text } : m,
              ),
            );
          } else if (evt.event === 'error') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: `❌ ${evt.data.message}` } : m,
              ),
            );
          }
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `❌ 연결 실패: ${(err as Error).message}` }
              : m,
          ),
        );
      }
    } finally {
      setPending(false);
    }
  };

  const handleOpenMenu = async () => {
    if (!config?.apiUrl) return;
    setShowMenu(true);
    setLoadingConvs(true);
    try {
      const list = await listConversations({ apiUrl: config.apiUrl, userId: config.userId });
      setConversations(list);
    } catch {
      // 목록 비어있게 둠
    } finally {
      setLoadingConvs(false);
    }
  };

  const handleSelectConversation = async (id: number) => {
    if (!config?.apiUrl) return;
    try {
      const stored = await getMessages({
        apiUrl: config.apiUrl,
        conversationId: id,
        userId: config.userId,
      });
      setMessages(
        stored.map((m) => ({
          id: uid(),
          role: m.role,
          content: m.content,
          createdAt: parseSqliteIso(m.created_at),
        })),
      );
      setConversationId(id);
      setShowMenu(false);
    } catch {
      // 무시
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages(freshGreeting());
    setShowMenu(false);
  };

  const handleToggleStar = async (id: number, starred: boolean) => {
    if (!config?.apiUrl) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_starred: starred ? 1 : 0 } : c)),
    );
    try {
      await toggleStar({
        apiUrl: config.apiUrl,
        conversationId: id,
        starred,
        userId: config.userId,
      });
    } catch {
      // 실패 시 되돌리기
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_starred: starred ? 0 : 1 } : c)),
      );
    }
  };

  const toggleOpen = () => {
    setOpen((v) => !v);
    setHint(false);
  };

  const menuEnabled = !!config?.apiUrl;

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
            onOpenMenu={menuEnabled ? handleOpenMenu : undefined}
          >
            {showMenu && (
              <ConversationList
                conversations={conversations}
                currentConvId={conversationId}
                loading={loadingConvs}
                onSelect={handleSelectConversation}
                onNew={handleNewConversation}
                onToggleStar={handleToggleStar}
                onClose={() => setShowMenu(false)}
              />
            )}
          </ChatPanel>
        )}
      </AnimatePresence>

      {!open && (
        <HintBubble show={hint} text={HINT_TEXT} onDismiss={() => setHint(false)} />
      )}

      <FloatingCharacter open={open} onClick={toggleOpen} />
    </div>
  );
}
