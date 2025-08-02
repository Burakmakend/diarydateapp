import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Settings, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Users,
  Activity,
  UserX,
  Unlock
} from 'lucide-react'
import './Profile.css'

const Profile = () => {
  const { user, updateUser, blockedUsers, unblockUser } = useAuth()
  const { addNotification } = useNotification()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    birthDate: '',
    avatar: user?.avatar || ''
  })
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showBirthDate: false,
    allowFriendRequests: true,
    showOnlineStatus: true,
    allowEventInvitations: true
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    friendRequests: true,
    eventInvitations: true,
    eventReminders: true,
    weeklyDigest: false
  })
  const [stats, setStats] = useState({
    totalEvents: 0,
    friendsCount: 0,
    eventsAttended: 0,
    eventsOrganized: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    // Simulated user stats
    setStats({
      totalEvents: 12,
      friendsCount: 8,
      eventsAttended: 7,
      eventsOrganized: 5
    })

    // Simulated recent activity
    setRecentActivity([
      {
        id: 1,
        type: 'event_created',
        title: 'Kitap Kulübü Toplantısı etkinliği oluşturuldu',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        type: 'event_joined',
        title: 'Hafta Sonu Yürüyüşü etkinliğine katıldı',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        type: 'friend_added',
        title: 'Ayşe Demir ile arkadaş oldu',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ])
  }, [])

  const handleSaveProfile = () => {
    updateUser({
      ...user,
      name: profileData.name,
      email: profileData.email,
      avatar: profileData.avatar
    })
    
    addNotification({
      type: 'toast',
      title: 'Profil güncellendi',
      message: 'Profil bilgileriniz başarıyla güncellendi'
    })
    
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      bio: '',
      birthDate: '',
      avatar: user?.avatar || ''
    })
    setIsEditing(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: 'toast',
          title: 'Dosya çok büyük',
          message: 'Lütfen 5MB\'dan küçük bir dosya seçin'
        })
        return
      }
      
      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'toast',
          title: 'Geçersiz dosya tipi',
          message: 'Lütfen bir resim dosyası seçin'
        })
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target.result })
        addNotification({
          type: 'toast',
          title: 'Profil fotoğrafı güncellendi',
          message: 'Değişiklikleri kaydetmeyi unutmayın'
        })
      }
      reader.onerror = () => {
        addNotification({
          type: 'toast',
          title: 'Hata',
          message: 'Dosya yüklenirken bir hata oluştu'
        })
      }
      reader.readAsDataURL(file)
    }
  }
  
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
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#grad)"/>
        <text x="60" y="75" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings({ ...privacySettings, [setting]: value })
    addNotification({
      type: 'toast',
      title: 'Gizlilik ayarı güncellendi',
      message: 'Gizlilik ayarlarınız kaydedildi'
    })
  }

  const handleNotificationChange = (setting, value) => {
    setNotificationSettings({ ...notificationSettings, [setting]: value })
    addNotification({
      type: 'toast',
      title: 'Bildirim ayarı güncellendi',
      message: 'Bildirim tercihleriniz kaydedildi'
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'event_created':
        return <Calendar size={16} />
      case 'event_joined':
        return <Users size={16} />
      case 'friend_added':
        return <User size={16} />
      default:
        return <Activity size={16} />
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-container">
            <img 
              src={profileData.avatar || getDefaultAvatar(profileData.name)} 
              alt={profileData.name || 'Kullanıcı'}
              className="profile-avatar"
              onError={(e) => {
                e.target.src = getDefaultAvatar(profileData.name)
              }}
            />
            {isEditing && (
              <label className="avatar-upload" title="Profil fotoğrafı değiştir">
                <Camera size={20} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                  hidden
                />
              </label>
            )}
          </div>
          
          <div className="profile-info">
            <h1>{profileData.name}</h1>
            <p className="profile-email">{profileData.email}</p>
            {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}
          </div>
        </div>
        
        <div className="profile-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSaveProfile}>
                <Save size={20} />
                Kaydet
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit}>
                <X size={20} />
                İptal
              </button>
            </div>
          ) : (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <Edit3 size={20} />
              Düzenle
            </button>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalEvents}</div>
          <div className="stat-label">Toplam Etkinlik</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.friendsCount}</div>
          <div className="stat-label">Arkadaş</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.eventsAttended}</div>
          <div className="stat-label">Katıldığı Etkinlik</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.eventsOrganized}</div>
          <div className="stat-label">Düzenlediği Etkinlik</div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          Profil Bilgileri
        </button>
        <button 
          className={activeTab === 'privacy' ? 'active' : ''}
          onClick={() => setActiveTab('privacy')}
        >
          <Shield size={20} />
          Gizlilik
        </button>
        <button 
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={20} />
          Bildirimler
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''}
          onClick={() => setActiveTab('activity')}
        >
          <Activity size={20} />
          Aktivite
        </button>
        <button 
          className={activeTab === 'blocked' ? 'active' : ''}
          onClick={() => setActiveTab('blocked')}
        >
          <UserX size={20} />
          Engellenenler ({blockedUsers.length})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-form">
            <div className="form-section">
              <h3>Kişisel Bilgiler</h3>
              
              <div className="form-group">
                <label>Ad Soyad</label>
                <div className="input-with-icon">
                  <User size={20} />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>E-posta</label>
                <div className="input-with-icon">
                  <Mail size={20} />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Telefon</label>
                <div className="input-with-icon">
                  <Phone size={20} />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Telefon numaranız"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Konum</label>
                <div className="input-with-icon">
                  <MapPin size={20} />
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Şehir, ülke"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Doğum Tarihi</label>
                <div className="input-with-icon">
                  <Calendar size={20} />
                  <input
                    type="date"
                    value={profileData.birthDate}
                    onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Hakkımda</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="privacy-settings">
            <div className="settings-section">
              <h3>Profil Gizliliği</h3>
              <p>Hangi bilgilerinizin diğer kullanıcılar tarafından görülebileceğini seçin.</p>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">E-posta Adresi</div>
                  <div className="setting-description">E-posta adresinizi arkadaşlarınıza göster</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.showEmail}
                    onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Telefon Numarası</div>
                  <div className="setting-description">Telefon numaranızı arkadaşlarınıza göster</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.showPhone}
                    onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Konum</div>
                  <div className="setting-description">Konumunuzu arkadaşlarınıza göster</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.showLocation}
                    onChange={(e) => handlePrivacyChange('showLocation', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Doğum Tarihi</div>
                  <div className="setting-description">Doğum tarihinizi arkadaşlarınıza göster</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.showBirthDate}
                    onChange={(e) => handlePrivacyChange('showBirthDate', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Sosyal Ayarlar</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Arkadaşlık İstekleri</div>
                  <div className="setting-description">Diğer kullanıcıların size arkadaşlık isteği göndermesine izin ver</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowFriendRequests}
                    onChange={(e) => handlePrivacyChange('allowFriendRequests', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Çevrimiçi Durum</div>
                  <div className="setting-description">Çevrimiçi olduğunuzda durumunuzu arkadaşlarınıza göster</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.showOnlineStatus}
                    onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Etkinlik Davetleri</div>
                  <div className="setting-description">Arkadaşlarınızın size etkinlik daveti göndermesine izin ver</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowEventInvitations}
                    onChange={(e) => handlePrivacyChange('allowEventInvitations', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notification-settings">
            <div className="settings-section">
              <h3>Bildirim Tercihleri</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">E-posta Bildirimleri</div>
                  <div className="setting-description">Önemli güncellemeler için e-posta bildirimleri al</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Push Bildirimleri</div>
                  <div className="setting-description">Anlık bildirimler al</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Arkadaşlık İstekleri</div>
                  <div className="setting-description">Yeni arkadaşlık istekleri için bildirim al</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.friendRequests}
                    onChange={(e) => handleNotificationChange('friendRequests', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Etkinlik Davetleri</div>
                  <div className="setting-description">Etkinlik davetleri için bildirim al</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.eventInvitations}
                    onChange={(e) => handleNotificationChange('eventInvitations', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Etkinlik Hatırlatıcıları</div>
                  <div className="setting-description">Yaklaşan etkinlikler için hatırlatıcı al</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.eventReminders}
                    onChange={(e) => handleNotificationChange('eventReminders', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Haftalık Özet</div>
                  <div className="setting-description">Haftalık aktivite özeti al</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.weeklyDigest}
                    onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blocked' && (
          <div className="blocked-users-section">
            <h3>Engellenen Kullanıcılar</h3>
            <p className="section-description">
              Engellediğiniz kullanıcılar sizi göremez ve sizinle etkileşime geçemez.
            </p>
            
            {blockedUsers.length === 0 ? (
              <div className="no-blocked-users">
                <UserX size={64} />
                <h4>Henüz kimseyi engellemediniz</h4>
                <p>Engellediğiniz kullanıcılar burada görünecek</p>
              </div>
            ) : (
              <div className="blocked-users-list">
                {blockedUsers.map(userId => {
                  // Simülasyon için mock kullanıcı verisi
                  const mockUser = {
                    id: userId,
                    name: `Kullanıcı ${userId}`,
                    email: `user${userId}@example.com`,
                    avatar: `https://via.placeholder.com/150/FF6B6B/white?text=U${userId}`
                  }
                  
                  return (
                    <div key={userId} className="blocked-user-item">
                      <div className="blocked-user-info">
                        <img 
                          src={mockUser.avatar} 
                          alt={mockUser.name}
                          className="blocked-user-avatar"
                        />
                        <div className="blocked-user-details">
                          <h4>{mockUser.name}</h4>
                          <p>{mockUser.email}</p>
                        </div>
                      </div>
                      <button 
                        className="unblock-btn"
                        onClick={() => {
                          if (window.confirm(`${mockUser.name} kullanıcısının engelini kaldırmak istediğinizden emin misiniz?`)) {
                            unblockUser(userId)
                            addNotification({
                              type: 'toast',
                              title: 'Engel Kaldırıldı',
                              message: `${mockUser.name} kullanıcısının engeli kaldırıldı`
                            })
                          }
                        }}
                        title="Engeli kaldır"
                      >
                        <Unlock size={16} />
                        Engeli Kaldır
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-section">
            <h3>Son Aktiviteler</h3>
            
            {recentActivity.length === 0 ? (
              <div className="no-activity">
                <Activity size={64} />
                <h4>Henüz aktivite yok</h4>
                <p>Etkinliklere katılın ve arkadaş ekleyin</p>
              </div>
            ) : (
              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-date">
                        {format(activity.date, 'dd MMMM yyyy, HH:mm', { locale: tr })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile