import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { Calendar, Users, Bell, User, LogOut, Home, MapPin, X, BookOpen } from 'lucide-react'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { notifications, markAsRead } = useNotification()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  
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
          <linearGradient id="navGrad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#navGrad${colorIndex})"/>
        <text x="16" y="21" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    setShowNotifications(false)
  }

  const formatNotificationTime = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffMinutes = Math.floor((now - notificationTime) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Şimdi'
    if (diffMinutes < 60) return `${diffMinutes} dakika önce`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} saat önce`
    return `${Math.floor(diffMinutes / 1440)} gün önce`
  }

  if (!user) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <Calendar className="logo-icon" />
            Sosyal Ajanda
          </Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Giriş Yap</Link>
            <Link to="/register" className="nav-link register-btn">Kayıt Ol</Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Calendar className="logo-icon" />
          Sosyal Ajanda
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <Home size={20} />
            Ana Sayfa
          </Link>
          <Link to="/calendar" className="nav-link">
            <Calendar size={20} />
            Ajanda
          </Link>
          <Link to="/friends" className="nav-link">
            <Users size={20} />
            Arkadaşlar
          </Link>
          <Link to="/events" className="nav-link">
            <Calendar size={20} />
            Etkinlikler
          </Link>
          <Link to="/diary/feed" className="nav-link">
            <BookOpen size={20} />
            Günlük
          </Link>
          <Link to="/map" className="nav-link">
            <MapPin size={20} />
            Harita
          </Link>
          
          <div className="nav-user">
            <div className="notification-container">
              <button className="notification-btn" onClick={toggleNotifications}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Bildirimler</h4>
                    <button 
                      className="close-notifications"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <Bell size={32} />
                        <p>Henüz bildirim yok</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-content">
                            <h5>{notification.title}</h5>
                            <p>{notification.message}</p>
                            <span className="notification-time">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                          </div>
                          {!notification.read && (
                            <div className="unread-indicator" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="user-menu">
              <Link to="/profile" className="user-link">
                <img 
                  src={user.avatar || getDefaultAvatar(user.name)} 
                  alt={user.name || 'Kullanıcı'} 
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = getDefaultAvatar(user.name)
                  }}
                />
                <span>{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar