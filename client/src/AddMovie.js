import React, { useState, useEffect } from 'react';
import './App.css'; 

const AddMovie = ({ onMovieAdded, currentUser }) => {
  const [title, setTitle] = useState('');
  const [movieData, setMovieData] = useState(null);
  
  // --- DİNAMİK LOKASYON VERİLERİ ---
  const [allLocations, setAllLocations] = useState([]); // Tüm dünya datası burada
  const [countries, setCountries] = useState([]); // Sadece ülke isimleri
  const [cities, setCities] = useState([]);       // Seçilen ülkenin şehirleri
  
  const [selectedCountry, setSelectedCountry] = useState(''); 
  const [selectedCity, setSelectedCity] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(''); 

  // 1. SAYFA AÇILINCA TÜM DÜNYAYI ÇEK (API)
  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
            // Ülkeleri al ve alfabetik sırala
            const sortedCountries = data.data.sort((a, b) => a.country.localeCompare(b.country));
            setAllLocations(sortedCountries);
            setCountries(sortedCountries.map(c => c.country));
            
            // Varsayılan olarak Türkiye'yi seçmeye çalış, yoksa ilkini seç
            const defaultCountry = sortedCountries.find(c => c.country === "Turkey") ? "Turkey" : sortedCountries[0].country;
            setSelectedCountry(defaultCountry);
        }
      })
      .catch(err => console.error("Location API Error:", err));
  }, []);

  // 2. ÜLKE DEĞİŞİNCE ŞEHİRLERİ GÜNCELLE
  useEffect(() => {
    if (selectedCountry && allLocations.length > 0) {
        const countryData = allLocations.find(c => c.country === selectedCountry);
        if (countryData) {
            const sortedCities = countryData.cities.sort(); // Şehirleri sırala
            setCities(sortedCities);
            setSelectedCity(sortedCities[0]); // İlk şehri seç
        }
    }
  }, [selectedCountry, allLocations]);


  // --- FILM ARAMA ---
  const fetchMovieData = async () => {
    if (!title) return alert("Please enter a movie title!");
    setLoading(true);
    setStatusMsg('Searching IMDb...');
    
    const API_KEY = "fff2b072"; 

    try {
      const response = await fetch(`https://www.omdbapi.com/?t=${title}&apikey=${API_KEY}`);
      const data = await response.json();
      
      if (data.Response === "True") {
        setMovieData(data);
        setStatusMsg('Movie found! Select location below.');
      } else {
        alert("Movie not found! Please try the English title.");
        setMovieData(null);
        setStatusMsg('');
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  // --- KAYDET ---
  const handleSave = async () => {
    if (!movieData || !selectedCity) return alert("Please select a city!");

    setStatusMsg('Finding coordinates...');

    let coords = null;
    try {
      // Nominatim'e "Şehir, Ülke" formatında soruyoruz
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${selectedCity}, ${selectedCountry}`);
      const data = await response.json();
      if (data && data.length > 0) {
        coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (err) {
      console.error(err);
    }

    if (!coords) {
      alert(`Could not find coordinates for "${selectedCity}, ${selectedCountry}". Try a bigger city nearby.`);
      setStatusMsg('');
      return;
    }

    const newMovie = {
      title: movieData.Title,
      director: movieData.Director,
      year: parseInt(movieData.Year),
      genre: movieData.Genre,
      imdb: parseFloat(movieData.imdbRating),
      poster: movieData.Poster,
      country: selectedCountry,
      city: selectedCity,
      coordinates: coords, 
      addedBy: currentUser.username 
    };

    try {
      const response = await fetch('http://localhost:5000/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
      });
      
      if (response.ok) {
        alert(`Movie Added! Flying to ${selectedCity}... ✈️`);
        onMovieAdded(coords); 
        setMovieData(null); setTitle(''); setStatusMsg('');
      }
    } catch (error) {
      alert("Server Error!");
    }
  };

  return (
    <div className="add-movie-panel" style={{ padding: '20px', background: '#1a1a1a', marginTop: '20px', borderTop: '2px solid #E50914' }}>
      <h3 style={{ color: '#E50914', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        ADD MOVIE
      </h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Movie Title (e.g. Inception)..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: '10px', background: '#333', border: '1px solid #444', color: 'white' }}
        />
        <button onClick={fetchMovieData} style={{ background: '#E50914', color: 'white', border: 'none', padding: '0 15px', cursor: 'pointer' }}>
          {loading ? '...' : 'SEARCH'}
        </button>
      </div>

      {statusMsg && <p style={{ fontSize: '12px', color: '#ccc', fontStyle: 'italic' }}>{statusMsg}</p>}

      {movieData && (
        <div style={{ background: '#222', padding: '15px', borderRadius: '5px', animation: 'fadeIn 0.5s' }}>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', borderBottom: '1px solid #444', paddingBottom: '15px' }}>
            <img src={movieData.Poster} alt="Poster" style={{ width: '60px', height: '90px', objectFit: 'cover' }} />
            <div>
              <strong style={{ color: 'white', display: 'block', fontSize: '1.1rem' }}>{movieData.Title}</strong>
              <small style={{ color: '#ccc' }}>{movieData.Year} • {movieData.Director}</small>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            <label style={{ color: '#E50914', fontSize: '12px', fontWeight: 'bold' }}>LOCATION:</label>
            
            {/* ÜLKE LİSTESİ (API'den Geliyor) */}
            <select 
                value={selectedCountry} 
                onChange={e => setSelectedCountry(e.target.value)} 
                style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #444' }}
            >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* ŞEHİR LİSTESİ (Seçilen ülkeye göre değişir) */}
            <select 
                value={selectedCity} 
                onChange={e => setSelectedCity(e.target.value)} 
                style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #444' }}
            >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button onClick={handleSave} style={{ width: '100%', background: '#28a745', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>
              SAVE & FLY 💾
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMovie;