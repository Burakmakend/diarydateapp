// Diary Service - CRUD operations and mention parsing

class DiaryService {
  constructor() {
    this.storageKey = 'diary_entries'
    this.userStorageKey = 'diary_users'
  }

  // Get all diary entries from localStorage
  getAllEntries() {
    try {
      const entries = localStorage.getItem(this.storageKey)
      return entries ? JSON.parse(entries) : []
    } catch (error) {
      console.error('Error loading diary entries:', error)
      return []
    }
  }

  // Get entries by user ID
  getEntriesByUser(userId) {
    const allEntries = this.getAllEntries()
    return allEntries.filter(entry => entry.authorId === userId)
  }

  // Get public entries (visible to everyone)
  getPublicEntries() {
    const allEntries = this.getAllEntries()
    return allEntries.filter(entry => entry.visibility === 'PUBLIC')
  }

  // Get entries visible to a specific user
  getVisibleEntries(userId) {
    const allEntries = this.getAllEntries()
    return allEntries.filter(entry => {
      // User can see their own entries (both public and private)
      if (entry.authorId === userId) {
        return true
      }
      // User can see public entries from others
      if (entry.visibility === 'PUBLIC') {
        return true
      }
      // User cannot see private entries from others
      return false
    })
  }

  // Get a single entry by ID
  getEntryById(entryId) {
    const allEntries = this.getAllEntries()
    return allEntries.find(entry => entry.id === entryId)
  }

  // Get recent entries for homepage widget
  getRecentEntries(userId, limit = 3) {
    const userEntries = this.getEntriesByUser(userId)
    return userEntries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }

