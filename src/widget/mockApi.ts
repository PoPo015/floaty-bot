const CANNED_REPLIES = [
  '음, 흥미로운 질문이네요! 조금 더 자세히 말씀해 주실 수 있나요?',
  '제가 이해한 바로는 그렇네요. 관련해서 어떤 부분이 가장 궁금하세요?',
  '좋은 포인트예요. 위키에서 비슷한 주제를 찾아드릴까요?',
  '잠시만요, 정리해서 답변드릴게요. 핵심은 다음과 같습니다.',
  '아직 mock 응답이지만, 실제로는 Claude API가 답변하게 될 거예요!',
];

const KEYWORD_REPLIES: Array<{ match: RegExp; reply: string }> = [
  { match: /안녕|hi|hello/i, reply: '안녕하세요! 무엇을 도와드릴까요? 🤖' },
  { match: /고마워|감사/i, reply: '천만에요! 또 궁금한 게 생기면 언제든 불러주세요.' },
  { match: /누구|뭐야|소개/i, reply: '저는 위키에 박혀있는 AI 도우미예요. 아직 mock 모드라 진짜 똑똑하진 않아요 😅' },
  { match: /\?$/, reply: '좋은 질문이에요. 실제 LLM이 연결되면 자세히 답변드릴게요!' },
];

export async function mockChat(userMessage: string): Promise<string> {
  const delay = 600 + Math.random() * 800;
  await new Promise((r) => setTimeout(r, delay));

  for (const { match, reply } of KEYWORD_REPLIES) {
    if (match.test(userMessage)) return reply;
  }
  return CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
}
