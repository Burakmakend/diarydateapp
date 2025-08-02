import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    try {
      await register(formData.name, formData.email, formData.password)
      navigate('/')
    } catch (err) {
      setError('Kayıt olurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Kayıt Ol</h1>
          <p>Yeni hesap oluşturun</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Ad Soyad</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınızı ve soyadınızı girin"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-posta adresinizi girin"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifrenizi girin (en az 6 karakter)"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Şifrenizi tekrar girin"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Zaten hesabınız var mı? 
            <Link to="/login" className="auth-link">
              Giriş yapın
            </Link>
          </p>
        </div>

        <div className="demo-info">
          <h3>Hızlı Kayıt</h3>
          <p>Test için örnek bilgilerle hızlıca kayıt olabilirsiniz.</p>
          <button 
            type="button"
            className="demo-button"
            onClick={() => {
              setFormData({
                name: 'Test Kullanıcı',
                email: 'test@example.com',
                password: 'test123',
                confirmPassword: 'test123'
              })
            }}
          >
            Örnek Bilgileri Doldur
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register