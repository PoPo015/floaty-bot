# floaty-bot — 기술 메커니즘 문서

채널톡 스타일의 떠다니는 AI 챗 위젯. 어떤 웹사이트에든 `<script>` 한 줄로 임베드 가능하고, GitHub Actions로 자동 빌드 후 GitHub Pages에 배포된다.

라이브: https://popo015.github.io/floaty-bot/
스크립트: https://popo015.github.io/floaty-bot/widget.js
Repo: https://github.com/PoPo015/floaty-bot

---

## 1. 전체 메커니즘 한눈에

```
┌─────────────────── 로컬 개발 ───────────────────┐
│ src/loader.ts ──┐                              │
│ src/widget/*.tsx ┼─▶ vite.widget.config.ts     │
│ React + Framer  ┘     (IIFE 빌드)              │
└────────────────────────┬────────────────────────┘
                         │ git push main
                         ▼
┌──────────────── GitHub Actions ──────────────┐
│ .github/workflows/deploy.yml                  │
│   1. checkout                                 │
│   2. npm ci                                   │
│   3. npm run build:widget  → dist/widget.js   │
│   4. publish/ 구성 (widget.js + index.html +  │
│                    external-test.html)         │
│   5. upload-pages-artifact                    │
│   6. deploy-pages                             │
└────────────────────────┬───────────────────────┘
                         ▼
┌────────────── GitHub Pages CDN ───────────────┐
│ https://popo015.github.io/floaty-bot/widget.js│
│   - HTTP/2, gzip ~87KB                        │
│   - access-control-allow-origin: *            │
│   - cache-control: max-age=600                │
└────────────────────────┬───────────────────────┘
                         ▼
┌─────────────── 임의의 호스트 사이트 ───────────┐
│ <script src=".../widget.js" defer></script>    │
│       │                                        │
│       ▼ loader.ts 실행                         │
│  document.body                                 │
│   └─ <div id="floating-widget-host">          │
│        └─ #shadow-root (open)                  │
│             ├─ <style> :host { all: initial } │
│             └─ <div> ◀ React mountPoint        │
│                  └─ <App>                      │
│                       ├─ FloatingCharacter     │
│                       ├─ HintBubble            │
│                       └─ ChatPanel (open 시)   │
│                            ├─ MessageList      │
│                            └─ Composer         │
└────────────────────────────────────────────────┘
```

---

## 2. 핵심 메커니즘 4가지

### 2.1 Shadow DOM 격리 (`src/loader.ts`)

호스트 페이지의 글로벌 CSS가 위젯에 영향을 못 주도록 Shadow DOM 안에 React를 마운트한다.

```ts
const host = document.createElement('div');
host.id = HOST_ID;                          // 'floating-widget-host'
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

const styleReset = document.createElement('style');
styleReset.textContent = `
  :host { all: initial; }
  * { box-sizing: border-box; font-family: ...; }
`;
shadow.appendChild(styleReset);

const mountPoint = document.createElement('div');
shadow.appendChild(mountPoint);

createRoot(mountPoint).render(createElement(App));
```

**핵심 포인트:**
- `:host { all: initial; }`로 모든 상속 스타일을 reset
- React 17+는 이벤트를 root container에 위임하므로 `createRoot(mountPoint)`로 Shadow DOM 안에 마운트해도 클릭/입력 이벤트가 정상 동작
- Framer Motion은 인라인 스타일을 사용하므로 Shadow DOM과 호환됨 (CSS-in-JS 라이브러리 중 일부는 head에 `<style>` 주입하므로 주의 필요)
- 중복 마운트 방지: `document.getElementById(HOST_ID)`로 체크

**검증 방법:** `examples/external-test.html`은 호스트 페이지에 `* { color: red !important }` 같은 깡패 CSS를 넣어둔 시뮬레이션이다. 위젯이 영향받지 않으면 격리 성공.

### 2.2 Vite IIFE 빌드 (`vite.widget.config.ts`)

