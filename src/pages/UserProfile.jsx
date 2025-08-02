import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { 
  User, 
  MapPin, 
  Calendar, 
  Users,
  Activity,
  Star,
  Trophy,
  Clock,
  ArrowLeft,
  UserPlus,
  MessageCircle,
  Award,
  UserX
} from 'lucide-react'
import './UserProfile.css'

const UserProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user, blockUser, isUserBlocked } = useAuth()
  const { addNotification } = useNotification()
  const [profileUser, setProfileUser] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [publicEvents, setPublicEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFriend, setIsFriend] = useState(false)
  const [friendRequestSent, setFriendRequestSent] = useState(false)
  
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
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#grad${colorIndex})"/>
        <text x="60" y="75" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }

  useEffect(() => {
    // Simulated user data fetch
    const fetchUserProfile = () => {
      // Mock user data
      const mockUsers = {
        '1': {
          id: '1',
          name: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          avatar: getDefaultAvatar('Ahmet Yılmaz'),
          bio: 'Doğa severim, fotoğraf çekmeyi ve yeni yerler keşfetmeyi seviyorum.',
          location: 'İstanbul, Türkiye',
          joinDate: new Date('2023-01-15'),
          isOnline: true
        },
        '2': {
          id: '2',
          name: 'Zeynep Kaya',
          email: 'zeynep@example.com',
          avatar: getDefaultAvatar('Zeynep Kaya'),
          bio: 'Kitap okumayı, müze gezmeyi ve sanat etkinliklerini takip etmeyi seviyorum.',
          location: 'Ankara, Türkiye',
          joinDate: new Date('2023-03-20'),
          isOnline: false
        },
        '3': {
          id: '3',
          name: 'Mehmet Demir',
          email: 'mehmet@example.com',
          avatar: getDefaultAvatar('Mehmet Demir'),
          bio: 'Spor yapmayı, teknoloji takip etmeyi ve arkadaşlarımla vakit geçirmeyi seviyorum.',
          location: 'İzmir, Türkiye',
          joinDate: new Date('2023-02-10'),
          isOnline: true
        }
      }

      const mockStats = {
        '1': {
          level: 8,
          xp: 2450,
          nextLevelXp: 3000,
          totalEvents: 15,
          eventsAttended: 12,
          eventsOrganized: 8,
          friendsCount: 24,
          achievements: [
            { id: 1, name: 'Sosyal Kelebek', description: '10 etkinliğe katıl', earned: true, earnedDate: '2023-11-15' },
            { id: 2, name: 'Organizatör', description: '5 etkinlik düzenle', earned: true, earnedDate: '2023-12-01' },
            { id: 3, name: 'Keşifçi', description: '3 farklı şehirde etkinliğe katıl', earned: true, earnedDate: '2023-12-10' },
            { id: 4, name: 'Fotoğraf Ustası', description: '20 etkinlik fotoğrafı paylaş', earned: false, progress: 15 }
          ]
        },
        '2': {
          level: 6,
          xp: 1680,
          nextLevelXp: 2000,
          totalEvents: 11,
          eventsAttended: 9,
          eventsOrganized: 4,
          friendsCount: 18,
          achievements: [
            { id: 1, name: 'Sosyal Kelebek', description: '10 etkinliğe katıl', earned: false, progress: 9 },
            { id: 2, name: 'Organizatör', description: '5 etkinlik düzenle', earned: false, progress: 4 },
            { id: 5, name: 'Kültür Tutkunu', description: '5 kültür etkinliğine katıl', earned: true, earnedDate: '2023-11-20' }
          ]
        },
        '3': {
          level: 10,
          xp: 3200,
          nextLevelXp: 4000,
          totalEvents: 22,
          eventsAttended: 18,
          eventsOrganized: 12,
          friendsCount: 31,
          achievements: [
            { id: 1, name: 'Sosyal Kelebek', description: '10 etkinliğe katıl', earned: true, earnedDate: '2023-10-15' },
            { id: 2, name: 'Organizatör', description: '5 etkinlik düzenle', earned: true, earnedDate: '2023-11-01' },
            { id: 6, name: 'Spor Tutkunu', description: '8 spor etkinliğine katıl', earned: true, earnedDate: '2023-12-05' },
            { id: 7, name: 'Lider', description: '10 etkinlik düzenle', earned: true, earnedDate: '2023-12-15' }
          ]
        }
      }

      const mockPublicEvents = {
        '1': [
          {
            id: 1,
            title: 'Boğaziçi Köprüsü Fotoğraf Turu',
            description: 'Boğaziçi Köprüsü ve çevresinde fotoğraf çekme turu',
            date: new Date('2023-12-20'),
            time: '14:00',
            location: 'Boğaziçi Köprüsü',
            category: 'photography',
            status: 'attended',
            participantCount: 8
          },
          {
            id: 2,
            title: 'Emirgan Korusu Yürüyüşü',
            description: 'Doğada huzurlu bir yürüyüş',
            date: new Date('2023-12-15'),
            time: '09:00',
            location: 'Emirgan Korusu',
            category: 'outdoor',
            status: 'attended',
            participantCount: 12
          },
          {
            id: 3,
            title: 'Galata Kulesi Gezi',
            description: 'Tarihi Galata Kulesi gezisi',
            date: new Date('2023-12-10'),
            time: '16:00',
            location: 'Galata Kulesi',
            category: 'culture',
            status: 'organized',
            participantCount: 15
          }
        ],
        '2': [
          {
            id: 4,
            title: 'Kitap Kulübü Toplantısı',
            description: 'Aylık kitap tartışması',
            date: new Date('2023-12-18'),
            time: '19:00',
            location: 'Kültür Merkezi',
            category: 'culture',
            status: 'organized',
            participantCount: 6
          },
          {
            id: 5,
            title: 'Sanat Galerisi Gezisi',
            description: 'Modern sanat eserleri sergisi',
            date: new Date('2023-12-12'),
            time: '15:00',
            location: 'İstanbul Modern',
            category: 'culture',
            status: 'attended',
            participantCount: 10
          }
        ],
        '3': [
          {
            id: 6,
            title: 'Hafta Sonu Futbol Maçı',
            description: 'Arkadaşlarla futbol oynama',
            date: new Date('2023-12-16'),
            time: '10:00',
            location: 'Spor Kompleksi',
            category: 'sports',
            status: 'organized',
            participantCount: 20
          },
          {
            id: 7,
            title: 'Teknoloji Konferansı',
            description: 'Yapay zeka ve gelecek teknolojileri',
            date: new Date('2023-12-14'),
            time: '13:00',
            location: 'Kongre Merkezi',
            category: 'technology',
            status: 'attended',
            participantCount: 150
          }
        ]
      }

      const userData = mockUsers[userId]
      const statsData = mockStats[userId]
      const eventsData = mockPublicEvents[userId] || []

      if (userData && statsData) {
        setProfileUser(userData)
        setUserStats(statsData)
        setPublicEvents(eventsData)
        
        // Simulate friend status
        setIsFriend(Math.random() > 0.5)
        setFriendRequestSent(Math.random() > 0.7)
      }
      
      setLoading(false)
    }

    fetchUserProfile()
  }, [userId])

  const handleSendFriendRequest = () => {
    setFriendRequestSent(true)
    addNotification({
      type: 'toast',
      title: 'Arkadaşlık isteği gönderildi',
      message: `${profileUser.name} kullanıcısına arkadaşlık isteği gönderildi`
    })
  }

  const handleSendMessage = () => {
    addNotification({
      type: 'toast',
      title: 'Mesaj özelliği',
      message: 'Mesajlaşma özelliği yakında eklenecek'
    })
  }

  const handleBlockUser = () => {
    if (window.confirm(`${profileUser.name} kullanıcısını engellemek istediğinizden emin misiniz? Bu kullanıcı sizi artık göremeyecek.`)) {
      blockUser(profileUser.id)
      addNotification({
        type: 'toast',
        title: 'Kullanıcı Engellendi',
        message: `${profileUser.name} başarıyla engellendi`
      })
      navigate('/friends')
    }
  }

  const getCategoryName = (category) => {
    const categories = {
      sports: 'Spor',
      culture: 'Kültür',
      technology: 'Teknoloji',
      outdoor: 'Doğa',
      photography: 'Fotoğraf',
      food: 'Yemek',
      music: 'Müzik',
      art: 'Sanat'
    }
    return categories[category] || category
  }

  const getStatusText = (status) => {
    return status === 'organized' ? 'Düzenledi' : 'Katıldı'
  }

  const getStatusColor = (status) => {
    return status === 'organized' ? '#667eea' : '#4CAF50'
  }

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="loading-state">
          <Activity className="loading-icon" size={40} />
          <p>Profil yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="user-profile-container">
        <div className="error-state">
          <User size={40} />
          <h3>Kullanıcı bulunamadı</h3>
          <p>Aradığınız kullanıcı mevcut değil.</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={16} />
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  const progressPercentage = (userStats.xp / userStats.nextLevelXp) * 100
  const earnedAchievements = userStats.achievements.filter(a => a.earned)

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
        </button>
        
        <div className="user-info-section">
          <div className="user-avatar-container">
            <img 
              src={profileUser.avatar || getDefaultAvatar(profileUser.name)} 
              alt={profileUser.name || 'Kullanıcı'}
              className="user-profile-avatar"
              onError={(e) => {
                e.target.src = getDefaultAvatar(profileUser.name)
              }}
            />
            {profileUser.isOnline && <div className="online-indicator"></div>}
          </div>
          
          <div className="user-details">
            <h1>{profileUser.name}</h1>
            {profileUser.bio && <p className="user-bio">{profileUser.bio}</p>}
            {profileUser.location && (
              <div className="user-location">
                <MapPin size={16} />
                <span>{profileUser.location}</span>
              </div>
            )}
            <div className="user-join-date">
              <Calendar size={16} />
              <span>Katılım: {format(profileUser.joinDate, 'MMMM yyyy', { locale: tr })}</span>
            </div>
          </div>
        </div>
        
        <div className="user-actions">
          {!isFriend && !friendRequestSent && (
            <button onClick={handleSendFriendRequest} className="friend-request-btn">
              <UserPlus size={16} />
              Arkadaş Ekle
            </button>
          )}
          {friendRequestSent && (
            <button disabled className="friend-request-sent">
              <Clock size={16} />
              İstek Gönderildi
            </button>
          )}
          {isFriend && (
            <button onClick={handleSendMessage} className="message-btn">
              <MessageCircle size={16} />
              Mesaj Gönder
            </button>
          )}
          {!isUserBlocked(profileUser.id) && (
            <button onClick={handleBlockUser} className="block-user-btn">
              <UserX size={16} />
              Engelle
            </button>
          )}
        </div>
      </div>

      <div className="user-profile-content">
        {/* XP ve Seviye Bölümü */}
        <div className="xp-level-section">
          <div className="level-card">
            <div className="level-info">
              <div className="level-badge">
                <Trophy size={24} />
                <span>Seviye {userStats.level}</span>
              </div>
              <div className="xp-info">
                <span>{userStats.xp} XP</span>
                <small className="next-level">Sonraki seviye: {userStats.nextLevelXp} XP</small>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="stats-section">
          <h2>İstatistikler</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{userStats.totalEvents}</span>
                <span className="stat-label">Toplam Etkinlik</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{userStats.eventsAttended}</span>
                <span className="stat-label">Katıldığı Etkinlik</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{userStats.eventsOrganized}</span>
                <span className="stat-label">Düzenlediği Etkinlik</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <User size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{userStats.friendsCount}</span>
                <span className="stat-label">Arkadaş</span>
              </div>
            </div>
          </div>
        </div>

        {/* Başarımlar */}
        <div className="achievements-section">
          <h2>Başarımlar ({earnedAchievements.length}/{userStats.achievements.length})</h2>
          <div className="achievements-grid">
            {userStats.achievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {achievement.earned ? (
                    <Award size={24} />
                  ) : (
                    <Award size={24} className="locked-icon" />
                  )}
                </div>
                <div className="achievement-info">
                  <h4>{achievement.name}</h4>
                  <p>{achievement.description}</p>
                  {achievement.earned ? (
                    <span className="earned-date">
                      {format(new Date(achievement.earnedDate), 'dd MMMM yyyy', { locale: tr })}
                    </span>
                  ) : (
                    achievement.progress && (
                      <div className="progress-info">
                        <span>{achievement.progress}/10</span>
                        <div className="mini-progress">
                          <div 
                            className="mini-progress-fill" 
                            style={{ width: `${(achievement.progress / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Etkinlikler */}
        <div className="public-events-section">
          <h2>Katıldığı Public Etkinlikler ({publicEvents.length})</h2>
          {publicEvents.length > 0 ? (
            <div className="events-list">
              {publicEvents.map(event => (
                <div key={event.id} className="event-item">
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                    <div className="event-meta">
                      <div className="event-detail">
                        <Calendar size={14} />
                        <span>{format(event.date, 'dd MMMM yyyy', { locale: tr })}</span>
                      </div>
                      <div className="event-detail">
                        <Clock size={14} />
                        <span>{event.time}</span>
                      </div>
                      <div className="event-detail">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                      <div className="event-detail">
                        <Users size={14} />
                        <span>{event.participantCount} kişi</span>
                      </div>
                    </div>
                    <div className="event-tags">
                      <span className="category-tag">{getCategoryName(event.category)}</span>
                      <span 
                        className="status-tag" 
                        style={{ backgroundColor: getStatusColor(event.status) }}
                      >
                        {getStatusText(event.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={40} />
              <p>Henüz public etkinliğe katılmamış.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile