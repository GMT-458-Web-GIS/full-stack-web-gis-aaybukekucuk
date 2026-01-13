import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import AddMovie from './AddMovie';
import Login from './Login';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { useLanguage } from './LanguageContext'; // YENİ

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
  const { t, lang, toggleLang } = useLanguage(); // YENİ
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); 
  const [selectedCountry, setSelectedCountry] = useState("World");
  const [movies, setMovies] = useState([]); 
  const [usersList, setUsersList] = useState([]); 
  const [mapCenter, setMapCenter] = useState(null);
  const [countryList, setCountryList] = useState([]);
  const [favorites, setFavorites] = useState([]); 

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setFavorites(parsedUser.favorites || []);
      if(parsedUser._id) fetchFavorites(parsedUser._id);
    }
    fetchMovies();
    fetchCountries();
  }, []);

  const fetchMovies = () => fetch('http://localhost:5000/api/movies').then(res=>res.json()).then(data=>setMovies(data));
  const fetchCountries = () => fetch('https://countriesnow.space/api/v0.1/countries').then(res=>res.json()).then(data=>{if(!data.error) setCountryList(data.data.map(d=>d.country).sort())});
  const fetchUsers = () => fetch('http://localhost:5000/api/users').then(res=>res.json()).then(data=>setUsersList(data));
  const fetchFavorites = (userId) => fetch(`http://localhost:5000/api/users/${userId}/favorites`).then(res=>res.json()).then(data=>setFavorites(data));

  const toggleFavorite = async (movieId, e) => {
      if(e) e.stopPropagation();
      if (!user || !user._id) { alert(t.loginFirst); return; }
      try {
        const response = await fetch(`http://localhost:5000/api/users/${user._id}/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ movieId }) });
        const data = await response.json();
        if(response.ok) {
            setFavorites(data.favorites); 
            const updatedUser = { ...user, favorites: data.favorites };
            setUser(updatedUser); localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (err) { console.error("Fav Error", err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDel)) return;
    await fetch(`http://localhost:5000/api/movies/${id}`, { method: 'DELETE' });
    setMovies(movies.filter(movie => movie._id !== id));
  };

  const handleEdit = async (movie) => {
    const newTitle = prompt("Update Title:", movie.title);
    if (newTitle && newTitle !== movie.title) {
        await fetch(`http://localhost:5000/api/movies/${movie._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...movie, title: newTitle }) });
        fetchMovies(); 
    }
  };

  const handleBanUser = async (id) => {
      if(!window.confirm(t.banConfirm)) return;
      await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
      fetchUsers(); 
  };

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };

  let displayedMovies = movies;
  if (activeTab === 'watchlist') displayedMovies = movies.filter(movie => favorites.includes(movie._id));
  else if (selectedCountry !== "World") displayedMovies = movies.filter(movie => movie.country === selectedCountry);

  if (!user) return <Login onLoginSuccess={(userData) => { setUser(userData); setFavorites(userData.favorites || []); }} />;

  return (
    <div className="app-container">
      <div className="sidebar" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>CINEMAP</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>User: <span style={{ color: '#E50914', fontWeight: 'bold' }}>{user.username}</span> ({user.role})</p>
          </div>
          <button onClick={handleLogout} style={{ background: '#333', border: '1px solid #555', color: '#ccc', padding: '5px 8px', cursor: 'pointer', fontSize: '10px' }}>{t.logout}</button>
        </div>
        
        {/* DİL DEĞİŞTİRME BUTONU */}
        <div style={{marginTop: '10px', textAlign: 'right'}}>
            <button onClick={toggleLang} style={{background: 'transparent', border: '1px solid #555', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '15px', fontSize: '12px'}}>
                {lang === 'en' ? '🇹🇷 Türkçe Yap' : '🇺🇸 Switch to English'}
            </button>
        </div>

        <div style={{ display: 'flex', gap: '5px', marginTop: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('map')} style={{ flex: 1, padding: '10px', background: activeTab === 'map' ? '#E50914' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}>{t.mapTab}</button>
          <button onClick={() => setActiveTab('list')} style={{ flex: 1, padding: '10px', background: activeTab === 'list' ? '#E50914' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}>{t.listTab}</button>
          <button onClick={() => setActiveTab('watchlist')} style={{ flex: 1, padding: '10px', background: activeTab === 'watchlist' ? '#E50914' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}>{t.watchlistTab}</button>
          {user.role === 'Admin' && (
              <button onClick={() => { setActiveTab('admin'); fetchUsers(); }} style={{ flex: 1, padding: '10px', background: activeTab === 'admin' ? '#E50914' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}>{t.usersTab}</button>
          )}
        </div>

        {activeTab !== 'admin' && activeTab !== 'watchlist' && (
            <div className="filter-section">
            <label>{t.filterCountry}</label>
            <select onChange={(e) => setSelectedCountry(e.target.value)} value={selectedCountry}>
                <option value="World">{t.allWorld}</option>
                {countryList.map(country => <option key={country} value={country}>{country}</option>)}
            </select>
            </div>
        )}

        {(user.role === 'Cinephile' || user.role === 'Admin') && activeTab !== 'admin' && (
          <AddMovie currentUser={user} onMovieAdded={(coords) => { fetchMovies(); if(coords) setMapCenter([coords.lat, coords.lng]); setActiveTab('map'); }} />
        )}

        <div style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '1rem', paddingBottom: '20px' }}>
          <span style={{ fontSize: '10px', color: '#666' }}>{t.footer}</span>
        </div>
      </div>

      <div className="map-area" style={{ background: '#141414', overflowY: 'auto' }}>
        {activeTab === 'map' && (
          <MapContainer center={[39.93, 32.85]} zoom={4} style={{ height: "100vh", width: "100%" }}>
            <MapController centerCoordinates={mapCenter} />
            <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {displayedMovies.map((movie) => (
              <CircleMarker key={movie._id} center={[movie.coordinates.lat, movie.coordinates.lng]} pathOptions={{ color: '#E50914', fillColor: '#E50914', fillOpacity: 0.6, weight: 2 }} radius={8}>
                <Popup>
                  <div style={{ minWidth: "220px" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#E50914", borderBottom: "1px solid #333", paddingBottom: "5px", display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        {movie.title}
                        <span onClick={(e) => toggleFavorite(movie._id, e)} style={{cursor: 'pointer', fontSize: '1.4rem', lineHeight: '1'}}>{favorites.includes(movie._id) ? '⭐' : '☆'}</span>
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      {movie.poster && <img src={movie.poster} alt="Poster" style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.4' }}>
                        <div><strong>Dir:</strong> {movie.director}</div><div><strong>Year:</strong> {movie.year}</div><div><strong>Genre:</strong> {movie.genre}</div><div style={{ color: '#f5c518', fontWeight: 'bold', marginTop: '3px' }}>★ {movie.imdb}</div>
                      </div>
                    </div>
                    <div style={{marginTop: '5px', fontSize: '10px', color: '#666', borderTop: '1px solid #333', paddingTop: '5px'}}>{t.addedBy} <span style={{color: '#fff'}}>{movie.addedBy}</span></div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}

        {(activeTab === 'list' || activeTab === 'watchlist') && (
          <div style={{ padding: '40px', color: 'white' }}>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>{activeTab === 'watchlist' ? t.myWatchlist : `${t.movieList} (${selectedCountry})`}</h2>
            {activeTab === 'watchlist' && displayedMovies.length === 0 && <p style={{color: '#666', fontStyle: 'italic'}}>{t.emptyWatchlist}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {displayedMovies.map(movie => (
                <div key={movie._id} style={{ background: '#222', padding: '15px', borderRadius: '5px', position: 'relative' }}>
                  <div onClick={(e) => toggleFavorite(movie._id, e)} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '5px' }}>{favorites.includes(movie._id) ? '⭐' : '☆'}</div>
                  {movie.poster && <img src={movie.poster} alt="Poster" style={{ width: '100%', borderRadius: '4px' }} />}
                  <h3 style={{ fontSize: '1rem', marginTop: '10px' }}>{movie.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.8rem' }}>{movie.city}, {movie.country}</p>
                  <div style={{display:'flex', justifyContent:'space-between'}}><p style={{ color: '#E50914', fontWeight: 'bold' }}>★ {movie.imdb}</p><p style={{ fontSize: '0.7rem', color: '#666', alignSelf:'center' }}>{movie.addedBy}</p></div>
                  {(user.role === 'Admin' || user.username === movie.addedBy) && (
                    <div style={{display: 'flex', gap: '5px', marginTop: '10px'}}>
                        <button onClick={() => handleEdit(movie)} style={{ flex: 1, background: '#333', color: 'white', border: '1px solid #555', padding: '5px', cursor: 'pointer' }}>{t.edit}</button>
                        <button onClick={() => handleDelete(movie._id)} style={{ flex: 1, background: '#b20d18', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}>{t.del}</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && user.role === 'Admin' && (
            <div style={{ padding: '40px', color: 'white' }}>
                <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '20px', color: '#E50914' }}>{t.adminPanel}</h2>
                <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                    <thead><tr style={{borderBottom: '1px solid #444'}}><th style={{padding: '10px'}}>Username</th><th style={{padding: '10px'}}>Email</th><th style={{padding: '10px'}}>Role</th><th style={{padding: '10px'}}>Action</th></tr></thead>
                    <tbody>
                        {usersList.map(u => (
                            <tr key={u._id} style={{borderBottom: '1px solid #333'}}><td style={{padding: '10px'}}>{u.username}</td><td style={{padding: '10px', color: '#aaa'}}>{u.email}</td><td style={{padding: '10px'}}>{u.role}</td><td style={{padding: '10px'}}>{u.role !== 'Admin' && <button onClick={() => handleBanUser(u._id)} style={{background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>{t.ban}</button>}</td></tr>
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