여러 모듈을 단일 자가실행 함수로 묶는다. 외부 사이트가 `<script>` 한 줄로 가져갈 수 있게 하기 위함.

```ts
build: {
  lib: {
    entry: 'src/loader.ts',
    name: 'FloatingWidget',
    formats: ['iife'],
    fileName: () => 'widget.js',
  },
  rollupOptions: { output: { inlineDynamicImports: true } },
}
```

**왜 IIFE인가:**
- ESM은 `<script type="module">` 필요 + 동적 import 시 추가 요청 발생
- UMD는 `window.X` 같은 글로벌 노출 — 위젯엔 불필요
- IIFE는 `(function(){...})()` 한 덩어리, 부수효과만 발생 (DOM 마운트), 외부 노출 없음 → 임베드용으로 최적

**번들 사이즈:** 265KB (gzip 87KB). React+Framer Motion 포함. Preact로 바꾸면 ~30KB까지 가능하지만 현재는 우선순위 낮음.

### 2.3 자동 마운트 (DOMContentLoaded)

`<script defer>`로 임베드되어도, body 파싱 완료 시점에 안전하게 마운트된다.

```ts
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();  // 이미 로드 끝났으면 즉시
}
```

이 패턴 덕에 호스트 사이트의 어디에 `<script>`를 박든 (head든 body 끝이든) 동작한다.

### 2.4 GitHub Actions + Pages 자동 배포 (`.github/workflows/deploy.yml`)

`main`에 push할 때마다 빌드 → Pages 배포까지 자동.

```yaml
permissions:
  contents: read
  pages: write
  id-token: write       # Pages OIDC 토큰 발급용

jobs:
  build:
    - npm ci
    - npm run build:widget        # → dist/widget.js
    - mkdir publish && cp ...     # widget.js + landing + external-test
    - actions/configure-pages
    - actions/upload-pages-artifact (path: publish)
  deploy:
    needs: build
    - actions/deploy-pages
```

**Pages 설정 (1회만):**
```bash
gh api -X POST /repos/PoPo015/floaty-bot/pages -f 'build_type=workflow'
```
→ Pages 소스를 "GitHub Actions"로 설정. 이후 워크플로우가 자동으로 배포.

**publish 폴더 구성:**
- `widget.js` — 빌드 결과물
- `index.html` — 랜딩 페이지 (라이브 데모 포함, `public/index.html`에서 복사)
- `external-test.html` — 깡패 CSS 시뮬레이션 (`examples/`에서 복사 후 sed로 경로 교체)

`dist/`는 `.gitignore`에 있어서 repo에 안 들어감. 매 빌드마다 Actions가 새로 만든다 → 소스/빌드 일치 보장.

---

## 3. 디렉토리 구조

```
floaty-bot/
├── .github/workflows/deploy.yml       ◀ Actions 워크플로우
├── public/index.html                  ◀ Pages 랜딩 페이지 (배포용)
├── examples/external-test.html        ◀ 호스트 CSS 격리 검증용
├── demo.html                          ◀ 로컬 dev (Vite가 /src/loader.ts 직접 import)
├── vite.config.ts                     ◀ dev 서버 설정
├── vite.widget.config.ts              ◀ 프로덕션 IIFE 빌드 설정
├── tsconfig.json
├── package.json
├── README.md
├── CLAUDE.md                          ◀ 이 문서
└── src/
    ├── loader.ts                      ◀ 진입점. Shadow DOM + React 마운트
    └── widget/
        ├── App.tsx                    ◀ 상태 관리 (messages, open, pending)
        ├── FloatingCharacter.tsx      ◀ 우하단 떠다니는 버튼 + 호버/클릭
        ├── RobotCharacter.tsx         ◀ 인라인 SVG 로봇 (눈 깜빡임/안테나 흔들림)
        ├── HintBubble.tsx             ◀ 비활성 시 말풍선 hint
        ├── ChatPanel.tsx              ◀ 채팅창 (헤더 + List + Composer)
        ├── MessageList.tsx            ◀ 자동 스크롤 + pending 타이핑
        ├── Bubble.tsx                 ◀ 단일 메시지 + TypingDots
        ├── Composer.tsx               ◀ 입력창 + 전송 버튼
        ├── mockApi.ts                 ◀ 가짜 LLM (정규식 + 랜덤)
        └── types.ts                   ◀ Message, Role
```

