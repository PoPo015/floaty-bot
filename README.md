# floating-widget

채널톡 스타일의 떠다니는 AI 캐릭터 채팅 위젯. Shadow DOM + Loader script 구조로 어떤 사이트에든 `<script>` 한 줄로 임베드 가능합니다.

## 구조

```
[호스트 페이지]
  └─ <script src="widget.js">           ← 한 줄 임베드
        └─ Shadow DOM 호스트 div 주입
              └─ React 위젯 (격리됨)
                    ├─ FloatingCharacter   ← 우하단 떠다니는 로봇
                    ├─ HintBubble          ← 말풍선 hint
                    └─ ChatPanel           ← 채팅창 (열렸을 때)
                          ├─ MessageList
                          └─ Composer
```

## 스택

- React 18 + TypeScript
- Vite (dev + IIFE 빌드)
- Framer Motion (애니메이션)
- 인라인 SVG 로봇 캐릭터 (외부 의존 없음)

## 실행

```bash
npm install
npm run dev          # http://localhost:5173/demo.html
npm run build:widget # dist/widget.js 단일 번들 생성
```

## 다음 단계

- [ ] Mock API → 실제 Claude API 연동 (스트리밍 SSE)
- [ ] 위키 백엔드 연결 (지식 검색 RAG)
- [ ] 캐릭터 Lottie 교체 옵션
- [ ] 다국어 / 테마 prop
