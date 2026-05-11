export interface ChatEvent {
  event: string;
  data: any;
}

export interface StreamChatArgs {
  apiUrl: string;
  message: string;
  conversationId?: number | null;
}

/**
 * 백엔드의 /api/chat에 POST 요청 + SSE 응답을 파싱해 ChatEvent를 yield.
 * 사용자 식별은 쿠키(fbs_session 또는 어드민 세션 쿠키)로 자동 전송된다.
 */
export async function* streamChat(args: StreamChatArgs): AsyncGenerator<ChatEvent> {
  const res = await fetch(args.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      message: args.message,
      conversation_id: args.conversationId ?? null,
    }),
    credentials: 'include',
  });

  if (!res.ok || !res.body) {
    throw new Error(`chat request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // SSE 표준은 \r\n도 허용. Python sse-starlette은 CRLF로 보내는 경우가 있어
    // \n으로 정규화한 뒤 \n\n으로 블록 분리한다.
    buf += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

    let sepIdx: number;
    while ((sepIdx = buf.indexOf('\n\n')) >= 0) {
      const block = buf.slice(0, sepIdx);
      buf = buf.slice(sepIdx + 2);
      const evt = parseSseBlock(block);
      if (evt) yield evt;
    }
  }
}

function baseFrom(apiUrl: string): string {
  return apiUrl.replace(/\/api\/chat\/?$/, '');
}

export interface ConversationSummary {
  id: number;
  title: string;
  is_starred: number;
  starred_at: string | null;
  created_at: string;
}

export interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface BaseArgs {
  apiUrl: string;
}

export async function listConversations(
  args: BaseArgs & { starredOnly?: boolean; limit?: number },
): Promise<ConversationSummary[]> {
  const params = new URLSearchParams({
    starred_only: args.starredOnly ? 'true' : 'false',
    limit: String(args.limit ?? 50),
  });
  const res = await fetch(`${baseFrom(args.apiUrl)}/api/conversations?${params}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`listConversations ${res.status}`);
  const data = await res.json();
  return data.conversations;
}

export async function getMessages(
  args: BaseArgs & { conversationId: number },
): Promise<StoredMessage[]> {
  const res = await fetch(
    `${baseFrom(args.apiUrl)}/api/conv/${args.conversationId}/messages`,
    { credentials: 'include' },
  );
  if (!res.ok) throw new Error(`getMessages ${res.status}`);
  const data = await res.json();
  return data.messages;
}

export async function toggleStar(
  args: BaseArgs & { conversationId: number; starred: boolean },
): Promise<void> {
  const res = await fetch(`${baseFrom(args.apiUrl)}/api/conv/${args.conversationId}/star`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ starred: args.starred }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`toggleStar ${res.status}`);
}

function parseSseBlock(block: string): ChatEvent | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const raw of block.split('\n')) {
    if (raw.startsWith('event:')) {
      event = raw.slice(6).trim();
    } else if (raw.startsWith('data:')) {
      dataLines.push(raw.slice(5).trim());
    }
  }
  if (dataLines.length === 0) return null;
  const data = dataLines.join('\n');
  try {
    return { event, data: JSON.parse(data) };
  } catch {
    return { event, data };
  }
}
