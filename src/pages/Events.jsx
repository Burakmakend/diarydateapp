import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Plus, MapPin, Clock, Users, Calendar, Filter, Search, Star } from 'lucide-react'
import LocationPicker from '../components/LocationPicker'
import './Events.css'

const Events = () => {
  const { user } = useAuth()
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
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="eventsGrad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill="url(#eventsGrad${colorIndex})"/>
        <text x="24" y="30" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }
  const [events, setEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [activeTab, setActiveTab] = useState('discover')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date') // date, popularity, newest
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    locationData: null,
    category: 'social',
    maxParticipants: '',
    isPublic: true,
    visibility: 'PUBLIC'
  })

  useEffect(() => {
    // Simulated public events
    const mockEvents = [
      {
        id: 1,
        title: 'Hafta Sonu Yürüyüşü',
        description: 'Doğada güzel bir yürüyüş yapmak isteyen herkesi bekliyoruz!',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: '09:00',
        location: 'Belgrad Ormanı',
        category: 'sports',
        organizer: {
          id: 2,
          name: 'Ahmet Yılmaz',
          avatar: null
        },
        participants: [
          { id: 2, name: 'Ahmet Yılmaz' },
          { id: 3, name: 'Ayşe Demir' },
          { id: 4, name: 'Mehmet Kaya' }
        ],
        maxParticipants: 10,
        isPublic: true
      },
      {
        id: 2,
        title: 'Kahve ve Sohbet',
        description: 'Rahat bir ortamda kahve içip sohbet edelim.',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        time: '15:30',
        location: 'Starbucks Nişantaşı',
        category: 'social',
        organizer: {
          id: 3,
          name: 'Ayşe Demir',
          avatar: null
        },
        participants: [
          { id: 3, name: 'Ayşe Demir' },
          { id: 5, name: 'Fatma Özkan' }
        ],
        maxParticipants: 6,
        isPublic: true
      },
      {
        id: 3,
        title: 'Fotoğrafçılık Workshop',
        description: 'Temel fotoğrafçılık tekniklerini öğrenelim.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        time: '14:00',
        location: 'Sanat Merkezi',
        category: 'education',
        organizer: {
          id: 4,
          name: 'Mehmet Kaya',
          avatar: null
        },
        participants: [
          { id: 4, name: 'Mehmet Kaya' }
        ],
        maxParticipants: 15,
        isPublic: true
      }
    ]
    setEvents(mockEvents)

    // Simulated user's events
    const userEvents = [
      {
        id: 4,
        title: 'Kitap Kulübü Toplantısı',
        description: 'Bu ayın kitabını tartışacağız.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        time: '19:00',
        location: 'Kafe Kitap',
        category: 'education',
        organizer: user,
        participants: [
          user,
          { id: 2, name: 'Ahmet Yılmaz' }
        ],
        maxParticipants: 8,
        isPublic: true
      }
    ]
    setMyEvents(userEvents)
  }, [user])

  const categories = {
    all: 'Tümü',
    social: 'Sosyal',
    sports: 'Spor',
    education: 'Eğitim',
    culture: 'Kültür',
    food: 'Yemek'
  }

  const getFilteredAndSortedEvents = () => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory
      return matchesSearch && matchesCategory
    })

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date)
        case 'popularity':
          return (b.participants?.length || 0) - (a.participants?.length || 0)
        case 'newest':
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        default:
          return 0
      }
    })

    return filtered
  }

  const filteredEvents = getFilteredAndSortedEvents()

  const handleCreateEvent = (e) => {
    e.preventDefault()
    
    const newEvent = {
      id: Date.now(),
      ...eventForm,
      date: new Date(eventForm.date),
      organizer: user,
      participants: [user],
      maxParticipants: parseInt(eventForm.maxParticipants) || 10
    }
    
    if (eventForm.isPublic) {
      setEvents([...events, newEvent])
    }
    setMyEvents([...myEvents, newEvent])
    
    addNotification({
      type: 'toast',
      title: 'Etkinlik oluşturuldu',
      message: 'Yeni etkinlik başarıyla oluşturuldu'
    })
    
    setShowCreateModal(false)
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'social',
      maxParticipants: '',
      isPublic: true
    })
  }

  const handleJoinEvent = (event) => {
    if (event.participants.some(p => p.id === user.id)) {
      addNotification({
        type: 'toast',
        title: 'Zaten katılıyorsunuz',
        message: 'Bu etkinliğe zaten katılım sağlamışsınız'
      })
      return
    }

    if (event.participants.length >= event.maxParticipants) {
      addNotification({
        type: 'toast',
        title: 'Etkinlik dolu',
        message: 'Bu etkinlik maksimum katılımcı sayısına ulaştı'
      })
      return
    }

    const updatedEvent = {
      ...event,
      participants: [...event.participants, user]
    }

    setEvents(events.map(e => e.id === event.id ? updatedEvent : e))
    
    addNotification({
      type: 'toast',
      title: 'Etkinliğe katıldınız',
      message: `"${event.title}" etkinliğine başarıyla katıldınız`
    })
  }

  const handleLeaveEvent = (event) => {
    const updatedEvent = {
      ...event,
      participants: event.participants.filter(p => p.id !== user.id)
    }

    setEvents(events.map(e => e.id === event.id ? updatedEvent : e))
    
    addNotification({
      type: 'toast',
      title: 'Etkinlikten ayrıldınız',
      message: `"${event.title}" etkinliğinden ayrıldınız`
    })
  }

  const isUserParticipant = (event) => {
    return event.participants.some(p => p.id === user.id)
  }

  const isEventFull = (event) => {
    return event.participants.length >= event.maxParticipants
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Etkinlikler</h1>
        <button className="create-event-btn" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Etkinlik Oluştur
        </button>
      </div>

      <div className="events-tabs">
        <button 
          className={activeTab === 'discover' ? 'active' : ''}
          onClick={() => setActiveTab('discover')}
        >
          <Search size={20} />
          Etkinlikleri Keşfet
        </button>
        <button 
          className={activeTab === 'my-events' ? 'active' : ''}
          onClick={() => setActiveTab('my-events')}
        >
          <Calendar size={20} />
          Etkinliklerim ({myEvents.length})
        </button>
      </div>

      {activeTab === 'discover' && (
        <div className="discover-section">
          <div className="filters">
            <div className="search-filter">
              <Search size={20} />
              <input
                type="text"
                placeholder="Etkinlik ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="category-filter">
              <Filter size={20} />
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {Object.entries(categories).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            
            <div className="sort-filter">
              <Calendar size={20} />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Tarihe Göre</option>
                <option value="popularity">Popülerliğe Göre</option>
                <option value="newest">En Yeni</option>
              </select>
            </div>
          </div>

          <div className="events-grid">
            {filteredEvents.length === 0 ? (
              <div className="no-events">
                <Calendar size={64} />
                <h3>Etkinlik bulunamadı</h3>
                <p>Arama kriterlerinize uygun etkinlik bulunamadı</p>
              </div>
            ) : (
              filteredEvents.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <div className="event-category">
                      <span className={`category-badge ${event.category}`}>
                        {categories[event.category]}
                      </span>
                    </div>
                    <div className="event-organizer">
                      <img 
                    src={event.organizer.avatar || getDefaultAvatar(event.organizer.name)} 
                    alt={event.organizer.name}
                    onError={(e) => {
                      e.target.src = getDefaultAvatar(event.organizer.name)
                    }}
                  />
                      <span>{event.organizer.name}</span>
                    </div>
                  </div>
                  
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="event-detail">
                      <Calendar size={16} />
                      <span>{format(event.date, 'dd MMMM yyyy', { locale: tr })}</span>
                    </div>
                    <div className="event-detail">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="event-detail">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div className="event-detail">
                      <Users size={16} />
                      <span>{event.participants.length}/{event.maxParticipants} kişi</span>
                    </div>
                  </div>
                  
                  <div className="event-participants">
                    <div className="participants-avatars">
                      {event.participants.slice(0, 3).map(participant => (
                        <img 
                          key={participant.id} 
                          src={participant.avatar || getDefaultAvatar(participant.name)} 
                          alt={participant.name}
                          title={participant.name}
                        />
                      ))}
                      {event.participants.length > 3 && (
                        <span className="more-participants">
                          +{event.participants.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="event-actions">
                    {isUserParticipant(event) ? (
                      <button 
                        className="leave-btn"
                        onClick={() => handleLeaveEvent(event)}
                      >
                        Ayrıl
                      </button>
                    ) : (
                      <button 
                        className={`join-btn ${isEventFull(event) ? 'disabled' : ''}`}
                        onClick={() => handleJoinEvent(event)}
                        disabled={isEventFull(event)}
                      >
                        {isEventFull(event) ? 'Dolu' : 'Katıl'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'my-events' && (
        <div className="my-events-section">
          {myEvents.length === 0 ? (
            <div className="no-events">
              <Calendar size={64} />
              <h3>Henüz etkinliğiniz yok</h3>
              <p>İlk etkinliğinizi oluşturun ve arkadaşlarınızı davet edin</p>
              <button onClick={() => setShowCreateModal(true)}>
                İlk Etkinliği Oluştur
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {myEvents.map(event => (
                <div key={event.id} className="event-card my-event">
                  <div className="event-header">
                    <div className="event-category">
                      <span className={`category-badge ${event.category}`}>
                        {categories[event.category]}
                      </span>
                      <Star className="organizer-star" size={16} />
                    </div>
                  </div>
                  
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="event-detail">
                      <Calendar size={16} />
                      <span>{format(event.date, 'dd MMMM yyyy', { locale: tr })}</span>
                    </div>
                    <div className="event-detail">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="event-detail">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div className="event-detail">
                      <Users size={16} />
                      <span>{event.participants.length}/{event.maxParticipants} kişi</span>
                    </div>
                  </div>
                  
                  <div className="event-participants">
                    <div className="participants-avatars">
                      {event.participants.slice(0, 3).map(participant => (
                        <img 
                          key={participant.id} 
                          src={participant.avatar || getDefaultAvatar(participant.name)} 
                          alt={participant.name}
                          title={participant.name}
                        />
                      ))}
                      {event.participants.length > 3 && (
                        <span className="more-participants">
                          +{event.participants.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="event-actions">
                    <button className="manage-btn">
                      Yönet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Yeni Etkinlik Oluştur</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="event-form">
              <div className="form-group">
                <label>Etkinlik Başlığı</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tarih</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Saat</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Konum</label>
                <LocationPicker
                  value={eventForm.location}
                  locationData={eventForm.locationData}
                  onLocationSelect={(location, locationData) => {
                    setEventForm({
                      ...eventForm,
                      location: location,
                      locationData: locationData
                    })
                  }}
                  placeholder="Etkinlik konumunu seçin..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                  >
                    {Object.entries(categories).filter(([key]) => key !== 'all').map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Maksimum Katılımcı</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={eventForm.maxParticipants}
                    onChange={(e) => setEventForm({...eventForm, maxParticipants: e.target.value})}
                    placeholder="10"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Etkinlik Görünürlüğü</label>
                <div className="visibility-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="visibility"
                      value="PUBLIC"
                      checked={eventForm.visibility === 'PUBLIC'}
                      onChange={(e) => setEventForm({...eventForm, visibility: e.target.value, isPublic: true})}
                    />
                    <span className="radio-label">
                      <strong>Herkese Açık</strong>
                      <small>Herkes görebilir ve katılım isteği gönderebilir</small>
                    </span>
                  </label>
                  
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="visibility"
                      value="FRIENDS"
                      checked={eventForm.visibility === 'FRIENDS'}
                      onChange={(e) => setEventForm({...eventForm, visibility: e.target.value, isPublic: false})}
                    />
                    <span className="radio-label">
                      <strong>Sadece Arkadaşlar</strong>
                      <small>Sadece arkadaşlarınız görebilir</small>
                    </span>
                  </label>
                  
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="visibility"
                      value="PRIVATE"
                      checked={eventForm.visibility === 'PRIVATE'}
                      onChange={(e) => setEventForm({...eventForm, visibility: e.target.value, isPublic: false})}
                    />
                    <span className="radio-label">
                      <strong>Özel</strong>
                      <small>Sadece siz görebilirsiniz</small>
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  İptal
                </button>
                <button type="submit">
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events