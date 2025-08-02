import { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification) => {
    const id = Date.now()
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date()
    }
    setNotifications(prev => [newNotification, ...prev])
    
    // Auto remove after 5 seconds if it's a toast notification
    if (notification.type === 'toast') {
      setTimeout(() => {
        removeNotification(id)
      }, 5000)
    }
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  const addEventStartNotification = (eventTitle, eventId) => {
    addNotification({
      title: 'Etkinlik Başladı! 🎉',
      message: `"${eventTitle}" etkinliği başladı! Fotoğraf paylaşmayı unutma.`,
      type: 'event_start',
      eventId: eventId,
      read: false
    })
  }

  const value = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    addEventStartNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}