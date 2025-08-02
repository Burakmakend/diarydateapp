import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Plus, Calendar } from 'lucide-react'
import './DiaryWidget.css'

const DiaryWidget = () => {
  const { user } = useAuth()
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulated diary entries fetch
    const fetchRecentEntries = () => {
      // Mock data - son 3 günlük girişi
      const mockEntries = [
        {
          id: '1',
          content: 'Sevgili günlük, bugün harika bir gün geçirdim. Arkadaşlarımla kahve içtik ve yeni projeler hakkında konuştuk...',
          entryDate: new Date(),
          createdAt: new Date(),
          visibility: 'PRIVATE'
        },
        {
          id: '2', 
          content: 'Sevgili günlük, dün akşam sinema da gittik. Film gerçekten çok güzeldi, herkese tavsiye ederim...',
          entryDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          visibility: 'PUBLIC'
        },
        {
          id: '3',
          content: 'Sevgili günlük, bu hafta çok yoğun geçti. İş yerinde yeni bir proje başladı ve çok heyecanlıyım...',
          entryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          visibility: 'PRIVATE'
        }
      ]
      
      setRecentEntries(mockEntries)
      setLoading(false)
    }

    if (user) {
      fetchRecentEntries()
    }
  }, [user])

  const formatDate = (date) => {
    const today = new Date()
    const entryDate = new Date(date)
    
    if (entryDate.toDateString() === today.toDateString()) {
      return 'Bugün'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (entryDate.toDateString() === yesterday.toDateString()) {
      return 'Dün'
    }
    
    return entryDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long'
    })
  }

  const truncateContent = (content, maxLength = 80) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (!user) return null

  return (
    <div className="diary-widget">
      <div className="diary-widget-header">
        <div className="diary-widget-title">
          <BookOpen size={20} className="diary-icon" />
          <h3>Günlük</h3>
        </div>
        <Link to="/diary/new" className="new-diary-btn">
          <Plus size={16} />
          Yeni Ekle
        </Link>
      </div>

      <div className="diary-widget-content">
        {loading ? (
          <div className="diary-loading">
            <p>Günlük girişleri yükleniyor...</p>
          </div>
        ) : recentEntries.length === 0 ? (
          <div className="diary-empty">
            <BookOpen size={32} className="empty-icon" />
            <p>Henüz günlük yazılmamış</p>
            <Link to="/diary/new" className="start-writing-btn">
              İlk günlüğünü yaz
            </Link>
          </div>
        ) : (
          <div className="diary-entries">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="diary-entry-preview">
                <div className="entry-header">
                  <span className="entry-date">
                    <Calendar size={14} />
                    {formatDate(entry.entryDate)}
                  </span>
                  <span className={`visibility-badge ${entry.visibility.toLowerCase()}`}>
                    {entry.visibility === 'PUBLIC' ? 'Herkese Açık' : 'Özel'}
                  </span>
                </div>
                <p className="entry-content">
                  {truncateContent(entry.content)}
                </p>
              </div>
            ))}
            
            <Link to="/diary" className="view-all-btn">
              Tüm günlük girişlerini gör
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiaryWidget