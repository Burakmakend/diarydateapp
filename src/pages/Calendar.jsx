import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Plus, Clock, MapPin, Users, Edit, Trash2, ChevronLeft, ChevronRight, Camera, Image as ImageIcon, X, Heart, BookOpen } from 'lucide-react'
import LocationPicker from '../components/LocationPicker'
import eventService from '../services/eventService'
import diaryService from '../services/diaryService'
import './Calendar.css'

const Calendar = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventPhotos, setEventPhotos] = useState([])
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const fileInputRef = useRef(null)
  const diaryFileInputRef = useRef(null)
  const [diaryPhotos, setDiaryPhotos] = useState([])
  const [showDiaryPhotos, setShowDiaryPhotos] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    time: '',
    location: '',
    locationData: null,
    visibility: 'PUBLIC',
    isPublic: true
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
    const allEvents = eventService.getAllEvents()
    // Tarihleri düzgün formata çevir
    const formattedEvents = allEvents.map(event => ({
      ...event,
      date: new Date(event.datetime || event.date)
    }))
    setEvents(formattedEvents)
  }

  // Etkinlik seçildiğinde fotoğrafları yükle
  useEffect(() => {
    if (selectedEvent) {
      const photos = eventService.getEventPhotos(selectedEvent.id)
      setEventPhotos(photos)
    }
  }, [selectedEvent])

  // Seçili tarih değiştiğinde günlük fotoğraflarını yükle
  useEffect(() => {
    const photos = diaryService.getDiaryPhotos(selectedDate)
    setDiaryPhotos(photos)
  }, [selectedDate])
  }, [selectedEvent])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(event.date, date))
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
  }

  const handleAddEvent = () => {
    if (!user) {
      addNotification({
        type: 'toast',
        title: 'Giriş Gerekli',
        message: 'Etkinlik eklemek için önce giriş yapmalısınız'
      })
      return
    }
    
    setEditingEvent(null)
    setEventForm({
      title: '',
      description: '',
      time: '',
      location: '',
      locationData: null,
      visibility: 'PUBLIC',
      isPublic: true
    })
    setShowEventModal(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description,
      time: event.time,
      location: event.location,
      locationData: event.locationData || null,
      visibility: event.visibility || (event.isPublic ? 'PUBLIC' : 'PRIVATE'),
      isPublic: event.isPublic
    })
    setShowEventModal(true)
  }

  const handleDeleteEvent = (eventId) => {
    const result = eventService.deleteEvent(eventId)
    if (result.success) {
      addNotification({
        type: 'toast',
        title: 'Etkinlik silindi',
        message: 'Etkinlik başarıyla silindi'
      })
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    
    if (!user) {
      addNotification({
        type: 'toast',
        title: 'Hata',
        message: 'Etkinlik eklemek için giriş yapmalısınız'
      })
      return
    }
    
    if (editingEvent) {
      // Güncelleme
      const result = eventService.updateEvent(editingEvent.id, {
        title: eventForm.title,
        description: eventForm.description,
        time: eventForm.time,
        placeName: eventForm.location,
        coords: eventForm.locationData?.coords,
        address: eventForm.locationData?.address,
        visibility: eventForm.visibility,
        isPublic: eventForm.visibility === 'PUBLIC'
      })
      
      if (result.success) {
        addNotification({
          type: 'toast',
          title: 'Etkinlik güncellendi',
          message: 'Etkinlik başarıyla güncellendi'
        })
      }
    } else {
      // Yeni etkinlik oluştur
      const datetime = new Date(selectedDate)
      if (eventForm.time) {
        const [hours, minutes] = eventForm.time.split(':')
        datetime.setHours(parseInt(hours), parseInt(minutes))
      }
      
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
        category: 'social',
        creatorUid: user?.id || 'user1',
        creatorName: user?.name || 'Kullanıcı',
        creatorType: 'user',
        isPublic: eventForm.visibility === 'PUBLIC'
      })
      
      if (result.success) {
        addNotification({
          type: 'toast',
          title: 'Etkinlik eklendi',
          message: 'Yeni etkinlik başarıyla eklendi'
        })
      }
    }
    
    setShowEventModal(false)
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

  // Etkinlik fotoğrafı silme
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

  // Günlük fotoğrafı ekleme
  const handleDiaryPhotoAdd = (e) => {
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
        const result = diaryService.addPhotoToDiary(selectedDate, {
          url: event.target.result,
          uploadedBy: user?.id || 'user1',
          uploaderName: user?.name || 'Kullanıcı',
          source: 'diary'
        })
        
        if (result.success) {
          const photos = diaryService.getDiaryPhotos(selectedDate)
          setDiaryPhotos(photos)
          
          addNotification({
            type: 'toast',
            title: 'Başarılı',
            message: 'Fotoğraf ajandaya eklendi'
          })
        }
      }
      reader.readAsDataURL(file)
    })
    
    e.target.value = ''
  }

  // Günlük fotoğrafı silme
  const handleDiaryPhotoDelete = (photoId) => {
    const result = diaryService.deletePhotoFromDiary(selectedDate, photoId)
    if (result.success) {
      const photos = diaryService.getDiaryPhotos(selectedDate)
      setDiaryPhotos(photos)
      
      addNotification({
        type: 'toast',
        title: 'Başarılı',
        message: 'Fotoğraf silindi'
      })
    }
  }

  // Etkinlik fotoğrafını ajandaya kaydet
  const handleSavePhotoToDiary = (photo) => {
    const result = diaryService.addPhotoToDiary(selectedDate, {
      url: photo.url,
      uploadedBy: user?.id || 'user1',
      uploaderName: user?.name || 'Kullanıcı',
      source: 'event',
      caption: `${selectedEvent?.title || 'Etkinlik'} etkinliğinden`
    })
    
    if (result.success) {
      const photos = diaryService.getDiaryPhotos(selectedDate)
      setDiaryPhotos(photos)
      
      addNotification({
        type: 'toast',
        title: 'Başarılı',
        message: 'Fotoğraf ajandanıza kaydedildi'
      })
    }
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Ajanda</h1>
        <button className="add-event-btn" onClick={handleAddEvent}>
          <Plus size={20} />
          Etkinlik Ekle
        </button>
      </div>

      <div className="calendar-content">
        <div className="calendar-view">
          <div className="calendar-nav">
            <button onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <h2>{format(currentDate, 'MMMM yyyy', { locale: tr })}</h2>
            <button onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            
            <div className="calendar-days">
              {monthDays.map(day => {
                const dayEvents = getEventsForDate(day)
                const isSelected = isSameDay(day, selectedDate)
                const isCurrentDay = isToday(day)
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`calendar-day ${
                      isSelected ? 'selected' : ''
                    } ${isCurrentDay ? 'today' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    <span className="day-number">{format(day, 'd')}</span>
                    {dayEvents.length > 0 && (
                      <div className="event-indicators">
                        {dayEvents.slice(0, 3).map(event => (
                          <div key={event.id} className="event-indicator" />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="more-events">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="events-sidebar">
          <div className="selected-date">
            <h3>{format(selectedDate, 'dd MMMM yyyy', { locale: tr })}</h3>
            <p>{selectedDateEvents.length} etkinlik</p>
          </div>

          <div className="events-list">
            {selectedDateEvents.length === 0 ? (
              <div className="no-events">
                <p>Bu tarihte etkinlik yok</p>
                <button onClick={handleAddEvent} className="add-first-event">
                  İlk etkinliği ekle
                </button>
              </div>
            ) : (
              selectedDateEvents.map(event => (
                <div key={event.id} className="event-card" onClick={() => setSelectedEvent(event)}>
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <div className="event-actions" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleEditEvent(event)}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
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
                    {(event.location || event.placeName) && (
                      <div className="event-detail">
                        <MapPin size={14} />
                        <span>{event.placeName || event.location}</span>
                      </div>
                    )}
                    {event.isPublic && (
                      <div className="event-detail">
                        <Users size={14} />
                        <span>Herkese açık</span>
                      </div>
                    )}
                    {event.photoCount > 0 && (
                      <div className="event-detail">
                        <Camera size={14} />
                        <span>{event.photoCount} fotoğraf</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Günlük Fotoğrafları Bölümü */}
          <div className="diary-photos-section">
            <div className="diary-photos-header">
              <h4>
                <BookOpen size={16} />
                Günlük Fotoğrafları ({diaryPhotos.length})
              </h4>
              <button 
                className="add-diary-photo-btn"
                onClick={() => diaryFileInputRef.current?.click()}
              >
                <Camera size={14} />
                Fotoğraf Ekle
              </button>
              <input
                ref={diaryFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleDiaryPhotoAdd}
                style={{ display: 'none' }}
              />
            </div>
            
            {diaryPhotos.length > 0 ? (
              <div className="diary-photos-grid">
                {diaryPhotos.map((photo, index) => (
                  <div key={photo.id} className="diary-photo-item">
                    <img 
                      src={photo.url} 
                      alt={`Fotoğraf ${index + 1}`}
                      onClick={() => { setSelectedPhotoIndex(index); setShowDiaryPhotos(true); }}
                    />
                    <button 
                      className="delete-photo-btn"
                      onClick={(e) => { e.stopPropagation(); handleDiaryPhotoDelete(photo.id); }}
                      title="Sil"
                    >
                      <Trash2 size={12} />
                    </button>
                    {photo.source && photo.source !== 'diary' && (
                      <span className="photo-source">{photo.source === 'event' ? 'Etkinlik' : 'Harita'}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-diary-photos">
                <Camera size={24} />
                <p>Bu gün için fotoğraf yok</p>
                <small>Fotoğraf ekleyerek anılarınızı kaydedin</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}</h3>
              <button onClick={() => setShowEventModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="event-form">
              <div className="form-group">
                <label>Başlık</label>
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
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Saat</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                  />
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
                <button type="button" onClick={() => setShowEventModal(false)}>
                  İptal
                </button>
                <button type="submit">
                  {editingEvent ? 'Güncelle' : 'Ekle'}
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
              {selectedEvent.description && (
                <p className="event-full-description">{selectedEvent.description}</p>
              )}
              
              <div className="event-meta-list">
                {selectedEvent.time && (
                  <div className="meta-item">
                    <Clock size={18} />
                    <span>{selectedEvent.time}</span>
                  </div>
                )}
                {(selectedEvent.location || selectedEvent.placeName) && (
                  <div className="meta-item">
                    <MapPin size={18} />
                    <span>{selectedEvent.placeName || selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.isPublic && (
                  <div className="meta-item">
                    <Users size={18} />
                    <span>Herkese açık</span>
                  </div>
                )}
              </div>

              {/* Fotoğraf Galerisi */}
              <div className="calendar-photos-section">
                <div className="photos-header">
                  <h4>
                    <ImageIcon size={16} />
                    Fotoğraflar ({eventPhotos.length})
                  </h4>
                  <button 
                    className="add-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={14} />
                    Ekle
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
                  <div className="calendar-photos-grid">
                    {eventPhotos.map((photo, index) => (
                      <div 
                        key={photo.id} 
                        className="calendar-photo-item"
                      >
                        <img 
                          src={photo.url} 
                          alt={`Fotoğraf ${index + 1}`}
                          onClick={() => { setSelectedPhotoIndex(index); setShowPhotoModal(true); }}
                        />
                        <div className="photo-actions-overlay">
                          <button 
                            className="save-to-diary-btn"
                            onClick={(e) => { e.stopPropagation(); handleSavePhotoToDiary(photo); }}
                            title="Ajandama Kaydet"
                          >
                            <BookOpen size={12} />
                          </button>
                          <button 
                            className="delete-photo-btn"
                            onClick={(e) => { e.stopPropagation(); handlePhotoDelete(photo.id); }}
                            title="Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {photo.expiresAt && (
                          <span className="photo-expires">24s</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-photos-message">
                    <Camera size={24} />
                    <p>Henüz fotoğraf yok</p>
                  </div>
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
            
            <img src={eventPhotos[selectedPhotoIndex].url} alt="Fotoğraf" className="photo-modal-image" />
            
            {eventPhotos.length > 1 && (
              <div className="photo-nav-buttons">
                <button 
                  onClick={() => setSelectedPhotoIndex(prev => prev === 0 ? eventPhotos.length - 1 : prev - 1)}
                >
                  <ChevronLeft size={24} />
                </button>
                <span>{selectedPhotoIndex + 1} / {eventPhotos.length}</span>
                <button 
                  onClick={() => setSelectedPhotoIndex(prev => prev === eventPhotos.length - 1 ? 0 : prev + 1)}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
            
            <div className="photo-modal-actions">
              <button 
                className="save-to-diary-btn-large"
                onClick={() => handleSavePhotoToDiary(eventPhotos[selectedPhotoIndex])}
              >
                <BookOpen size={16} />
                Ajandama Kaydet
              </button>
              <button 
                className="photo-delete-btn"
                onClick={() => handlePhotoDelete(eventPhotos[selectedPhotoIndex].id)}
              >
                <Trash2 size={16} />
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Günlük Fotoğraf Görüntüleme Modal */}
      {showDiaryPhotos && diaryPhotos.length > 0 && (
        <div className="photo-modal-overlay" onClick={() => setShowDiaryPhotos(false)}>
          <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={() => setShowDiaryPhotos(false)}>
              <X size={24} />
            </button>
            
            <img src={diaryPhotos[selectedPhotoIndex].url} alt="Fotoğraf" className="photo-modal-image" />
            
            {diaryPhotos.length > 1 && (
              <div className="photo-nav-buttons">
                <button 
                  onClick={() => setSelectedPhotoIndex(prev => prev === 0 ? diaryPhotos.length - 1 : prev - 1)}
                >
                  <ChevronLeft size={24} />
                </button>
                <span>{selectedPhotoIndex + 1} / {diaryPhotos.length}</span>
                <button 
                  onClick={() => setSelectedPhotoIndex(prev => prev === diaryPhotos.length - 1 ? 0 : prev + 1)}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
            
            <button 
              className="photo-delete-btn"
              onClick={() => { handleDiaryPhotoDelete(diaryPhotos[selectedPhotoIndex].id); setShowDiaryPhotos(false); }}
            >
              <Trash2 size={16} />
              Sil
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar