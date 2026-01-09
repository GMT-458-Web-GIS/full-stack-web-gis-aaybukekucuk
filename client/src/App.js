import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import AddMovie from './AddMovie';
import Login from './Login'; // Login ekranını çağırdık
import 'leaflet/dist/leaflet.css';
import './App.css';

// Harita Hareket Kontrolcüsü
function MapController({ centerCoordinates }) {
  const map = useMap();
  useEffect(() => {
    if (centerCoordinates) {
      map.flyTo(centerCoordinates, 10, { duration: 2 });
    }
  }, [centerCoordinates, map]);
  return null;
}

function App() {
  // --- DURUM YÖNETİMİ (State) ---
  const [user, setUser] = useState(null); // Giriş yapan kullanıcı
  const [activeTab, setActiveTab] = useState('map'); // 'map' veya 'list' (Liste görünümü için)
  
  const [selectedCountry, setSelectedCountry] = useState("Dünya");
  const [movies, setMovies] = useState([]); 
  const [mapCenter, setMapCenter] = useState(null);

  // --- BAŞLANGIÇ KONTROLÜ (Oturum Açık mı?) ---
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser)); // Hafızadaki kullanıcıyı geri yükle
    }
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    fetch('http://localhost:5000/api/movies')
      .then(response => response.json())
      .then(data => setMovies(data))
      .catch(error => console.error("Hata:", error));
  };

  // ÇIKIŞ YAP (Logout)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); // Giriş ekranına atar
  };

  const filteredMovies = selectedCountry === "Dünya" 
    ? movies 
    : movies.filter(movie => movie.country === selectedCountry);

  // --- EĞER GİRİŞ YAPILMAMIŞSA LOGIN EKRANINI GÖSTER ---
  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  // --- EĞER GİRİŞ YAPILMIŞSA ANA EKRANI GÖSTER ---
  return (
    <div className="app-container">
      
      {/* --- SOL PANEL (SIDEBAR) --- */}
      <div className="sidebar" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>CINEMAP</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Hoşgeldin, <span style={{ color: 'white' }}>{user.username}</span> ({user.role})</p>
          </div>
          <button onClick={handleLogout} style={{ background: '#333', border: '1px solid #555', color: '#ccc', padding: '5px 8px', cursor: 'pointer', fontSize: '10px' }}>ÇIKIŞ</button>
        </div>
        
        {/* SEKME GEÇİŞİ (Harita / Liste) */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('map')}
            style={{ flex: 1, padding: '10px', background: activeTab === 'map' ? '#E50914' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            HARİTA 🗺️
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            style={{ flex: 1, padding: '10px', background: activeTab === 'list' ? '#E50914' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            LİSTE 📋
          </button>
        </div>

        {/* FİLTRELEME */}
        <div className="filter-section">
          <label>Ülke Seçin:</label>
          <select onChange={(e) => setSelectedCountry(e.target.value)}>
            <option value="Dünya">Tüm Dünya</option>
            <option value="Türkiye">Türkiye</option>
            <option value="ABD">ABD</option>
            <option value="İngiltere">İngiltere</option>
            <option value="Fransa">Fransa</option>
            <option value="İtalya">İtalya</option>
            <option value="Japonya">Japonya</option>
          </select>
        </div>

        {/* FİLM EKLEME (Sadece Sinefil ve Admin görebilir) */}
        {(user.role === 'Sinefil' || user.role === 'Admin') && (
          <AddMovie onMovieAdded={(coords) => {
            fetchMovies();
            if(coords) setMapCenter([coords.lat, coords.lng]);
            setActiveTab('map'); // Ekleme yapınca haritaya dön
          }} />
        )}

        <div style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '1rem', paddingBottom: '20px' }}>
          <span style={{ fontSize: '10px', color: '#666' }}>GMT 458 - Web GIS</span>
        </div>
      </div>

      {/* --- ANA İÇERİK ALANI --- */}
      <div className="map-area" style={{ background: '#141414', overflowY: 'auto' }}>
        
        {/* DURUM 1: HARİTA GÖRÜNÜMÜ */}
        {activeTab === 'map' && (
          <MapContainer center={[39.93, 32.85]} zoom={4} style={{ height: "100vh", width: "100%" }}>
            <MapController centerCoordinates={mapCenter} />
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {filteredMovies.map((movie) => (
              <CircleMarker
                key={movie._id}
                center={[movie.coordinates.lat, movie.coordinates.lng]}
                pathOptions={{ color: '#E50914', fillColor: '#E50914', fillOpacity: 0.6, weight: 2 }}
                radius={8}
              >
                <Popup>
                  <div style={{ minWidth: "200px" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#E50914", borderBottom: "1px solid #333" }}>{movie.title}</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {movie.poster && <img src={movie.poster} alt="Poster" style={{ width: '50px' }} />}
                      <div style={{ fontSize: '12px' }}>
                        <div>{movie.year}</div>
                        <div>{movie.director}</div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}

        {/* DURUM 2: LİSTE GÖRÜNÜMÜ (Senin istediğin tablo) */}
        {activeTab === 'list' && (
          <div style={{ padding: '40px', color: 'white' }}>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>FİLM LİSTESİ ({selectedCountry})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {filteredMovies.map(movie => (
                <div key={movie._id} style={{ background: '#222', padding: '15px', borderRadius: '5px' }}>
                  {movie.poster && <img src={movie.poster} alt="Poster" style={{ width: '100%', borderRadius: '4px' }} />}
                  <h3 style={{ fontSize: '1rem', marginTop: '10px' }}>{movie.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.8rem' }}>{movie.city}, {movie.country}</p>
                  <p style={{ color: '#E50914', fontWeight: 'bold' }}>★ {movie.imdb}</p>
                  
                  {/* SİLME BUTONU (Sadece Admin veya Ekleyen Kişi Görebilir - Şimdilik herkese açık yapalım test için) */}
                  <button 
                    style={{ width: '100%', background: 'transparent', border: '1px solid #E50914', color: '#E50914', padding: '5px', cursor: 'pointer', marginTop: '10px' }}
                    onClick={() => {
                        // Burada silme fonksiyonu olacak
                        alert("Silme özelliği bir sonraki adımda eklenecek!");
                    }}
                  >
                    SİL 🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;