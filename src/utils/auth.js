const USERS_KEY = 'interview_users'
const CURRENT_USER_KEY = 'interview_current_user'

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

export function registerUser(name, username, password) {
  const users = getUsers()
  if (users.find(u => u.username === username)) {
    return { success: false, error: 'Username already taken! Try another one.' }
  }
  if (username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' }
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' }
  }
  const newUser = {
    id: Date.now(),
    name: name.trim(),
    username: username.trim().toLowerCase(),
    password,
    createdAt: new Date().toLocaleDateString('en-IN')
  }
  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  const { password: _, ...safeUser } = newUser
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
  return { success: true, user: safeUser }
}

export function loginUser(username, password) {
  const users = getUsers()
  const user = users.find(
    u => u.username === username.trim().toLowerCase() && u.password === password
  )
  if (!user) {
    return { success: false, error: 'Wrong username or password!' }
  }
  const { password: _, ...safeUser } = user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
  return { success: true, user: safeUser }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function isLoggedIn() {
  return getCurrentUser() !== null
}