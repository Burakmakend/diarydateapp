import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { 
  Save, 
  X, 
  Calendar, 
  Eye, 
  EyeOff, 
  Type, 
  Quote, 
  Heading1,
  ArrowLeft,
  AtSign,
  Camera,
  Image as ImageIcon,
  Trash2
} from 'lucide-react'
import MentionSuggestions from '../components/MentionSuggestions'
import './DiaryEditor.css'

const DiaryEditor = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const navigate = useNavigate()
  const { id } = useParams()
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [entry, setEntry] = useState({
    content: 'Sevgili günlük, ',
    entryDate: new Date().toISOString().split('T')[0],
    visibility: 'PRIVATE',
    mentions: [],
    photos: []
  })
  
  const [textStyle, setTextStyle] = useState('normal')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 })
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState(null)

  useEffect(() => {
    if (id && id !== 'new') {
      // Mevcut günlük girişini yükle
      setIsEditing(true)
      // Mock data - gerçek uygulamada API'den gelecek
      const mockEntry = {
        id: id,
        content: 'Sevgili günlük, bugün harika bir gün geçirdim. @ahmet ile kahve içtik ve yeni projeler hakkında konuştuk.',
        entryDate: '2025-01-15',
        visibility: 'PUBLIC',
        mentions: [{ userId: '2', username: 'ahmet' }],
        photos: []
      }
      setEntry(mockEntry)
    }
  }, [id])

  // Fotoğraf ekleme
  const handlePhotoAdd = (e) => {
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
        const newPhoto = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: event.target.result,
          name: file.name,
          uploadedAt: new Date().toISOString()
        }
        
        setEntry(prev => ({
          ...prev,
          photos: [...prev.photos, newPhoto]
        }))
      }
      reader.readAsDataURL(file)
    })
    
    // Input'u temizle
    e.target.value = ''
  }

  // Fotoğraf silme
  const handlePhotoDelete = (photoId) => {
    setEntry(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId)
    }))
    addNotification({
      type: 'toast',
      title: 'Başarılı',
      message: 'Fotoğraf silindi'
    })
  }

  const handleContentChange = (e) => {
    const content = e.target.value
    const cursorPosition = e.target.selectionStart
    
    setEntry({ ...entry, content })
    
    // @ mention kontrolü
    const beforeCursor = content.substring(0, cursorPosition)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
      setMentionPosition({ 
        start: cursorPosition - mentionMatch[0].length,
        end: cursorPosition 
      })
      setShowMentions(true)
    } else {
      setShowMentions(false)
      setMentionQuery('')
    }
  }

  const handleMentionSelect = (user) => {
    const { content } = entry
    const beforeMention = content.substring(0, mentionPosition.start)
    const afterMention = content.substring(mentionPosition.end)
    const newContent = beforeMention + `@${user.username} ` + afterMention
    
    // Mention'ı kaydet
    const newMentions = [...entry.mentions]
    const existingMention = newMentions.find(m => m.userId === user.id)
    if (!existingMention) {
      newMentions.push({ userId: user.id, username: user.username })
    }
    
    setEntry({ 
      ...entry, 
      content: newContent,
      mentions: newMentions
    })
    
    setShowMentions(false)
    setMentionQuery('')
    
    // Cursor'ı doğru pozisyona getir
    setTimeout(() => {
      const newPosition = beforeMention.length + user.username.length + 2
      textareaRef.current.setSelectionRange(newPosition, newPosition)
      textareaRef.current.focus()
    }, 0)
  }

  const applyTextStyle = (style) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = entry.content.substring(start, end)
    
    if (selectedText) {
      let styledText = selectedText
      
      switch (style) {
        case 'heading':
          styledText = `# ${selectedText}`
          break
        case 'quote':
          styledText = `> ${selectedText}`
          break
        case 'bold':
          styledText = `**${selectedText}**`
          break
        default:
          styledText = selectedText
      }
      
      const newContent = entry.content.substring(0, start) + styledText + entry.content.substring(end)
      setEntry({ ...entry, content: newContent })
      
      // Seçimi koru
      setTimeout(() => {
        textarea.setSelectionRange(start, start + styledText.length)
        textarea.focus()
      }, 0)
    }
    
    setTextStyle(style)
  }

  const handleSave = async () => {
    if (!entry.content.trim()) {
      addNotification({
        type: 'toast',
        title: 'Hata',
        message: 'Günlük içeriği boş olamaz'
      })
      return
    }
    
    setSaving(true)
    
    try {
      // Simulated save - gerçek uygulamada API çağrısı
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mention'lara bildirim gönder (PUBLIC ise)
      if (entry.visibility === 'PUBLIC' && entry.mentions.length > 0) {
        entry.mentions.forEach(mention => {
          addNotification({
            type: 'toast',
            title: 'Günlük Paylaşıldı',
            message: `${mention.username} kullanıcısı günlüğünüzde etiketlendi`
          })
        })
      }
      
      addNotification({
        type: 'toast',
        title: 'Başarılı',
        message: isEditing ? 'Günlük güncellendi' : 'Günlük kaydedildi'
      })
      
      navigate('/diary/feed')
    } catch (error) {
      addNotification({
        type: 'toast',
        title: 'Hata',
        message: 'Günlük kaydedilirken bir hata oluştu'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (entry.content !== 'Sevgili günlük, ' && entry.content.trim()) {
      if (window.confirm('Değişiklikler kaydedilmedi. Çıkmak istediğinizden emin misiniz?')) {
        navigate(-1)
      }
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="diary-editor-container">
      <div className="diary-editor">
        <div className="editor-header">
          <button onClick={handleCancel} className="back-btn">
            <ArrowLeft size={20} />
            Geri
          </button>
          
          <h1>{isEditing ? 'Günlüğü Düzenle' : 'Yeni Günlük'}</h1>
          
          <div className="header-actions">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="save-btn"
            >
              <Save size={16} />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>

        <div className="editor-toolbar">
          <div className="toolbar-section">
            <label>Yazı Stili:</label>
            <div className="style-buttons">
              <button 
                onClick={() => applyTextStyle('normal')}
                className={textStyle === 'normal' ? 'active' : ''}
                title="Normal"
              >
                <Type size={16} />
              </button>
              <button 
                onClick={() => applyTextStyle('heading')}
                className={textStyle === 'heading' ? 'active' : ''}
                title="Başlık"
              >
                <Heading1 size={16} />
              </button>
              <button 
                onClick={() => applyTextStyle('quote')}
                className={textStyle === 'quote' ? 'active' : ''}
                title="Alıntı"
              >
                <Quote size={16} />
              </button>
              <button 
                onClick={() => applyTextStyle('bold')}
                className={textStyle === 'bold' ? 'active' : ''}
                title="Kalın"
              >
                <strong>B</strong>
              </button>
            </div>
          </div>
          
          <div className="toolbar-section">
            <label>Görünürlük:</label>
            <div className="visibility-toggle">
              <button 
                onClick={() => setEntry({ ...entry, visibility: 'PRIVATE' })}
                className={entry.visibility === 'PRIVATE' ? 'active' : ''}
              >
                <EyeOff size={16} />
                Özel
              </button>
              <button 
                onClick={() => setEntry({ ...entry, visibility: 'PUBLIC' })}
                className={entry.visibility === 'PUBLIC' ? 'active' : ''}
              >
                <Eye size={16} />
                Herkese Açık
              </button>
            </div>
          </div>
          
          <div className="toolbar-section">
            <label htmlFor="entry-date">Tarih:</label>
            <input 
              id="entry-date"
              type="date" 
              value={entry.entryDate}
              onChange={(e) => setEntry({ ...entry, entryDate: e.target.value })}
              className="date-input"
            />
          </div>
          
          <div className="toolbar-section">
            <label>Fotoğraf:</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="photo-add-btn"
              title="Fotoğraf Ekle"
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
        </div>

        <div className="editor-content">
          <div className="content-wrapper">
            <textarea
              ref={textareaRef}
              value={entry.content}
              onChange={handleContentChange}
              placeholder="Sevgili günlük, bugün..."
              className="content-textarea"
              rows={15}
            />
            
            {showMentions && (
              <MentionSuggestions 
                query={mentionQuery}
                onSelect={handleMentionSelect}
                onClose={() => setShowMentions(false)}
              />
            )}
          </div>
          
          <div className="editor-help">
            <p>
              <AtSign size={14} />
              <strong>İpucu:</strong> Kullanıcı etiketlemek için @ yazın
            </p>
            <p>Markdown formatını destekler: **kalın**, *italik*, # başlık, &gt; alıntı</p>
          </div>

          {/* Fotoğraf Galerisi */}
          {entry.photos.length > 0 && (
            <div className="diary-photos-section">
              <h4>
                <ImageIcon size={16} />
                Eklenen Fotoğraflar ({entry.photos.length})
              </h4>
              <div className="diary-photos-grid">
                {entry.photos.map(photo => (
                  <div key={photo.id} className="diary-photo-item">
                    <img 
                      src={photo.url} 
                      alt={photo.name || 'Fotoğraf'}
                      onClick={() => setPreviewPhoto(photo)}
                    />
                    <button 
                      className="photo-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePhotoDelete(photo.id)
                      }}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fotoğraf Önizleme Modal */}
          {previewPhoto && (
            <div className="photo-preview-modal" onClick={() => setPreviewPhoto(null)}>
              <div className="photo-preview-content" onClick={e => e.stopPropagation()}>
                <img src={previewPhoto.url} alt="Önizleme" />
                <button 
                  className="photo-preview-close"
                  onClick={() => setPreviewPhoto(null)}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="editor-footer">
          <button onClick={handleCancel} className="cancel-btn">
            <X size={16} />
            Vazgeç
          </button>
          
          <div className="footer-info">
            <span className="char-count">
              {entry.content.length} karakter
            </span>
            {entry.photos.length > 0 && (
              <span className="photo-count">
                <Camera size={14} />
                {entry.photos.length} fotoğraf
              </span>
            )}
            {entry.mentions.length > 0 && (
              <span className="mention-count">
                {entry.mentions.length} kişi etiketlendi
              </span>
            )}
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="save-btn primary"
          >
            <Save size={16} />
            {saving ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Kaydet')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DiaryEditor