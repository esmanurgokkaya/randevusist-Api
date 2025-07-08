// 📦 Room tablosuyla ilgili veritabanı işlemleri
const RoomModel = require('../models/room.model'); // prisma.room

class RoomRepository {
  /**
   * 🔍 Tüm odaları getirir (opsiyonel filtre ile)
   * Örn: { status: 'available' } gibi filtreler verilebilir
   */
  async getAllRooms(filter = {}) {
    return await RoomModel.findMany({
      where: filter,
      orderBy: { name: 'asc' }, // Oda ismine göre sıralama
    });
  }

  /**
   * 🔍 Oda ID’si ile tek bir oda getirir
   */
  async getRoomById(id) {
    return await RoomModel.findUnique({
      where: { id: Number(id) }, // String gelirse Number’a çevir
    });
  }

  /**
   * ➕ Yeni oda oluşturur
   */
  async createRoom(data) {
    return await RoomModel.create({ data });
  }

  /**
   * 📝 Belirli bir odayı günceller
   */
  async updateRoom(id, data) {
    return await RoomModel.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * ❌ Odayı siler
   */
  async deleteRoom(id) {
    return await RoomModel.delete({
      where: { id: Number(id) },
    });
  }

  /**
   * 🟢 Belirli bir duruma sahip (örneğin sadece "available") odaları getirir
   */
  async getRoomsByStatus(status) {
    return await RoomModel.findMany({
      where: { status },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * 🔍 Oda arama: filtre + pagination
   * - name: içerdiği isme göre arama
   * - status: mevcut duruma göre filtre
   * - pagination: sayfa ve limit ile veri kontrolü
   */
  async searchRooms(filters = {}, page = 1, limit = 10) {
    const where = {};

    // Filtreleme koşulları
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.name) {
      where.name = {
        contains: filters.name, // İçeren isimler (LIKE '%...%')
        mode: 'insensitive', // Büyük/küçük harf duyarsız
      };
    }

    const skip = (page - 1) * limit;

    // Aynı anda veri ve toplam sayıyı al
    const [rooms, total] = await Promise.all([
      RoomModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      RoomModel.count({ where }),
    ]);

    return {
      data: rooms,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 🔎 Minimum kapasiteye sahip ve uygun (available) odaları getir
   */
  async getRoomsByMinimumCapacity(minCapacity) {
    return await RoomModel.findMany({
      where: {
        capacity: { gte: minCapacity }, // "capacity >= minCapacity"
        status: 'available',
      },
      orderBy: { capacity: 'asc' }, // Kapasiteye göre küçükten büyüğe sırala
    });
  }

  /**
   * 🖼️ Odaya ait görsel URL’sini güncelle
   */
  async updateRoomImage(id, imageUrl) {
    return await RoomModel.update({
      where: { id: Number(id) },
      data: { imageUrl },
    });
  }

  /**
   * 🔁 Oda durumunu değiştir (örneğin "maintenance" → "available")
   */
  async changeRoomStatus(id, status) {
    return await RoomModel.update({
      where: { id: Number(id) },
      data: { status },
    });
  }
}

// Singleton export: her yerden erişilebilir tek bir nesne
module.exports = new RoomRepository();
