// Event Service - Merkezi etkinlik yönetimi ve senkronizasyon
// Ajanda, Events ve Harita arasında tutarlılık sağlar

class EventService {
  constructor() {
    this.storageKey = 'diarydate_events'
    this.photosStorageKey = 'diarydate_event_photos'
    this.listeners = []
  }

  // Tüm etkinlikleri getir
  getAllEvents() {
    try {
      const events = localStorage.getItem(this.storageKey)
      return events ? JSON.parse(events) : []
    } catch (error) {
      console.error('Error loading events:', error)
      return []
    }
  }

  // Kullanıcının etkinliklerini getir
  getEventsByUser(userId) {
    const allEvents = this.getAllEvents()
    return allEvents.filter(event => event.creatorUid === userId)
  }

  // Herkese açık etkinlikleri getir
  getPublicEvents() {
    const allEvents = this.getAllEvents()
    return allEvents.filter(event => 
      event.visibility === 'PUBLIC' && 
      event.isActive !== false &&
      new Date(event.datetime) > new Date()
    )
  }

  // Belirli tarihteki etkinlikleri getir
  getEventsByDate(date) {
    const allEvents = this.getAllEvents()
    const targetDate = new Date(date).toDateString()
    return allEvents.filter(event => {
      const eventDate = new Date(event.datetime).toDateString()
      return eventDate === targetDate
    })
  }

  // Belirli konumdaki etkinlikleri getir
  getEventsByLocation(lat, lng, radiusKm = 1) {
    const allEvents = this.getAllEvents()
    return allEvents.filter(event => {
      if (!event.coords) return false
      const distance = this.calculateDistance(lat, lng, event.coords.lat, event.coords.lng)
      return distance <= radiusKm
    })
  }

  // ID ile etkinlik getir
  getEventById(eventId) {
    const allEvents = this.getAllEvents()
    return allEvents.find(event => event.id === eventId)
  }

