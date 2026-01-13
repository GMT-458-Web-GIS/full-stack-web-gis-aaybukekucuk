import React, { useState, useEffect } from 'react';
import './App.css'; 
import { useLanguage } from './LanguageContext'; // YENİ

const AddMovie = ({ onMovieAdded, currentUser }) => {
  const { t } = useLanguage(); // YENİ
  const [mode, setMode] = useState('search'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [manualData, setManualData] = useState({ title: '', director: '', year: '', genre: '', imdb: '', poster: '' });
  const [movieData, setMovieData] = useState(null); 
  const [allLocations, setAllLocations] = useState([]); 
  const [countries, setCountries] = useState([]); 
  const [cities, setCities] = useState([]);       
  const [selectedCountry, setSelectedCountry] = useState(''); 
  const [selectedCity, setSelectedCity] = useState(''); 
  const [customCity, setCustomCity] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(''); 

  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
            const sortedCountries = data.data.sort((a, b) => a.country.localeCompare(b.country));
            setAllLocations(sortedCountries);
            setCountries(sortedCountries.map(c => c.country));
            const defaultCountry = sortedCountries.find(c => c.country === "Turkey") ? "Turkey" : sortedCountries[0].country;
            setSelectedCountry(defaultCountry);
        }
      })
      .catch(err => console.error("Location API Error:", err));
  }, []);

  useEffect(() => {
    if (selectedCountry && allLocations.length > 0) {
        const countryData = allLocations.find(c => c.country === selectedCountry);
        if (countryData) {
            const sortedCities = countryData.cities.sort(); 
            setCities(sortedCities);
            setSelectedCity(sortedCities[0]); 
        }
    }
  }, [selectedCountry, allLocations]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true); setSearchResults([]); setMovieData(null); setStatusMsg('...');
    try {
      const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&apikey=fff2b072`);
      const data = await response.json();
      if (data.Response === "True") {
        setSearchResults(data.Search); setStatusMsg('');
      } else { setStatusMsg('Movie not found.'); }
    } catch (error) { console.error("Error:", error); }
    setLoading(false);
  };

  const selectMovie = async (imdbID) => {
    setLoading(true); setSearchResults([]);
    try {
      const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=fff2b072`);
      const data = await response.json();
      if (data.Response === "True") { setMovieData(data); setStatusMsg(''); }
    } catch (error) { console.error("Detail Error:", error); }
    setLoading(false);
  };

  const handleSave = async () => {
    let finalMovie = {};
    if (mode === 'manual') {
        if (!manualData.title || !manualData.director || !manualData.year) return alert(t.fillAll);
        finalMovie = { Title: manualData.title, Director: manualData.director, Year: manualData.year, Genre: manualData.genre || "Unknown", imdbRating: manualData.imdb || "0", Poster: manualData.poster || "N/A" };
    } else {
        if (!movieData) return;
        finalMovie = movieData;
    }

    const finalCity = selectedCity === "Other" ? customCity : selectedCity;
    if (!finalCity) return;

    setStatusMsg('Finding coordinates...');
    let coords = null;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${finalCity}, ${selectedCountry}`);
      const data = await response.json();
      if (data && data.length > 0) coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (err) { console.error(err); }

    if (!coords) { alert(t.notFound); setStatusMsg(''); return; }

    const newMovie = {
      title: finalMovie.Title, director: finalMovie.Director, year: parseInt(finalMovie.Year), genre: finalMovie.Genre, imdb: parseFloat(finalMovie.imdbRating) || 0,
      poster: (finalMovie.Poster && finalMovie.Poster !== "N/A") ? finalMovie.Poster : "https://via.placeholder.com/300x450?text=No+Poster",
      country: selectedCountry, city: finalCity, coordinates: coords, addedBy: currentUser.username 
    };

    try {
      const response = await fetch('http://localhost:5000/api/movies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMovie) });
      if (response.ok) {
        alert(t.movieAdded); onMovieAdded(coords); 
        setMovieData(null); setSearchTerm(''); setStatusMsg(''); setManualData({title: '', director: '', year: '', genre: '', imdb: '', poster: ''}); setMode('search');
      }
    } catch (error) { alert("Server Error!"); }
  };

  return (
    <div className="add-movie-panel" style={{ padding: '20px', background: '#1a1a1a', marginTop: '20px', borderTop: '2px solid #E50914' }}>
      <h3 style={{ color: '#E50914', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px', display:'flex', justifyContent:'space-between' }}>
        {t.addMovieTitle}
        <button onClick={() => { setMode(mode === 'search' ? 'manual' : 'search'); setStatusMsg(''); setMovieData(null); }} style={{fontSize: '10px', background: 'transparent', border: '1px solid #666', color: '#ccc', cursor: 'pointer', padding: '2px 8px'}}>
            {mode === 'search' ? t.manualBtn : t.searchModeBtn}
        </button>
      </h3>
      
      {mode === 'search' && (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} style={{ flex: 1, padding: '10px', background: '#333', border: '1px solid #444', color: 'white' }} />
                <button onClick={handleSearch} style={{ background: '#E50914', color: 'white', border: 'none', padding: '0 15px', cursor: 'pointer' }}>{loading ? '...' : t.searchBtn}</button>
            </div>
            
            {statusMsg === 'Movie not found.' && (
                <div style={{marginBottom: '15px', color: '#ccc', fontSize: '12px'}}>
                    {t.notFound} <span onClick={() => setMode('manual')} style={{color: '#E50914', cursor: 'pointer', textDecoration: 'underline'}}>{t.addManually}</span>
                </div>
            )}

            {searchResults.length > 0 && (
                <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#222', borderRadius: '4px', marginBottom: '15px', border: '1px solid #444' }}>
                    {searchResults.map((movie) => (
                        <div key={movie.imdbID} onClick={() => selectMovie(movie.imdbID)} className="search-result-item" style={{ padding: '10px', borderBottom: '1px solid #333', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <img src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/30" } alt="poster" style={{width: '30px', height: '45px', objectFit: 'cover'}} />
                            <div><div style={{color: 'white', fontSize: '0.9rem'}}>{movie.Title}</div><div style={{color: '#888', fontSize: '0.8rem'}}>{movie.Year}</div></div>
                        </div>
                    ))}
                </div>
            )}
          </>
      )}

      {mode === 'manual' && (
          <div style={{display: 'grid', gap: '10px', marginBottom: '20px', animation: 'fadeIn 0.5s'}}>
              <input type="text" placeholder={t.mTitle} value={manualData.title} onChange={e => setManualData({...manualData, title: e.target.value})} style={{padding: '10px', background: '#333', border: '1px solid #444', color: 'white'}} />
              <div style={{display: 'flex', gap: '10px'}}>
                <input type="text" placeholder={t.mDirector} value={manualData.director} onChange={e => setManualData({...manualData, director: e.target.value})} style={{flex: 1, padding: '10px', background: '#333', border: '1px solid #444', color: 'white'}} />
                <input type="number" placeholder={t.mYear} value={manualData.year} onChange={e => setManualData({...manualData, year: e.target.value})} style={{width: '80px', padding: '10px', background: '#333', border: '1px solid #444', color: 'white'}} />
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <input type="text" placeholder={t.mGenre} value={manualData.genre} onChange={e => setManualData({...manualData, genre: e.target.value})} style={{flex: 1, padding: '10px', background: '#333', border: '1px solid #444', color: 'white'}} />
                <input type="number" placeholder="IMDb" step="0.1" value={manualData.imdb} onChange={e => setManualData({...manualData, imdb: e.target.value})} style={{width: '80px', padding: '10px', background: '#333', border: '1px solid #444', color: 'white'}} />
              </div>
              <input type="text" placeholder={t.mPoster} value={manualData.poster} onChange={e => setManualData({...manualData, poster: e.target.value})} style={{padding: '10px', background: '#333', border: '1px solid #444', color: 'white', fontSize: '11px'}} />
          </div>
      )}

      {statusMsg && mode === 'search' && statusMsg !== 'Movie not found.' && <p style={{ fontSize: '12px', color: '#ccc', fontStyle: 'italic' }}>{statusMsg}</p>}

      {movieData && mode === 'search' && (
        <div style={{ background: '#222', padding: '10px', borderRadius: '5px', marginBottom: '15px', display: 'flex', gap: '10px' }}>
            <img src={movieData.Poster !== "N/A" ? movieData.Poster : "https://via.placeholder.com/60x90"} alt="Poster" style={{ width: '40px', height: '60px', objectFit: 'cover' }} />
            <div><strong style={{ color: 'white', display: 'block' }}>{movieData.Title}</strong><small style={{ color: '#ccc' }}>{movieData.Year} • {movieData.Director}</small></div>
        </div>
      )}

      {(movieData || mode === 'manual') && (
        <div style={{ display: 'grid', gap: '10px', borderTop: '1px solid #333', paddingTop: '15px' }}>
            <label style={{ color: '#E50914', fontSize: '12px', fontWeight: 'bold' }}>{t.location}</label>
            <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #444' }}>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #444' }}>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Other">{t.otherCity}</option>
            </select>
            {selectedCity === "Other" && (
              <input type="text" placeholder={t.typeCity} value={customCity} onChange={e => setCustomCity(e.target.value)} style={{ padding: '10px', background: '#444', color: 'white', border: '1px solid #E50914' }} />
            )}
            <button onClick={handleSave} style={{ width: '100%', background: '#28a745', color: 'white', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>{t.saveFly}</button>
        </div>
      )}
    </div>
  );
};
export default AddMovie;