import { useState, useRef } from 'react'
import { Camera, X, Image, Upload, ZoomIn, Heart, Trash2, BookOpen, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import diaryService from '../services/diaryService'
import './PhotoGallery.css'

const PhotoGallery = ({ entityId, entityType, photos = [], onPhotoAdd, onPhotoDelete, onSaveToDiary }) => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const fileInputRef = useRef(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [localPhotos, setLocalPhotos] = useState(photos)

  // Fotoğraf yükleme işlemi
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (!user) {
      addNotification({
        type: 'toast',
        title: 'Giriş Gerekli',
        message: 'Fotoğraf yüklemek için giriş yapmalısınız'
      })
      return
    }

    setUploading(true)

    try {
      for (const file of files) {
        // Dosya boyutu kontrolü (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          addNotification({
            type: 'toast',
            title: 'Hata',
            message: 'Dosya boyutu 5MB\'dan küçük olmalıdır'
          })
          continue
        }

        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
          addNotification({
            type: 'toast',
            title: 'Hata',
            message: 'Sadece resim dosyaları yüklenebilir'
          })
          continue
        }

        // Base64'e çevir (gerçek uygulamada cloud storage kullanılacak)
        const reader = new FileReader()
        reader.onload = (event) => {
          const newPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: event.target.result,
            uploadedBy: user.id || 'user1',
            uploaderName: user.name || user.displayName || 'Kullanıcı',
            uploaderAvatar: user.avatar || user.photoURL,
            uploadedAt: new Date().toISOString(),
            entityId,
            entityType,
            likes: 0,
            likedBy: []
          }

          setLocalPhotos(prev => [newPhoto, ...prev])
          
          if (onPhotoAdd) {
            onPhotoAdd(newPhoto)
          }

          // localStorage'a kaydet
          savePhotoToStorage(newPhoto)
        }
        reader.readAsDataURL(file)
      }

      addNotification({
        type: 'toast',
        title: 'Başarılı',
        message: 'Fotoğraf yüklendi'
      })
    } catch (error) {
      console.error('Fotoğraf yükleme hatası:', error)
      addNotification({
        type: 'toast',
        title: 'Hata',
        message: 'Fotoğraf yüklenirken bir hata oluştu'
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // localStorage'a kaydet
  const savePhotoToStorage = (photo) => {
    try {
      const storageKey = `photos_${entityType}_${entityId}`
      const existingPhotos = JSON.parse(localStorage.getItem(storageKey) || '[]')
      existingPhotos.unshift(photo)
      localStorage.setItem(storageKey, JSON.stringify(existingPhotos))
    } catch (error) {
      console.error('Fotoğraf kaydetme hatası:', error)
    }
  }

  // Fotoğraf silme
  const handleDeletePhoto = (photoId) => {
    if (!user) return

    const photoToDelete = localPhotos.find(p => p.id === photoId)
    if (photoToDelete && photoToDelete.uploadedBy !== user.id && photoToDelete.uploadedBy !== 'user1') {
      addNotification({
        type: 'toast',
        title: 'Yetkisiz İşlem',
        message: 'Sadece kendi yüklediğiniz fotoğrafları silebilirsiniz'
      })
      return
    }

    setLocalPhotos(prev => prev.filter(p => p.id !== photoId))
    
    if (onPhotoDelete) {
      onPhotoDelete(photoId)
    }

    // localStorage'dan sil
    try {
      const storageKey = `photos_${entityType}_${entityId}`
      const existingPhotos = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const updatedPhotos = existingPhotos.filter(p => p.id !== photoId)
      localStorage.setItem(storageKey, JSON.stringify(updatedPhotos))
    } catch (error) {
      console.error('Fotoğraf silme hatası:', error)
    }

    setSelectedPhoto(null)
    addNotification({
      type: 'toast',
      title: 'Silindi',
      message: 'Fotoğraf silindi'
    })
  }

  // Fotoğraf beğenme
  const handleLikePhoto = (photoId) => {
    if (!user) {
      addNotification({
        type: 'toast',
        title: 'Giriş Gerekli',
        message: 'Beğenmek için giriş yapmalısınız'
      })
      return
    }

    setLocalPhotos(prev => prev.map(photo => {
      if (photo.id === photoId) {
        const userId = user.id || 'user1'
        const isLiked = photo.likedBy?.includes(userId)
        return {
          ...photo,
          likes: isLiked ? photo.likes - 1 : photo.likes + 1,
          likedBy: isLiked 
            ? photo.likedBy.filter(id => id !== userId)
            : [...(photo.likedBy || []), userId]
        }
      }
      return photo
    }))
  }

  // Fotoğrafı ajandaya kaydet
  const handleSaveToDiary = (photo) => {
    if (!user) {
      addNotification({
        type: 'toast',
        title: 'Giriş Gerekli',
        message: 'Ajandaya kaydetmek için giriş yapmalısınız'
      })
      return
    }

    const result = diaryService.addPhotoToDiary(new Date(), {
      url: photo.url,
      uploadedBy: user.id || 'user1',
      uploaderName: user.name || 'Kullanıcı',
      source: entityType === 'event' ? 'event' : 'map',
      caption: `${entityType === 'event' ? 'Etkinlik' : 'Harita'} fotoğrafı`
    })

    if (result.success) {
      addNotification({
        type: 'toast',
        title: 'Başarılı',
        message: 'Fotoğraf ajandanıza kaydedildi'
      })
      
      if (onSaveToDiary) {
        onSaveToDiary(photo)
      }
    }
  }

  // Tüm fotoğrafları birleştir (props + local)
  const allPhotos = [...localPhotos]

  return (
    <div className="photo-gallery">
      <div className="gallery-header">
        <div className="gallery-title">
          <Image size={18} />
          <span>Fotoğraflar ({allPhotos.length})</span>
        </div>
        <button 
          className="upload-photo-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <div className="upload-spinner" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Camera size={16} />
              Fotoğraf Ekle
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {allPhotos.length === 0 ? (
        <div className="gallery-empty">
          <Upload size={40} />
          <p>Henüz fotoğraf yüklenmemiş</p>
          <span>İlk fotoğrafı sen paylaş!</span>
        </div>
      ) : (
        <div className="gallery-grid">
          {allPhotos.map((photo, index) => (
            <div 
              key={photo.id || index} 
              className="gallery-item"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img src={photo.url} alt={`Fotoğraf ${index + 1}`} />
              <div className="gallery-item-overlay">
                <ZoomIn size={20} />
              </div>
              {photo.likes > 0 && (
                <div className="gallery-item-likes">
                  <Heart size={12} fill="#fff" />
                  {photo.likes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fotoğraf Detay Modal */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="photo-modal-close"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={24} />
            </button>
            
            <img src={selectedPhoto.url} alt="Detay" />
            
            <div className="photo-modal-info">
              <div className="photo-uploader">
                {selectedPhoto.uploaderAvatar ? (
                  <img src={selectedPhoto.uploaderAvatar} alt={selectedPhoto.uploaderName} />
                ) : (
                  <div className="photo-uploader-placeholder">
                    {selectedPhoto.uploaderName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <strong>{selectedPhoto.uploaderName || 'Kullanıcı'}</strong>
                  <span>
                    {new Date(selectedPhoto.uploadedAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="photo-modal-actions">
                <button 
                  className={`photo-like-btn ${selectedPhoto.likedBy?.includes(user?.id || 'user1') ? 'liked' : ''}`}
                  onClick={() => handleLikePhoto(selectedPhoto.id)}
                >
                  <Heart size={18} fill={selectedPhoto.likedBy?.includes(user?.id || 'user1') ? '#e91e63' : 'none'} />
                  {selectedPhoto.likes || 0}
                </button>
                
                <button 
                  className="photo-save-diary-btn"
                  onClick={() => handleSaveToDiary(selectedPhoto)}
                >
                  <BookOpen size={18} />
                  Ajandama Kaydet
                </button>
                
                {selectedPhoto.expiresAt && (
                  <div className="photo-expires-info">
                    <Clock size={14} />
                    <span>
                      {Math.ceil((new Date(selectedPhoto.expiresAt) - new Date()) / (1000 * 60 * 60))} saat sonra silinecek
                    </span>
                  </div>
                )}
                
                {(selectedPhoto.uploadedBy === user?.id || selectedPhoto.uploadedBy === 'user1') && (
                  <button 
                    className="photo-delete-btn"
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  >
                    <Trash2 size={18} />
                    Sil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoGallery
