import React, { useState } from 'react';
import './App.css'; 

const Login = ({ onLoginSuccess }) => {
  const [step, setStep] = useState('login'); // 'login' | 'register' | 'verify'
  const [username, setUsername] = useState(''); // NEW
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Cinephile'); // Default Role
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 'verify') {
        handleVerify();
        return;
    }

    const endpoint = step === 'login' ? '/api/login' : '/api/register';
    
    // Register ise username gönder, Login ise gönderme
    const payload = step === 'register' 
        ? { username, email, password, role } 
        : { email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (step === 'login') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        alert("Verification code sent to your email!");
        setStep('verify');
      }

    } catch (err) {
        setError(err.message);
    }
  };

  const handleVerify = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        alert("Account Verified! Please Login.");
        setStep('login'); 
      } catch (err) {
          setError(err.message);
      }
  };

  const inputStyle = {width: '100%', padding: '16px', marginBottom: '16px', background: '#333', border: 'none', color: 'white', borderRadius: '4px'};

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 style={{ color: '#E50914', fontSize: '3rem', margin: '0 0 20px 0', fontFamily: 'Bebas Neue, sans-serif' }}>CINEMAP</h1>
        
        <h2 style={{ color: 'white', marginBottom: '20px' }}>
          {step === 'login' && 'Sign In'}
          {step === 'register' && 'Sign Up'}
          {step === 'verify' && 'Verify Email'}
        </h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          {step === 'verify' ? (
              <input type="text" placeholder="6-Digit Code" value={code} onChange={(e) => setCode(e.target.value)} required style={{...inputStyle, border: '1px solid #E50914'}} />
          ) : (
              <>
                {/* Sadece Register adımında Username sor */}
                {step === 'register' && (
                    <input type="text" placeholder="Username (Display Name)" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
                )}

                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                
                {step === 'register' && (
                    <div style={{marginBottom: '16px', textAlign: 'left'}}>
                        <label style={{color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px'}}>User Type:</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                            <option value="Cinephile">Cinephile (Can Add Movies)</option>
                            <option value="Viewer">Viewer (Read Only)</option>
                        </select>
                    </div>
                )}
              </>
          )}

          <button type="submit" className="login-btn">
            {step === 'login' ? 'Sign In' : (step === 'register' ? 'Get Code' : 'Verify')}
          </button>
        </form>

        {step !== 'verify' && (
            <p style={{ color: '#737373', marginTop: '20px' }}>
            {step === 'login' ? 'New to Cinemap? ' : 'Already have an account? '}
            <span style={{ color: 'white', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setStep(step === 'login' ? 'register' : 'login')}>
                {step === 'login' ? 'Sign up now.' : 'Sign in.'}
            </span>
            </p>
        )}
      </div>
    </div>
  );
};

export default Login;