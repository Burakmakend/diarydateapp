import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Calendar, Users, MapPin, Bell, TrendingUp } from 'lucide-react'
import DiaryWidget from '../components/DiaryWidget'
import './Home.css'

const Home = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Sosyal Ajanda ile Hayatınızı Organize Edin
            </h1>
            <p className="hero-description">
              Günlük planlarınızı paylaşın, arkadaşlarınızın ajandalarını görün ve 
              birlikte etkinlikler düzenleyin. Sosyal hayatınızı bir araya getirin!
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Hemen Başla
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Giriş Yap
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="calendar-preview">
              <div className="calendar-header">
                <h3>Bugün</h3>
                <span>15 Ocak 2025</span>
              </div>
              <div className="calendar-events">
                <div className="event-item">
                  <span className="event-time">09:00</span>
                  <span className="event-title">Sabah Koşusu</span>
                </div>
                <div className="event-item">
                  <span className="event-time">14:00</span>
                  <span className="event-title">Arkadaşlarla Kahve</span>
                </div>
                <div className="event-item">
                  <span className="event-time">19:00</span>
                  <span className="event-title">Sinema</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="container">
            <h2 className="section-title">Özellikler</h2>
            <div className="features-grid">
              <div className="feature-card">
                <Calendar className="feature-icon" />
                <h3>Günlük Ajanda</h3>
                <p>Günlük planlarınızı kolayca kaydedin ve takip edin</p>
              </div>
              <div className="feature-card">
                <Users className="feature-icon" />
                <h3>Arkadaş Ağı</h3>
                <p>Arkadaşlarınızın planlarını görün ve ortak etkinlikler düzenleyin</p>
              </div>
              <div className="feature-card">
                <MapPin className="feature-icon" />
                <h3>Konum Bazlı Etkinlikler</h3>
                <p>Yakınınızdaki etkinlikleri keşfedin ve katılın</p>
              </div>
              <div className="feature-card">
                <Bell className="feature-icon" />
                <h3>Anlık Bildirimler</h3>
                <p>Önemli etkinlikler ve davetler için bildirim alın</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <div className="container">
          <h1>Hoş geldin, {user.name}!</h1>
          <p>Bugün ne planlıyorsun?</p>
          
          <div className="quick-actions">
            <Link to="/calendar" className="action-card">
              <Calendar className="action-icon" />
              <div>
                <h3>Ajandanı Görüntüle</h3>
                <p>Bugünkü planlarını kontrol et</p>
              </div>
            </Link>
            
            <Link to="/friends" className="action-card">
              <Users className="action-icon" />
              <div>
                <h3>Arkadaşların</h3>
                <p>Arkadaşlarının planlarını gör</p>
              </div>
            </Link>
            
            <Link to="/events" className="action-card">
              <Users className="action-icon" />
              <div>
                <h3>Etkinlikler</h3>
                <p>Yeni etkinlikler keşfet</p>
              </div>
            </Link>
            
            <Link to="/activity" className="action-card activity-card">
              <TrendingUp className="action-icon" />
              <div>
                <h3>Aktivite Merkezi</h3>
                <p>Başarılarını takip et ve XP kazan</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="home-widgets">
        <div className="container">
          <div className="widgets-grid">
            <DiaryWidget />
            <div className="recent-activity-widget">
              <h2>Son Aktiviteler</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="activity-content">
                    <p><strong>Yeni etkinlik eklendi:</strong> Spor salonu</p>
                    <span className="activity-time">2 saat önce</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <Users size={20} />
                  </div>
                  <div className="activity-content">
                    <p><strong>Ahmet</strong> seni arkadaş olarak ekledi</p>
                    <span className="activity-time">5 saat önce</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <Bell size={20} />
                  </div>
                  <div className="activity-content">
                    <p><strong>Hatırlatma:</strong> Yarın doktor randevun var</p>
                    <span className="activity-time">1 gün önce</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="recent-activity" style={{display: 'none'}}>
        <div className="container">
          <h2>Son Aktiviteler</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <Calendar size={20} />
              </div>
              <div className="activity-content">
                <p><strong>Yeni etkinlik eklendi:</strong> Spor salonu</p>
                <span className="activity-time">2 saat önce</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Users size={20} />
              </div>
              <div className="activity-content">
                <p><strong>Ahmet</strong> seni arkadaş olarak ekledi</p>
                <span className="activity-time">5 saat önce</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Bell size={20} />
              </div>
              <div className="activity-content">
                <p><strong>Hatırlatma:</strong> Yarın doktor randevun var</p>
                <span className="activity-time">1 gün önce</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home