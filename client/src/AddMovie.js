import React, { useState, useEffect } from 'react';
import './App.css'; 

// --- AKILLI ŞEHİR LİSTESİ ---
// Kullanıcı yazmakla uğraşmasın, buradan seçsin.
const CITY_DATA = {
  "Türkiye": ["İstanbul", "Ankara", "İzmir", "Eskişehir", "Antalya", "Kars", "Mardin", "Trabzon"],
  "ABD": ["New York", "Los Angeles", "Chicago", "Las Vegas", "San Francisco", "Washington", "Boston"],
  "İngiltere": ["London", "Manchester", "Liverpool", "Oxford", "Edinburgh"],
  "Fransa": ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux"],
  "İtalya": ["Roma", "Venice", "Florence", "Milan", "Naples", "Arezzo", "Sicily"], // Life is Beautiful: Arezzo, Godfather: Sicily
  "Japonya": ["Tokyo", "Kyoto", "Osaka", "Hiroshima"],
  "Almanya": ["Berlin", "Munich", "Hamburg", "Frankfurt"]
};

const AddMovie = ({ onMovieAdded, currentUser }) => {
  const [title, setTitle] = useState('');
  const [movieData, setMovieData] = useState(null);
  
  // Konum Bilgileri
  const [country, setCountry] = useState('Türkiye'); 
  const [city, setCity] = useState(CITY_DATA["Türkiye"][0]); // İlk şehri seçili getir
  const [customCity, setCustomCity] = useState(''); // "Diğer" seçilirse aktif olur
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(''); 

  // Ülke değişince şehir listesini güncelle
  useEffect(() => {
    setCity(CITY_DATA[country][0]);
  }, [country]);

  // --- 1. OMDb API'den Film Çek ---
  const fetchMovieData = async () => {
    if (!title) return alert("Lütfen bir film adı girin!");
    setLoading(true);
    setStatusMsg('Film aranıyor...');
    
    const API_KEY = "fff2b072"; 

    try {
      const response = await fetch(`https://www.omdbapi.com/?t=${title}&apikey=${API_KEY}`);
      const data = await response.json();
      
      if (data.Response === "True") {
        setMovieData(data);
        setStatusMsg('Film bulundu! Şimdi konumu seçin.');
      } else {
        alert("Film bulunamadı! İngilizce ismini denediniz mi?");
        setMovieData(null);
        setStatusMsg('');
      }
    } catch (error) {
      console.error("Hata:", error);
    }
    setLoading(false);
  };

  // --- 2. Koordinat Bul ve Kaydet ---
  const handleSave = async () => {
    const selectedCity = city === "Diğer" ? customCity : city;
    if (!movieData || !selectedCity) return alert("Lütfen şehir seçin!");

    setStatusMsg('Konum kaydediliyor...');

    // A) Koordinatı Bul (Nominatim API)
    // "q" parametresini kullanmak daha esnektir
    let coords = null;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${selectedCity}, ${country}`);
      const data = await response.json();
      if (data && data.length > 0) {
        coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (err) {
      console.error(err);
    }

    if (!coords) {
      alert(`"${selectedCity}" haritada bulunamadı. Lütfen büyük bir şehir seçin.`);
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
      city: selectedCity,
      coordinates: coords, 
      addedBy: currentUser.username 
    };

    // C) Kaydet
    try {
      const response = await fetch('http://localhost:5000/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
      });
      
      if (response.ok) {
        alert(`Film Eklendi! Harita ${selectedCity} konumuna gidiyor... ✈️`);
        onMovieAdded(coords); 
        setMovieData(null); setTitle(''); setStatusMsg('');
      }
    } catch (error) {
      alert("Sunucu hatası!");
    }
  };

  return (
    <div className="add-movie-panel" style={{ padding: '20px', background: '#1a1a1a', marginTop: '20px', borderTop: '2px solid #E50914' }}>
      <h3 style={{ color: '#E50914', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        FİLM EKLE
      </h3>
      
      {/* 1. ADIM: ARAMA */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Film Adı (Örn: Godfather)..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: '10px', background: '#333', border: '1px solid #444', color: 'white' }}
        />
        <button onClick={fetchMovieData} style={{ background: '#E50914', color: 'white', border: 'none', padding: '0 15px', cursor: 'pointer' }}>
          {loading ? '...' : 'ARA'}
        </button>
      </div>

      {statusMsg && <p style={{ fontSize: '12px', color: '#ccc', fontStyle: 'italic' }}>{statusMsg}</p>}

      {/* 2. ADIM: SONUÇ VE KONUM (Sadece film bulununca görünür) */}
      {movieData && (
        <div style={{ background: '#222', padding: '15px', borderRadius: '5px', animation: 'fadeIn 0.5s' }}>
          
          {/* Film Kartı */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', borderBottom: '1px solid #444', paddingBottom: '15px' }}>
            <img src={movieData.Poster} alt="Poster" style={{ width: '60px', height: '90px', objectFit: 'cover' }} />
            <div>
              <strong style={{ color: 'white', display: 'block', fontSize: '1.1rem' }}>{movieData.Title}</strong>
              <small style={{ color: '#ccc' }}>{movieData.Year} • {movieData.Director}</small>
              <div style={{ color: '#f5c518', fontWeight: 'bold', marginTop: '5px' }}>★ {movieData.imdbRating}</div>
            </div>
          </div>

          {/* Konum Seçimi */}
          <div style={{ display: 'grid', gap: '10px' }}>
            <label style={{ color: '#E50914', fontSize: '12px', fontWeight: 'bold' }}>ÇEKİLDİĞİ YERİ SEÇİN:</label>
            
            {/* Ülke Seçimi */}
            <select 
              value={country} 
              onChange={e => setCountry(e.target.value)} 
              style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #444' }}
            >
                {Object.keys(CITY_DATA).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Şehir Seçimi (Otomatik Değişir) */}
            <select 
              value={city} 
              onChange={e => setCity(e.target.value)} 
              style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #444' }}
            >
                {CITY_DATA[country].map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Diğer">Diğer (Listede Yok)</option>
            </select>

            {/* Eğer 'Diğer' seçilirse manuel giriş açılır */}
            {city === "Diğer" && (
              <input 
                type="text" 
                placeholder="Şehir Adını Yazın..." 
                value={customCity} 
                onChange={e => setCustomCity(e.target.value)} 
                style={{ padding: '10px', background: '#444', color: 'white', border: '1px solid #E50914' }} 
              />
            )}

            <button onClick={handleSave} style={{ width: '100%', background: '#28a745', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>
              KAYDET 💾
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMovie;