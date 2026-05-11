import type { ConversationSummary } from './apiClient';

interface Props {
  conversations: ConversationSummary[];
  currentConvId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
  onNew: () => void;
  onToggleStar: (id: number, starred: boolean) => void;
  onClose: () => void;
}

function formatDate(iso: string): string {
  try {
    const normalized = iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z';
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ConversationList({
  conversations,
  currentConvId,
  loading,
  onSelect,
  onNew,
  onToggleStar,
  onClose,
}: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 25,
      }}
    >
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
        <button
          onClick={onClose}
          aria-label="채팅으로"
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
          ←
        </button>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 14, color: '#2B2D42' }}>
          대화 목록
        </div>
        <button
          onClick={onNew}
          style={{
            border: 'none',
            background: '#2B2D42',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: 12,
            padding: '6px 12px',
            borderRadius: 14,
            fontWeight: 600,
          }}
        >
          + 새 대화
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {loading && (
          <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            불러오는 중…
          </div>
        )}
        {!loading && conversations.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            아직 저장된 대화가 없어요
          </div>
        )}
        {!loading &&
          conversations.map((conv) => {
            const isActive = conv.id === currentConvId;
            const starred = !!conv.is_starred;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                style={{
                  padding: '10px 12px 10px 13px',
                  borderLeft: isActive ? '3px solid #FFD56B' : '3px solid transparent',
                  background: isActive ? 'rgba(255, 213, 107, 0.12)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#2B2D42',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {conv.title || '제목 없음'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                    {formatDate(conv.created_at)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(conv.id, !starred);
                  }}
                  aria-label={starred ? '별표 해제' : '별표'}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 16,
                    color: starred ? '#F59E0B' : '#D1D5DB',
                    padding: 6,
                    lineHeight: 1,
                  }}
                >
                  ★
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
