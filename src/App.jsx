import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Navbar from './components/Navbar'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import Calendar from './pages/Calendar'
import Friends from './pages/Friends'
import Events from './pages/Events'
import Map from './pages/Map'
import Activity from './pages/Activity'
import DiaryEditor from './pages/DiaryEditor'
import DiaryFeed from './pages/DiaryFeed'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/events" element={<Events />} />
                <Route path="/map" element={<Map />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/diary/new" element={<DiaryEditor />} />
                <Route path="/diary/edit/:id" element={<DiaryEditor />} />
                <Route path="/diary/feed" element={<DiaryFeed />} />
                <Route path="/diary/:id" element={<DiaryFeed />} />
              </Routes>
            </main>
            <PWAInstallPrompt />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
