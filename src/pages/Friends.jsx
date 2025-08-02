import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { Search, UserPlus, Users, Calendar, MapPin, Clock, MessageCircle, Eye } from 'lucide-react'
import './Friends.css'

const Friends = () => {
  const { user, filterBlockedUsers } = useAuth()
  const { addNotification } = useNotification()
  
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
          <linearGradient id="friendGrad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="30" fill="url(#friendGrad${colorIndex})"/>
        <text x="30" y="38" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [friendEvents, setFriendEvents] = useState([])
  const [activeTab, setActiveTab] = useState('friends')

  useEffect(() => {
    // Simulated friends data
    const mockFriends = [
      {
        id: 2,
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        avatar: getDefaultAvatar('Ahmet Yılmaz'),
        status: 'online',
        lastSeen: new Date()
      },
      {
        id: 3,
        name: 'Ayşe Demir',
        email: 'ayse@example.com',
        avatar: getDefaultAvatar('Ayşe Demir'),
        status: 'offline',
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 4,
        name: 'Mehmet Kaya',
        email: 'mehmet@example.com',
        avatar: getDefaultAvatar('Mehmet Kaya'),
        status: 'online',
        lastSeen: new Date()
      }
    ]
    // Engellenen kullanıcıları filtrele
    const filteredFriends = filterBlockedUsers(mockFriends)
    setFriends(filteredFriends)

    // Simulated friend requests
    const mockRequests = [
      {
        id: 5,
        name: 'Fatma Özkan',
        email: 'fatma@example.com',
        avatar: getDefaultAvatar('Fatma Özkan'),
        requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ]
    // Engellenen kullanıcıları filtrele
    const filteredRequests = filterBlockedUsers(mockRequests)
    setFriendRequests(filteredRequests)
  }, [user])

  useEffect(() => {
    if (selectedFriend) {
      // Simulated friend events
      const mockEvents = [
        {
          id: 1,
          title: 'Sabah Yürüyüşü',
          description: 'Günlük spor rutini',
          date: new Date(),
          time: '07:30',
          location: 'Merkez Park',
          isPublic: true
        },
        {
          id: 2,
          title: 'Kahve Molası',
          description: 'Arkadaşlarla buluşma',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '15:00',
          location: 'Starbucks',
          isPublic: true
        }
      ]
      setFriendEvents(mockEvents)
    }
  }, [selectedFriend])

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.length > 2) {
      // Simulated search results
      const mockResults = [
        {
          id: 6,
          name: 'Ali Veli',
          email: 'ali@example.com',
          avatar: 'https://via.placeholder.com/150/9C27B0/white?text=AV',
          mutualFriends: 2
        },
        {
          id: 7,
          name: 'Zeynep Ak',
          email: 'zeynep@example.com',
          avatar: 'https://via.placeholder.com/150/607D8B/white?text=ZA',
          mutualFriends: 1
        }
      ].filter(person => 
        person.name.toLowerCase().includes(query.toLowerCase()) ||
        person.email.toLowerCase().includes(query.toLowerCase())
      )
      // Engellenen kullanıcıları filtrele
      const filteredResults = filterBlockedUsers(mockResults)
      setSearchResults(filteredResults)
    } else {
      setSearchResults([])
    }
  }

  const handleSendFriendRequest = (person) => {
    addNotification({
      type: 'toast',
      title: 'Arkadaşlık isteği gönderildi',
      message: `${person.name} kişisine arkadaşlık isteği gönderildi`
    })
  }

  const handleAcceptRequest = (request) => {
    setFriends([...friends, { ...request, status: 'online' }])
    setFriendRequests(friendRequests.filter(req => req.id !== request.id))
    addNotification({
      type: 'toast',
      title: 'Arkadaşlık isteği kabul edildi',
      message: `${request.name} artık arkadaşınız`
    })
  }

  const handleRejectRequest = (request) => {
    setFriendRequests(friendRequests.filter(req => req.id !== request.id))
    addNotification({
      type: 'toast',
      title: 'Arkadaşlık isteği reddedildi',
      message: `${request.name} kişisinin isteği reddedildi`
    })
  }

  const handleJoinEvent = (event) => {
    addNotification({
      type: 'toast',
      title: 'Etkinlik teklifi gönderildi',
      message: `"${event.title}" etkinliği için birlikte yapma teklifi gönderildi`
    })
  }

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

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h1>Arkadaşlar</h1>
        <div className="friends-tabs">
          <button 
            className={activeTab === 'friends' ? 'active' : ''}
            onClick={() => setActiveTab('friends')}
          >
            <Users size={20} />
            Arkadaşlarım ({friends.length})
          </button>
          <button 
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => setActiveTab('requests')}
          >
            <UserPlus size={20} />
            İstekler ({friendRequests.length})
          </button>
          <button 
            className={activeTab === 'search' ? 'active' : ''}
            onClick={() => setActiveTab('search')}
          >
            <Search size={20} />
            Kişi Ara
          </button>
        </div>
      </div>

      <div className="friends-content">
        <div className="friends-sidebar">
          {activeTab === 'friends' && (
            <div className="friends-list">
              {friends.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <h3>Henüz arkadaşınız yok</h3>
                  <p>Kişi arayarak arkadaş ekleyebilirsiniz</p>
                  <button onClick={() => setActiveTab('search')}>
                    Kişi Ara
                  </button>
                </div>
              ) : (
                friends.map(friend => (
                  <div 
                    key={friend.id} 
                    className={`friend-card ${selectedFriend?.id === friend.id ? 'selected' : ''}`}
                  >
                    <div className="friend-avatar" onClick={() => setSelectedFriend(friend)}>
                      <img src={friend.avatar} alt={friend.name} />
                      <div className={`status-indicator ${friend.status}`} />
                    </div>
                    <div className="friend-info" onClick={() => setSelectedFriend(friend)}>
                      <h4>{friend.name}</h4>
                      <p>{friend.status === 'online' ? 'Çevrimiçi' : formatLastSeen(friend.lastSeen)}</p>
                    </div>
                    <div className="friend-actions">
                      <Link to={`/user/${friend.id}`} className="view-profile-btn">
                        <Eye size={16} />
                        Profil
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-list">
              {friendRequests.length === 0 ? (
                <div className="empty-state">
                  <UserPlus size={48} />
                  <h3>Arkadaşlık isteği yok</h3>
                  <p>Yeni arkadaşlık istekleri burada görünecek</p>
                </div>
              ) : (
                friendRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="friend-avatar">
                      <img src={request.avatar} alt={request.name} />
                    </div>
                    <div className="request-info">
                      <h4>{request.name}</h4>
                      <p>{formatLastSeen(request.requestDate)} tarihinde istek gönderdi</p>
                      <div className="request-actions">
                        <button 
                          className="accept-btn"
                          onClick={() => handleAcceptRequest(request)}
                        >
                          Kabul Et
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleRejectRequest(request)}
                        >
                          Reddet
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="search-section">
              <div className="search-input">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="İsim veya e-posta ile ara..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              
              <div className="search-results">
                {searchQuery.length > 2 && searchResults.length === 0 && (
                  <p className="no-results">Sonuç bulunamadı</p>
                )}
                
                {searchResults.map(person => (
                  <div key={person.id} className="search-result">
                    <div className="friend-avatar">
                      <img src={person.avatar} alt={person.name} />
                    </div>
                    <div className="person-info">
                      <h4>{person.name}</h4>
                      <p>{person.email}</p>
                      <span className="mutual-friends">
                        {person.mutualFriends} ortak arkadaş
                      </span>
                    </div>
                    <div className="search-actions">
                      <Link to={`/user/${person.id}`} className="view-profile-btn small">
                        <Eye size={14} />
                        Profil
                      </Link>
                      <button 
                        className="add-friend-btn"
                        onClick={() => handleSendFriendRequest(person)}
                      >
                        <UserPlus size={16} />
                        Ekle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="friend-details">
          {selectedFriend ? (
            <div className="friend-profile">
              <div className="profile-header">
                <div className="profile-avatar">
                  <img src={selectedFriend.avatar} alt={selectedFriend.name} />
                  <div className={`status-indicator ${selectedFriend.status}`} />
                </div>
                <div className="profile-info">
                  <h2>{selectedFriend.name}</h2>
                  <p>{selectedFriend.email}</p>
                  <span className="status">
                    {selectedFriend.status === 'online' ? 'Çevrimiçi' : formatLastSeen(selectedFriend.lastSeen)}
                  </span>
                </div>
                <button className="message-btn">
                  <MessageCircle size={20} />
                  Mesaj Gönder
                </button>
              </div>

              <div className="friend-events">
                <h3>
                  <Calendar size={20} />
                  {selectedFriend.name} kişisinin Etkinlikleri
                </h3>
                
                {friendEvents.length === 0 ? (
                  <div className="no-events">
                    <p>Henüz paylaşılan etkinlik yok</p>
                  </div>
                ) : (
                  <div className="events-list">
                    {friendEvents.map(event => (
                      <div key={event.id} className="event-card">
                        <div className="event-header">
                          <h4>{event.title}</h4>
                          <button 
                            className="join-btn"
                            onClick={() => handleJoinEvent(event)}
                          >
                            Birlikte Yapalım
                          </button>
                        </div>
                        
                        {event.description && (
                          <p className="event-description">{event.description}</p>
                        )}
                        
                        <div className="event-details">
                          {event.time && (
                            <div className="event-detail">
                              <Clock size={14} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="event-detail">
                              <MapPin size={14} />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <Users size={64} />
              <h3>Arkadaş Seçin</h3>
              <p>Bir arkadaşınızı seçerek etkinliklerini görüntüleyebilirsiniz</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Friends