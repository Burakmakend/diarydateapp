import { Clock, MapPin, User, Send } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import './EventCard.css'

const EventCard = ({ event, onJoinRequest }) => {
  // Mesafe hesaplama (simülasyon)
  const calculateDistance = () => {
    // Gerçek uygulamada haversine formülü kullanılacak
    const distances = ['150 m', '320 m', '500 m', '1.2 km', '2.5 km']
    return distances[Math.floor(Math.random() * distances.length)]
  }

  // Etkinlik zamanını formatla
  const formatEventTime = (datetime) => {
    const now = new Date()
    const eventDate = new Date(datetime)
    const diffHours = Math.floor((eventDate - now) / (1000 * 60 * 60))
    
    if (diffHours < 24) {
      return `Bugün ${format(eventDate, 'HH:mm', { locale: tr })}`
    } else if (diffHours < 48) {
      return `Yarın ${format(eventDate, 'HH:mm', { locale: tr })}`
    } else {
      return format(eventDate, 'dd MMM HH:mm', { locale: tr })
    }
  }

  // Katılma isteği gönder
  const handleJoinRequest = () => {
    if (onJoinRequest) {
      onJoinRequest(event)
    }
  }

  return (
    <div className="event-card">
      <div className="event-creator">
        <img src={event.creatorAvatar} alt={event.creatorName} className="creator-avatar" />
        <div className="creator-info">
          <h4 className="creator-name">{event.creatorName}</h4>
          <span className="event-distance">{calculateDistance()}</span>
        </div>
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-description">{event.description}</p>
        
        <div className="event-details">
          <div className="detail-item">
            <Clock size={16} />
            <span>{formatEventTime(event.datetime)}</span>
          </div>
          
          <div className="detail-item">
            <MapPin size={16} />
            <span>{event.placeName}</span>
          </div>
        </div>
      </div>
      
      <div className="event-actions">
        <button 
          className="join-request-btn"
          onClick={handleJoinRequest}
        >
          <Send size={16} />
          Katılma İsteği Gönder
        </button>
      </div>
    </div>
  )
}

export default EventCard