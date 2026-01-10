import React, { useState } from 'react';
import './App.css'; 

const Login = ({ onLoginSuccess }) => {
  const [step, setStep] = useState('login'); // 'login' | 'register' | 'verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sinefil');
  const [code, setCode] = useState(''); // Girilen doğrulama kodu
  const [error, setError] = useState('');

  // Kayıt / Giriş İsteği
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 'verify') {
        handleVerify(); // Eğer doğrulama adımındaysak buraya git
        return;
    }

    const endpoint = step === 'login' ? '/api/login' : '/api/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: step === 'register' ? role : undefined })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (step === 'login') {
        // GİRİŞ BAŞARILI
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        // KAYIT BAŞARILI -> DOĞRULAMAYA GEÇ
        alert("Onay kodu mailinize gönderildi! Lütfen kodu girin.");
        setStep('verify');
      }

    } catch (err) {
        setError(err.message);
    }
  };

  // Doğrulama Kodu Gönder
  const handleVerify = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        alert("Hesap Onaylandı! Şimdi giriş yapabilirsiniz.");
        setStep('login'); // Giriş ekranına dön
      } catch (err) {
          setError(err.message);
      }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 style={{ color: '#E50914', fontSize: '3rem', margin: '0 0 20px 0', fontFamily: 'Bebas Neue, sans-serif' }}>CINEMAP</h1>
        
        {/* BAŞLIK DEĞİŞİR */}
        <h2 style={{ color: 'white', marginBottom: '20px' }}>
          {step === 'login' && 'Giriş Yap'}
          {step === 'register' && 'Kayıt Ol'}
          {step === 'verify' && 'Kodu Gir'}
        </h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* VERIFY ADIMINDA SADECE KOD SOR */}
          {step === 'verify' ? (
              <input 
                type="text" 
                placeholder="6 Haneli Kod" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                style={{width: '100%', padding: '16px', marginBottom: '16px', background: '#333', border: '1px solid #E50914', color: 'white'}}
              />
          ) : (
              // DİĞER ADIMLARDA EMAIL/ŞİFRE SOR
              <>
                <input 
                    type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    style={{width: '100%', padding: '16px', marginBottom: '16px', background: '#333', border: 'none', color: 'white'}}
                />
                <input 
                    type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required
                    style={{width: '100%', padding: '16px', marginBottom: '16px', background: '#333', border: 'none', color: 'white'}}
                />
                {step === 'register' && (
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={{width: '100%', padding: '16px', marginBottom: '16px', background: '#333', border: 'none', color: 'white'}}>
                    <option value="Sinefil">Sinefil</option>
                    <option value="Ziyaretçi">Ziyaretçi</option>
                    </select>
                )}
              </>
          )}

          <button type="submit" className="login-btn">
            {step === 'login' ? 'Giriş Yap' : (step === 'register' ? 'Kod Gönder' : 'Onayla')}
          </button>
        </form>

        {step !== 'verify' && (
            <p style={{ color: '#737373', marginTop: '20px' }}>
            {step === 'login' ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
            <span style={{ color: 'white', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setStep(step === 'login' ? 'register' : 'login')}>
                {step === 'login' ? 'Şimdi Kayıt Ol.' : 'Giriş Yap.'}
            </span>
            </p>
        )}
      </div>
    </div>
  );
};

export default Login;