import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [blockedUsers, setBlockedUsers] = useState([])
  const [blockedByUsers, setBlockedByUsers] = useState([])

  useEffect(() => {
    // Simulated auth check - in real app, check localStorage or make API call
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    // Load blocked users from localStorage
    const savedBlockedUsers = localStorage.getItem('blockedUsers')
    if (savedBlockedUsers) {
      setBlockedUsers(JSON.parse(savedBlockedUsers))
    }
    
    const savedBlockedByUsers = localStorage.getItem('blockedByUsers')
    if (savedBlockedByUsers) {
      setBlockedByUsers(JSON.parse(savedBlockedByUsers))
    }
    
    setLoading(false)
  }, [])

  const getDefaultAvatar = (name) => {
    const initials = name ? name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U'
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
      '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ]
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0
    const bgColor = colors[colorIndex]
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="75" cy="75" r="75" fill="url(#grad${colorIndex})"/>
        <text x="75" y="90" font-family="Arial, sans-serif" font-size="45" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }

  const login = async (email, password) => {
    // Simulated login - in real app, make API call
    const userName = email.split('@')[0] || 'Kullanıcı'
    const mockUser = {
      id: 1,
      name: userName,
      email: email,
      avatar: getDefaultAvatar(userName)
    }
    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
    return mockUser
  }

  const register = async (name, email, password) => {
    // Simulated registration - in real app, make API call
    const mockUser = {
      id: Date.now(),
      name: name,
      email: email,
      avatar: getDefaultAvatar(name)
    }
    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
    return mockUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  // Kullanıcı engelleme fonksiyonu
  const blockUser = (userId) => {
    if (!user || blockedUsers.includes(userId)) return
    
    const updatedBlockedUsers = [...blockedUsers, userId]
    setBlockedUsers(updatedBlockedUsers)
    localStorage.setItem('blockedUsers', JSON.stringify(updatedBlockedUsers))
    
    // Gerçek uygulamada API çağrısı yapılacak
    // Bu simülasyonda engellenen kullanıcının blockedByUsers listesine de ekliyoruz
    const currentBlockedBy = JSON.parse(localStorage.getItem(`blockedBy_${userId}`) || '[]')
    if (!currentBlockedBy.includes(user.id)) {
      currentBlockedBy.push(user.id)
      localStorage.setItem(`blockedBy_${userId}`, JSON.stringify(currentBlockedBy))
    }
  }

  // Kullanıcı engelini kaldırma fonksiyonu
  const unblockUser = (userId) => {
    if (!user || !blockedUsers.includes(userId)) return
    
    const updatedBlockedUsers = blockedUsers.filter(id => id !== userId)
    setBlockedUsers(updatedBlockedUsers)
    localStorage.setItem('blockedUsers', JSON.stringify(updatedBlockedUsers))
    
    // Engellenen kullanıcının blockedByUsers listesinden de çıkar
    const currentBlockedBy = JSON.parse(localStorage.getItem(`blockedBy_${userId}`) || '[]')
    const updatedBlockedBy = currentBlockedBy.filter(id => id !== user.id)
    localStorage.setItem(`blockedBy_${userId}`, JSON.stringify(updatedBlockedBy))
  }

  // Kullanıcının engellenip engellenmediğini kontrol etme
  const isUserBlocked = (userId) => {
    return blockedUsers.includes(userId)
  }

  // Kullanıcının beni engelleyip engellemediğini kontrol etme
  const isBlockedByUser = (userId) => {
    if (!user) return false
    const userBlockedBy = JSON.parse(localStorage.getItem(`blockedBy_${user.id}`) || '[]')
    return userBlockedBy.includes(userId)
  }

  // Kullanıcıları filtreleme fonksiyonu (engellenenler ve engelleyenler hariç)
  const filterBlockedUsers = (users) => {
    if (!user) return users
    
    return users.filter(u => {
      // Benim engellediğim kullanıcıları filtrele
      if (blockedUsers.includes(u.id)) return false
      
      // Beni engelleyen kullanıcıları filtrele
      const userBlockedBy = JSON.parse(localStorage.getItem(`blockedBy_${user.id}`) || '[]')
      if (userBlockedBy.includes(u.id)) return false
      
      return true
    })
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    blockedUsers,
    blockUser,
    unblockUser,
    isUserBlocked,
    isBlockedByUser,
    filterBlockedUsers
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}