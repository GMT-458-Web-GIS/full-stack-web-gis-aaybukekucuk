import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import HeatmapLayer from './HeatmapLayer';
import AddMovie from './AddMovie';
import Login from './Login';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './App.css';
import { useLanguage } from './LanguageContext'; 

// İKON TANIMI
const recDotIcon = new L.DivIcon({
  className: 'custom-rec-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10]
});

// GÜNÜN FİLMİ LİSTESİ
const CULT_CLASSICS = [
    { Title: "The Godfather", Year: "1972", Director: "Francis Ford Coppola", Poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg" },
    { Title: "Pulp Fiction", Year: "1994", Director: "Quentin Tarantino", Poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg" },
    { Title: "Fight Club", Year: "1999", Director: "David Fincher", Poster: "https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg" },
    { Title: "Inception", Year: "2010", Director: "Christopher Nolan", Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg" },
    { Title: "The Matrix", Year: "1999", Director: "Lana Wachowski", Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg" },
    { Title: "Goodfellas", Year: "1990", Director: "Martin Scorsese", Poster: "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg" },
    { Title: "Interstellar", Year: "2014", Director: "Christopher Nolan", Poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg" },
    { Title: "Parasite", Year: "2019", Director: "Bong Joon Ho", Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg" },
    { Title: "Spirited Away", Year: "2001", Director: "Hayao Miyazaki", Poster: "https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg" },
    { Title: "The Dark Knight", Year: "2008", Director: "Christopher Nolan", Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg" }
];

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
  const { t, lang, toggleLang } = useLanguage(); 
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); 
  const [mapLayer, setMapLayer] = useState('cluster'); 
  const [selectedCountry, setSelectedCountry] = useState("World");
  const [selectedGenre, setSelectedGenre] = useState("All"); 
  const [movies, setMovies] = useState([]); 
  const [usersList, setUsersList] = useState([]); 
  const [mapCenter, setMapCenter] = useState(null);
  const [countryList, setCountryList] = useState([]);
  const [favorites, setFavorites] = useState([]); 
  const [showRankModal, setShowRankModal] = useState(false);
  const [dailyMovie, setDailyMovie] = useState(null);

  const genreList = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    const allTags = movies.map(m => m.genre || "").join(',').split(','); 
    const uniqueTags = [...new Set(allTags.map(tag => tag ? tag.trim() : ""))];
    return uniqueTags.filter(tag => tag !== "").sort(); 
  }, [movies]);

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
    setDailyMovie(CULT_CLASSICS[Math.floor(Math.random() * CULT_CLASSICS.length)]);
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
  if (activeTab === 'watchlist') displayedMovies = displayedMovies.filter(movie => favorites.includes(movie._id));
  if (selectedCountry !== "World") displayedMovies = displayedMovies.filter(movie => movie.country === selectedCountry);
  if (selectedGenre !== "All") displayedMovies = displayedMovies.filter(movie => movie.genre && movie.genre.includes(selectedGenre));

  if (!user) return <Login onLoginSuccess={(userData) => { setUser(userData); setFavorites(userData.favorites || []); }} />;

  return (
    <div className="app-container">
      <div className="sidebar" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{margin:0, color:'#E50914', fontSize:'2.5rem', fontFamily:'Bebas Neue, sans-serif'}}>CINEMAP</h1>
            <div style={{fontSize: '13px', lineHeight: '1.4', marginTop:'5px'}}>
                <div style={{color: '#ccc'}}>Hello, <span style={{ color: 'white', fontWeight: 'bold' }}>{user.username}</span></div>
                <div style={{color: '#E50914', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'}}>
                    {user.rank || 'Ticket Holder'} 
                    <span onClick={() => setShowRankModal(true)} style={{cursor: 'pointer', fontSize: '14px', color: '#ccc'}} title="Rank Info">ⓘ</span>
                </div>
                <div style={{fontSize: '11px', color: '#888'}}>{user.points || 0} XP</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #444', color: '#888', padding: '5px 10px', cursor: 'pointer', fontSize: '10px', borderRadius:'3px' }}>{t.logout}</button>
        </div>
        
        <div style={{marginTop: '10px', textAlign: 'right'}}>
            <button onClick={toggleLang} style={{background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '11px', textDecoration:'underline'}}>
                {lang === 'en' ? '🇹🇷 Türkçe' : '🇺🇸 English'}
            </button>
        </div>

        {/* --- YENİLENEN NAVİGASYON (FLEXBOX İLE SIĞDIRILDI) --- */}
        <div className="nav-row">
          <button onClick={() => setActiveTab('map')} className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}>{t.mapTab}</button>
          <button onClick={() => setActiveTab('list')} className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`}>{t.listTab}</button>
          <button onClick={() => setActiveTab('watchlist')} className={`nav-btn ${activeTab === 'watchlist' ? 'active' : ''}`}>{t.watchlistTab}</button>
          {user.role === 'Admin' && (
              <button onClick={() => { setActiveTab('admin'); fetchUsers(); }} className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}>{t.usersTab}</button>
          )}
        </div>

        {activeTab !== 'admin' && activeTab !== 'watchlist' && (
            <div className="filter-section">
                
                {/* --- LENS MODE KUTUSU --- */}
                {activeTab === 'map' && (
                  <div className="control-panel">
                      <label className="panel-label">{t.projMode}</label>
                      <div style={{display: 'flex', gap: '8px'}}>
                          <button onClick={() => setMapLayer('cluster')} className={`mode-btn ${mapLayer === 'cluster' ? 'active' : ''}`}>
                            {t.locMode}
                          </button>
                          <button onClick={() => setMapLayer('heatmap')} className={`mode-btn ${mapLayer === 'heatmap' ? 'active' : ''}`}>
                            {t.buzzMode}
                          </button>
                      </div>
                  </div>
                )}
                
                {/* --- GÜNÜN FİLMİ KARTI --- */}
                {dailyMovie && activeTab !== 'admin' && (
                    <div className="daily-card">
                        <img src={dailyMovie.Poster} alt="Daily" className="daily-poster" />
                        <div className="daily-info">
                            <h4>{t.dailyPick}</h4>
                            <strong>{dailyMovie.Title}</strong>
                            <small>{dailyMovie.Year} • {dailyMovie.Director}</small>
                        </div>
                    </div>
                )}

                <div style={{marginBottom: '10px'}}>
                    <label className="filter-label">{t.filterCountry}</label>
                    <select onChange={(e) => setSelectedCountry(e.target.value)} value={selectedCountry}>
                        <option value="World">{t.allWorld}</option>
                        {countryList.map(country => <option key={country} value={country}>{country}</option>)}
                    </select>
                </div>
                <div>
                    <label className="filter-label">{t.filterGenre}</label>
                    <select onChange={(e) => setSelectedGenre(e.target.value)} value={selectedGenre}>
                        <option value="All">{t.allGenres}</option>
                        {genreList.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                    </select>
                </div>
            </div>
        )}

        {(user.role === 'Cinephile' || user.role === 'Admin') && activeTab !== 'admin' && (
          <AddMovie 
            currentUser={user} 
            onMovieAdded={(coords, updatedUser) => { 
                fetchMovies(); 
                if(coords) setMapCenter([coords.lat, coords.lng]); 
                setActiveTab('map');
                if(updatedUser) { setUser(updatedUser); localStorage.setItem('user', JSON.stringify(updatedUser)); }
            }} 
          />
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
            
            {mapLayer === 'heatmap' && (<HeatmapLayer points={displayedMovies} />)}

            {mapLayer === 'cluster' && (
                <MarkerClusterGroup chunkedLoading>
                    {displayedMovies.map((movie) => (
                    <Marker key={movie._id} position={[movie.coordinates.lat, movie.coordinates.lng]} icon={recDotIcon}>
                        <Popup>
                        <div style={{ minWidth: "220px" }}>
                            <h3 style={{ margin: "0 0 10px 0", color: "#E50914", borderBottom: "1px solid #333", paddingBottom: "5px", display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                {movie.title}
                                <span onClick={(e) => toggleFavorite(movie._id, e)} style={{cursor: 'pointer', fontSize: '1.4rem', lineHeight: '1'}}>{favorites.includes(movie._id) ? '⭐' : '☆'}</span>
                            </h3>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            {movie.poster && <img src={movie.poster} alt="Poster" style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />}
                            <div style={{ fontSize: '12px', color: '#333', lineHeight: '1.4' }}>
                                <div><strong>Dir:</strong> {movie.director}</div><div><strong>Year:</strong> {movie.year}</div><div><strong>Genre:</strong> {movie.genre}</div><div style={{ color: '#E50914', fontWeight: 'bold', marginTop: '3px' }}>★ {movie.imdb}</div>
                            </div>
                            </div>
                            <div style={{marginTop: '5px', fontSize: '10px', color: '#666', borderTop: '1px solid #ccc', paddingTop: '5px'}}>{t.addedBy} <span style={{color: '#000'}}>{movie.addedBy}</span></div>
                        </div>
                        </Popup>
                    </Marker>
                    ))}
                </MarkerClusterGroup>
            )}
          </MapContainer>
        )}

        {(activeTab === 'list' || activeTab === 'watchlist') && (
          <div style={{ padding: '40px', color: 'white' }}>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                {activeTab === 'watchlist' ? t.myWatchlist : `${t.movieList} (${selectedCountry}${selectedGenre !== 'All' ? ` - ${selectedGenre}` : ''})`}
            </h2>
            {activeTab === 'watchlist' && displayedMovies.length === 0 && <p style={{color: '#666', fontStyle: 'italic'}}>{t.emptyWatchlist}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {displayedMovies.map(movie => (
                <div key={movie._id} style={{ background: '#222', padding: '15px', borderRadius: '5px', position: 'relative' }}>
                  <div onClick={(e) => toggleFavorite(movie._id, e)} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '5px' }}>{favorites.includes(movie._id) ? '⭐' : '☆'}</div>
                  {movie.poster && <img src={movie.poster} alt="Poster" style={{ width: '100%', borderRadius: '4px' }} />}
                  <h3 style={{ fontSize: '1rem', marginTop: '10px' }}>{movie.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.8rem' }}>{movie.city}, {movie.country}</p>
                  <p style={{ color: '#ccc', fontSize: '0.7rem' }}>{movie.genre}</p>
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

      {showRankModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }} onClick={() => setShowRankModal(false)}>
            <div style={{
                background: '#141414', padding: '30px', borderRadius: '10px', border: '1px solid #E50914',
                maxWidth: '400px', width: '90%', textAlign: 'center', color: 'white'
            }} onClick={(e) => e.stopPropagation()}>
                <h2 style={{color: '#E50914', fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', margin: '0 0 20px 0'}}>{t.rankTitle}</h2>
                <p style={{marginBottom: '20px', color: '#ccc'}}>{t.rankDesc}</p>
                <div style={{background: '#222', padding: '10px', borderRadius: '5px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between'}}><span>{t.rule1}</span><span style={{color: '#28a745', fontWeight: 'bold'}}>{t.rule1Points}</span></div>
                <div style={{textAlign: 'left', marginTop: '20px'}}>
                    <h3 style={{fontSize: '14px', borderBottom: '1px solid #333', paddingBottom: '5px', color: '#888'}}>{t.ranks}</h3>
                    <ul style={{listStyle: 'none', padding: 0, fontSize: '14px', lineHeight: '2'}}><li style={{color: '#aaa'}}>{t.r1}</li><li style={{color: '#fff'}}>{t.r2}</li><li style={{color: '#f5c518'}}>{t.r3}</li><li style={{color: '#E50914', fontWeight: 'bold'}}>{t.r4}</li></ul>
                </div>
                <button onClick={() => setShowRankModal(false)} style={{marginTop: '20px', background: '#333', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px'}}>{t.close}</button>
            </div>
        </div>
      )}

    </div>
  );
}
export default App;