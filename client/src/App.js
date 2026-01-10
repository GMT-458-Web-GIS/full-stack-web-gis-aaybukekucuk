import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import AddMovie from './AddMovie';
import Login from './Login';
import 'leaflet/dist/leaflet.css';
import './App.css';

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
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); 
  const [selectedCountry, setSelectedCountry] = useState("World");
  const [movies, setMovies] = useState([]); 
  const [usersList, setUsersList] = useState([]); 
  const [mapCenter, setMapCenter] = useState(null);
  
  // YENİ: FİLTRE İÇİN ÜLKE LİSTESİ
  const [countryList, setCountryList] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    fetchMovies();
    fetchCountries(); // Ülkeleri çek
  }, []);

  const fetchMovies = () => {
    fetch('http://localhost:5000/api/movies')
      .then(response => response.json())
      .then(data => setMovies(data))
      .catch(error => console.error("Error:", error));
  };

  // SADECE ÜLKE İSİMLERİNİ ÇEK (Filtreleme için)
  const fetchCountries = () => {
    fetch('https://countriesnow.space/api/v0.1/countries')
      .then(res => res.json())
      .then(data => {
        if(!data.error) {
            const sorted = data.data.map(d => d.country).sort();
            setCountryList(sorted);
        }
      });
  };

  const fetchUsers = () => {
    fetch('http://localhost:5000/api/users').then(res => res.json()).then(data => setUsersList(data));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await fetch(`http://localhost:5000/api/movies/${id}`, { method: 'DELETE' });
    setMovies(movies.filter(movie => movie._id !== id));
  };

  const handleEdit = async (movie) => {
    const newTitle = prompt("Update Title:", movie.title);
    if (newTitle && newTitle !== movie.title) {
        await fetch(`http://localhost:5000/api/movies/${movie._id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...movie, title: newTitle })
        });
        fetchMovies(); 
    }
  };

  const handleBanUser = async (id) => {
      if(!window.confirm("Ban this user?")) return;
      await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
      fetchUsers(); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const filteredMovies = selectedCountry === "World" 
    ? movies 
    : movies.filter(movie => movie.country === selectedCountry);

  if (!user) return <Login onLoginSuccess={(userData) => setUser(userData)} />;

  return (
    <div className="app-container">
      
      <div className="sidebar" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>CINEMAP</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
              User: <span style={{ color: '#E50914', fontWeight: 'bold' }}>{user.username}</span> ({user.role})
            </p>
          </div>
          <button onClick={handleLogout} style={{ background: '#333', border: '1px solid #555', color: '#ccc', padding: '5px 8px', cursor: 'pointer', fontSize: '10px' }}>LOGOUT</button>
        </div>
        
        <div style={{ display: 'flex', gap: '5px', marginTop: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('map')} style={{ flex: 1, padding: '10px', background: activeTab === 'map' ? '#E50914' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}>MAP 🗺️</button>
          <button onClick={() => setActiveTab('list')} style={{ flex: 1, padding: '10px', background: activeTab === 'list' ? '#E50914' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}>LIST 📋</button>
          {user.role === 'Admin' && (
              <button onClick={() => { setActiveTab('admin'); fetchUsers(); }} style={{ flex: 1, padding: '10px', background: activeTab === 'admin' ? '#E50914' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}>USERS 👥</button>
          )}
        </div>

        {activeTab !== 'admin' && (
            <div className="filter-section">
            <label>Filter by Country:</label>
            {/* API'den gelen dev liste */}
            <select onChange={(e) => setSelectedCountry(e.target.value)} value={selectedCountry}>
                <option value="World">All World</option>
                {countryList.map(country => (
                    <option key={country} value={country}>{country}</option>
                ))}
            </select>
            </div>
        )}

        {(user.role === 'Cinephile' || user.role === 'Admin') && activeTab !== 'admin' && (
          <AddMovie 
            currentUser={user}
            onMovieAdded={(coords) => {
              fetchMovies();
              if(coords) setMapCenter([coords.lat, coords.lng]);
              setActiveTab('map');
            }} 
          />
        )}

        <div style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '1rem', paddingBottom: '20px' }}>
          <span style={{ fontSize: '10px', color: '#666' }}>GMT 458 - Web GIS</span>
        </div>
      </div>

      <div className="map-area" style={{ background: '#141414', overflowY: 'auto' }}>
        {/* --- HARİTA --- */}
        {activeTab === 'map' && (
          <MapContainer center={[39.93, 32.85]} zoom={4} style={{ height: "100vh", width: "100%" }}>
            <MapController centerCoordinates={mapCenter} />
            <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {filteredMovies.map((movie) => (
              <CircleMarker key={movie._id} center={[movie.coordinates.lat, movie.coordinates.lng]} pathOptions={{ color: '#E50914', fillColor: '#E50914', fillOpacity: 0.6, weight: 2 }} radius={8}>
                <Popup>
                  <div style={{ minWidth: "220px" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#E50914", borderBottom: "1px solid #333", paddingBottom: "5px" }}>{movie.title}</h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      {movie.poster && <img src={movie.poster} alt="Poster" style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.4' }}>
                        <div><strong>Dir:</strong> {movie.director}</div>
                        <div><strong>Year:</strong> {movie.year}</div>
                        <div><strong>Genre:</strong> {movie.genre}</div>
                        <div style={{ color: '#f5c518', fontWeight: 'bold', marginTop: '3px' }}>★ {movie.imdb}</div>
                      </div>
                    </div>
                    <div style={{marginTop: '5px', fontSize: '10px', color: '#666', borderTop: '1px solid #333', paddingTop: '5px'}}>
                      Added by: <span style={{color: '#fff'}}>{movie.addedBy}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}

        {/* --- LİSTE --- */}
        {activeTab === 'list' && (
          <div style={{ padding: '40px', color: 'white' }}>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>MOVIE LIST ({selectedCountry})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {filteredMovies.map(movie => (
                <div key={movie._id} style={{ background: '#222', padding: '15px', borderRadius: '5px', position: 'relative' }}>
                  {movie.poster && <img src={movie.poster} alt="Poster" style={{ width: '100%', borderRadius: '4px' }} />}
                  <h3 style={{ fontSize: '1rem', marginTop: '10px' }}>{movie.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.8rem' }}>{movie.city}, {movie.country}</p>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <p style={{ color: '#E50914', fontWeight: 'bold' }}>★ {movie.imdb}</p>
                    <p style={{ fontSize: '0.7rem', color: '#666', alignSelf:'center' }}>{movie.addedBy}</p>
                  </div>
                  {(user.role === 'Admin' || user.username === movie.addedBy) && (
                    <div style={{display: 'flex', gap: '5px', marginTop: '10px'}}>
                        <button onClick={() => handleEdit(movie)} style={{ flex: 1, background: '#333', color: 'white', border: '1px solid #555', padding: '5px', cursor: 'pointer' }}>EDIT ✏️</button>
                        <button onClick={() => handleDelete(movie._id)} style={{ flex: 1, background: '#b20d18', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}>DEL 🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ADMIN PANEL --- */}
        {activeTab === 'admin' && user.role === 'Admin' && (
            <div style={{ padding: '40px', color: 'white' }}>
                <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '20px', color: '#E50914' }}>ADMIN PANEL - USER MANAGEMENT</h2>
                <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{borderBottom: '1px solid #444'}}>
                            <th style={{padding: '10px'}}>Username</th>
                            <th style={{padding: '10px'}}>Email</th>
                            <th style={{padding: '10px'}}>Role</th>
                            <th style={{padding: '10px'}}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.map(u => (
                            <tr key={u._id} style={{borderBottom: '1px solid #333'}}>
                                <td style={{padding: '10px'}}>{u.username}</td>
                                <td style={{padding: '10px', color: '#aaa'}}>{u.email}</td>
                                <td style={{padding: '10px'}}>{u.role}</td>
                                <td style={{padding: '10px'}}>
                                    {u.role !== 'Admin' && (
                                        <button onClick={() => handleBanUser(u._id)} style={{background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>BAN 🚫</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;