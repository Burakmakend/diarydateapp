import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Navigation, Coffee, Utensils, ShoppingBag } from 'lucide-react'
import './LocationPicker.css'

const LocationPicker = ({ value, locationData, onLocationSelect, placeholder = "Konum seçin..." }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const searchRef = useRef(null)
  const timeoutRef = useRef(null)

  // Popüler POI kategorileri
  const quickFilters = [
    { icon: Coffee, label: 'En Yakın Starbucks', query: 'Starbucks' },
    { icon: Utensils, label: 'Restoran', query: 'restoran' },
    { icon: Coffee, label: 'Kafe', query: 'kafe' },
    { icon: ShoppingBag, label: 'AVM', query: 'alışveriş merkezi' }
  ]

  // Kullanıcının mevcut konumunu al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Konum alınamadı:', error)
        }
      )
    }
  }, [])

  // Mock API çağrısı (gerçek uygulamada Google Places API kullanılacak)
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    
    // Kapsamlı simülasyon veriler
    const allLocations = [
      // Starbucks lokasyonları
      {
        id: 'sb1',
        name: 'Starbucks Kadıköy',
        address: 'Bağdat Caddesi, Kadıköy, İstanbul',
        type: 'establishment',
        coords: { lat: 40.9833, lng: 29.0167 }
      },
      {
        id: 'sb2',
        name: 'Starbucks Taksim',
        address: 'İstiklal Caddesi, Beyoğlu, İstanbul',
        type: 'establishment',
        coords: { lat: 41.0082, lng: 28.9784 }
      },
      {
        id: 'sb3',
        name: 'Starbucks Beşiktaş',
        address: 'Barbaros Bulvarı, Beşiktaş, İstanbul',
        type: 'establishment',
        coords: { lat: 41.0422, lng: 29.0094 }
      },
      {
        id: 'sb4',
        name: 'Starbucks Levent',
        address: 'Büyükdere Caddesi, Şişli, İstanbul',
        type: 'establishment',
        coords: { lat: 41.0766, lng: 29.0142 }
      },
      // Diğer kafeler
      {
        id: 'cf1',
        name: 'Kahve Dünyası Kadıköy',
        address: 'Moda Caddesi, Kadıköy, İstanbul',
        type: 'establishment',
        coords: { lat: 40.9833, lng: 29.0167 }
      },
      {
        id: 'cf2',
        name: 'Gloria Jeans Kadıköy',
        address: 'Söğütlüçeşme Caddesi, Kadıköy, İstanbul',
        type: 'establishment',
        coords: { lat: 40.9833, lng: 29.0167 }
      },
      // Restoranlar
      {
        id: 'rs1',
        name: 'McDonald\'s Kadıköy',
        address: 'Bağdat Caddesi, Kadıköy, İstanbul',
        type: 'establishment',
        coords: { lat: 40.9833, lng: 29.0167 }
      },
      {
        id: 'rs2',
        name: 'Burger King Taksim',
        address: 'Taksim Meydanı, Beyoğlu, İstanbul',
        type: 'establishment',
        coords: { lat: 41.0082, lng: 28.9784 }
      },
      // Genel lokasyonlar
      {
        id: 'loc1',
        name: 'Kadıköy Merkez',
        address: 'Kadıköy, İstanbul',
        type: 'locality',
        coords: { lat: 40.9833, lng: 29.0167 }
      },
      {
        id: 'loc2',
        name: 'Taksim Meydanı',
        address: 'Beyoğlu, İstanbul',
        type: 'locality',
        coords: { lat: 41.0082, lng: 28.9784 }
      },
      {
        id: 'loc3',
        name: 'Beşiktaş İskelesi',
        address: 'Beşiktaş, İstanbul',
        type: 'locality',
        coords: { lat: 41.0422, lng: 29.0094 }
      }
    ]

    // Arama sorgusuna göre filtrele
    const filtered = allLocations.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.address.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8) // En fazla 8 sonuç göster

    setTimeout(() => {
      setSuggestions(filtered)
      setLoading(false)
    }, 200)
  }

  // Arama inputu değiştiğinde
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)
  }

  // Konum seçildiğinde
  const handleLocationSelect = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location.name, location)
    }
    setSearchQuery(location.name)
    setIsOpen(false)
    setSuggestions([])
  }

  // Hızlı filtre seçildiğinde
  const handleQuickFilter = (filter) => {
    setSearchQuery(filter.query)
    fetchSuggestions(filter.query)
  }

  // Mevcut konumu kullan
  const handleUseCurrentLocation = () => {
    if (userLocation) {
      const currentLocationData = {
        id: 'current',
        name: 'Mevcut Konum',
        address: 'Şu anki konumunuz',
        type: 'current',
        coords: userLocation
      }
      handleLocationSelect(currentLocationData)
    }
  }

  return (
    <div className="location-picker">
      <div className="location-input-wrapper">
        <MapPin className="location-icon" size={20} />
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="location-input"
        />
        {userLocation && (
          <button
            type="button"
            className="current-location-btn"
            onClick={handleUseCurrentLocation}
            title="Mevcut konumu kullan"
          >
            <Navigation size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="location-dropdown">
          {/* Hızlı Filtreler */}
          <div className="quick-filters">
            <div className="filter-label">Hızlı Arama:</div>
            <div className="filter-chips">
              {quickFilters.map((filter, index) => {
                const IconComponent = filter.icon
                return (
                  <button
                    key={index}
                    type="button"
                    className="filter-chip"
                    onClick={() => handleQuickFilter(filter)}
                  >
                    <IconComponent size={14} />
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Arama Sonuçları */}
          <div className="suggestions-list">
            {loading && (
              <div className="suggestion-item loading">
                <Search size={16} />
                Aranıyor...
              </div>
            )}
            
            {!loading && suggestions.length === 0 && searchQuery && (
              <div className="suggestion-item no-results">
                <Search size={16} />
                Sonuç bulunamadı
              </div>
            )}
            
            {!loading && suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className="suggestion-item"
                onClick={() => handleLocationSelect(suggestion)}
              >
                <MapPin size={16} />
                <div className="suggestion-content">
                  <div className="suggestion-name">{suggestion.name}</div>
                  <div className="suggestion-address">{suggestion.address}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seçili konum önizlemesi */}
      {value && (
        <div className="selected-location">
          <MapPin size={16} />
          <div className="selected-content">
            <div className="selected-name">{value.name}</div>
            <div className="selected-address">{value.address}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationPicker