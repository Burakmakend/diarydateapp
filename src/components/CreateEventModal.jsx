import { useState } from 'react'
import { X, Calendar, Clock, MapPin, Users, Globe, Lock, Image } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import './CreateEventModal.css'

const CreateEventModal = ({ isOpen, onClose, place, onEventCreate }) => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    maxParticipants: '',
    visibility: 'PUBLIC',
    category: 'social'
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      addNotification({
        type: 'toast',
        title: 'Giriş Gerekli',
        message: 'Etkinlik oluşturmak için giriş yapmalısınız'
      })
      return
    }

    if (!formData.title || !formData.date || !formData.time) {
      addNotification({
        type: 'toast',
        title: 'Eksik Bilgi',
        message: 'Lütfen zorunlu alanları doldurun'
      })
      return
    }

    setLoading(true)

    try {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`)
      
      const newEvent = {
        id: `event-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        datetime: eventDateTime,
        coords: place?.coords || { lat: 41.0082, lng: 28.9784 },
        placeName: place?.name || 'Belirlenmemiş',
        placeId: place?.id,
        address: place?.address || '',
        region: place?.region || 'İstanbul',
        visibility: formData.visibility,
        category: formData.category,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        creatorUid: user.id || 'user1',
        creatorName: user.name || user.displayName || 'Kullanıcı',
        creatorAvatar: user.avatar || user.photoURL,
        creatorType: 'user', // 'user' veya 'venue'
        isActive: true,
        participants: [],
        pendingRequests: [],
        createdAt: new Date().toISOString()
      }

      // localStorage'a kaydet
      const existingEvents = JSON.parse(localStorage.getItem('user_events') || '[]')
      existingEvents.push(newEvent)
      localStorage.setItem('user_events', JSON.stringify(existingEvents))

      if (onEventCreate) {
        onEventCreate(newEvent)
      }

      addNotification({
        type: 'toast',
        title: 'Etkinlik Oluşturuldu',
        message: `"${formData.title}" etkinliğiniz başarıyla oluşturuldu`
      })

      // Formu sıfırla ve kapat
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        maxParticipants: '',
        visibility: 'PUBLIC',
        category: 'social'
      })
      onClose()
    } catch (error) {
      console.error('Etkinlik oluşturma hatası:', error)
      addNotification({
        type: 'toast',
        title: 'Hata',
        message: 'Etkinlik oluşturulurken bir hata oluştu'
      })
    } finally {
      setLoading(false)
    }
  }

  // Minimum tarih (bugün)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="create-event-modal-overlay" onClick={onClose}>
      <div className="create-event-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Calendar size={24} />
            Etkinlik Oluştur
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {place && (
          <div className="selected-place-info">
            <MapPin size={16} />
            <span>{place.name}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Etkinlik Adı *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Örn: Kahve Buluşması"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Etkinlik hakkında detaylar..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                <Calendar size={16} />
                Tarih *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">
                <Clock size={16} />
                Saat *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Kategori</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="social">Sosyal</option>
                <option value="food">Yemek</option>
                <option value="coffee">Kahve</option>
                <option value="sports">Spor</option>
                <option value="culture">Kültür</option>
                <option value="music">Müzik</option>
                <option value="business">İş</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="maxParticipants">
                <Users size={16} />
                Max Katılımcı
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                placeholder="Sınırsız"
                min={2}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Görünürlük</label>
            <div className="visibility-options">
              <button
                type="button"
                className={`visibility-option ${formData.visibility === 'PUBLIC' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, visibility: 'PUBLIC' }))}
              >
                <Globe size={18} />
                <div>
                  <strong>Herkese Açık</strong>
                  <span>Tüm kullanıcılar görebilir</span>
                </div>
              </button>
              <button
                type="button"
                className={`visibility-option ${formData.visibility === 'FRIENDS' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, visibility: 'FRIENDS' }))}
              >
                <Users size={18} />
                <div>
                  <strong>Arkadaşlara Açık</strong>
                  <span>Sadece arkadaşların görebilir</span>
                </div>
              </button>
              <button
                type="button"
                className={`visibility-option ${formData.visibility === 'PRIVATE' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, visibility: 'PRIVATE' }))}
              >
                <Lock size={18} />
                <div>
                  <strong>Özel</strong>
                  <span>Sadece davet edilenler</span>
                </div>
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="btn-spinner" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Calendar size={18} />
                  Etkinlik Oluştur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEventModal
