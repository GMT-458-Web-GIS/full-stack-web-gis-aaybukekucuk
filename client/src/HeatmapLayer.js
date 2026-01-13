import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heatData = points.map(p => [p.coordinates.lat, p.coordinates.lng, 1]);

    const heat = L.heatLayer(heatData, {
      radius: 30, // Biraz daha geniş ve yumuşak
      blur: 20,   
      maxZoom: 10,
      
      // --- TAMAMEN KIRMIZI/ATEŞ PALETİ ---
      gradient: {
        0.0: 'rgba(255, 0, 0, 0)',   // Tam şeffaf başlangıç
        0.4: 'rgba(229, 9, 20, 0.5)', // Hafif kırmızı
        0.7: '#E50914',               // Netflix Kırmızısı
        1.0: '#FFFFFF'                // En sıcak nokta BEYAZ (Kor ateş)
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);

  return null;
};

export default HeatmapLayer;