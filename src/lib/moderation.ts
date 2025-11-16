const OPENAI_URL = 'https://api.openai.com/v1/moderations';

interface ModerationResult {
  approved: boolean;
  flagged?: boolean;
  reason?: string;
}

export const moderateText = async (text: string): Promise<ModerationResult> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { approved: true, reason: 'no_key' };
  }
  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: text })
    });
    if (!response.ok) {
      console.warn('[moderation] unexpected status', response.status, await response.text());
      return { approved: true, reason: 'api_error' };
    }
    const data = await response.json();
    const flagged = Boolean(data?.results?.[0]?.flagged);
    return { approved: !flagged, flagged };
  } catch (error) {
    console.error('[moderation] failed to call OpenAI', error);
    return { approved: true, reason: 'network_error' };
  }
};
