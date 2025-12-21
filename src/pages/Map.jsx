import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import { Search, Users, Filter, MapPin, Clock, Share, UserCheck, Calendar, Coffee, Utensils, BookOpen, ShoppingBag, Send, X, Loader, RefreshCw, Plus, Store, UserPlus, Trash2 } from 'lucide-react'
import UserCard from '../components/UserCard'
import EventCard from '../components/EventCard'
import PhotoGallery from '../components/PhotoGallery'
import CreateEventModal from '../components/CreateEventModal'
import eventService from '../services/eventService'
import diaryService from '../services/diaryService'
import 'leaflet/dist/leaflet.css'
import './Map.css'

// Leaflet marker ikonlarını düzelt
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerRetina,
  shadowUrl: markerShadow,
})

// İkon SVG'lerini döndüren fonksiyon
const getIconSVG = (iconType) => {
  const icons = {
    'coffee': '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.38 0 2.5-1.12 2.5-2.5S19.88 5 18.5 5V3zM16 5v3h.5c.55 0 1-.45 1-1s-.45-1-1-1H16z"/></svg>',
    'utensils': '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>',
    'book-open': '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>',
    'shopping-bag': '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v12z"/></svg>',
    'map-pin': '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
  }
  return icons[iconType] || icons['map-pin']
}

