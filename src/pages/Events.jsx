import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Plus, MapPin, Clock, Users, Calendar, Filter, Search, Star, Camera, Image as ImageIcon, X, Heart, Trash2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import LocationPicker from '../components/LocationPicker'
import eventService from '../services/eventService'
import diaryService from '../services/diaryService'
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
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventPhotos, setEventPhotos] = useState([])
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const fileInputRef = useRef(null)
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
    // EventService'den etkinlikleri yükle
    loadEvents()
    
    // EventService değişikliklerini dinle
    const unsubscribe = eventService.addListener((action, event) => {
      loadEvents()
    })
    
    return () => unsubscribe()
  }, [user])

  const loadEvents = () => {
    // Tüm public etkinlikleri yükle
    const allEvents = eventService.getPublicEvents()
    
    // Kullanıcının etkinliklerini yükle
    const userEvents = eventService.getEventsByUser(user?.id || 'user1')
    
    setEvents(allEvents)
    setMyEvents(userEvents)
  }

  // Etkinlik seçildiğinde fotoğrafları yükle
  useEffect(() => {
    if (selectedEvent) {
      const photos = eventService.getEventPhotos(selectedEvent.id)
      setEventPhotos(photos)
    }
  }, [selectedEvent])

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
    
    // EventService kullanarak etkinlik oluştur
    const datetime = new Date(`${eventForm.date}T${eventForm.time}`)
    
    const result = eventService.createEvent({
      title: eventForm.title,
      description: eventForm.description,
      datetime: datetime.toISOString(),
      time: eventForm.time,
      placeName: eventForm.location,
      coords: eventForm.locationData?.coords,
      address: eventForm.locationData?.address,
      region: eventForm.locationData?.region,
      visibility: eventForm.visibility,
      category: eventForm.category,
      maxParticipants: eventForm.maxParticipants,
      creatorUid: user?.id || 'user1',
      creatorName: user?.name || 'Kullanıcı',
      creatorType: 'user',
      isPublic: eventForm.visibility === 'PUBLIC'
    })
    
    if (result.success) {
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
        locationData: null,
        category: 'social',
        maxParticipants: '',
        isPublic: true,
        visibility: 'PUBLIC'
      })
    } else {
      addNotification({
        type: 'toast',
        title: 'Hata',
        message: result.error || 'Etkinlik oluşturulamadı'
      })
    }
  }

  // Fotoğraf ekleme
  const handlePhotoAdd = (e) => {
    if (!selectedEvent) return
    
    const files = Array.from(e.target.files)
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'toast',
          title: 'Hata',
          message: 'Sadece resim dosyaları yüklenebilir'
        })
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: 'toast',
          title: 'Hata',
          message: 'Dosya boyutu 5MB\'dan küçük olmalıdır'
        })
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = eventService.addPhotoToEvent(selectedEvent.id, {
          url: event.target.result,
          uploadedBy: user?.id || 'user1',
          uploaderName: user?.name || 'Kullanıcı'
        })
        
        if (result.success) {
          const photos = eventService.getEventPhotos(selectedEvent.id)
          setEventPhotos(photos)
          
          addNotification({
            type: 'toast',
            title: 'Başarılı',
            message: 'Fotoğraf eklendi'
          })
        }
      }
      reader.readAsDataURL(file)
    })
    
    e.target.value = ''
  }

  // Fotoğraf silme
  const handlePhotoDelete = (photoId) => {
    if (!selectedEvent) return
    
    const result = eventService.deletePhoto(selectedEvent.id, photoId)
    if (result.success) {
      const photos = eventService.getEventPhotos(selectedEvent.id)
      setEventPhotos(photos)
      setShowPhotoModal(false)
      
      addNotification({
        type: 'toast',
        title: 'Başarılı',
        message: 'Fotoğraf silindi'
      })
    }
  }

  // Fotoğrafı ajandaya kaydet
  const handleSavePhotoToDiary = (photo) => {
    // Etkinlik tarihini al
    const eventDate = selectedEvent?.datetime ? new Date(selectedEvent.datetime) : new Date()
    
    const result = diaryService.addPhotoToDiary(eventDate, {
      url: photo.url,
      uploadedBy: user?.id || 'user1',
      uploaderName: user?.name || 'Kullanıcı',
      source: 'event',
      caption: `${selectedEvent?.title || 'Etkinlik'} etkinliğinden`
    })
    
    if (result.success) {
      addNotification({
        type: 'toast',
        title: 'Başarılı',
        message: 'Fotoğraf ajandanıza kaydedildi'
      })
    }
  }

  const handleJoinEvent = (event) => {
    const userId = user?.id || 'user1'
    const userName = user?.name || 'Kullanıcı'
    
    if (event.participants?.some(p => p.id === userId)) {
      addNotification({
        type: 'toast',
        title: 'Zaten katılıyorsunuz',
        message: 'Bu etkinliğe zaten katılım sağlamışsınız'
      })
      return
    }

    if (event.maxParticipants && event.participants?.length >= event.maxParticipants) {
      addNotification({
        type: 'toast',
        title: 'Etkinlik dolu',
        message: 'Bu etkinlik maksimum katılımcı sayısına ulaştı'
      })
      return
    }

    const result = eventService.joinEvent(event.id, userId, userName)
    
    if (result.success) {
      addNotification({
        type: 'toast',
        title: 'Etkinliğe katıldınız',
        message: `"${event.title}" etkinliğine başarıyla katıldınız`
      })
    } else {
      addNotification({
        type: 'toast',
        title: 'Hata',
        message: result.error
      })
    }
  }

  const handleLeaveEvent = (event) => {
    const userId = user?.id || 'user1'
    
    const result = eventService.leaveEvent(event.id, userId)
    
    if (result.success) {
      addNotification({
        type: 'toast',
        title: 'Etkinlikten ayrıldınız',
        message: `"${event.title}" etkinliğinden ayrıldınız`
      })
    }
  }

  const isUserParticipant = (event) => {
    const userId = user?.id || 'user1'
    return event.participants?.some(p => p.id === userId)
  }

  const isEventFull = (event) => {
    if (!event.maxParticipants) return false
    return (event.participants?.length || 0) >= event.maxParticipants
  }

  // Event için organizer bilgisini al
  const getEventOrganizer = (event) => {
    return {
      id: event.creatorUid,
      name: event.creatorName || 'Kullanıcı',
      avatar: event.creatorAvatar
    }
  }

  // Event tarihini formatla
  const formatEventDate = (event) => {
    try {
      const date = event.datetime ? new Date(event.datetime) : event.date
      return format(date, 'dd MMMM yyyy', { locale: tr })
    } catch {
      return 'Tarih belirtilmemiş'
    }
  }

  // Event konumunu al
  const getEventLocation = (event) => {
    return event.placeName || event.location || 'Konum belirtilmemiş'
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
                <div key={event.id} className="event-card" onClick={() => setSelectedEvent(event)}>
                  <div className="event-header">
                    <div className="event-category">
                      <span className={`category-badge ${event.category}`}>
                        {categories[event.category] || 'Etkinlik'}
                      </span>
                    </div>
                    <div className="event-organizer">
                      <img 
                    src={getEventOrganizer(event).avatar || getDefaultAvatar(getEventOrganizer(event).name)} 
                    alt={getEventOrganizer(event).name}
                    onError={(e) => {
                      e.target.src = getDefaultAvatar(getEventOrganizer(event).name)
                    }}
                  />
                      <span>{getEventOrganizer(event).name}</span>
                    </div>
                  </div>
                  
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="event-detail">
                      <Calendar size={16} />
                      <span>{formatEventDate(event)}</span>
                    </div>
                    <div className="event-detail">
                      <Clock size={16} />
                      <span>{event.time || '00:00'}</span>
                    </div>
                    <div className="event-detail">
                      <MapPin size={16} />
                      <span>{getEventLocation(event)}</span>
                    </div>
                    <div className="event-detail">
                      <Users size={16} />
                      <span>{event.participants?.length || 0}/{event.maxParticipants || '∞'} kişi</span>
                    </div>
                  </div>
                  
                  <div className="event-participants">
                    <div className="participants-avatars">
                      {(event.participants || []).slice(0, 3).map(participant => (
                        <img 
                          key={participant.id} 
                          src={participant.avatar || getDefaultAvatar(participant.name)} 
                          alt={participant.name}
                          title={participant.name}
                        />
                      ))}
                      {(event.participants?.length || 0) > 3 && (
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
                <div key={event.id} className="event-card my-event" onClick={() => setSelectedEvent(event)}>
                  <div className="event-header">
                    <div className="event-category">
                      <span className={`category-badge ${event.category}`}>
                        {categories[event.category] || 'Etkinlik'}
                      </span>
                      <Star className="organizer-star" size={16} />
                    </div>
                  </div>
                  
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="event-detail">
                      <Calendar size={16} />
                      <span>{formatEventDate(event)}</span>
                    </div>
                    <div className="event-detail">
                      <Clock size={16} />
                      <span>{event.time || '00:00'}</span>
                    </div>
                    <div className="event-detail">
                      <MapPin size={16} />
                      <span>{getEventLocation(event)}</span>
                    </div>
                    <div className="event-detail">
                      <Users size={16} />
                      <span>{event.participants?.length || 0}/{event.maxParticipants || '∞'} kişi</span>
                    </div>
                  </div>
                  
                  <div className="event-participants">
                    <div className="participants-avatars">
                      {(event.participants || []).slice(0, 3).map(participant => (
                        <img 
                          key={participant.id} 
                          src={participant.avatar || getDefaultAvatar(participant.name)} 
                          alt={participant.name}
                          title={participant.name}
                        />
                      ))}
                      {(event.participants?.length || 0) > 3 && (
                        <span className="more-participants">
                          +{event.participants.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="event-actions">
                    <button className="manage-btn" onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}>
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

      {/* Etkinlik Detay Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal event-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)}>×</button>
            </div>
            
            <div className="event-detail-content">
              <div className="event-info-section">
                <p className="event-full-description">{selectedEvent.description}</p>
                
                <div className="event-meta-grid">
                  <div className="meta-item">
                    <Calendar size={20} />
                    <div>
                      <strong>Tarih</strong>
                      <span>{formatEventDate(selectedEvent)}</span>
                    </div>
                  </div>
                  <div className="meta-item">
                    <Clock size={20} />
                    <div>
                      <strong>Saat</strong>
                      <span>{selectedEvent.time || '00:00'}</span>
                    </div>
                  </div>
                  <div className="meta-item">
                    <MapPin size={20} />
                    <div>
                      <strong>Konum</strong>
                      <span>{getEventLocation(selectedEvent)}</span>
                    </div>
                  </div>
                  <div className="meta-item">
                    <Users size={20} />
                    <div>
                      <strong>Katılımcılar</strong>
                      <span>{selectedEvent.participants?.length || 0}/{selectedEvent.maxParticipants || '∞'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fotoğraf Galerisi Bölümü */}
              <div className="event-photos-section">
                <div className="photos-header">
                  <h4>
                    <ImageIcon size={18} />
                    Fotoğraflar ({eventPhotos.length})
                  </h4>
                  <button 
                    className="add-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={16} />
                    Fotoğraf Ekle
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoAdd}
                    style={{ display: 'none' }}
                  />
                </div>
                
                {eventPhotos.length > 0 ? (
                  <div className="event-photos-grid">
                    {eventPhotos.map((photo, index) => (
                      <div 
                        key={photo.id} 
                        className="event-photo-item"
                        onClick={() => { setSelectedPhotoIndex(index); setShowPhotoModal(true); }}
                      >
                        <img src={photo.url} alt={`Fotoğraf ${index + 1}`} />
                        {photo.likes > 0 && (
                          <div className="photo-likes">
                            <Heart size={12} fill="#e74c3c" />
                            {photo.likes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-photos">
                    <Camera size={32} />
                    <p>Henüz fotoğraf eklenmemiş</p>
                    <small>İlk fotoğrafı ekleyen siz olun!</small>
                  </div>
                )}
              </div>

              {/* Etkinlik Aksiyonları */}
              <div className="event-detail-actions">
                {isUserParticipant(selectedEvent) ? (
                  <button 
                    className="leave-btn full-width"
                    onClick={() => { handleLeaveEvent(selectedEvent); setSelectedEvent(null); }}
                  >
                    Etkinlikten Ayrıl
                  </button>
                ) : (
                  <button 
                    className={`join-btn full-width ${isEventFull(selectedEvent) ? 'disabled' : ''}`}
                    onClick={() => { handleJoinEvent(selectedEvent); }}
                    disabled={isEventFull(selectedEvent)}
                  >
                    {isEventFull(selectedEvent) ? 'Etkinlik Dolu' : 'Etkinliğe Katıl'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fotoğraf Görüntüleme Modal */}
      {showPhotoModal && eventPhotos.length > 0 && (
        <div className="photo-modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={() => setShowPhotoModal(false)}>
              <X size={24} />
            </button>
            
            <div className="photo-modal-image">
              <img src={eventPhotos[selectedPhotoIndex].url} alt="Fotoğraf" />
            </div>
            
            {eventPhotos.length > 1 && (
              <>
                <button 
                  className="photo-nav photo-prev"
                  onClick={() => setSelectedPhotoIndex(prev => prev === 0 ? eventPhotos.length - 1 : prev - 1)}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className="photo-nav photo-next"
                  onClick={() => setSelectedPhotoIndex(prev => prev === eventPhotos.length - 1 ? 0 : prev + 1)}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
            
            <div className="photo-modal-info">
              <span>{selectedPhotoIndex + 1} / {eventPhotos.length}</span>
              <div className="photo-modal-actions">
                <button 
                  className="photo-save-diary-action"
                  onClick={() => handleSavePhotoToDiary(eventPhotos[selectedPhotoIndex])}
                >
                  <BookOpen size={18} />
                  Ajandama Kaydet
                </button>
                <button 
                  className="photo-delete-action"
                  onClick={() => handlePhotoDelete(eventPhotos[selectedPhotoIndex].id)}
                >
                  <Trash2 size={18} />
                  Sil
                </button>
              </div>
            </div>
            
            {eventPhotos[selectedPhotoIndex].expiresAt && (
              <div className="photo-expires-info">
                <Clock size={14} />
                24 saat sonra otomatik silinecek
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Events