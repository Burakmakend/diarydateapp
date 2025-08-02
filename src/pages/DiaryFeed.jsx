import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  BookOpen, 
  Calendar, 
  Eye, 
  EyeOff, 
  Plus, 
  Search,
  Filter,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal
} from 'lucide-react'
import './DiaryFeed.css'

const DiaryFeed = () => {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, public, private
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest

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
          <linearGradient id="feedGrad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill="url(#feedGrad${colorIndex})"/>
        <text x="24" y="30" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true)
      
      // Simulated diary entries - gerçek uygulamada API çağrısı
      const mockEntries = [
        {
          id: '1',
          authorId: user?.id,
          authorName: user?.name,
          authorAvatar: user?.avatar,
          content: 'Sevgili günlük, bugün harika bir gün geçirdim. Arkadaşlarımla @ahmet ve @ayse ile kahve içtik ve yeni projeler hakkında konuştuk. Hava da çok güzeldi, parkta yürüyüş yaptık.',
          entryDate: new Date(),
          createdAt: new Date(),
          visibility: 'PUBLIC',
          mentions: [{ userId: '2', username: 'ahmet' }, { userId: '3', username: 'ayse' }],
          likes: 5,
          comments: 2
        },
        {
          id: '2',
          authorId: user?.id,
          authorName: user?.name,
          authorAvatar: user?.avatar,
          content: 'Sevgili günlük, dün akşam sinema da gittik. Film gerçekten çok güzeldi, herkese tavsiye ederim. @mehmet ile birlikte izledik ve sonrasında film hakkında uzun uzun konuştuk.',
          entryDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          visibility: 'PRIVATE',
          mentions: [{ userId: '4', username: 'mehmet' }],
          likes: 0,
          comments: 0
        },
        {
          id: '3',
          authorId: '2',
          authorName: 'Ahmet Yılmaz',
          authorAvatar: null,
          content: 'Sevgili günlük, bu hafta çok yoğun geçti. İş yerinde yeni bir proje başladı ve çok heyecanlıyım. Takım arkadaşlarımla @fatma ve @ali ile harika bir işbirliği yapıyoruz.',
          entryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          visibility: 'PUBLIC',
          mentions: [{ userId: '5', username: 'fatma' }, { userId: '6', username: 'ali' }],
          likes: 8,
          comments: 3
        },
        {
          id: '4',
          authorId: '3',
          authorName: 'Ayşe Demir',
          authorAvatar: null,
          content: 'Sevgili günlük, bugün yoga dersine gittim ve kendimi çok iyi hissediyorum. Meditasyon yapmak gerçekten çok rahatlatıcı. @zeynep ile birlikte gittik ve çok eğlendik.',
          entryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          visibility: 'PUBLIC',
          mentions: [{ userId: '7', username: 'zeynep' }],
          likes: 12,
          comments: 5
        }
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setEntries(mockEntries)
      setLoading(false)
    }

    fetchEntries()
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
      month: 'long',
      year: entryDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const renderMentions = (content, mentions) => {
    let renderedContent = content
    
    mentions.forEach(mention => {
      const mentionRegex = new RegExp(`@${mention.username}`, 'g')
      renderedContent = renderedContent.replace(
        mentionRegex,
        `<span class="mention">@${mention.username}</span>`
      )
    })
    
    return { __html: renderedContent }
  }

  const getFilteredEntries = () => {
    let filtered = entries
    
    // Visibility filter
    if (filter === 'public') {
      filtered = filtered.filter(entry => entry.visibility === 'PUBLIC')
    } else if (filter === 'private') {
      filtered = filtered.filter(entry => entry.authorId === user?.id && entry.visibility === 'PRIVATE')
    } else if (filter === 'all') {
      // Show public entries from everyone + private entries from current user
      filtered = filtered.filter(entry => 
        entry.visibility === 'PUBLIC' || 
        (entry.authorId === user?.id && entry.visibility === 'PRIVATE')
      )
    }
    
    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(entry =>
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
    })
    
    return filtered
  }

  const filteredEntries = getFilteredEntries()

  return (
    <div className="diary-feed-container">
      <div className="diary-feed">
        <div className="feed-header">
          <div className="header-title">
            <BookOpen size={24} className="header-icon" />
            <h1>Günlük Akışı</h1>
          </div>
          
          <Link to="/diary/new" className="new-entry-btn">
            <Plus size={16} />
            Yeni Günlük
          </Link>
        </div>

        <div className="feed-controls">
          <div className="search-section">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Günlük girişlerinde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-section">
            <div className="filter-group">
              <Filter size={16} />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tümü</option>
                <option value="public">Herkese Açık</option>
                <option value="private">Özel</option>
              </select>
            </div>
            
            <div className="sort-group">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
              </select>
            </div>
          </div>
        </div>

        <div className="feed-content">
          {loading ? (
            <div className="feed-loading">
              <div className="loading-spinner"></div>
              <p>Günlük girişleri yükleniyor...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="feed-empty">
              <BookOpen size={48} className="empty-icon" />
              <h3>Henüz günlük yazılmamış</h3>
              <p>
                {searchQuery ? 
                  'Arama kriterlerinize uygun günlük girişi bulunamadı.' :
                  'İlk günlük girişinizi yazarak başlayın!'
                }
              </p>
              {!searchQuery && (
                <Link to="/diary/new" className="start-writing-btn">
                  <Plus size={16} />
                  İlk Günlüğünü Yaz
                </Link>
              )}
            </div>
          ) : (
            <div className="entries-list">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <div className="author-info">
                      <img 
                        src={entry.authorAvatar || getDefaultAvatar(entry.authorName)}
                        alt={entry.authorName}
                        className="author-avatar"
                      />
                      <div className="author-details">
                        <h4 className="author-name">{entry.authorName}</h4>
                        <div className="entry-meta">
                          <Calendar size={12} />
                          <span>{formatDate(entry.entryDate)}</span>
                          <span className="time">{formatTime(entry.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="entry-actions">
                      <span className={`visibility-badge ${entry.visibility.toLowerCase()}`}>
                        {entry.visibility === 'PUBLIC' ? (
                          <><Eye size={12} /> Herkese Açık</>
                        ) : (
                          <><EyeOff size={12} /> Özel</>
                        )}
                      </span>
                      
                      {entry.authorId === user?.id && (
                        <Link to={`/diary/edit/${entry.id}`} className="edit-btn">
                          Düzenle
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <div className="entry-content">
                    <div 
                      className="content-text"
                      dangerouslySetInnerHTML={renderMentions(truncateContent(entry.content), entry.mentions)}
                    />
                    
                    {entry.content.length > 200 && (
                      <Link to={`/diary/${entry.id}`} className="read-more">
                        Devamını oku
                      </Link>
                    )}
                  </div>
                  
                  {entry.visibility === 'PUBLIC' && (
                    <div className="entry-footer">
                      <div className="engagement-stats">
                        <button className="stat-btn">
                          <Heart size={14} />
                          <span>{entry.likes}</span>
                        </button>
                        <button className="stat-btn">
                          <MessageCircle size={14} />
                          <span>{entry.comments}</span>
                        </button>
                      </div>
                      
                      <div className="entry-actions">
                        <button className="action-btn">
                          <Share2 size={14} />
                          Paylaş
                        </button>
                        <button className="action-btn">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiaryFeed