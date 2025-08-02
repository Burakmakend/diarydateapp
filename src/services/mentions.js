// Mentions Service - User search and mention functionality

class MentionsService {
  constructor() {
    this.userStorageKey = 'app_users'
    this.initializeSampleUsers()
  }

  // Get all users from localStorage
  getAllUsers() {
    try {
      const users = localStorage.getItem(this.userStorageKey)
      return users ? JSON.parse(users) : []
    } catch (error) {
      console.error('Error loading users:', error)
      return []
    }
  }

  // Search users by username or display name
  async searchUsers(query, limit = 10) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const allUsers = this.getAllUsers()
      const lowercaseQuery = query.toLowerCase().trim()
      
      if (!lowercaseQuery) {
        return []
      }
      
      const filteredUsers = allUsers.filter(user => {
        return (
          user.username.toLowerCase().includes(lowercaseQuery) ||
          user.displayName.toLowerCase().includes(lowercaseQuery) ||
          user.email?.toLowerCase().includes(lowercaseQuery)
        )
      })
      
      // Sort by relevance (exact matches first, then starts with, then contains)
      const sortedUsers = filteredUsers.sort((a, b) => {
        const aUsername = a.username.toLowerCase()
        const bUsername = b.username.toLowerCase()
        const aDisplayName = a.displayName.toLowerCase()
        const bDisplayName = b.displayName.toLowerCase()
        
        // Exact username match gets highest priority
        if (aUsername === lowercaseQuery) return -1
        if (bUsername === lowercaseQuery) return 1
        
        // Username starts with query
        if (aUsername.startsWith(lowercaseQuery) && !bUsername.startsWith(lowercaseQuery)) return -1
        if (bUsername.startsWith(lowercaseQuery) && !aUsername.startsWith(lowercaseQuery)) return 1
        
        // Display name starts with query
        if (aDisplayName.startsWith(lowercaseQuery) && !bDisplayName.startsWith(lowercaseQuery)) return -1
        if (bDisplayName.startsWith(lowercaseQuery) && !aDisplayName.startsWith(lowercaseQuery)) return 1
        
        // Alphabetical order
        return aUsername.localeCompare(bUsername)
      })
      
