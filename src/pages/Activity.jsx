import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  MapPin, 
  Star, 
  Trophy, 
  Target, 
  Camera,
  Share2,
  Award,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react'
import './Activity.css'

const Activity = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [currentMonth] = useState(new Date().getMonth())
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoCaption, setPhotoCaption] = useState('')

  // Mock aktivite verileri
  const [activityData] = useState({
    currentXP: 2450,
    level: 8,
    nextLevelXP: 3000,
    monthlyStats: {
      eventsCreated: 12,
      eventsAttended: 18,
      socialConnections: 8,
      completionRate: 85,
      activeScore: 92
    },
    achievements: [
      {
        id: 1,
        title: 'Sosyal Kelebek',
        description: '10 farklı etkinliğe katıldın',
        icon: '🦋',
        earned: true,
        date: '2024-01-15'
      },
      {
        id: 2,
        title: 'Etkinlik Organizatörü',
        description: '5 etkinlik oluşturdun',
        icon: '🎯',
        earned: true,
        date: '2024-01-10'
      },
      {
        id: 3,
        title: 'Haftalık Kahraman',
        description: '7 gün üst üste aktif oldun',
        icon: '⚡',
        earned: false,
        progress: 5
      }
    ],
    recentEvents: [
      {
        id: 1,
        title: 'Kahve Buluşması',
        date: new Date(),
        status: 'ongoing',
        canShare: true
      },
      {
        id: 2,
        title: 'Spor Salonu',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        canShare: true
      }
    ]
  })

  // Seviye hesaplama
  const progressPercentage = ((activityData.currentXP % 1000) / 1000) * 100

  // Aylık değerlendirme
  const getMonthlyEvaluation = () => {
    const score = activityData.monthlyStats.activeScore
    if (score >= 90) return { text: 'Mükemmel Aktiftin! 🌟', color: '#4CAF50' }
    if (score >= 75) return { text: 'Harika Gidiyorsun! 🚀', color: '#2196F3' }
    if (score >= 60) return { text: 'İyi Performans! 👍', color: '#FF9800' }
    return { text: 'Daha Aktif Olabilirsin! 💪', color: '#F44336' }
  }

  // Fotoğraf paylaşma
  const handleSharePhoto = () => {
    if (!photoFile || !selectedEvent) return

    // Simülasyon - gerçek uygulamada dosya yükleme yapılacak
    addNotification({
      type: 'toast',
      title: 'Fotoğraf Paylaşıldı!',
      message: `"${selectedEvent.title}" etkinliğinden fotoğrafın paylaşıldı`
    })

    // XP kazanma
    addNotification({
      type: 'toast',
      title: '+50 XP Kazandın!',
      message: 'Etkinlik fotoğrafı paylaştığın için XP kazandın'
    })

    setShowPhotoModal(false)
    setPhotoFile(null)
    setPhotoCaption('')
    setSelectedEvent(null)
  }

  // Etkinlik başlama bildirimi (simülasyon)
  useEffect(() => {
    const checkOngoingEvents = () => {
      activityData.recentEvents.forEach(event => {
        if (event.status === 'ongoing') {
          addNotification({
            type: 'notification',
            title: 'Etkinlik Başladı! 🎉',
            message: `"${event.title}" etkinliğin başladı. Fotoğraf paylaşmayı unutma!`,
            timestamp: new Date(),
            read: false
          })
        }
      })
    }

    // Sayfa yüklendiğinde bir kez kontrol et
    setTimeout(checkOngoingEvents, 2000)
  }, [])

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const evaluation = getMonthlyEvaluation()

  return (
    <div className="activity-container">
      <div className="activity-header">
        <h1>Aktivite Merkezi</h1>
        <p>Sosyal hayatındaki başarılarını takip et ve XP kazan!</p>
      </div>

      {/* XP ve Seviye */}
      <div className="xp-section">
        <div className="level-card">
          <div className="level-info">
            <div className="level-badge">
              <Star size={24} />
              <span>Seviye {activityData.level}</span>
            </div>
            <div className="xp-info">
              <span>{activityData.currentXP} XP</span>
              <span className="next-level">Sonraki seviye: {activityData.nextLevelXP} XP</span>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Aylık Analiz */}
      <div className="monthly-analysis">
        <div className="analysis-header">
          <h2>{monthNames[currentMonth]} Ayı Analizi</h2>
          <div className="evaluation" style={{ color: evaluation.color }}>
            {evaluation.text}
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{activityData.monthlyStats.eventsCreated}</span>
              <span className="stat-label">Etkinlik Oluşturdun</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{activityData.monthlyStats.eventsAttended}</span>
              <span className="stat-label">Etkinliğe Katıldın</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{activityData.monthlyStats.socialConnections}</span>
              <span className="stat-label">Yeni Arkadaş</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-number">%{activityData.monthlyStats.completionRate}</span>
              <span className="stat-label">Tamamlama Oranı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Başarımlar */}
      <div className="achievements-section">
        <h2>Başarımlar</h2>
        <div className="achievements-grid">
          {activityData.achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.earned ? (
                  <span className="emoji">{achievement.icon}</span>
                ) : (
                  <Award size={32} className="locked-icon" />
                )}
              </div>
              <div className="achievement-info">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                {achievement.earned ? (
                  <span className="earned-date">{achievement.date}</span>
                ) : (
                  achievement.progress && (
                    <div className="progress-info">
                      <span>{achievement.progress}/7 gün</span>
                      <div className="mini-progress">
                        <div 
                          className="mini-progress-fill" 
                          style={{ width: `${(achievement.progress / 7) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aktif Etkinlikler */}
      <div className="active-events-section">
        <h2>Aktif Etkinlikler</h2>
        <div className="events-list">
          {activityData.recentEvents.map(event => (
            <div key={event.id} className={`event-item ${event.status}`}>
              <div className="event-info">
                <h4>{event.title}</h4>
                <div className="event-meta">
                  <Clock size={16} />
                  <span>
                    {event.status === 'ongoing' ? 'Şu anda devam ediyor' : 'Tamamlandı'}
                  </span>
                </div>
              </div>
              {event.canShare && (
                <button 
                  className="share-photo-btn"
                  onClick={() => {
                    setSelectedEvent(event)
                    setShowPhotoModal(true)
                  }}
                >
                  <Camera size={16} />
                  Fotoğraf Paylaş
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fotoğraf Paylaşma Modal */}
      {showPhotoModal && (
        <div className="modal-overlay">
          <div className="photo-modal">
            <div className="modal-header">
              <h3>Etkinlik Fotoğrafı Paylaş</h3>
              <button 
                className="close-modal"
                onClick={() => setShowPhotoModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="event-info">
                <h4>{selectedEvent?.title}</h4>
                <p>Bu etkinlikten bir fotoğraf paylaş ve XP kazan!</p>
              </div>
              
              <div className="photo-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="file-input"
                />
                <div className="upload-area">
                  <Camera size={48} />
                  <p>Fotoğraf seç veya sürükle</p>
                </div>
              </div>
              
              <textarea
                placeholder="Fotoğrafına bir açıklama ekle..."
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                className="photo-caption"
              />
              
              <div className="xp-reward">
                <Zap size={20} />
                <span>+50 XP kazanacaksın!</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowPhotoModal(false)}
              >
                İptal
              </button>
              <button 
                className="share-btn"
                onClick={handleSharePhoto}
                disabled={!photoFile}
              >
                <Share2 size={16} />
                Paylaş
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Activity