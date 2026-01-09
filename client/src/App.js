import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// --- FİLM VERİSİ ŞABLONU (Şu an boş, sen dolduracaksın) ---
// İleride veritabanından veya buradan elle ekleyeceğin filmler bu formatta olacak.
const movieLocations = [
  /* Örnek Veri Yapısı (Şu an haritada görünmemesi için yorum satırı yaptım):
  { 
    id: 1, 
    title: "The Godfather", 
    city: "New York", 
    country: "ABD", 
    coordinates: [40.7128, -74.0060], 
    year: 1972,
    director: "Francis Ford Coppola",
    genre: "Suç, Drama",
    imdb: 9.2
  },
  */
];

function App() {
  const [selectedCountry, setSelectedCountry] = useState("Dünya");

  // Ülkeye göre filtreleme (Veri olduğunda çalışacak)
  const filteredMovies = selectedCountry === "Dünya" 
    ? movieLocations 
    : movieLocations.filter(movie => movie.country === selectedCountry);

  return (
    <div className="app-container">
      {/* --- SOL PANEL --- */}
      <div className="sidebar">
        <div>
          <h1>CINEMAP</h1>
          <p>Mekansal Film Arşivi</p>
        </div>
        
        <div className="filter-section">
          <label>Ülke Seçin:</label>
          <select onChange={(e) => setSelectedCountry(e.target.value)}>
            <option value="Dünya">Tüm Dünya</option>
            <option value="Türkiye">Türkiye</option>
            <option value="Fransa">Fransa</option>
            <option value="ABD">ABD</option>
            <option value="İtalya">İtalya</option>
            <option value="Japonya">Japonya</option>
          </select>
        </div>

        {/* Alt Bilgi ve Dil Butonu */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #333', paddingTop: '1rem' }}>
          <span style={{ fontSize: '10px', color: '#666' }}>GMT 458 - Web GIS</span>
          <button style={{
            background: 'transparent',
            border: '1px solid #E50914',
            color: '#E50914',
            padding: '5px 10px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            borderRadius: '4px'
          }}>
            EN / TR
          </button>
        </div>
      </div>

      {/* --- HARİTA ALANI --- */}
      <div className="map-area">
        <MapContainer center={[39.93, 32.85]} zoom={5} style={{ height: "100vh", width: "100%", background: "#141414" }}>
          
          {/* Karanlık Sinematik Harita Katmanı */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Film Lokasyonları (Veri eklendiğinde burada belirecek) */}
          {filteredMovies.map((movie) => (
            <CircleMarker
              key={movie.id}
              center={movie.coordinates}
              pathOptions={{ 
                color: '#E50914',       
                fillColor: '#E50914',   
                fillOpacity: 0.6,       
                weight: 2               
              }}
              radius={8}
            >
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  {/* Film Başlığı */}
                  <h3 style={{ margin: "0 0 5px 0", color: "#E50914", borderBottom: "1px solid #333", paddingBottom: "5px" }}>
                    {movie.title}
                  </h3>
                  
                  {/* Detay Bilgiler */}
                  <div style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.6" }}>
                    <div><strong>Yönetmen:</strong> {movie.director}</div>
                    <div><strong>Tür:</strong> {movie.genre}</div>
                    <div><strong>Yıl:</strong> {movie.year}</div>
                    <div style={{ marginTop: "5px", color: "#f5c518", fontWeight: "bold" }}>
                      ★ IMDb: {movie.imdb}
                    </div>
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