  // Etkinlik oluştur
  createEvent(eventData) {
    try {
      const allEvents = this.getAllEvents()
      
      // Unique ID oluştur
      const id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const newEvent = {
        id,
        title: eventData.title,
        description: eventData.description || '',
        datetime: eventData.datetime || eventData.date,
        time: eventData.time,
        coords: eventData.coords || eventData.locationData?.coords || null,
        placeName: eventData.placeName || eventData.location || '',
        placeId: eventData.placeId || null,
        address: eventData.address || '',
        region: eventData.region || '',
        visibility: eventData.visibility || 'PUBLIC',
        category: eventData.category || 'social',
        maxParticipants: eventData.maxParticipants ? parseInt(eventData.maxParticipants) : null,
        creatorUid: eventData.creatorUid || eventData.userId || 'user1',
        creatorName: eventData.creatorName || eventData.organizerName || 'Kullanıcı',
        creatorAvatar: eventData.creatorAvatar || null,
        creatorType: eventData.creatorType || 'user',
        isActive: true,
        isPublic: eventData.visibility === 'PUBLIC' || eventData.isPublic !== false,
        participants: eventData.participants || [],
        pendingRequests: [],
        photos: eventData.photos || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      allEvents.push(newEvent)
      localStorage.setItem(this.storageKey, JSON.stringify(allEvents))
      
      // Listener'ları bilgilendir
      this.notifyListeners('create', newEvent)
      
      return { success: true, event: newEvent }
    } catch (error) {
      console.error('Error creating event:', error)
      return { success: false, error: error.message }
    }
  }

  // Etkinlik güncelle
  updateEvent(eventId, updates) {
    try {
      const allEvents = this.getAllEvents()
      const eventIndex = allEvents.findIndex(e => e.id === eventId)
      
      if (eventIndex === -1) {
        return { success: false, error: 'Etkinlik bulunamadı' }
      }

      const updatedEvent = {
        ...allEvents[eventIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      allEvents[eventIndex] = updatedEvent
      localStorage.setItem(this.storageKey, JSON.stringify(allEvents))
      
      // Listener'ları bilgilendir
      this.notifyListeners('update', updatedEvent)
      
      return { success: true, event: updatedEvent }
    } catch (error) {
      console.error('Error updating event:', error)
      return { success: false, error: error.message }
    }
  }

  // Etkinlik sil
  deleteEvent(eventId) {
    try {
      const allEvents = this.getAllEvents()
      const eventIndex = allEvents.findIndex(e => e.id === eventId)
      
      if (eventIndex === -1) {
        return { success: false, error: 'Etkinlik bulunamadı' }
      }

      const deletedEvent = allEvents[eventIndex]
      allEvents.splice(eventIndex, 1)
      localStorage.setItem(this.storageKey, JSON.stringify(allEvents))
      
      // İlişkili fotoğrafları da sil
      this.deleteEventPhotos(eventId)
      
      // Listener'ları bilgilendir
      this.notifyListeners('delete', deletedEvent)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting event:', error)
      return { success: false, error: error.message }
    }
  }

  // Etkinliğe katıl
  joinEvent(eventId, userId, userName) {
    const event = this.getEventById(eventId)
    if (!event) {
      return { success: false, error: 'Etkinlik bulunamadı' }
    }

    // Max katılımcı kontrolü
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return { success: false, error: 'Etkinlik dolu' }
    }

    // Zaten katılıyor mu kontrolü
    if (event.participants.some(p => p.id === userId)) {
      return { success: false, error: 'Zaten katılıyorsunuz' }
    }

    const participants = [...event.participants, { id: userId, name: userName }]
    return this.updateEvent(eventId, { participants })
  }

  // Etkinlikten ayrıl
  leaveEvent(eventId, userId) {
    const event = this.getEventById(eventId)
    if (!event) {
      return { success: false, error: 'Etkinlik bulunamadı' }
    }

    const participants = event.participants.filter(p => p.id !== userId)
    return this.updateEvent(eventId, { participants })
  }

  // Fotoğraf ekle (24 saat sonra otomatik silinir - harita ve etkinlikler için)
  addPhotoToEvent(eventId, photo, autoExpire = true) {
    try {
      const photosKey = `${this.photosStorageKey}_${eventId}`
      const existingPhotos = JSON.parse(localStorage.getItem(photosKey) || '[]')
      
      const now = new Date()
      const expiresAt = autoExpire ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() : null
      
      const newPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: photo.url,
        uploadedBy: photo.uploadedBy,
        uploaderName: photo.uploaderName,
        uploaderAvatar: photo.uploaderAvatar,
        uploadedAt: now.toISOString(),
        expiresAt: expiresAt, // 24 saat sonra sona erer
        likes: 0,
        likedBy: []
      }

      existingPhotos.unshift(newPhoto)
      localStorage.setItem(photosKey, JSON.stringify(existingPhotos))
      
      // Event'in photo count'ını güncelle
      const event = this.getEventById(eventId)
      if (event) {
        this.updateEvent(eventId, { photoCount: existingPhotos.length })
      }
      
      return { success: true, photo: newPhoto }
    } catch (error) {
      console.error('Error adding photo:', error)
      return { success: false, error: error.message }
    }
  }

  // Etkinlik fotoğraflarını getir (süresi dolmuşları temizle)
  getEventPhotos(eventId) {
    try {
      const photosKey = `${this.photosStorageKey}_${eventId}`
      let photos = JSON.parse(localStorage.getItem(photosKey) || '[]')
      
      // 24 saat geçmiş fotoğrafları filtrele
      const now = new Date()
      const validPhotos = photos.filter(photo => {
        if (!photo.expiresAt) return true // Süresi olmayan fotoğraflar kalır
        return new Date(photo.expiresAt) > now
      })
      
      // Eğer silinen fotoğraf varsa güncelle
      if (validPhotos.length !== photos.length) {
        localStorage.setItem(photosKey, JSON.stringify(validPhotos))
      }
      
      return validPhotos
    } catch (error) {
      console.error('Error loading photos:', error)
      return []
    }
  }

  // Etkinlik fotoğraflarını sil
  deleteEventPhotos(eventId) {
    try {
      const photosKey = `${this.photosStorageKey}_${eventId}`
      localStorage.removeItem(photosKey)
    } catch (error) {
      console.error('Error deleting photos:', error)
    }
  }

  // Fotoğraf sil
  deletePhoto(eventId, photoId) {
    try {
      const photosKey = `${this.photosStorageKey}_${eventId}`
      const photos = JSON.parse(localStorage.getItem(photosKey) || '[]')
      const updatedPhotos = photos.filter(p => p.id !== photoId)
      localStorage.setItem(photosKey, JSON.stringify(updatedPhotos))
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting photo:', error)
      return { success: false, error: error.message }
    }
  }

  // Tüm expired fotoğrafları temizle (arka planda çalışır)
  cleanupExpiredPhotos() {
    try {
      const allEvents = this.getAllEvents()
      allEvents.forEach(event => {
        this.getEventPhotos(event.id) // Bu otomatik olarak expired olanları temizler
      })
    } catch (error) {
      console.error('Error cleaning up photos:', error)
    }
  }

  // Mesafe hesaplama
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Listener ekle (state güncellemeleri için)
  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  // Listener'ları bilgilendir
  notifyListeners(action, event) {
    this.listeners.forEach(callback => {
      try {
        callback(action, event)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })
  }

  // Demo etkinlikleri oluştur (ilk kullanım için)
  initializeDemoEvents() {
    const existingEvents = this.getAllEvents()
    if (existingEvents.length > 0) return

    const demoEvents = [
      {
        title: 'Kahve Buluşması',
        description: 'Hafta sonu kahve içip sohbet edelim',
        datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        time: '14:00',
        coords: { lat: 41.0082, lng: 28.9784 },
        placeName: 'Starbucks Taksim',
        address: 'Taksim Meydanı, Beyoğlu',
        region: 'Beyoğlu',
        visibility: 'PUBLIC',
        category: 'social',
        creatorUid: 'user1',
        creatorName: 'Ahmet Yılmaz',
        creatorType: 'user',
        maxParticipants: 10
      },
      {
        title: 'Sahil Yürüyüşü',
        description: 'Kadıköy sahilinde yürüyüş yapalım',
        datetime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        time: '10:00',
        coords: { lat: 40.9833, lng: 29.0167 },
        placeName: 'Kadıköy Sahil',
        address: 'Kadıköy Sahil Yolu',
        region: 'Kadıköy',
        visibility: 'PUBLIC',
        category: 'sports',
        creatorUid: 'user2',
        creatorName: 'Ayşe Demir',
        creatorType: 'user',
        maxParticipants: null
      },
      {
        title: 'Canlı Müzik Gecesi',
        description: 'Her Cuma canlı müzik performansı',
        datetime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        time: '21:00',
        coords: { lat: 41.0082, lng: 28.9784 },
        placeName: 'Jazz Bar Taksim',
        address: 'İstiklal Caddesi, Beyoğlu',
        region: 'Beyoğlu',
        visibility: 'PUBLIC',
        category: 'music',
        creatorUid: 'venue1',
        creatorName: 'Jazz Bar Taksim',
        creatorType: 'venue',
        maxParticipants: 50
      }
    ]

    demoEvents.forEach(event => this.createEvent(event))
  }
}

// Singleton instance
const eventService = new EventService()

// Demo etkinlikleri başlat
eventService.initializeDemoEvents()

export default eventService
