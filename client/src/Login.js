import React, { useState } from 'react';
import './App.css'; 

const Login = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true); // Giriş mi Kayıt mı?
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sinefil'); // Varsayılan rol
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Hangi adrese gideceğiz? (Login veya Register)
    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: isLoginMode ? undefined : role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu.");
      }

      if (isLoginMode) {
        // GİRİŞ BAŞARILI
        // Token'ı ve Kullanıcı Bilgisini Kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user); // App.js'e haber ver
      } else {
        // KAYIT BAŞARILI -> Giriş ekranına yönlendir
        alert("Kayıt Başarılı! Şimdi giriş yapabilirsiniz. 🎉");
        setIsLoginMode(true);
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 style={{ color: '#E50914', fontSize: '3rem', margin: '0 0 20px 0', fontFamily: 'Bebas Neue, sans-serif' }}>
          CINEMAP
        </h1>
        
        <h2 style={{ color: 'white', marginBottom: '20px' }}>
          {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
        </h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Kullanıcı Adı" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <input 
            type="password" 
            placeholder="Şifre" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Sadece Kayıt Olurken Rol Seç */}
          {!isLoginMode && (
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Sinefil">Sinefil (Veri Ekleyebilir)</option>
              <option value="Ziyaretçi">Ziyaretçi (Sadece İzler)</option>
              {/* Admin rolünü buraya koymuyoruz, onu veritabanından elle atarız güvenlik için */}
            </select>
          )}

          <button type="submit" className="login-btn">
            {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ color: '#737373', marginTop: '20px' }}>
          {isLoginMode ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
          <span 
            style={{ color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setIsLoginMode(!isLoginMode)}
          >
            {isLoginMode ? 'Şimdi Kayıt Ol.' : 'Giriş Yap.'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;