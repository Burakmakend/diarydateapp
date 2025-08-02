import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Plus, Clock, MapPin, Users, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import LocationPicker from '../components/LocationPicker'
import './Calendar.css'

const Calendar = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
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
    // Simulated events data
    const mockEvents = [
      {
        id: 1,
        title: 'Sabah Koşusu',
        description: 'Günlük spor rutini',
        date: new Date(),
        time: '07:00',
        location: 'Park',
        isPublic: true,
        userId: user?.id
      },
      {
        id: 2,
        title: 'İş Toplantısı',
        description: 'Proje değerlendirme toplantısı',
        date: new Date(),
        time: '14:00',
        location: 'Ofis',
        isPublic: false,
        userId: user?.id
      }
    ]
    setEvents(mockEvents)
  }, [user])

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
    setEvents(events.filter(event => event.id !== eventId))
    addNotification({
      type: 'toast',
      title: 'Etkinlik silindi',
      message: 'Etkinlik başarıyla silindi'
    })
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
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...eventForm }
          : event
      ))
      addNotification({
        type: 'toast',
        title: 'Etkinlik güncellendi',
        message: 'Etkinlik başarıyla güncellendi'
      })
    } else {
      const newEvent = {
        id: Date.now(),
        ...eventForm,
        date: selectedDate,
        userId: user?.id || Date.now()
      }
      setEvents([...events, newEvent])
      addNotification({
        type: 'toast',
        title: 'Etkinlik eklendi',
        message: 'Yeni etkinlik başarıyla eklendi'
      })
    }
    
    setShowEventModal(false)
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
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <div className="event-actions">
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
                    {event.location && (
                      <div className="event-detail">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.isPublic && (
                      <div className="event-detail">
                        <Users size={14} />
                        <span>Herkese açık</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
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
    </div>
  )
}

export default Calendar