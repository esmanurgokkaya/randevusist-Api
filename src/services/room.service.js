const prisma = require('../config/prismaClient');

class RoomService {
  // 📦 Tüm odaları getir (Admin & User)
  // Tüm oda kayıtlarını "en yeni oluşturulandan en eskiye" sıralayarak getirir.
  async listAllRooms() {
    return await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 📊 Belirli bir duruma sahip odaları getir (örn: available)
  // Durum bilgisine göre filtreleme yapar (örn: sadece boşta olan odalar)
  async listRoomsByStatus(status) {
    return await prisma.room.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🔍 Arama ve sayfalama (Admin Panel için)
  // Oda adında arama yapabilir, durum filtresi uygulayabilir ve sayfa bazlı veri döner
  async searchRooms(filters = {}, page = 1, limit = 10) {
    const where = {}; // filtre kriterlerini toplar

    if (filters.name) {
      // Oda adında arama yap
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters.status) {
      where.status = filters.status; // Duruma göre filtrele
    }

    const skip = (page - 1) * limit; // sayfalama için başlangıç

    // Aynı anda odaları ve toplam sayıyı getirir
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.room.count({ where }),
    ]);

    return {
      data: rooms,         // gelen oda verileri
      total,               // toplam sonuç sayısı
      page,                // şu anki sayfa
      limit,               // sayfa başına kaç kayıt var
      totalPages: Math.ceil(total / limit), // toplam sayfa sayısı
    };
  }

  // 🆕 Yeni oda oluştur
  // Admin panelinden yeni oda kaydı eklemek için kullanılır
  async createRoom(roomData) {
    return await prisma.room.create({ data: roomData });
  }

  // 📝 Odayı güncelle
  // Belirli bir odanın bilgilerini (isim, kapasite vb.) günceller
  async updateRoom(id, updateData) {
    return await prisma.room.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  // 📸 Görsel URL güncelle
  // Odaya ait görseli değiştirmek için
  async updateImage(id, imageUrl) {
    return await prisma.room.update({
      where: { id: Number(id) },
      data: { imageUrl },
    });
  }

  // 🔄 Durum güncelle
  // Odanın kullanım durumunu değiştirir (örneğin: bakımda → aktif)
  async changeStatus(id, status) {
    return await prisma.room.update({
      where: { id: Number(id) },
      data: { status },
    });
  }

  // ❌ Odayı sil
  // Admin panelinden odanın tamamen veritabanından silinmesi
  async deleteRoom(id) {
    return await prisma.room.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new RoomService();
