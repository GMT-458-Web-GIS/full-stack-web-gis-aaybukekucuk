import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
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

// --- İKON TANIMLARI ---

// 1. Filmler için Kırmızı Nokta (CSS)
const recDotIcon = new L.DivIcon({
  className: 'custom-rec-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10]
});

// 2. Kullanıcı Konumu için Mavi Nokta (CSS)
const userLocationIcon = new L.DivIcon({
  className: 'custom-user-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -15]
});

// --- YENİLENMİŞ FİLM ENDÜSTRİ MERKEZLERİ ---
const FILM_PRODUCTION_CENTERS = [
    {
        id: "hollywood",
        name: "HOLLYWOOD 🇺🇸",
        desc: "Global mainstream cinema and major studio system.",
        location: "California (Los Angeles)",
        color: "#bf00ff",
        coords: [
            [34.1700, -118.4500],
            [34.1700, -118.2000],
            [34.0000, -118.2000],
            [34.0000, -118.4500]
        ]
    },
    {
        id: "bollywood",
        name: "BOLLYWOOD 🇮🇳",
        desc: "Hindi-language film industry known for music and dance.",
        location: "Mumbai and surrounding area",
        color: "#ff9900",
        coords: [
            [19.2800, 72.7500],
            [19.2800, 73.0000],
            [18.9000, 73.0000],
            [18.9000, 72.7500]
        ]
    },
    {
        id: "yesilcam",
        name: "YEŞİLÇAM 🇹🇷",
        desc: "The historical center of classic Turkish cinema.",
        location: "Istanbul (Beyoğlu district)",
        color: "#00ff00",
        coords: [
            [41.0600, 28.9400],
            [41.0600, 29.0000],
            [41.0000, 29.0000],
            [41.0000, 28.9400]
        ]
    },
    {
        id: "nollywood",
        name: "NOLLYWOOD 🇳🇬",
        desc: "Africa’s largest film production industry.",
        location: "Lagos metropolitan area",
        color: "#ffff00",
        coords: [
            [6.7000, 3.2000],
            [6.7000, 3.5000],
            [6.4000, 3.5000],
            [6.4000, 3.2000]
        ]
    },
    {
        id: "cinecitta",
        name: "CINECITTÀ 🇮🇹",
        desc: "One of Europe’s oldest and most influential film studio hubs.",
        location: "Rome",
        color: "#ff0000",
        coords: [
            [41.9500, 12.4000],
            [41.9500, 12.6000],
            [41.8000, 12.6000],
            [41.8000, 12.4000]
        ]
    },
    {
        id: "chinawood",
        name: "CHINAWOOD 🇨🇳",
        desc: "Mainland China’s film production industry.",
        location: "Beijing–Shanghai axis",
        color: "#cc0000",
        coords: [
            [29.4000, 120.1000],
            [29.4000, 120.4000],
            [29.1000, 120.4000],
            [29.1000, 120.1000]
        ]
    },
    {
        id: "hallyuwood",
        name: "HALLYUWOOD 🇰🇷",
        desc: "Center of the Korean Wave in film, television, and pop culture.",
        location: "Seoul metropolitan area",
        color: "#ff66cc",
        coords: [
            [37.7000, 126.8000],
            [37.7000, 127.2000],
            [37.4000, 127.2000],
            [37.4000, 126.8000]
        ]
    }
];

