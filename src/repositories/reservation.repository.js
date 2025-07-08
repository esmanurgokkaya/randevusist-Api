// ReservationModel üzerinden veri tabanı işlemleri için CRUD metodları tanımlanıyor
const ReservationModel = require('../models/reservation.model'); // prisma.reservation tablosu referansı

// 🟢 Yeni rezervasyon oluşturma
async function create(data) {
  return ReservationModel.create({ data }); // Gelen verileri kullanarak rezervasyon oluştur
}

// 🔵 Belirli bir rezervasyonu ID ile getir
async function getById(id) {
  return ReservationModel.findUnique({
    where: {
      id: Number(id), // Prisma Int türü beklediğinden string olan id'yi sayıya dönüştürüyoruz
    },
  });
}

// 🟢 Belirli kullanıcıya ait rezervasyonları getir
async function getByUser(userId) {
  return ReservationModel.findMany({
    where: {
      users: {
        equals: [userId], // JSON array içinde birebir eşleşme aranıyor
      },
    },
    orderBy: { date: 'desc' }, // Tarihe göre azalan sırada getir
  });
}

// 🔍 Arama işlemleri: tarih, oda, kullanıcıya göre filtreleme + pagination
async function search(filters = {}, page = 1, limit = 10) {
  const where = {};

  if (filters.roomId) where.roomId = filters.roomId; // Oda ID'si filtreleniyor
  if (filters.userId) where.users = { equals: [filters.userId] }; // Kullanıcı ID eşleşmesi
  if (filters.date) where.date = { gte: new Date(filters.date) }; // Belirli tarihten sonra
  if (filters.endDate) where.date = { lte: new Date(filters.endDate) }; // Belirli tarihe kadar

  return ReservationModel.findMany({
    where,
    skip: (page - 1) * limit, // Sayfalama için atlanacak veri
    take: limit,              // Her sayfada gösterilecek veri miktarı
    orderBy: { date: "desc" }, // Tarihe göre azalan sıralama
  });
}

// 🟡 Rezervasyonu güncelleme işlemi
async function update(id, data) {
  return ReservationModel.update({
    where: { id: Number(id) }, // ID'yi sayıya dönüştürüp eşleşen rezervasyonu güncelle
    data,
  });
}

// 🔴 Rezervasyonu silme işlemi
async function remove(id) {
  return ReservationModel.delete({
    where: { id: Number(id) }, // ID’ye göre rezervasyonu sil
  });
}

// Tüm metodlar dışa aktarılıyor
module.exports = {
  create,
  getById,
  getByUser,
  update,
  remove,
  search,
};
