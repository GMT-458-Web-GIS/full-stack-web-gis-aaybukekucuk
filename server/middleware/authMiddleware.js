// Mekan silme veya güncelleme rotasında:
app.delete('/api/locations/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Token'dan gelen user id
    const userRole = req.user.role; // Token'dan gelen role
  
    // Veritabanından bu noktayı kimin eklediğine bakalım
    const location = await pool.query('SELECT user_id FROM locations WHERE id = $1', [id]);
  
    if (location.rows.length === 0) return res.status(404).send("Mekan bulunamadı.");
  
    // EĞER SİLMEK İSTEYEN KİŞİ:
    // 1. Verinin sahibi değilse VE 
    // 2. Admin değilse -> İZİN VERME
    if (location.rows[0].user_id !== userId && userRole !== 'Admin') {
      return res.status(403).json({ message: "Bu işlemi sadece veri sahibi veya Admin yapabilir." });
    }
  
    await pool.query('DELETE FROM locations WHERE id = $1', [id]);
    res.json({ message: "Başarıyla silindi." });
  });