const sendJson = (response, body, status = 200) => {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.end(JSON.stringify(body))
}

module.exports = async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end()
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, { error: 'Method Not Allowed' }, 405)
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    sendJson(response, { error: 'ANTHROPIC_API_KEY belum dikonfigurasi di Vercel.' }, 500)
    return
  }

  const input = request.body && Array.isArray(request.body.messages)
    ? request.body.messages
    : []
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
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        max_tokens: 512,
        temperature: 0.2,
        system,
        messages
      })
    })

    const data = await anthropicResponse.json()
    if (!anthropicResponse.ok) {
      sendJson(response, { error: data.error?.message || 'Anthropic API request gagal.' }, anthropicResponse.status)
      return
    }

    const content = data.content?.filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('') || ''
    sendJson(response, { content })
  } catch (error) {
    sendJson(response, { error: error instanceof Error ? error.message : 'Server error.' }, 500)
  }
}