  // Create a new diary entry
  async createEntry(entryData) {
    try {
      const allEntries = this.getAllEntries()
      
      // Generate unique ID
      const id = this.generateId()
      
      // Parse mentions from content
      const mentions = this.parseMentions(entryData.content)
      
      // Create entry object
      const newEntry = {
        id,
        authorId: entryData.authorId,
        content: entryData.content,
        mentions,
        visibility: entryData.visibility || 'PRIVATE',
        entryDate: entryData.entryDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        comments: 0
      }
      
      // Add to entries array
      allEntries.push(newEntry)
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(allEntries))
      
      // Send notifications for public entries with mentions
      if (newEntry.visibility === 'PUBLIC' && mentions.length > 0) {
        this.sendMentionNotifications(newEntry, mentions)
      }
      
      return { success: true, entry: newEntry }
    } catch (error) {
      console.error('Error creating diary entry:', error)
      return { success: false, error: error.message }
    }
  }

  // Update an existing diary entry
  async updateEntry(entryId, updateData, userId) {
    try {
      const allEntries = this.getAllEntries()
      const entryIndex = allEntries.findIndex(entry => entry.id === entryId)
      
      if (entryIndex === -1) {
        return { success: false, error: 'Entry not found' }
      }
      
      const existingEntry = allEntries[entryIndex]
      
      // Check authorization - only author can update
      if (existingEntry.authorId !== userId) {
        return { success: false, error: 'Unauthorized' }
      }
      
      // Parse mentions from updated content
      const mentions = updateData.content ? this.parseMentions(updateData.content) : existingEntry.mentions
      
      // Update entry
      const updatedEntry = {
        ...existingEntry,
        ...updateData,
        mentions,
        updatedAt: new Date().toISOString()
      }
      
      allEntries[entryIndex] = updatedEntry
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(allEntries))
      
      // Send notifications for public entries with new mentions
      if (updatedEntry.visibility === 'PUBLIC' && mentions.length > 0) {
        this.sendMentionNotifications(updatedEntry, mentions)
      }
      
      return { success: true, entry: updatedEntry }
    } catch (error) {
      console.error('Error updating diary entry:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete a diary entry
  async deleteEntry(entryId, userId) {
    try {
      const allEntries = this.getAllEntries()
      const entryIndex = allEntries.findIndex(entry => entry.id === entryId)
      
      if (entryIndex === -1) {
        return { success: false, error: 'Entry not found' }
      }
      
      const entry = allEntries[entryIndex]
      
      // Check authorization - only author can delete
      if (entry.authorId !== userId) {
        return { success: false, error: 'Unauthorized' }
      }
      
      // Remove entry
      allEntries.splice(entryIndex, 1)
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(allEntries))
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting diary entry:', error)
      return { success: false, error: error.message }
    }
  }

  // Parse mentions from content (@username)
  parseMentions(content) {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g
    const mentions = []
    let match
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1]
      
      // Resolve username to userId (simulated)
      const userId = this.resolveUsernameToId(username)
      
      if (userId && !mentions.find(m => m.username === username)) {
        mentions.push({
          userId,
          username
        })
      }
    }
    
    return mentions
  }

  // Resolve username to user ID (simulated)
  resolveUsernameToId(username) {
    // Simulated user database
    const users = {
      'ahmet': '2',
      'ayse': '3',
      'mehmet': '4',
      'fatma': '5',
      'ali': '6',
      'zeynep': '7',
      'emre': '8',
      'selin': '9'
    }
    
    return users[username.toLowerCase()] || null
  }

  // Send notifications for mentions in public entries
  sendMentionNotifications(entry, mentions) {
    // Simulated notification system
    mentions.forEach(mention => {
      console.log(`Notification sent to user ${mention.userId} (${mention.username}) for diary entry ${entry.id}`)
      
      // In a real app, this would send push notifications, emails, etc.
      // For now, we'll just log to console
    })
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Search entries by content or author
  searchEntries(query, userId) {
    const visibleEntries = this.getVisibleEntries(userId)
    const lowercaseQuery = query.toLowerCase()
    
    return visibleEntries.filter(entry => {
      return (
        entry.content.toLowerCase().includes(lowercaseQuery) ||
        entry.authorName?.toLowerCase().includes(lowercaseQuery) ||
        entry.mentions.some(mention => 
          mention.username.toLowerCase().includes(lowercaseQuery)
        )
      )
    })
  }

  // Get entries by date range
  getEntriesByDateRange(startDate, endDate, userId) {
    const visibleEntries = this.getVisibleEntries(userId)
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return visibleEntries.filter(entry => {
      const entryDate = new Date(entry.entryDate)
      return entryDate >= start && entryDate <= end
    })
  }

  // Get statistics for user
  getUserStats(userId) {
    const userEntries = this.getEntriesByUser(userId)
    const publicEntries = userEntries.filter(entry => entry.visibility === 'PUBLIC')
    const privateEntries = userEntries.filter(entry => entry.visibility === 'PRIVATE')
    
    const totalLikes = userEntries.reduce((sum, entry) => sum + (entry.likes || 0), 0)
    const totalComments = userEntries.reduce((sum, entry) => sum + (entry.comments || 0), 0)
    const totalMentions = userEntries.reduce((sum, entry) => sum + entry.mentions.length, 0)
    
    return {
      totalEntries: userEntries.length,
      publicEntries: publicEntries.length,
      privateEntries: privateEntries.length,
      totalLikes,
      totalComments,
      totalMentions,
      firstEntry: userEntries.length > 0 ? 
        userEntries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0].createdAt : null,
      lastEntry: userEntries.length > 0 ? 
        userEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : null
    }
  }

  // Initialize with sample data (for development)
  initializeSampleData() {
    const existingEntries = this.getAllEntries()
    
    if (existingEntries.length === 0) {
      const sampleEntries = [
        {
          id: 'sample1',
          authorId: '1',
          content: 'Sevgili günlük, bugün harika bir gün geçirdim. Arkadaşlarımla @ahmet ve @ayse ile kahve içtik ve yeni projeler hakkında konuştuk.',
          mentions: [
            { userId: '2', username: 'ahmet' },
            { userId: '3', username: 'ayse' }
          ],
          visibility: 'PUBLIC',
          entryDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 5,
          comments: 2
        },
        {
          id: 'sample2',
          authorId: '1',
          content: 'Sevgili günlük, dün akşam sinema da gittik. Film gerçekten çok güzeldi, herkese tavsiye ederim.',
          mentions: [],
          visibility: 'PRIVATE',
          entryDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          likes: 0,
          comments: 0
        }
      ]
      
      localStorage.setItem(this.storageKey, JSON.stringify(sampleEntries))
    }
  }
}

// Create and export singleton instance
const diaryService = new DiaryService()
export default diaryService