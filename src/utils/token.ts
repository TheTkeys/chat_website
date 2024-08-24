const TOKEN_KEY = 'token'

let _token = ''

export function setToken(token: string) {
  _token = token

  localStorage.setItem(TOKEN_KEY, token)
}

export function deleteToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getToken() {
  if (!_token) {
    _token = localStorage.getItem(TOKEN_KEY) ?? ''
  }

  return _token
}
