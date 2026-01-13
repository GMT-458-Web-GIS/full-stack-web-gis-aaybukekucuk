import React, { useState } from 'react';
import './App.css'; 
import { useLanguage } from './LanguageContext'; // YENİ

const Login = ({ onLoginSuccess }) => {
  const { t, lang, toggleLang } = useLanguage(); // YENİ
  const [step, setStep] = useState('login'); 
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Cinephile');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 'verify') { handleVerify(); return; }

    const endpoint = step === 'login' ? '/api/login' : '/api/register';
    const payload = step === 'register' ? { username, email, password, role } : { email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (step === 'login') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        alert(lang === 'en' ? "Verification code sent!" : "Doğrulama kodu gönderildi!");
        setStep('verify');
      }
    } catch (err) { setError(err.message); }
  };

  const handleVerify = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        alert(lang === 'en' ? "Account Verified!" : "Hesap Onaylandı!");
        setStep('login'); 
      } catch (err) { setError(err.message); }
  };

  const inputStyle = {width: '100%', padding: '16px', marginBottom: '16px', background: '#333', border: 'none', color: 'white', borderRadius: '4px'};

  return (
    <div className="login-container">
      {/* DİL DEĞİŞTİRME BUTONU (SAĞ ÜST) */}
      <div style={{position: 'absolute', top: 20, right: 20}}>
        <button onClick={toggleLang} style={{background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '20px'}}>
            {lang === 'en' ? '🇹🇷 TR' : '🇺🇸 EN'}
        </button>
      </div>

      <div className="login-box">
        <h1 style={{ color: '#E50914', fontSize: '3rem', margin: '0 0 20px 0', fontFamily: 'Bebas Neue, sans-serif' }}>CINEMAP</h1>
        
        <h2 style={{ color: 'white', marginBottom: '20px' }}>
          {step === 'login' && t.signIn}
          {step === 'register' && t.signUp}
          {step === 'verify' && t.verify}
        </h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 'verify' ? (
              <input type="text" placeholder={t.code} value={code} onChange={(e) => setCode(e.target.value)} required style={{...inputStyle, border: '1px solid #E50914'}} />
          ) : (
              <>
                {step === 'register' && (
                    <input type="text" placeholder={t.username} value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
                )}
                <input type="email" placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                <input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                
                {step === 'register' && (
                    <div style={{marginBottom: '16px', textAlign: 'left'}}>
                        <label style={{color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px'}}>{t.userType}:</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                            <option value="Cinephile">{t.cinephile}</option>
                            <option value="Viewer">{t.viewer}</option>
                        </select>
                    </div>
                )}
              </>
          )}

          <button type="submit" className="login-btn">
            {step === 'login' ? t.signIn : (step === 'register' ? t.getCode : t.verify)}
          </button>
        </form>

        {step !== 'verify' && (
            <p style={{ color: '#737373', marginTop: '20px' }}>
            {step === 'login' ? t.newTo : t.alreadyHave}
            <span style={{ color: 'white', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setStep(step === 'login' ? 'register' : 'login')}>
                {step === 'login' ? t.signUpNow : t.signInLink}
            </span>
            </p>
        )}
      </div>
    </div>
  );
};
export default Login;