      return sortedUsers.slice(0, limit)
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  // Get user by username
  getUserByUsername(username) {
    const allUsers = this.getAllUsers()
    return allUsers.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    )
  }

  // Get user by ID
  getUserById(userId) {
    const allUsers = this.getAllUsers()
    return allUsers.find(user => user.id === userId)
  }

  // Get multiple users by IDs
  getUsersByIds(userIds) {
    const allUsers = this.getAllUsers()
    return allUsers.filter(user => userIds.includes(user.id))
  }

  // Validate mention (check if user exists)
  validateMention(username) {
    const user = this.getUserByUsername(username)
    return user ? {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar
      }
    } : {
      valid: false,
      user: null
    }
  }

  // Parse and validate mentions from text
  parseAndValidateMentions(text) {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g
    const mentions = []
    const invalidMentions = []
    let match
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1]
      const validation = this.validateMention(username)
      
      if (validation.valid) {
        // Avoid duplicates
        if (!mentions.find(m => m.username === username)) {
          mentions.push({
            userId: validation.user.id,
            username: validation.user.username,
            displayName: validation.user.displayName,
            position: match.index,
            length: match[0].length
          })
        }
      } else {
        invalidMentions.push({
          username,
          position: match.index,
          length: match[0].length
        })
      }
    }
    
    return {
      validMentions: mentions,
      invalidMentions,
      totalMentions: mentions.length + invalidMentions.length
    }
  }

  // Get recent mentions for a user (users who mentioned them)
  getRecentMentions(userId, limit = 10) {
    // This would typically query a mentions table/collection
    // For now, we'll return empty array as this requires diary entries integration
    return []
  }

  // Get users frequently mentioned by a user
  getFrequentlyMentioned(userId, limit = 5) {
    // This would analyze mention patterns
    // For now, return sample data
    const allUsers = this.getAllUsers()
    return allUsers.slice(0, limit)
  }

  // Add a new user (for registration)
  addUser(userData) {
    try {
      const allUsers = this.getAllUsers()
      
      // Check if username already exists
      const existingUser = allUsers.find(user => 
        user.username.toLowerCase() === userData.username.toLowerCase()
      )
      
      if (existingUser) {
        return { success: false, error: 'Username already exists' }
      }
      
      const newUser = {
        id: this.generateId(),
        username: userData.username,
        displayName: userData.displayName || userData.username,
        email: userData.email,
        avatar: userData.avatar || null,
        createdAt: new Date().toISOString(),
        isActive: true
      }
      
      allUsers.push(newUser)
      localStorage.setItem(this.userStorageKey, JSON.stringify(allUsers))
      
      return { success: true, user: newUser }
    } catch (error) {
      console.error('Error adding user:', error)
      return { success: false, error: error.message }
    }
  }

  // Update user information
  updateUser(userId, updateData) {
    try {
      const allUsers = this.getAllUsers()
      const userIndex = allUsers.findIndex(user => user.id === userId)
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' }
      }
      
      // Check username uniqueness if updating username
      if (updateData.username) {
        const existingUser = allUsers.find(user => 
          user.id !== userId && 
          user.username.toLowerCase() === updateData.username.toLowerCase()
        )
        
        if (existingUser) {
          return { success: false, error: 'Username already exists' }
        }
      }
      
      const updatedUser = {
        ...allUsers[userIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      }
      
      allUsers[userIndex] = updatedUser
      localStorage.setItem(this.userStorageKey, JSON.stringify(allUsers))
      
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message }
    }
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Initialize sample users for development
  initializeSampleUsers() {
    const existingUsers = this.getAllUsers()
    
    if (existingUsers.length === 0) {
      const sampleUsers = [
        {
          id: '1',
          username: 'currentuser',
          displayName: 'Mevcut Kullanıcı',
          email: 'user@example.com',
          avatar: null,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '2',
          username: 'ahmet',
          displayName: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          avatar: null,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '3',
          username: 'ayse',
          displayName: 'Ayşe Demir',
          email: 'ayse@example.com',
          avatar: null,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '4',
          username: 'mehmet',
          displayName: 'Mehmet Kaya',
          email: 'mehmet@example.com',
          avatar: null,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '5',
          username: 'fatma',
          displayName: 'Fatma Özkan',
          email: 'fatma@example.com',
          avatar: null,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '6',
          username: 'ali',
          displayName: 'Ali Veli',
          email: 'ali@example.com',
          avatar: null,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '7',
          username: 'zeynep',
          displayName: 'Zeynep Çelik',
          email: 'zeynep@example.com',
          avatar: null,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '8',
          username: 'emre',
          displayName: 'Emre Yıldız',
          email: 'emre@example.com',
          avatar: null,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '9',
          username: 'selin',
          displayName: 'Selin Akar',
          email: 'selin@example.com',
          avatar: null,
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ]
      
      localStorage.setItem(this.userStorageKey, JSON.stringify(sampleUsers))
    }
  }

  // Get mention suggestions based on context
  getMentionSuggestions(query, context = {}) {
    // Context could include:
    // - recentlyMentioned: users recently mentioned by current user
    // - friends: user's friends list
    // - collaborators: users in same projects/groups
    
    return this.searchUsers(query, 8)
  }

  // Format mention for display
  formatMention(user, includeDisplayName = false) {
    if (includeDisplayName && user.displayName !== user.username) {
      return `@${user.username} (${user.displayName})`
    }
    return `@${user.username}`
  }

  // Get mention statistics
  getMentionStats(userId) {
    // This would analyze mention patterns
    return {
      totalMentionsGiven: 0,
      totalMentionsReceived: 0,
      mostMentionedUsers: [],
      mostMentionedBy: [],
      mentionTrends: []
    }
  }
}

// Create and export singleton instance
const mentionsService = new MentionsService()
export default mentionsService