---

## 4. 데이터 흐름 (사용자 입력 → 응답)

```
사용자 타이핑
   │
   ▼
Composer.onSubmit()
   │
   ▼
App.handleSend(text)
   ├─ setMessages([...prev, userMsg])    ◀ user 버블 즉시 표시
   ├─ setPending(true)                    ◀ 타이핑 ⚫⚫⚫ 표시
   ├─ await mockChat(text)                ◀ 600~1400ms 가짜 지연
   │     ├─ KEYWORD_REPLIES 정규식 매칭
   │     └─ 매칭 실패 시 CANNED_REPLIES 랜덤
   ├─ setMessages([...prev, assistantMsg])
   └─ setPending(false)
   │
   ▼
MessageList useEffect → endRef.scrollIntoView()  ◀ 자동 스크롤
```

**실제 LLM 연동 시 교체 지점은 단 한 줄:**
```tsx
// src/widget/App.tsx:36
const reply = await mockChat(text);
// ↓ 이렇게 교체
const reply = await fetch(config.apiUrl, {
  method: 'POST',
  body: JSON.stringify({ message: text, history: messages }),
}).then(r => r.text());
```

`mockApi.ts`의 시그니처가 `(text: string) => Promise<string>`이라 인터페이스 호환성을 미리 잡아둔 상태. 스트리밍이 필요하면 SSE/fetch streaming으로 점진 갱신.

---

## 5. 임베드 방법 (사용자 관점)

```html
<script src="https://popo015.github.io/floaty-bot/widget.js" defer></script>
```

이 한 줄을 어떤 사이트의 `</body>` 위에 넣으면 됨. 끝.

**확인된 동작 환경:**
- Shadow DOM이 격리하므로 호스트 페이지의 어떤 글로벌 CSS가 있어도 영향 없음
- CORS는 GitHub Pages가 `access-control-allow-origin: *`로 응답하므로 모든 도메인 허용
- 같은 페이지에 두 번 이상 박혀도 두 번째 이후는 무시 (HOST_ID 체크)

---

## 6. 로컬 개발 흐름

```bash
# 처음 한 번
git clone https://github.com/PoPo015/floaty-bot.git
cd floaty-bot
npm install

# 개발
npm run dev               # http://localhost:5173/demo.html (auto-open)
                         # demo.html이 직접 src/loader.ts를 import (HMR 동작)

# 빌드 검증
npm run build:widget      # dist/widget.js 생성
                         # examples/external-test.html이 ../dist/widget.js를 참조
                         # → 빌드 후 examples/external-test.html을 file:// 또는
                         #   별도 정적 서버로 띄워서 확인 가능

# 배포 (자동)
git push                  # Actions가 알아서 빌드 + Pages 배포
                         # https://popo015.github.io/floaty-bot/ 갱신
```

---

## 7. 알려진 한계 & 의도된 단순화

| 항목 | 현재 | 향후 |
|---|---|---|
| AI 응답 | mock (`mockApi.ts`) | 실제 Claude API 백엔드 + 스트리밍 SSE |
| 백엔드 URL 주입 | 없음 (mock이 클라 안에서 처리) | `<script data-api-url="...">`로 주입 |
| 멀티 인스턴스 | 페이지당 1개만 (HOST_ID 체크) | 의도적 단순화. 변경 시 prefix 옵션 필요 |
| 호스트 JS 격리 | 없음 (같은 메모리 공간) | 진짜 보안 필요 시 iframe 추가 |
| 번들 사이즈 | gzip 87KB | Preact 교체 시 ~30KB 가능 |
| 다국어 | 한국어 하드코딩 | i18n props |
| 캐릭터 교체 | 인라인 SVG 1종 | Lottie 옵션 / props로 교체 가능하게 |
| 메시지 영속화 | 없음 (새로고침 시 사라짐) | localStorage 또는 백엔드 세션 |
| 버저닝 | Pages는 항상 latest | git tag → jsDelivr `@v0.1.0` 핀 |