// GÜNÜN FİLMİ LİSTESİ
const CULT_CLASSICS = [
    { Title: "The Godfather", Year: "1972", Director: "Francis Ford Coppola", Poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg" },
    { Title: "Pulp Fiction", Year: "1994", Director: "Quentin Tarantino", Poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg" },
    { Title: "Fight Club", Year: "1999", Director: "David Fincher", Poster: "https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg" },
    { Title: "Inception", Year: "2010", Director: "Christopher Nolan", Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg" },
    { Title: "Interstellar", Year: "2014", Director: "Christopher Nolan", Poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg" },
    { Title: "Parasite", Year: "2019", Director: "Bong Joon Ho", Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg" }
];

const MOCK_USERS = ["Cinephile_99", "MovieBuff", "Ali_K", "Sarah.J", "Mehmet Y.", "Aybüke", "John D.", "Gizem"];
const ACTIONS_EN = ["reviewed", "visited", "added media to", "rated ★5"];
const ACTIONS_TR = ["inceledi", "ziyaret etti", "medya ekledi", "puanladı ★5"];

const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; 
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// Harita kontrolü (Zoom/Pan)
function MapController({ centerCoordinates }) {
  const map = useMap();
  useEffect(() => {
    if (centerCoordinates) {
      map.flyTo(centerCoordinates, 12, { duration: 2 });
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
  
  // Konum & Radar
  const [userLocation, setUserLocation] = useState(null);
  const [isNearbyActive, setIsNearbyActive] = useState(false);
  const [radarStatus, setRadarStatus] = useState('');
  
  // Feed & Media Modal
  const [feed, setFeed] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMovieForMedia, setSelectedMovieForMedia] = useState(null);
  const [mediaType, setMediaType] = useState('image'); 
  const [mediaUrl, setMediaUrl] = useState('');

  // --- POLİGON GÖSTERME DURUMU ---
  const [showPolygons, setShowPolygons] = useState(false); 

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

  const handleAddMedia = async (e) => {
      e.preventDefault();
      if(!mediaUrl) return;
      try {
          const response = await fetch(`http://localhost:5000/api/movies/${selectedMovieForMedia._id}/media`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: mediaType, url: mediaUrl, addedBy: user.username })
          });
          if(response.ok) {
              alert(t.evidenceAdded);
              setMediaUrl('');
              setShowMediaModal(false);
              fetchMovies(); 
          } else { alert("Error adding media. Check backend."); }
      } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (movies.length === 0) return;
    const generateRealActivity = () => {
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
        const actions = lang === 'en' ? ACTIONS_EN : ACTIONS_TR;
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        return {
            user: randomUser,
            action: randomAction,
            movie: randomMovie.title,
            location: randomMovie.city,
            coords: [randomMovie.coordinates.lat, randomMovie.coordinates.lng] 
        };
    };
    if (feed.length === 0) { setFeed([generateRealActivity(), generateRealActivity()]); }
    const interval = setInterval(() => { setFeed(prev => [generateRealActivity(), ...prev].slice(0, 3)); }, 45000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies, lang]);

  const handleFindNearby = () => {
    if (isNearbyActive) { setIsNearbyActive(false); setRadarStatus(''); return; }
    setRadarStatus(t.locating);
    if (!navigator.geolocation) { alert("Geolocation not supported"); setRadarStatus(''); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(coords);
        setMapCenter([coords.lat, coords.lng]); 
        setIsNearbyActive(true); 
        setRadarStatus(t.nearbyActive);
      },
      (error) => { console.error(error); alert(t.gpsDenied); setRadarStatus(''); }
    );
  };

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
  if (isNearbyActive && userLocation) {
      displayedMovies = displayedMovies.filter(movie => {
          const dist = haversineDistance(userLocation, movie.coordinates);
          return dist <= 1000; 
      });
  } else {
      if (selectedCountry !== "World") displayedMovies = displayedMovies.filter(movie => movie.country === selectedCountry);
  }
  if (activeTab === 'watchlist') displayedMovies = displayedMovies.filter(movie => favorites.includes(movie._id));
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
                
                {activeTab === 'map' && (
                  <div className="control-panel">
                      <label className="panel-label">{t.projMode}</label>
                      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                          <button onClick={() => setMapLayer('cluster')} className={`mode-btn ${mapLayer === 'cluster' ? 'active' : ''}`}>
                            {t.locMode}
                          </button>
                          <button onClick={() => setMapLayer('heatmap')} className={`mode-btn ${mapLayer === 'heatmap' ? 'active' : ''}`}>
                            {t.buzzMode}
                          </button>
                          
                          {/* --- FİLM MERKEZLERİ BUTONU --- */}
                          <button 
                            onClick={() => setShowPolygons(!showPolygons)} 
                            className={`mode-btn ${showPolygons ? 'active' : ''}`}
                            style={{
                                borderColor: '#E50914', 
                                color: showPolygons ? 'white' : '#E50914', 
                                background: showPolygons ? '#E50914' : 'transparent',
                                flex: '1 0 100%',
                                marginTop: '5px'
                            }}
                          >
                            {showPolygons ? 'HIDE CENTERS 🎬' : 'FILM PRODUCTION CENTERS 🎥'}
                          </button>
                      </div>
                  </div>
                )}
                
                {dailyMovie && activeTab !== 'admin' && !isNearbyActive && (
                    <div className="daily-card">
                        <img src={dailyMovie.Poster} alt="Daily" className="daily-poster" />
                        <div className="daily-info">
                            <h4>{t.dailyPick}</h4>
                            <strong>{dailyMovie.Title}</strong>
                            <small>{dailyMovie.Year} • {dailyMovie.Director}</small>
                        </div>
                    </div>
                )}

                <div style={{marginBottom: '20px'}}>
                    <button 
                        onClick={handleFindNearby}
                        style={{
                            width: '100%', padding: '12px', 
                            background: isNearbyActive ? 'rgba(229, 9, 20, 0.1)' : '#1a1a1a', 
                            color: isNearbyActive ? '#E50914' : 'white', 
                            border: isNearbyActive ? '1px solid #E50914' : '1px solid #444', 
                            borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.3s', fontSize: '11px', letterSpacing: '0.5px'
                        }}
                    >
                        {isNearbyActive ? `✖ ${t.close}` : t.nearbyBtn}
                    </button>
                    {radarStatus && <div style={{fontSize: '10px', color: '#E50914', marginTop: '8px', textAlign: 'center', fontStyle:'italic', animation: 'fadeIn 0.5s'}}>{radarStatus}</div>}
                    {isNearbyActive && displayedMovies.length === 0 && <div style={{fontSize: '10px', color: '#888', marginTop: '5px', textAlign: 'center'}}>{t.noMoviesNearby}</div>}
                </div>

                <div style={{marginBottom: '10px'}}>
                    <label className="filter-label">{t.filterCountry}</label>
                    <select onChange={(e) => setSelectedCountry(e.target.value)} value={selectedCountry} disabled={isNearbyActive} style={{opacity: isNearbyActive ? 0.5 : 1}}>
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

      <div className="map-area" style={{ background: '#141414', overflowY: 'auto', position: 'relative' }}>
        {activeTab === 'map' && (
          <>
            <MapContainer center={[39.93, 32.85]} zoom={4} style={{ height: "100vh", width: "100%" }}>
                <MapController centerCoordinates={mapCenter} />
                <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                
                {/* --- FILM ENDÜSTRİ BÖLGELERİ (GÖRÜNÜR POLİGONLAR) --- */}
                {showPolygons && FILM_PRODUCTION_CENTERS.map((center) => (
                    <Polygon 
                        key={center.id} 
                        positions={center.coords} 
                        pathOptions={{ 
                            color: center.color, 
                            fillColor: center.color, 
                            fillOpacity: 0.4, // Daha görünür
                            weight: 2,
                            dashArray: null 
                        }}
                    >
                        <Popup>
                            <div style={{textAlign:'center'}}>
                                <h3 style={{margin:'0 0 5px 0', color: center.color, textShadow:'1px 1px 0 #000'}}>{center.name}</h3>
                                <div style={{fontSize:'12px', fontWeight:'bold', marginBottom:'3px'}}>{center.location}</div>
                                <div style={{fontSize:'11px', color:'#333'}}>{center.desc}</div>
                            </div>
                        </Popup>
                    </Polygon>
                ))}

                {isNearbyActive && userLocation && (<Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}><Popup>📍 YOU ARE HERE</Popup></Marker>)}
                {mapLayer === 'heatmap' && (<HeatmapLayer points={displayedMovies} />)}
                {mapLayer === 'cluster' && (
                    <MarkerClusterGroup chunkedLoading>
                        {displayedMovies.map((movie) => (
                        <Marker key={movie._id} position={[movie.coordinates.lat, movie.coordinates.lng]} icon={recDotIcon}>
                            <Popup>
                            <div style={{ minWidth: "240px", maxHeight: "300px", overflowY: "auto" }}>
                                <h3 style={{ margin: "0 0 12px 0", color: "#E50914", borderBottom: "1px solid #444", paddingBottom: "8px", display:'flex', justifyContent:'space-between', alignItems:'center', fontSize: "16px", fontFamily: "Arial, sans-serif", paddingRight: "25px" }}>
                                    {movie.title}
                                    <span onClick={(e) => toggleFavorite(movie._id, e)} style={{cursor: 'pointer', fontSize: '1.6rem', color: favorites.includes(movie._id) ? '#f5c518' : '#888', lineHeight: '1', marginLeft: '10px'}}>
                                        {favorites.includes(movie._id) ? '★' : '☆'}
                                    </span>
                                </h3>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    {movie.poster && <img src={movie.poster} alt="Poster" style={{ width: '70px', height: '105px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #333' }} />}
                                    <div style={{ fontSize: '13px', lineHeight: '1.6', flex: 1 }}>
                                        <div style={{color: '#ccc'}}><span style={{color: '#666', fontWeight:'bold', marginRight:'5px'}}>Dir:</span> {movie.director}</div>
                                        <div style={{color: '#ccc'}}><span style={{color: '#666', fontWeight:'bold', marginRight:'5px'}}>Year:</span> {movie.year}</div>
                                        <div style={{color: '#ccc'}}><span style={{color: '#666', fontWeight:'bold', marginRight:'5px'}}>Genre:</span> {movie.genre}</div>
                                        <div style={{ color: '#E50914', fontWeight: 'bold', marginTop: '6px', fontSize: '14px' }}>★ {movie.imdb}</div>
                                    </div>
                                </div>
                                {movie.media && movie.media.length > 0 && (
                                    <div style={{marginBottom:'10px', borderTop:'1px solid #333', paddingTop:'8px'}}>
                                        <strong style={{fontSize:'11px', color:'#888', display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.5px'}}>SCENE ARCHIVE:</strong>
                                        <div style={{display:'flex', gap:'5px', overflowX:'auto', paddingBottom:'5px'}}>
                                            {movie.media.map((m, i) => (
                                                <div key={i} style={{flexShrink:0, width:'80px'}}>
                                                    {m.type === 'image' ? (
                                                        <a href={m.url} target="_blank" rel="noreferrer"><img src={m.url} alt="Evidence" style={{width:'100%', height:'50px', objectFit:'cover', borderRadius:'3px', border:'1px solid #444'}} /></a>
                                                    ) : (
                                                        <a href={m.url} target="_blank" rel="noreferrer" style={{display:'block', width:'100%', height:'50px', background:'#222', color:'#fff', fontSize:'20px', textAlign:'center', lineHeight:'50px', borderRadius:'3px', border:'1px solid #444'}}>▶</a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(user.role === 'Cinephile' || user.role === 'Admin') && (
                                    <button 
                                        onClick={() => { setSelectedMovieForMedia(movie); setShowMediaModal(true); }}
                                        style={{width:'100%', background:'transparent', color:'#ccc', border:'1px solid #555', padding:'6px', fontSize:'11px', cursor:'pointer', marginTop:'5px', borderRadius: '3px', transition: 'all 0.2s'}}
                                        onMouseOver={(e) => {e.target.style.borderColor = '#E50914'; e.target.style.color = '#fff'}}
                                        onMouseOut={(e) => {e.target.style.borderColor = '#555'; e.target.style.color = '#ccc'}}
                                    >
                                        {t.addEvidenceBtn}
                                    </button>
                                )}
                                <div style={{marginTop: '8px', fontSize: '10px', color: '#555', textAlign:'right', fontStyle:'italic'}}>
                                    {t.addedBy} <span style={{color: '#888'}}>{movie.addedBy}</span>
                                </div>
                            </div>
                            </Popup>
                        </Marker>
                        ))}
                    </MarkerClusterGroup>
                )}
            </MapContainer>

            <div className="activity-feed-container">
                <div className="feed-header"><div className="blink-dot"></div>{t.feedTitle}</div>
                {feed.map((item, index) => (
                    <div key={index} className="feed-item" onClick={() => setMapCenter([item.coords[0], item.coords[1]])}>
                        <span className="feed-user">{item.user}</span> {item.action} <span className="feed-movie">{item.movie}</span> <span className="feed-loc">({item.location})</span>
                    </div>
                ))}
            </div>
          </>
        )}

        {(activeTab === 'list' || activeTab === 'watchlist') && (
          <div style={{ padding: '40px', color: 'white' }}>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                {activeTab === 'watchlist' ? t.myWatchlist : `${t.movieList} (${isNearbyActive ? 'On Location (1000km)' : selectedCountry})`}
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

      {showMediaModal && (
            <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999}}>
                <div style={{background:'#141414', padding:'20px', borderRadius:'8px', width:'300px', border:'1px solid #E50914', color:'white'}}>
                    <h3 style={{color:'#E50914', margin:'0 0 15px 0', fontSize:'16px'}}>{t.evidenceModalTitle}</h3>
                    <form onSubmit={handleAddMedia}>
                        <div style={{marginBottom:'10px'}}>
                            <label style={{display:'block', fontSize:'12px', color:'#aaa', marginBottom:'5px'}}>{t.evidenceType}</label>
                            <select value={mediaType} onChange={e=>setMediaType(e.target.value)} style={{width:'100%', padding:'8px', background:'#222', color:'white', border:'1px solid #444'}}>
                                <option value="image">{t.photo}</option>
                                <option value="video">{t.video}</option>
                            </select>
                        </div>
                        <input type="text" placeholder={t.evidencePlaceholder} value={mediaUrl} onChange={e=>setMediaUrl(e.target.value)} required style={{width:'100%', padding:'8px', background:'#222', color:'white', border:'1px solid #444', marginBottom:'15px'}} />
                        <div style={{display:'flex', gap:'10px'}}>
                            <button type="submit" style={{flex:1, background:'#E50914', color:'white', border:'none', padding:'10px', cursor:'pointer', fontWeight:'bold'}}>{t.submitEvidence}</button>
                            <button type="button" onClick={() => setShowMediaModal(false)} style={{flex:1, background:'#333', color:'white', border:'none', padding:'10px', cursor:'pointer'}}>{t.close}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

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