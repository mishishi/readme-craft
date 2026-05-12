const API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
// Some MiniMax accounts require GroupId as query param
const groupId = process.env.MINIMAX_GROUP_ID;
const url = groupId ? `${API_URL}?GroupId=${groupId}` : API_URL;

interface MiniMaxChoice {
  message: { role: string; content: string };
  finish_reason: string;
}

interface MiniMaxResponse {
  choices: MiniMaxChoice[];
}

export async function generateReadme(
  systemPrompt: string,
  userPrompt: string,
  temperature?: number
): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY 未配置');
  }

  const model = process.env.MINIMAX_MODEL || 'MiniMax-Text-01';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: temperature ?? 0.8,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MiniMax API 错误 (${response.status}): ${text}`);
  }

  const data: MiniMaxResponse = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('MiniMax 返回内容为空');
  }

  return content;
}
