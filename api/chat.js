const sendJson = (response, body, status = 200) => {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.end(JSON.stringify(body))
}

const keysFromEnvironment = () => (
  process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || ''
)
  .split(/[,\r\n]+/)
  .map((key) => key.trim())
  .filter(Boolean)

let keyRotator

const getKeyRotator = () => {
  const configuredKeys = keysFromEnvironment()
  const configuredValue = configuredKeys.join(',')
  if (!keyRotator || keyRotator.configuration !== configuredValue) {
    keyRotator = {
      configuration: configuredValue,
      keys: configuredKeys,
      currentIndex: 0
    }
  }
  return keyRotator
}

const nextKey = (rotator, attempted) => {
  if (rotator.keys.length === 0) return null
  for (let offset = 0; offset < rotator.keys.length; offset += 1) {
    const index = (rotator.currentIndex + offset) % rotator.keys.length
    if (!attempted.has(index)) {
      rotator.currentIndex = index
      return { key: rotator.keys[index], index }
    }
  }
  return null
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

  const rotator = getKeyRotator()
  if (rotator.keys.length === 0) {
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

  const attempted = new Set()
  for (let attempt = 0; attempt < rotator.keys.length; attempt += 1) {
    const selected = nextKey(rotator, attempted)
    if (!selected) break
    attempted.add(selected.index)

    try {
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${selected.key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'https://firdhanaiv17.vercel.app',
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
      if (openRouterResponse.ok) {
        rotator.currentIndex = (selected.index + 1) % rotator.keys.length
        sendJson(response, { content: data.choices?.[0]?.message?.content || '' })
        return
      }

      // 401/402/429 indicate an unavailable or exhausted key; try the next one.
      if (![401, 402, 429].includes(openRouterResponse.status)) {
        sendJson(response, { error: data.error?.message || 'OpenRouter API request gagal.' }, openRouterResponse.status)
        return
      }
      rotator.currentIndex = (selected.index + 1) % rotator.keys.length
    } catch (error) {
      sendJson(response, { error: error instanceof Error ? error.message : 'Server error.' }, 502)
      return
    }
  }

  sendJson(response, { error: 'Semua OpenRouter API key sedang habis atau tidak tersedia.' }, 503)
}
