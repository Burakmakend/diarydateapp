import { useState, useEffect } from 'react'
import { User, AtSign } from 'lucide-react'
import './MentionSuggestions.css'

const MentionSuggestions = ({ query, onSelect, onClose }) => {
  const [suggestions, setSuggestions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)

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
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mentionGrad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#mentionGrad${colorIndex})"/>
        <text x="16" y="21" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setSuggestions([])
        return
      }

      setLoading(true)
      
      // Simulated user search - gerçek uygulamada API çağrısı
      const mockUsers = [
        { id: '1', username: 'ahmet', displayName: 'Ahmet Yılmaz', avatar: null },
        { id: '2', username: 'ayse', displayName: 'Ayşe Demir', avatar: null },
        { id: '3', username: 'mehmet', displayName: 'Mehmet Kaya', avatar: null },
        { id: '4', username: 'fatma', displayName: 'Fatma Özkan', avatar: null },
        { id: '5', username: 'ali', displayName: 'Ali Veli', avatar: null },
        { id: '6', username: 'zeynep', displayName: 'Zeynep Çelik', avatar: null },
        { id: '7', username: 'emre', displayName: 'Emre Yıldız', avatar: null },
        { id: '8', username: 'selin', displayName: 'Selin Akar', avatar: null }
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const filtered = mockUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) // Maksimum 5 öneri
      
      setSuggestions(filtered)
      setSelectedIndex(0)
      setLoading(false)
    }

    searchUsers()
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (suggestions.length === 0) return
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [suggestions, selectedIndex, onSelect, onClose])

  if (!query && suggestions.length === 0) return null

  return (
    <div className="mention-suggestions">
      <div className="suggestions-header">
        <AtSign size={14} />
        <span>Kullanıcı Etiketle</span>
      </div>
      
      {loading ? (
        <div className="suggestions-loading">
          <div className="loading-spinner"></div>
          <span>Aranıyor...</span>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="suggestions-empty">
          <User size={16} />
          <span>Kullanıcı bulunamadı</span>
        </div>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((user, index) => (
            <div
              key={user.id}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => onSelect(user)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <img 
                src={user.avatar || getDefaultAvatar(user.displayName)}
                alt={user.displayName}
                className="suggestion-avatar"
              />
              <div className="suggestion-info">
                <div className="suggestion-name">{user.displayName}</div>
                <div className="suggestion-username">@{user.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="suggestions-footer">
        <span>↑↓ ile seç, Enter ile onayla, Esc ile kapat</span>
      </div>
    </div>
  )
}

export default MentionSuggestions