// Diary Service - Günlük yönetimi ve fotoğraf desteği

class DiaryService {
  constructor() {
    this.storageKey = 'diarydate_diaries'
    this.photosStorageKey = 'diarydate_diary_photos'
    this.listeners = []
  }

  // Tüm günlükleri getir
  getAllDiaries() {
    try {
      const diaries = localStorage.getItem(this.storageKey)
      return diaries ? JSON.parse(diaries) : []
    } catch (error) {
      console.error('Error loading diaries:', error)
      return []
    }
  }

  // Belirli tarihteki günlüğü getir
  getDiaryByDate(date) {
    const allDiaries = this.getAllDiaries()
    const targetDate = new Date(date).toDateString()
    return allDiaries.find(diary => {
      const diaryDate = new Date(diary.entryDate).toDateString()
      return diaryDate === targetDate
    })
  }

  // ID ile günlük getir
  getDiaryById(diaryId) {
    const allDiaries = this.getAllDiaries()
    return allDiaries.find(diary => diary.id === diaryId)
  }

  // Günlük oluştur veya güncelle
  saveDiary(diaryData) {
    try {
      const allDiaries = this.getAllDiaries()
      const existingIndex = allDiaries.findIndex(d => 
        new Date(d.entryDate).toDateString() === new Date(diaryData.entryDate).toDateString()
      )
      
      if (existingIndex >= 0) {
        // Güncelle
        allDiaries[existingIndex] = {
          ...allDiaries[existingIndex],
          ...diaryData,
          updatedAt: new Date().toISOString()
        }
      } else {
        // Yeni oluştur
        const id = `diary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newDiary = {
          id,
          content: diaryData.content || '',
          entryDate: diaryData.entryDate,
          visibility: diaryData.visibility || 'PRIVATE',
          mentions: diaryData.mentions || [],
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        allDiaries.push(newDiary)
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(allDiaries))
      this.notifyListeners('save', diaryData)
      
      return { success: true }
    } catch (error) {
      console.error('Error saving diary:', error)
      return { success: false, error: error.message }
    }
  }

  // Günlük sil
  deleteDiary(diaryId) {
    try {
      const allDiaries = this.getAllDiaries()
      const filteredDiaries = allDiaries.filter(d => d.id !== diaryId)
      localStorage.setItem(this.storageKey, JSON.stringify(filteredDiaries))
      
      // Fotoğrafları da sil
      this.deleteDiaryPhotos(diaryId)
      
      this.notifyListeners('delete', { id: diaryId })
      return { success: true }
    } catch (error) {
      console.error('Error deleting diary:', error)
      return { success: false, error: error.message }
    }
  }

  // Günlüğe fotoğraf ekle
  addPhotoToDiary(date, photo) {
    try {
      const dateKey = new Date(date).toISOString().split('T')[0]
      const photosKey = `${this.photosStorageKey}_${dateKey}`
      const existingPhotos = JSON.parse(localStorage.getItem(photosKey) || '[]')
      
      const newPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: photo.url,
        uploadedBy: photo.uploadedBy || 'user1',
        uploaderName: photo.uploaderName || 'Kullanıcı',
        uploadedAt: new Date().toISOString(),
        caption: photo.caption || '',
        source: photo.source || 'diary' // 'diary', 'event', 'map'
      }

      existingPhotos.unshift(newPhoto)
      localStorage.setItem(photosKey, JSON.stringify(existingPhotos))
      
      this.notifyListeners('photo_add', { date, photo: newPhoto })
      
      return { success: true, photo: newPhoto }
    } catch (error) {
      console.error('Error adding photo to diary:', error)
      return { success: false, error: error.message }
    }
  }

  // Günlük fotoğraflarını getir
  getDiaryPhotos(date) {
    try {
      const dateKey = new Date(date).toISOString().split('T')[0]
      const photosKey = `${this.photosStorageKey}_${dateKey}`
      return JSON.parse(localStorage.getItem(photosKey) || '[]')
    } catch (error) {
      console.error('Error loading diary photos:', error)
      return []
    }
  }

  // Günlük fotoğrafı sil
  deletePhotoFromDiary(date, photoId) {
    try {
      const dateKey = new Date(date).toISOString().split('T')[0]
      const photosKey = `${this.photosStorageKey}_${dateKey}`
      const photos = JSON.parse(localStorage.getItem(photosKey) || '[]')
      const updatedPhotos = photos.filter(p => p.id !== photoId)
      localStorage.setItem(photosKey, JSON.stringify(updatedPhotos))
      
      this.notifyListeners('photo_delete', { date, photoId })
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting photo from diary:', error)
      return { success: false, error: error.message }
    }
  }

  // Tüm günlük fotoğraflarını sil
  deleteDiaryPhotos(diaryId) {
    try {
      const diary = this.getDiaryById(diaryId)
      if (diary) {
        const dateKey = new Date(diary.entryDate).toISOString().split('T')[0]
        const photosKey = `${this.photosStorageKey}_${dateKey}`
        localStorage.removeItem(photosKey)
      }
    } catch (error) {
      console.error('Error deleting diary photos:', error)
    }
  }

  // Listener ekle
  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  // Listener'ları bilgilendir
  notifyListeners(action, data) {
    this.listeners.forEach(callback => {
      try {
        callback(action, data)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })
  }
}

// Singleton instance
const diaryService = new DiaryService()

export default diaryService
