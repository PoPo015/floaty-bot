# floaty-bot

> 채널톡 스타일의 떠다니는 AI 캐릭터 채팅 위젯.
> 어떤 웹사이트에든 `<script>` 한 줄로 임베드 가능합니다.

🌐 **라이브 데모:** https://popo015.github.io/floaty-bot/

---

## 빠른 시작

호스트 사이트의 `</body>` 직전에 아래 한 줄을 추가하면 끝입니다.

```html
<script src="https://popo015.github.io/floaty-bot/widget.js" defer></script>
```

이게 전부예요. 페이지 우하단에 떠다니는 노란 AI 로봇이 등장하고, 클릭하면 채팅창이 열립니다.

### 동작 환경

- 모든 모던 브라우저 (Chrome, Safari, Firefox, Edge)
- 호스트 페이지 프레임워크 무관 (React, Vue, JSP, plain HTML, WordPress 등)
- 호스트 페이지의 글로벌 CSS는 위젯에 영향 없음 (Shadow DOM 격리)

---

## 사용 예시

### 1. 정적 HTML

```html
<!doctype html>
<html>
  <body>
    <h1>내 사이트</h1>
    <p>본문...</p>

    <script src="https://popo015.github.io/floaty-bot/widget.js" defer></script>
  </body>
</html>
```

### 2. JSP (Spring) — 모든 페이지에 적용

공통 footer/include 파일에 한 번만 추가하면 모든 JSP에 노출됩니다.

```jsp
<%-- inc_bottom.jsp 같은 공통 인클루드 --%>
<script src="https://popo015.github.io/floaty-bot/widget.js" defer></script>
</body>
</html>
```

### 3. Next.js / React

`app/layout.tsx` (App Router) 또는 `_document.tsx` (Pages Router)에서:

```tsx
<Script
  src="https://popo015.github.io/floaty-bot/widget.js"
  strategy="afterInteractive"
/>
```

### 4. WordPress

`Appearance → Theme File Editor → footer.php`의 `</body>` 직전에 동일하게 한 줄 추가.

---

## 자주 묻는 것

**Q. 페이지 어디에 넣어야 하나요?**
A. `</body>` 직전이 가장 안전합니다. `<head>`에 넣어도 `defer` 덕에 동작은 합니다.

**Q. 호스트 페이지 CSS와 충돌하지 않나요?**
A. Shadow DOM으로 격리되어 있어서 호스트가 어떤 글로벌 CSS를 쓰더라도 영향받지 않습니다.

**Q. 같은 페이지에 두 번 박으면 어떻게 되나요?**
A. 첫 번째만 동작합니다. 두 번째 이후는 자동으로 무시됩니다.

**Q. 응답이 진짜 AI인가요?**
A. 현재 mock 모드입니다. 키워드 매칭과 랜덤 응답으로 동작합니다. 실제 LLM 연동은 로드맵에 있습니다.

**Q. 사내망/오프라인 환경에서도 쓸 수 있나요?**
A. GitHub Pages CDN이 차단된 환경이면 `dist/widget.js`를 자체 호스팅에 복사해서 사용하세요. 빌드 방법은 [CLAUDE.md](./CLAUDE.md) 참조.

**Q. 위젯 크기/위치/색상을 바꾸고 싶어요.**
A. 현재 버전은 옵션이 없습니다. 커스터마이징은 fork 후 직접 수정. props 기반 옵션은 [Issues](https://github.com/PoPo015/floaty-bot/issues)에 등록되어 있습니다.

---

## 번들 크기

- `widget.js`: 265KB (gzip ~87KB)
- React + Framer Motion + 위젯 코드 모두 포함된 단일 IIFE 번들

---

## 기여 / 개발

기여하거나 직접 빌드하려면:

- 기술 구조와 아키텍처 → [CLAUDE.md](./CLAUDE.md)
- 향후 작업 / 로드맵 → [GitHub Issues](https://github.com/PoPo015/floaty-bot/issues)

---

## 라이선스

MIT
