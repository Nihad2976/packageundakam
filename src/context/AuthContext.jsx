import { createContext, useContext, useState, useEffect } from 'react'
import { api, setToken, clearToken, isLoggedIn } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }

    api
      .getMe()
      .then((res) => {
        if (res.user) {
          setUser(res.user)
          setAuthenticated(true)
        } else {
          clearToken()
        }
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = async ({ email, password }) => {
    const res = await api.login({ email, password })
    setToken(res.token)
    setUser(res.user)
    setAuthenticated(true)
    return res
  }

  const signup = async ({ name, email, password, confirmPassword }) => {
    const res = await api.signup({ name, email, password, confirmPassword })
    setToken(res.token)
    setUser(res.user)
    setAuthenticated(true)
    return res
  }

  const logout = () => {
    clearToken()
    setUser(null)
    setAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, authenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
