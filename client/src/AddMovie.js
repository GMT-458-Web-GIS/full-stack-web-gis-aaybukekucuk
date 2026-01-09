import React, { useState } from 'react';
import './App.css'; 

const AddMovie = ({ onMovieAdded }) => {
  const [title, setTitle] = useState('');
  const [movieData, setMovieData] = useState(null);
  
  // Konum Bilgileri
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Türkiye'); 
  const [user, setUser] = useState('Elvin (Yönetici)'); 
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(''); 

  // --- 1. OMDb API'den Film Çek ---
  const fetchMovieData = async () => {
    if (!title) return alert("Lütfen bir film adı girin!");
    setLoading(true);
    setStatusMsg('Film aranıyor...');
    
    // API KEY'İNİ UNUTMA (Tırnak içinde!)
    const API_KEY = "fff2b072"; 

    try {
      const response = await fetch(`https://www.omdbapi.com/?t=${title}&apikey=${API_KEY}`);
      const data = await response.json();
      
      if (data.Response === "True") {
        setMovieData(data);
        setStatusMsg('Film bulundu! Şimdi şehri girin.');
      } else {
        alert("Film bulunamadı!");
        setMovieData(null);
        setStatusMsg('');
      }
    } catch (error) {
      console.error("Hata:", error);
    }
    setLoading(false);
  };

  // --- 2. Şehir İsminden Koordinat Bul (Nominatim - Structured Query) ---
  const getCoordinates = async (cityName, countryName) => {
    try {
      // Daha hassas arama için 'structured query' kullanıyoruz
      // city=...&country=... diyerek nokta atışı yapıyoruz.
      const url = `https://nominatim.openstreetmap.org/search?format=json&city=${cityName}&country=${countryName}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Konum hatası:", error);
      return null;
    }
  };

  // --- 3. Veritabanına Kaydet ---
  const handleSave = async () => {
    if (!movieData || !city) return alert("Lütfen şehir ismini girin!");

    setStatusMsg('Konum aranıyor ve kaydediliyor...');

    // A) Koordinatı Bul
    const coords = await getCoordinates(city, country);

    if (!coords) {
      setStatusMsg('Hata: Bu şehir bulunamadı!');
      alert(`"${city}, ${country}" haritada bulunamadı. Yazımı kontrol edin.`);
      return;
    }

    // B) Veriyi Hazırla
    const newMovie = {
      title: movieData.Title,
      director: movieData.Director,
      year: parseInt(movieData.Year),
      genre: movieData.Genre,
      imdb: parseFloat(movieData.imdbRating),
      poster: movieData.Poster,
      country: country,
      city: city,
      coordinates: coords, 
      addedBy: user 
    };

    // C) Sunucuya Gönder
    try {
      const response = await fetch('http://localhost:5000/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
      });
      
      if (response.ok) {
        alert(`Film Eklendi! Harita ${city} konumuna gidiyor... ✈️`);
        
        // ÖNEMLİ: Haritayı oraya odaklamak için koordinatları yukarı (App.js'e) gönderiyoruz
        onMovieAdded(coords); 
        
        // Temizlik
        setMovieData(null); setTitle(''); setCity(''); setStatusMsg('');
      }
    } catch (error) {
      alert("Sunucu hatası!");
    }
  };

  return (
    <div className="add-movie-panel" style={{ padding: '20px', background: '#1a1a1a', marginTop: '20px', borderTop: '2px solid #E50914' }}>
      <h3 style={{ color: '#E50914', marginTop: 0 }}>FİLM EKLE</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', color: '#888', fontSize: '12px' }}>Kullanıcı:</label>
        <select value={user} onChange={(e) => setUser(e.target.value)} style={{ width: '100%', padding: '8px', background: '#333', color: 'white', border: 'none' }}>
          <option value="Elvin (Yönetici)">Elvin (Yönetici)</option>
          <option value="Ahmet (Kullanıcı)">Ahmet (Kullanıcı)</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Film Adı (İngilizce)..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: '10px', background: '#333', border: '1px solid #444', color: 'white' }}
        />
        <button onClick={fetchMovieData} style={{ background: '#E50914', color: 'white', border: 'none', padding: '0 15px', cursor: 'pointer' }}>
          {loading ? '...' : 'ARA'}
        </button>
      </div>

      {statusMsg && <p style={{ fontSize: '12px', color: '#ccc' }}>{statusMsg}</p>}

      {movieData && (
        <div style={{ background: '#222', padding: '10px', borderRadius: '5px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <img src={movieData.Poster} alt="Poster" style={{ width: '50px', height: '75px' }} />
            <div>
              <strong style={{ color: 'white', display: 'block' }}>{movieData.Title}</strong>
              <small style={{ color: '#ccc' }}>{movieData.Year}</small>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            <label style={{ color: '#E50914', fontSize: '12px', fontWeight: 'bold' }}>KONUM (Otomatik Bulunacak):</label>
            
            <input 
              type="text" 
              placeholder="Şehir (Örn: London)" 
              value={city} 
              onChange={e => setCity(e.target.value)} 
              style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #444' }} 
            />
            
            <select value={country} onChange={e => setCountry(e.target.value)} style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #444' }}>
                <option value="Türkiye">Türkiye</option>
                <option value="İngiltere">İngiltere</option>
                <option value="ABD">ABD</option>
                <option value="Fransa">Fransa</option>
                <option value="İtalya">İtalya</option>
                <option value="Japonya">Japonya</option>
                <option value="Almanya">Almanya</option>
            </select>

            <button onClick={handleSave} style={{ width: '100%', background: '#28a745', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              KAYDET VE GİT ✈️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMovie;