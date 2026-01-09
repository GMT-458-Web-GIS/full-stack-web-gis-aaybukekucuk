import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'; // useMap eklendi
import AddMovie from './AddMovie';
import 'leaflet/dist/leaflet.css';
import './App.css';

// --- HARİTA HAREKET KONTROLCÜSÜ ---
// Bu bileşen haritanın içine yerleşecek ve komut bekleyecek
function MapController({ centerCoordinates }) {
  const map = useMap();
  useEffect(() => {
    if (centerCoordinates) {
      map.flyTo(centerCoordinates, 10, { duration: 2 }); // 2 saniyede oraya uç
    }
  }, [centerCoordinates, map]);
  return null;
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState("Dünya");
  const [movies, setMovies] = useState([]); 
  const [mapCenter, setMapCenter] = useState(null); // Haritanın odaklanacağı yeni yer

  // Verileri Çek
  const fetchMovies = () => {
    fetch('http://localhost:5000/api/movies')
      .then(response => response.json())
      .then(data => {
        setMovies(data);
      })
      .catch(error => console.error("Veri çekme hatası:", error));
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Film eklendiğinde çalışacak fonksiyon
  const handleMovieAdded = (newCoordinates) => {
    fetchMovies(); // Listeyi güncelle
    if (newCoordinates) {
      setMapCenter([newCoordinates.lat, newCoordinates.lng]); // Haritayı oraya odakla
    }
  };

  const filteredMovies = selectedCountry === "Dünya" 
    ? movies 
    : movies.filter(movie => movie.country === selectedCountry);

  return (
    <div className="app-container">
      {/* SOL PANEL */}
      <div className="sidebar" style={{ overflowY: 'auto' }}>
        <div>
          <h1>CINEMAP</h1>
          <p>Mekansal Film Arşivi</p>
        </div>
        
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

        {/* Film Ekleme Paneli */}
        <AddMovie onMovieAdded={handleMovieAdded} />

        <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '1rem', paddingBottom: '20px' }}>
          <span style={{ fontSize: '10px', color: '#666' }}>GMT 458 - Web GIS</span>
        </div>
      </div>

      {/* HARİTA ALANI */}
      <div className="map-area">
        <MapContainer center={[39.93, 32.85]} zoom={4} style={{ height: "100vh", width: "100%", background: "#141414" }}>
          
          {/* Hareket Kontrolcüsü (Bunu eklemezsek harita hareket etmez!) */}
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
                <div style={{ minWidth: "220px" }}>
                  <h3 style={{ margin: "0 0 10px 0", color: "#E50914", borderBottom: "1px solid #333", paddingBottom: "5px" }}>
                    {movie.title}
                  </h3>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    {movie.poster && (
                      <img src={movie.poster} alt="Poster" style={{ width: "60px", borderRadius: "4px" }} />
                    )}
                    <div style={{ fontSize: "12px", color: "#ccc", lineHeight: "1.5" }}>
                      <div><strong>Yön:</strong> {movie.director}</div>
                      <div><strong>Yıl:</strong> {movie.year}</div>
                      <div><strong>Tür:</strong> {movie.genre}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ color: "#f5c518", fontWeight: "bold" }}>★ {movie.imdb}</span>
                     <span style={{ fontSize: '10px', color: '#666' }}>Ekleyen: {movie.addedBy}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;