const Map = () => {
  const { user, filterBlockedUsers } = useAuth()
  const { addNotification } = useNotification()
  
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
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mapGrad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="30" fill="url(#mapGrad${colorIndex})"/>
        <text x="30" y="38" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }
  const [userLocation, setUserLocation] = useState(null)
  const [isSharing, setIsSharing] = useState(false)
  const [nearbyUsers, setNearbyUsers] = useState([])
  const [nearbyEvents, setNearbyEvents] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [showUserSheet, setShowUserSheet] = useState(false)
  const [showEventSheet, setShowEventSheet] = useState(false)
  const [viewMode, setViewMode] = useState('users') // 'users' or 'events'
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    timeRange: '1h', // 15m, 1h, 24h
    category: 'all', // all, cafe, restaurant, event
    friendsOnly: false
  })
  const [mapCenter, setMapCenter] = useState([41.0082, 28.9784]) // İstanbul
  const [mapZoom, setMapZoom] = useState(10)
  const [selectedPOI, setSelectedPOI] = useState(null)
  const [showPOISheet, setShowPOISheet] = useState(false)
  const [poiEvents, setPOIEvents] = useState([])
  const [debounceTimer, setDebounceTimer] = useState(null)
  
  // Google Places benzeri mekanlar için state'ler
  const [places, setPlaces] = useState([])
  const [loadingPlaces, setLoadingPlaces] = useState(false)
  const [placesError, setPlacesError] = useState(null)
  const [showPlaces, setShowPlaces] = useState(true)
  const [placeFilter, setPlaceFilter] = useState('all') // 'all', 'restaurant', 'cafe', 'bar', 'fast_food'
  
  // Etkinlik filtreleri için state'ler
  const [eventFilter, setEventFilter] = useState('all') // 'all', 'user', 'venue'
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [userEvents, setUserEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventDetailSheet, setShowEventDetailSheet] = useState(false)

  // localStorage'dan kullanıcı etkinliklerini yükle
  useEffect(() => {
    // EventService'den tüm etkinlikleri yükle
    const loadEvents = () => {
      const allEvents = eventService.getAllEvents()
      setUserEvents(allEvents)
    }
    
    loadEvents()
    
    // EventService değişikliklerini dinle
    const unsubscribe = eventService.addListener((action, event) => {
      loadEvents()
    })
    
    return () => unsubscribe()
  }, [])

  // Overpass API ile restoran ve kafeleri çek
  const fetchPlacesFromOverpass = useCallback(async (bounds) => {
    if (!bounds) return
    
    setLoadingPlaces(true)
    setPlacesError(null)
    
    const south = bounds.getSouth()
    const west = bounds.getWest()
    const north = bounds.getNorth()
    const east = bounds.getEast()
    
    // Overpass API sorgusu - restoranlar, kafeler, barlar, fast food
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](${south},${west},${north},${east});
        node["amenity"="cafe"](${south},${west},${north},${east});
        node["amenity"="bar"](${south},${west},${north},${east});
        node["amenity"="fast_food"](${south},${west},${north},${east});
        node["amenity"="pub"](${south},${west},${north},${east});
        way["amenity"="restaurant"](${south},${west},${north},${east});
        way["amenity"="cafe"](${south},${west},${north},${east});
        way["amenity"="bar"](${south},${west},${north},${east});
        way["amenity"="fast_food"](${south},${west},${north},${east});
      );
      out center 200;
    `
    
    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      if (!response.ok) {
        throw new Error('API yanıt vermedi')
      }
      
      const data = await response.json()
      
      // Verileri işle
      const processedPlaces = data.elements
        .filter(el => el.tags && el.tags.name) // İsmi olanları al
        .map(el => {
          const lat = el.lat || el.center?.lat
          const lng = el.lon || el.center?.lon
          
          if (!lat || !lng) return null
          
          const amenity = el.tags.amenity
          let icon = 'utensils'
          let color = '#FF5722'
          let category = 'restaurant'
          
          if (amenity === 'cafe') {
            icon = 'coffee'
            color = '#795548'
            category = 'cafe'
          } else if (amenity === 'bar' || amenity === 'pub') {
            icon = 'wine'
            color = '#9C27B0'
            category = 'bar'
          } else if (amenity === 'fast_food') {
            icon = 'burger'
            color = '#FF9800'
            category = 'fast_food'
          }
          
          return {
            id: `osm-${el.id}`,
            name: el.tags.name,
            category,
            amenity,
            coords: { lat, lng },
            icon,
            color,
            cuisine: el.tags.cuisine || '',
            phone: el.tags.phone || el.tags['contact:phone'] || '',
            website: el.tags.website || el.tags['contact:website'] || '',
            openingHours: el.tags.opening_hours || '',
            address: [
              el.tags['addr:street'],
              el.tags['addr:housenumber'],
              el.tags['addr:city']
            ].filter(Boolean).join(' ') || '',
            wheelchair: el.tags.wheelchair || '',
            outdoor_seating: el.tags.outdoor_seating === 'yes'
          }
        })
        .filter(Boolean)
      
      setPlaces(processedPlaces)
      
      if (processedPlaces.length === 0) {
        addNotification({
          type: 'toast',
          title: 'Bilgi',
          message: 'Bu bölgede kayıtlı mekan bulunamadı. Haritayı yakınlaştırın veya farklı bir bölge seçin.'
        })
      }
      
    } catch (error) {
      console.error('Overpass API hatası:', error)
      setPlacesError('Mekanlar yüklenirken hata oluştu')
      addNotification({
        type: 'toast',
        title: 'Hata',
        message: 'Mekanlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
      })
    } finally {
      setLoadingPlaces(false)
    }
  }, [addNotification])

  // Filtrelenmiş mekanlar
  const getFilteredPlaces = useCallback(() => {
    if (placeFilter === 'all') return places
    return places.filter(p => p.category === placeFilter)
  }, [places, placeFilter])

  // POI (Point of Interest) verileri
  const mockPOIs = [
    {
      id: 'poi1',
      name: 'Starbucks Taksim',
      category: 'cafe',
      coords: { lat: 41.0082, lng: 28.9784 },
      region: 'Beyoğlu',
      icon: 'coffee',
      color: '#4CAF50'
    },
    {
      id: 'poi2',
      name: 'Kadıköy Sahil',
      category: 'park',
      coords: { lat: 40.9833, lng: 29.0167 },
      region: 'Kadıköy',
      icon: 'map-pin',
      color: '#2196F3'
    },
    {
      id: 'poi3',
      name: 'Beşiktaş Restaurant',
      category: 'restaurant',
      coords: { lat: 41.0422, lng: 29.0094 },
      region: 'Beşiktaş',
      icon: 'utensils',
      color: '#FF9800'
    },
    {
      id: 'poi4',
      name: 'Kütüphane',
      category: 'library',
      coords: { lat: 41.0150, lng: 28.9850 },
      region: 'Beyoğlu',
      icon: 'book-open',
      color: '#9C27B0'
    },
    {
      id: 'poi5',
      name: 'Alışveriş Merkezi',
      category: 'shopping',
      coords: { lat: 40.9900, lng: 29.0300 },
      region: 'Kadıköy',
      icon: 'shopping-bag',
      color: '#E91E63'
    }
  ]

  // Simülasyon kullanıcı verileri
  const mockUsers = [
    {
      id: '1',
      displayName: 'Ahmet Yılmaz',
      avatarUrl: getDefaultAvatar('Ahmet Yılmaz'),
      coords: { lat: 41.0082, lng: 28.9784 },
      updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 dk önce
      activityTag: 'kahve molası',
      placeName: 'Starbucks Taksim',
      region: 'Beyoğlu'
    },
    {
      id: '2',
      displayName: 'Ayşe Demir',
      avatarUrl: getDefaultAvatar('Ayşe Demir'),
      coords: { lat: 40.9833, lng: 29.0167 },
      updatedAt: new Date(Date.now() - 25 * 60 * 1000), // 25 dk önce
      activityTag: 'çalışıyor',
      placeName: 'Kadıköy Sahil',
      region: 'Kadıköy'
    },
    {
      id: '3',
      displayName: 'Mehmet Kaya',
      avatarUrl: getDefaultAvatar('Mehmet Kaya'),
      coords: { lat: 41.0422, lng: 29.0094 },
      updatedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 dk önce
      activityTag: 'yemek',
      placeName: 'Beşiktaş Çarşı',
      region: 'Beşiktaş'
    }
  ]

  // Simülasyon herkese açık etkinlik verileri
  const mockEvents = [
    {
      id: 'event1',
      title: 'Kahve Buluşması',
      description: 'Hafta sonu kahve içip sohbet edelim',
      datetime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 saat sonra
      coords: { lat: 41.0082, lng: 28.9784 },
      placeName: 'Starbucks Taksim',
      address: 'Taksim Meydanı, Beyoğlu',
      region: 'Beyoğlu',
      visibility: 'PUBLIC',
      creatorUid: 'user1',
      creatorName: 'Ahmet Yılmaz',
      creatorAvatar: 'https://via.placeholder.com/150/4CAF50/white?text=AY',
      creatorType: 'user', // Kullanıcı etkinliği
      isActive: true,
      participants: [],
      maxParticipants: 10
    },
    {
      id: 'event2',
      title: 'Sahil Yürüyüşü',
      description: 'Kadıköy sahilinde yürüyüş yapalım',
      datetime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 saat sonra
      coords: { lat: 40.9833, lng: 29.0167 },
      placeName: 'Kadıköy Sahil',
      address: 'Kadıköy Sahil Yolu',
      region: 'Kadıköy',
      visibility: 'PUBLIC',
      creatorUid: 'user2',
      creatorName: 'Ayşe Demir',
      creatorAvatar: 'https://via.placeholder.com/150/2196F3/white?text=AD',
      creatorType: 'user', // Kullanıcı etkinliği
      isActive: true,
      participants: [],
      maxParticipants: null
    },
    {
      id: 'event3',
      title: 'Akşam Yemeği Özel Menü',
      description: 'Şef özel menüsüyle akşam yemeği etkinliği',
      datetime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 saat sonra
      coords: { lat: 41.0422, lng: 29.0094 },
      placeName: 'Beşiktaş Restaurant',
      address: 'Beşiktaş Çarşı',
      region: 'Beşiktaş',
      visibility: 'PUBLIC',
      creatorUid: 'venue1',
      creatorName: 'Beşiktaş Restaurant',
      creatorAvatar: 'https://via.placeholder.com/150/FF9800/white?text=BR',
      creatorType: 'venue', // Mekan sahibi etkinliği
      isActive: true,
      participants: [],
      maxParticipants: 20
    },
    {
      id: 'event4',
      title: 'Canlı Müzik Gecesi',
      description: 'Her Cuma canlı müzik performansı',
      datetime: new Date(Date.now() + 8 * 60 * 60 * 1000),
      coords: { lat: 41.0082, lng: 28.9784 },
      placeName: 'Jazz Bar Taksim',
      address: 'İstiklal Caddesi, Beyoğlu',
      region: 'Beyoğlu',
      visibility: 'PUBLIC',
      creatorUid: 'venue2',
      creatorName: 'Jazz Bar Taksim',
      creatorAvatar: 'https://via.placeholder.com/150/9C27B0/white?text=JB',
      creatorType: 'venue', // Mekan sahibi etkinliği
      isActive: true,
      participants: [],
      maxParticipants: 50
    }
  ]

  // Kullanıcının konumunu al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter([location.lat, location.lng])
          setMapZoom(13)
        },
        (error) => {
          console.log('Konum alınamadı:', error)
          addNotification({
            type: 'toast',
            title: 'Konum Hatası',
            message: 'Konum bilgisi alınamadı. Varsayılan konum kullanılıyor.'
          })
        }
      )
    }
  }, [])

  // Konum paylaşımını başlat/durdur
  const toggleLocationSharing = () => {
    if (!user) {
      addNotification({
        type: 'toast',
        title: 'Giriş Gerekli',
        message: 'Konum paylaşmak için giriş yapmalısınız'
      })
      return
    }

    if (!userLocation) {
      addNotification({
        type: 'toast',
        title: 'Konum Bulunamadı',
        message: 'Önce konum izni vermeniz gerekiyor'
      })
      return
    }

    setIsSharing(!isSharing)
    
    if (!isSharing) {
      addNotification({
        type: 'toast',
        title: 'Konum Paylaşımı Açıldı',
        message: 'Konumunuz artık diğer kullanıcılara görünüyor'
      })
      // Gerçek uygulamada burada Firestore'a yazılacak
    } else {
      addNotification({
        type: 'toast',
        title: 'Konum Paylaşımı Kapatıldı',
        message: 'Konumunuz artık gizli'
      })
    }
  }

  // Yakındaki kullanıcıları filtrele
  const getFilteredUsers = () => {
    let filtered = [...mockUsers]

    // Zaman filtresi
    const now = new Date()
    const timeThresholds = {
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    }
    
    const threshold = timeThresholds[filters.timeRange]
    filtered = filtered.filter(user => 
      now - user.updatedAt <= threshold
    )

    // Kategori filtresi
    if (filters.category !== 'all') {
      filtered = filtered.filter(user => {
        if (filters.category === 'cafe') return user.activityTag?.includes('kahve')
        if (filters.category === 'restaurant') return user.activityTag?.includes('yemek')
        if (filters.category === 'event') return user.activityTag?.includes('etkinlik')
        return true
      })
    }

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.placeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.region?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Engellenen kullanıcıları filtrele
    filtered = filterBlockedUsers(filtered)

    return filtered
  }

  // Herkese açık etkinlikleri filtrele
  const getFilteredEvents = () => {
    // Mock etkinlikler + kullanıcı oluşturduğu etkinlikler
    let allEvents = [...mockEvents, ...userEvents]

    // Sadece herkese açık ve aktif etkinlikler
    let filtered = allEvents.filter(event => 
      event.visibility === 'PUBLIC' && 
      event.isActive && 
      new Date(event.datetime) > new Date() // Gelecekteki etkinlikler
    )

    // Etkinlik türü filtresi
    if (eventFilter === 'user') {
      filtered = filtered.filter(event => event.creatorType === 'user')
    } else if (eventFilter === 'venue') {
      filtered = filtered.filter(event => event.creatorType === 'venue')
    }

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.placeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.creatorName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  // Bölgeye tıklandığında
  const handleRegionClick = (region) => {
    const regionUsers = getFilteredUsers().filter(user => user.region === region)
    const regionEvents = getFilteredEvents().filter(event => event.region === region)
    setSelectedRegion(region)
    setNearbyUsers(regionUsers)
    setNearbyEvents(regionEvents)
    
    // Etkinlik varsa etkinlik sheet'ini, yoksa kullanıcı sheet'ini göster
    if (regionEvents.length > 0) {
      setViewMode('events')
      setShowEventSheet(true)
      setShowUserSheet(false)
    } else {
      setViewMode('users')
      setShowUserSheet(true)
      setShowEventSheet(false)
    }
  }

  // Mesafe hesaplama fonksiyonu
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Dünya'nın yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }

  // POI tıklama işlemi
  const handlePOIClick = (poi) => {
    const eventsInPOI = getFilteredEvents().filter(event => {
      const distance = calculateDistance(
        poi.coords.lat, poi.coords.lng,
        event.coords.lat, event.coords.lng
      )
      return parseFloat(distance) < 0.5 // 500m içindeki etkinlikler
    })
    
    setSelectedPOI(poi)
    setPOIEvents(eventsInPOI)
    setShowPOISheet(true)
    setShowUserSheet(false)
    setShowEventSheet(false)
  }

  // Katılma isteği gönder
  const handleJoinRequest = (event) => {
    if (!user) {
      addNotification({
        type: 'toast',
        title: 'Giriş Gerekli',
        message: 'Katılma isteği göndermek için giriş yapmalısınız'
      })
      return
    }

    // Gerçek uygulamada Firestore'a join_requests koleksiyonuna yazılacak
    addNotification({
      type: 'toast',
      title: 'İstek Gönderildi',
      message: `"${event.title}" etkinliği için katılma isteğiniz gönderildi`
    })

    // Etkinlik sahibine bildirim gönder (simülasyon)
    addNotification({
      type: 'notification',
      title: 'Yeni Katılma İsteği',
      message: `${user.name || 'Kullanıcı'}, "${event.title}" etkinliğinize katılmak istiyor`,
      timestamp: new Date(),
      read: false
    })
  }

  // Etkinliğe direkt katıl
  const handleJoinEvent = (event) => {
    if (!user) {
      addNotification({
        type: 'toast',
        title: 'Giriş Gerekli',
        message: 'Etkinliğe katılmak için giriş yapmalısınız'
      })
      return
    }

    const userId = user?.id || 'user1'
    const userName = user?.name || 'Kullanıcı'

    // Max katılımcı kontrolü
    if (event.maxParticipants && event.participants?.length >= event.maxParticipants) {
      addNotification({
        type: 'toast',
        title: 'Etkinlik Dolu',
        message: 'Bu etkinlik maksimum katılımcı sayısına ulaşmış'
      })
      return
    }

    // EventService ile katıl
    const result = eventService.joinEvent(event.id, userId, userName)
    
    if (result.success) {
      addNotification({
        type: 'toast',
        title: 'Katıldınız!',
        message: `"${event.title}" etkinliğine başarıyla katıldınız`
      })
    } else {
      addNotification({
        type: 'toast',
        title: 'Hata',
        message: result.error || 'Katılım işlemi başarısız'
      })
    }
  }

  // Etkinlik detay tıklama
  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowEventDetailSheet(true)
    setShowPOISheet(false)
    setShowUserSheet(false)
    setShowEventSheet(false)
  }

  // Etkinlik oluşturulduğunda
  const handleEventCreate = (newEvent) => {
    // EventService kullanarak etkinlik oluştur
    const result = eventService.createEvent({
      ...newEvent,
      creatorUid: user?.id || 'user1',
      creatorName: user?.name || 'Kullanıcı',
      creatorType: 'user'
    })
    
    if (result.success) {
      addNotification({
        type: 'toast',
        title: 'Başarılı',
        message: 'Etkinlik oluşturuldu!'
      })
    }
  }

  // Fotoğrafı ajandaya kaydet
  const handleSavePhotoToDiary = (photo) => {
    addNotification({
      type: 'toast',
      title: 'Başarılı',
      message: 'Fotoğraf ajandanıza kaydedildi'
    })
  }

  // Bu bölgede ara fonksiyonu
  const handleSearchInArea = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    
    const timer = setTimeout(() => {
      const eventsInArea = getFilteredEvents().filter(event => {
        if (!selectedPOI) return false
        const distance = calculateDistance(
          selectedPOI.coords.lat, selectedPOI.coords.lng,
          event.coords.lat, event.coords.lng
        )
        return parseFloat(distance) < 1 // 1km içindeki etkinlikler
      })
      
      setPOIEvents(eventsInArea)
      addNotification({
        type: 'toast',
        title: 'Arama Tamamlandı',
        message: `${eventsInArea.length} etkinlik bulundu`
      })
    }, 300)
    
    setDebounceTimer(timer)
  }

  // Harita olayları ve kontrolü
  const MapController = ({ onBoundsChange }) => {
    const map = useMap()
    
    useMapEvents({
      click: (e) => {
        // Tıklanan konuma göre bölge belirleme (simülasyon)
        const { lat, lng } = e.latlng
        let region = 'Bilinmeyen Bölge'
        
        if (lat > 41.0 && lng < 29.0) region = 'Beyoğlu'
        else if (lat < 41.0 && lng > 29.0) region = 'Kadıköy'
        else if (lat > 41.0 && lng > 29.0) region = 'Beşiktaş'
        
        handleRegionClick(region)
      },
      moveend: () => {
        const bounds = map.getBounds()
        const zoom = map.getZoom()
        // Sadece yakınlaştırma 13 ve üzeri olduğunda mekanları yükle
        if (zoom >= 13 && onBoundsChange) {
          onBoundsChange(bounds)
        }
      },
      zoomend: () => {
        const bounds = map.getBounds()
        const zoom = map.getZoom()
        if (zoom >= 13 && onBoundsChange) {
          onBoundsChange(bounds)
        }
      }
    })
    return null
  }

  // Mekan marker tıklama işlemi
  const handlePlaceClick = (place) => {
    setSelectedPOI(place)
    setShowPOISheet(true)
    setShowUserSheet(false)
    setShowEventSheet(false)
  }

  // Mekanları manuel yenile
  const handleRefreshPlaces = () => {
    // Bu fonksiyon MapController içinden çağrılacak şekilde güncellendi
    addNotification({
      type: 'toast',
      title: 'Bilgi',
      message: 'Mekanları yüklemek için haritayı yakınlaştırın (zoom 13+)'
    })
  }

  const filteredUsers = getFilteredUsers()
  const filteredPlaces = getFilteredPlaces()

  return (
    <div className="map-container">
      <div className="map-header">
        <h1>Harita</h1>
        <div className="map-controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Bölge, kullanıcı veya mekan ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            className={`share-toggle ${isSharing ? 'active' : ''}`}
            onClick={toggleLocationSharing}
          >
            <Share size={20} />
            {isSharing ? 'Paylaşım Açık' : 'Konumu Paylaş'}
          </button>
        </div>
      </div>

      <div className="map-filters">
        <div className="filter-group">
          <Filter size={16} />
          <span>Filtreler:</span>
        </div>
        
        <select 
          value={filters.timeRange} 
          onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
        >
          <option value="15m">Son 15 dakika</option>
          <option value="1h">Son 1 saat</option>
          <option value="24h">Son 24 saat</option>
        </select>
        
        <select 
          value={filters.category} 
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="all">Tüm Aktiviteler</option>
          <option value="cafe">Kafe</option>
          <option value="restaurant">Restoran</option>
          <option value="event">Etkinlik</option>
        </select>
        
        <label className="friends-filter">
          <input
            type="checkbox"
            checked={filters.friendsOnly}
            onChange={(e) => setFilters({...filters, friendsOnly: e.target.checked})}
          />
          <UserCheck size={16} />
          Sadece Arkadaşlarım
        </label>
      </div>

      {/* Mekan Filtreleri */}
      <div className="places-filters">
        <div className="places-header">
          <div className="places-title">
            <MapPin size={16} />
            <span>Mekanlar ({filteredPlaces.length})</span>
            {loadingPlaces && <Loader size={16} className="loading-spinner" />}
          </div>
          <div className="places-actions">
            <label className="show-places-toggle">
              <input
                type="checkbox"
                checked={showPlaces}
                onChange={(e) => setShowPlaces(e.target.checked)}
              />
              Göster
            </label>
            <button 
              className="refresh-places-btn"
              onClick={handleRefreshPlaces}
              disabled={loadingPlaces}
            >
              <RefreshCw size={14} className={loadingPlaces ? 'spinning' : ''} />
            </button>
          </div>
        </div>
        
        <div className="place-type-filters">
          <button 
            className={`place-filter-btn ${placeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPlaceFilter('all')}
          >
            Tümü
          </button>
          <button 
            className={`place-filter-btn ${placeFilter === 'restaurant' ? 'active' : ''}`}
            onClick={() => setPlaceFilter('restaurant')}
          >
            <Utensils size={14} />
            Restoran
          </button>
          <button 
            className={`place-filter-btn ${placeFilter === 'cafe' ? 'active' : ''}`}
            onClick={() => setPlaceFilter('cafe')}
          >
            <Coffee size={14} />
            Kafe
          </button>
          <button 
            className={`place-filter-btn ${placeFilter === 'bar' ? 'active' : ''}`}
            onClick={() => setPlaceFilter('bar')}
          >
            🍷 Bar
          </button>
          <button 
            className={`place-filter-btn ${placeFilter === 'fast_food' ? 'active' : ''}`}
            onClick={() => setPlaceFilter('fast_food')}
          >
            🍔 Fast Food
          </button>
        </div>
        
        {placesError && (
          <div className="places-error">
            {placesError}
          </div>
        )}
      </div>

      {/* Etkinlik Filtreleri */}
      <div className="events-filters">
        <div className="events-filter-header">
          <div className="events-title">
            <Calendar size={16} />
            <span>Etkinlikler ({getFilteredEvents().length})</span>
          </div>
          <button 
            className="create-event-btn"
            onClick={() => setShowCreateEventModal(true)}
          >
            <Plus size={14} />
            Etkinlik Oluştur
          </button>
        </div>
        
        <div className="event-type-filters">
          <button 
            className={`event-filter-btn ${eventFilter === 'all' ? 'active' : ''}`}
            onClick={() => setEventFilter('all')}
          >
            Tümü
          </button>
          <button 
            className={`event-filter-btn ${eventFilter === 'user' ? 'active' : ''}`}
            onClick={() => setEventFilter('user')}
          >
            <Users size={14} />
            Kullanıcı Etkinlikleri
          </button>
          <button 
            className={`event-filter-btn ${eventFilter === 'venue' ? 'active' : ''}`}
            onClick={() => setEventFilter('venue')}
          >
            <Store size={14} />
            Mekan Etkinlikleri
          </button>
        </div>
      </div>

      <div className="map-content">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapController onBoundsChange={fetchPlacesFromOverpass} />
          
          {/* Kullanıcı konumu */}
          {userLocation && isSharing && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>
                <div className="user-popup">
                  <strong>Siz</strong>
                  <br />
                  Mevcut konumunuz
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Overpass API'den gelen gerçek mekanlar */}
          {showPlaces && filteredPlaces.map(place => {
            const placeIcon = L.divIcon({
              className: 'place-marker',
              html: `
                <div class="place-circle" style="border-color: ${place.color}; ${selectedPOI?.id === place.id ? 'border-width: 4px; transform: scale(1.2);' : ''}">
                  <div class="place-icon" style="background-color: ${place.color}">
                    ${place.category === 'cafe' ? '☕' : 
                      place.category === 'bar' ? '🍷' : 
                      place.category === 'fast_food' ? '🍔' : '🍴'}
                  </div>
                </div>
              `,
              iconSize: [36, 36],
              iconAnchor: [18, 18]
            })
            
            return (
              <Marker 
                key={place.id}
                position={[place.coords.lat, place.coords.lng]}
                icon={placeIcon}
                eventHandlers={{
                  click: () => handlePlaceClick(place)
                }}
              >
                <Popup>
                  <div className="place-popup">
                    <strong>{place.name}</strong>
                    {place.cuisine && <><br /><small>🍽️ {place.cuisine}</small></>}
                    {place.address && <><br /><small>📍 {place.address}</small></>}
                    {place.openingHours && <><br /><small>🕐 {place.openingHours}</small></>}
                  </div>
                </Popup>
              </Marker>
            )
          })}
          
          {/* Diğer kullanıcılar */}
          {filteredUsers.map(user => (
            <Marker 
              key={user.id} 
              position={[user.coords.lat, user.coords.lng]}
            >
              <Popup>
                <div className="user-popup">
                  <strong>{user.displayName}</strong>
                  <br />
                  {user.placeName}
                  <br />
                  <small>{user.activityTag}</small>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Etkinlikler */}
          {getFilteredEvents().map(event => {
            const eventIcon = L.divIcon({
              className: 'event-marker',
              html: `
                <div class="event-circle ${event.creatorType === 'venue' ? 'venue-event' : 'user-event'}">
                  <div class="event-icon">
                    ${event.creatorType === 'venue' ? '🏪' : '📅'}
                  </div>
                </div>
              `,
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            })
            
            return (
              <Marker 
                key={event.id}
                position={[event.coords.lat, event.coords.lng]}
                icon={eventIcon}
                eventHandlers={{
                  click: () => handleEventClick(event)
                }}
              >
                <Popup>
                  <div className="event-popup">
                    <strong>{event.title}</strong>
                    <br />
                    <small>📍 {event.placeName}</small>
                    <br />
                    <small>🕐 {new Date(event.datetime).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</small>
                    <br />
                    <small>{event.creatorType === 'venue' ? '🏪 Mekan Etkinliği' : '👤 Kullanıcı Etkinliği'}</small>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Kullanıcı listesi sheet */}
      {showUserSheet && (
        <div className="user-sheet">
          <div className="sheet-header">
            <h3>
              <MapPin size={20} />
              {selectedRegion} Bölgesi
            </h3>
            <button 
              className="close-sheet"
              onClick={() => setShowUserSheet(false)}
            >
              ×
            </button>
          </div>
          
          <div className="sheet-content">
            {nearbyUsers.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h4>Bu bölgede kimse yok</h4>
                <p>Seçilen zaman aralığında bu bölgede konum paylaşan kullanıcı bulunmuyor.</p>
              </div>
            ) : (
              <div className="users-list">
                {nearbyUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* POI/Mekan Detay Sheet */}
      {showPOISheet && selectedPOI && (
        <div className="poi-sheet">
          <div className="sheet-header">
            <div className="poi-header-info">
              <div className="poi-header-icon" style={{backgroundColor: selectedPOI.color}}>
                {selectedPOI.category === 'cafe' ? '☕' : 
                 selectedPOI.category === 'bar' ? '🍷' : 
                 selectedPOI.category === 'fast_food' ? '🍔' : '🍴'}
              </div>
              <div>
                <h3>{selectedPOI.name}</h3>
                <p className="place-category">
                  {selectedPOI.category === 'cafe' ? 'Kafe' : 
                   selectedPOI.category === 'bar' ? 'Bar' : 
                   selectedPOI.category === 'fast_food' ? 'Fast Food' : 'Restoran'}
                  {selectedPOI.cuisine && ` • ${selectedPOI.cuisine}`}
                </p>
              </div>
            </div>
            <button 
              className="close-sheet"
              onClick={() => setShowPOISheet(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="sheet-content">
            <div className="place-details">
              {selectedPOI.address && (
                <div className="place-detail-item">
                  <MapPin size={16} />
                  <span>{selectedPOI.address}</span>
                </div>
              )}
              
              {selectedPOI.openingHours && (
                <div className="place-detail-item">
                  <Clock size={16} />
                  <span>{selectedPOI.openingHours}</span>
                </div>
              )}
              
              {selectedPOI.phone && (
                <div className="place-detail-item">
                  <a href={`tel:${selectedPOI.phone}`} className="place-link">
                    📞 {selectedPOI.phone}
                  </a>
                </div>
              )}
              
              {selectedPOI.website && (
                <div className="place-detail-item">
                  <a href={selectedPOI.website} target="_blank" rel="noopener noreferrer" className="place-link">
                    🌐 Web sitesini ziyaret et
                  </a>
                </div>
              )}
              
              {selectedPOI.outdoor_seating && (
                <div className="place-detail-item place-feature">
                  🪑 Açık hava oturma alanı
                </div>
              )}
              
              {selectedPOI.wheelchair && (
                <div className="place-detail-item place-feature">
                  ♿ Engelli erişimi: {selectedPOI.wheelchair === 'yes' ? 'Var' : selectedPOI.wheelchair}
                </div>
              )}
              
              {userLocation && (
                <div className="place-detail-item distance-info">
                  📍 {calculateDistance(
                    userLocation.lat, userLocation.lng,
                    selectedPOI.coords.lat, selectedPOI.coords.lng
                  )} uzaklıkta
                </div>
              )}
            </div>
            
            {/* Aksiyon Butonları */}
            <div className="place-primary-actions">
              <button 
                className="create-event-at-place-btn"
                onClick={() => {
                  setShowCreateEventModal(true)
                }}
              >
                <Calendar size={18} />
                Bu Mekanda Etkinlik Düzenle
              </button>
            </div>
            
            <div className="place-actions">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPOI.coords.lat},${selectedPOI.coords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-btn"
              >
                🧭 Yol tarifi al
              </a>
              
              <button 
                className="share-place-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedPOI.name,
                      text: `${selectedPOI.name} - ${selectedPOI.category}`,
                      url: `https://www.openstreetmap.org/?mlat=${selectedPOI.coords.lat}&mlon=${selectedPOI.coords.lng}#map=18/${selectedPOI.coords.lat}/${selectedPOI.coords.lng}`
                    })
                  } else {
                    navigator.clipboard.writeText(`${selectedPOI.name}: https://www.openstreetmap.org/?mlat=${selectedPOI.coords.lat}&mlon=${selectedPOI.coords.lng}`)
                    addNotification({
                      type: 'toast',
                      title: 'Kopyalandı',
                      message: 'Mekan linki panoya kopyalandı'
                    })
                  }
                }}
              >
                <Share size={16} />
                Paylaş
              </button>
            </div>

            {/* Fotoğraf Galerisi */}
            <PhotoGallery 
              entityId={selectedPOI.id}
              entityType="place"
              onSaveToDiary={handleSavePhotoToDiary}
            />
          </div>
        </div>
      )}

      {/* Etkinlik listesi sheet */}
      {showEventSheet && (
        <div className="event-sheet">
          <div className="sheet-header">
            <h3>
              <Calendar size={20} />
              {selectedRegion} - Herkese Açık Etkinlikler
            </h3>
            <button 
              className="close-sheet"
              onClick={() => setShowEventSheet(false)}
            >
              ×
            </button>
          </div>
          
          <div className="sheet-content">
            {nearbyEvents.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} />
                <h4>Bu bölgede etkinlik yok</h4>
                <p>Seçilen bölgede herkese açık etkinlik bulunmuyor.</p>
              </div>
            ) : (
              <div className="events-list">
                {nearbyEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onJoinRequest={handleJoinRequest}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Etkinlik Detay Sheet */}
      {showEventDetailSheet && selectedEvent && (
        <div className="event-detail-sheet">
          <div className="sheet-header">
            <div className="event-header-info">
              <div className={`event-header-icon ${selectedEvent.creatorType === 'venue' ? 'venue' : 'user'}`}>
                {selectedEvent.creatorType === 'venue' ? '🏪' : '📅'}
              </div>
              <div>
                <h3>{selectedEvent.title}</h3>
                <p className="event-type-badge">
                  {selectedEvent.creatorType === 'venue' ? 'Mekan Etkinliği' : 'Kullanıcı Etkinliği'}
                </p>
              </div>
            </div>
            <button 
              className="close-sheet"
              onClick={() => setShowEventDetailSheet(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="sheet-content">
            <div className="event-details">
              <div className="event-detail-item">
                <Clock size={16} />
                <span>
                  {new Date(selectedEvent.datetime).toLocaleString('tr-TR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="event-detail-item">
                <MapPin size={16} />
                <span>{selectedEvent.placeName}</span>
              </div>
              
              {selectedEvent.address && (
                <div className="event-detail-item">
                  <span className="event-address">{selectedEvent.address}</span>
                </div>
              )}
              
              {selectedEvent.description && (
                <div className="event-description-box">
                  <p>{selectedEvent.description}</p>
                </div>
              )}
              
              <div className="event-creator-info">
                {selectedEvent.creatorAvatar ? (
                  <img src={selectedEvent.creatorAvatar} alt={selectedEvent.creatorName} />
                ) : (
                  <div className="creator-placeholder">
                    {selectedEvent.creatorName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <strong>{selectedEvent.creatorName}</strong>
                  <span>Etkinlik Düzenleyicisi</span>
                </div>
              </div>
              
              {selectedEvent.maxParticipants && (
                <div className="event-participants-info">
                  <Users size={16} />
                  <span>
                    {selectedEvent.participants?.length || 0} / {selectedEvent.maxParticipants} Katılımcı
                  </span>
                </div>
              )}
            </div>
            
            {/* Etkinlik Aksiyonları */}
            <div className="event-primary-actions">
              <button 
                className="join-event-btn"
                onClick={() => handleJoinEvent(selectedEvent)}
              >
                <UserPlus size={18} />
                Etkinliğe Katıl
              </button>
            </div>
            
            <div className="event-secondary-actions">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEvent.coords.lat},${selectedEvent.coords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-btn"
              >
                🧭 Yol tarifi al
              </a>
              
              <button 
                className="share-event-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedEvent.title,
                      text: `${selectedEvent.title} - ${selectedEvent.placeName}`,
                      url: window.location.href
                    })
                  } else {
                    navigator.clipboard.writeText(`${selectedEvent.title} - ${selectedEvent.placeName}`)
                    addNotification({
                      type: 'toast',
                      title: 'Kopyalandı',
                      message: 'Etkinlik bilgisi panoya kopyalandı'
                    })
                  }
                }}
              >
                <Share size={16} />
                Paylaş
              </button>
            </div>

            {/* Fotoğraf Galerisi */}
            <PhotoGallery 
              entityId={selectedEvent.id}
              entityType="event"
              onSaveToDiary={handleSavePhotoToDiary}
            />
          </div>
        </div>
      )}

      {/* Etkinlik Oluşturma Modal */}
      <CreateEventModal 
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        place={selectedPOI}
        onEventCreate={handleEventCreate}
      />
    </div>
  )
}

export default Map