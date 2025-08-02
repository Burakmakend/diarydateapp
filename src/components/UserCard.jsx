import { Link } from 'react-router-dom'
import { Clock, MapPin, MessageCircle, UserPlus, Eye, UserX } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './UserCard.css'

const UserCard = ({ user, onMessage, onAddFriend }) => {
  const { blockUser, isUserBlocked } = useAuth()
  
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
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="30" fill="url(#grad${colorIndex})"/>
        <text x="30" y="38" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }
  // Son görülme zamanını formatla
  const formatLastSeen = (date) => {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Şimdi aktif'
    if (minutes < 60) return `${minutes} dakika önce`
    if (hours < 24) return `${hours} saat önce`
    return `${days} gün önce`
  }

  // Mesafe hesaplama (simülasyon)
  const calculateDistance = () => {
    // Gerçek uygulamada haversine formülü kullanılacak
    const distances = ['150 m', '320 m', '500 m', '1.2 km', '2.5 km']
    return distances[Math.floor(Math.random() * distances.length)]
  }

  // Aktivite etiketinin rengini belirle
  const getActivityColor = (tag) => {
    if (tag?.includes('kahve')) return '#8B4513'
    if (tag?.includes('yemek')) return '#FF6B35'
    if (tag?.includes('çalışıyor')) return '#4CAF50'
    if (tag?.includes('etkinlik')) return '#9C27B0'
    return '#666'
  }

  // Kullanıcıyı engelleme fonksiyonu
  const handleBlockUser = () => {
    if (window.confirm(`${user.displayName} kullanıcısını engellemek istediğinizden emin misiniz? Bu kullanıcı sizi artık göremeyecek.`)) {
      blockUser(user.id)
    }
  }

  return (
    <div className="user-card">
      <div className="user-avatar">
        <img 
          src={user.avatarUrl || getDefaultAvatar(user.displayName)} 
          alt={user.displayName || 'Kullanıcı'}
          onError={(e) => {
            e.target.src = getDefaultAvatar(user.displayName)
          }}
        />
        <div className="status-indicator online" />
      </div>
      
      <div className="user-info">
        <div className="user-header">
          <h4 className="user-name">{user.displayName}</h4>
          <span className="user-distance">{calculateDistance()}</span>
        </div>
        
        <div className="user-details">
          <div className="detail-item">
            <Clock size={14} />
            <span>{formatLastSeen(user.updatedAt)}</span>
          </div>
          
          {user.placeName && (
            <div className="detail-item">
              <MapPin size={14} />
              <span>{user.placeName}</span>
            </div>
          )}
          
          {user.activityTag && (
            <div className="activity-tag" style={{ backgroundColor: getActivityColor(user.activityTag) }}>
              {user.activityTag}
            </div>
          )}
        </div>
      </div>
      
      <div className="user-actions">
        <Link 
          to={`/user/${user.id}`}
          className="action-btn view-profile-btn"
          title="Profili görüntüle"
        >
          <Eye size={16} />
        </Link>
        
        <button 
          className="action-btn message-btn"
          onClick={() => onMessage?.(user)}
          title="Mesaj gönder"
        >
          <MessageCircle size={16} />
        </button>
        
        <button 
          className="action-btn add-friend-btn"
          onClick={() => onAddFriend?.(user)}
          title="Arkadaş ekle"
        >
          <UserPlus size={16} />
        </button>
        
        <button 
          className="action-btn block-user-btn"
          onClick={handleBlockUser}
          title="Kullanıcıyı engelle"
        >
          <UserX size={16} />
        </button>
      </div>
    </div>
  )
}

export default UserCard