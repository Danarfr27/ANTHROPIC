const sendJson = (response, body, status = 200) => {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.end(JSON.stringify(body))
}

export default (request, response) => {
  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type').end()
    return
  }
  if (request.method !== 'POST') {
    sendJson(response, { error: 'Method Not Allowed' }, 405)
    return
  }

  const username = typeof request.body?.username === 'string' ? request.body.username.trim() : ''
  const password = typeof request.body?.password === 'string' ? request.body.password : ''

  for (let index = 1; index <= 100; index += 1) {
    const userNumber = String(index).padStart(2, '0')
    if (
      username === process.env[`USER${userNumber}_USER`] &&
      password === process.env[`USER${userNumber}PASS`]
    ) {
      sendJson(response, { authenticated: true, username })
      return
    }
  }

  sendJson(response, { authenticated: false, error: 'Kredensial tidak valid.' }, 401)
}
