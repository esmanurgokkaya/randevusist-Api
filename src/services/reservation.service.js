const repo = require("../repositories/reservation.repository"); // 📦 Rezervasyonlara ait veritabanı işlemleri için repository import edilir

// ✅ Yeni rezervasyon oluştur
async function createReservation(data) {
  return await repo.create(data); // direkt olarak repo.create() fonksiyonunu çağırır
}

// ✅ Belirli bir rezervasyonu ID ile getir
async function getReservation(id) {
  return await repo.getById(id); // id'ye göre rezervasyon verisi döner
}

// ✅ Kullanıcının yaptığı tüm rezervasyonları getir
async function getReservationsByUser(userId) {
  return await repo.getByUser(userId); // userId ile eşleşen rezervasyonları getirir
}

// ✅ Rezervasyon güncelleme
async function updateReservation(id, data) {
  return await repo.update(id, data); // ID'ye göre ilgili rezervasyonu günceller
}

// ✅ Rezervasyon silme
async function deleteReservation(id) {
  return await repo.remove(id); // ID ile silme işlemi yapılır
}

// ✅ Filtreli arama + sayfalama
async function searchReservations(filters, page, limit) {
  return await repo.search(filters, page, limit); // örn: tarih, oda ID gibi filtrelerle arama
}

// 🟡 Alternatif isimle tek rezervasyon getir — `getReservationById` fonksiyonu aslında `getReservation` ile aynı işi yapar
// Geliştirici farklı isimlerde çağırmak istemiş olabilir
async function getReservationById(id) {
  return await repo.getById(id);
}

// 📤 Servis dışa aktarılır (controller kullanabilsin diye)
module.exports = {
  createReservation,
  getReservation,
  getReservationsByUser,
  updateReservation,
  deleteReservation,
  searchReservations,
  getReservationById,
};
