// --- EN ÜSTE EKLENECEK ---
const Route = require('./models/Route'); 

// ... (Mevcut kodlar) ...

// --- BU KISMI SERVER.JS İÇİNE, DİĞER ROTALARIN YANINA EKLE ---

// 1. Tüm Rotaları Getir
app.get('/api/routes', async (req, res) => {
  try {
    const routes = await Route.find();
    res.status(200).json(routes);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. Yeni Rota Ekle (Çizgi Oluştur)
app.post('/api/routes', async (req, res) => {
  try {
    const newRoute = new Route(req.body);
    const savedRoute = await newRoute.save();
    res.status(200).json(savedRoute);
  } catch (err) {
    console.error(err); // Hatayı terminale yazdır
    res.status(500).json(err);
  }
});