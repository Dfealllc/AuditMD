// ── AuditMD DeepSeek API Proxy ────────────────────────────────────────
// Netlify Function: /.netlify/functions/chat
// Keeps the DeepSeek API key server-side; browser calls this endpoint.
//
// Setup:
//   1. In Netlify dashboard → Site → Environment Variables
//   2. Add: DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxx
//   3. Deploy — the function is live automatically
// ─────────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Parse request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'messages array is required' }),
    };
  }

  // Validate API key is configured
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY environment variable is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI service not configured. Please contact intake@auditmd.xyz.' }),
    };
  }

  // Cap message history to prevent abuse (keep system + last 10 messages)
  const cappedMessages = messages.slice(0, 11);

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: cappedMessages,
        max_tokens: 600,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek API error:', response.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'AI service temporarily unavailable' }),
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'No response from AI service' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ content }),
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
