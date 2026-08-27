const sendJson = (response, body, status = 200) => {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.end(JSON.stringify(body))
}

export default async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type').end()
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, { error: 'Method Not Allowed' }, 405)
    return
  }

  const apiKeys = (process.env.OPENROUTER_API_KEYS || '').split(',').map((key) => key.trim()).filter(Boolean)
  if (apiKeys.length === 0) {
    sendJson(response, { error: 'OPENROUTER_API_KEYS belum dikonfigurasi di Vercel.' }, 500)
    return
  }

  const input = Array.isArray(request.body?.messages) ? request.body.messages : []
  const system = input.find((message) => message.role === 'system')?.content
  const messages = input
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .slice(-12)
    .map(({ role, content }) => ({ role, content: String(content) }))

  if (messages.length === 0) {
    sendJson(response, { error: 'Pesan tidak boleh kosong.' }, 400)
    return
  }

  try {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKeys[0]}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://firdhanaiv17.vercel.app',
        'X-Title': 'PenTest AI'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free',
        max_tokens: 512,
        temperature: 0.2,
        messages: system ? [{ role: 'system', content: system }, ...messages] : messages
      })
    })

    const data = await openRouterResponse.json()
    if (!openRouterResponse.ok) {
      sendJson(response, { error: data.error?.message || 'OpenRouter API request gagal.' }, openRouterResponse.status)
      return
    }
    sendJson(response, { content: data.choices?.[0]?.message?.content || '' })
  } catch (error) {
    sendJson(response, { error: error instanceof Error ? error.message : 'Server error.' }, 500)
  }
}