---

## 8. 향후 확장 포인트

### 8.1 백엔드 URL 주입 (다음 단계 1순위)

`loader.ts`에 한 블록 추가:

```ts
const currentScript = document.currentScript as HTMLScriptElement;
const config = {
  apiUrl: currentScript?.dataset.apiUrl ?? '/api/chat',
  tenant: currentScript?.dataset.tenant ?? 'default',
};
createRoot(mountPoint).render(createElement(App, { config }));
```

호스트 사이트에서:
```html
<script
  src="https://popo015.github.io/floaty-bot/widget.js"
  data-api-url="https://api.your-domain.com/chat"
  data-tenant="acme-corp"
  defer
></script>
```

### 8.2 실제 Claude API 연동

- Spring/FastAPI 백엔드에서 Claude API 프록시
- 클라이언트는 백엔드만 호출 (API 키 노출 방지)
- SSE 스트리밍으로 토큰 단위 갱신 → `MessageList`의 `pending` 상태를 부분 텍스트로 변환

### 8.3 위키 RAG 연결

- 위키 컨텐츠 임베딩 → 벡터 DB
- 사용자 질문 → 백엔드가 관련 위키 청크 검색 → Claude에 컨텍스트 주입
- 응답에 출처(위키 URL) 인라인 링크

### 8.4 버저닝 + jsDelivr 백업

```bash
git tag v0.1.0 && git push --tags
```
→ 호스트 사이트에서 안정 버전 핀 가능:
```
https://cdn.jsdelivr.net/gh/PoPo015/floaty-bot@v0.1.0/dist/widget.js
```
(단 jsDelivr이 dist를 보려면 dist를 commit 필요 — Pages만 쓰면 latest로 충분)

---

## 9. 빠른 트러블슈팅

| 증상 | 원인 후보 | 확인 |
|---|---|---|
| 위젯이 안 뜸 | `<script>` 위치/defer 누락 | DevTools → Network로 widget.js 200 OK 확인, Console 에러 확인 |
| 호스트 CSS가 위젯에 침범 | Shadow DOM이 어떤 이유로 깨짐 | Elements 탭에서 `#floating-widget-host > #shadow-root (open)` 존재 확인 |
| 두 번째 페이지 로드 시 위젯 사라짐 | SPA 라우팅에서 body 갈아엎기 | 라우팅 라이브러리가 body를 비우는지 확인. 필요 시 라우트 변경 시 재마운트 |
| Actions 빌드 실패 | npm ci 실패 / lock 불일치 | 로컬에서 `npm ci` 동일하게 실행해서 재현 |
| Pages가 갱신 안 됨 | 캐시 (max-age=600) | 10분 대기 또는 `?v=$(date +%s)` 쿼리 |

---

## 10. 핵심 의사결정 요약

| 결정 | 이유 |
|---|---|
| **Shadow DOM** (iframe 아님) | 가벼움, 호스트와 부드러운 인터랙션 가능. 진짜 격리 필요 시 iframe 추가 |
| **인라인 SVG 로봇** (Lottie 아님) | 외부 의존 0, 즉시 동작. Lottie는 옵션으로 추후 추가 |
| **Vite IIFE 빌드** | `<script>` 한 줄로 임베드되는 단일 파일 |
| **Framer Motion** | 인라인 스타일 기반이라 Shadow DOM 호환 |
| **`mockApi.ts` 분리** | 인터페이스 안정화 — 실제 LLM 교체 시 한 줄만 변경 |
| **GitHub Pages + Actions** | 무료, 1인 운영, push만으로 배포. 트래픽 늘면 Cloudflare로 이전 |
| **`dist/`는 ignore** | Actions가 매번 새로 빌드 → 소스/번들 불일치 차단 |
