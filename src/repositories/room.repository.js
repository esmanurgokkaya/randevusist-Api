const RoomModel = require('../models/room.model'); // prisma.R

class RoomRepository {
  /**
   * Tüm odaları getir (isteğe bağlı filtre ile)
   */
  async getAllRooms(filter = {}) {
    return await RoomModel.findMany({
      where: filter,
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Oda ID'sine göre getir
   */
  async getRoomById(id) {
    return await RoomModel.findUnique({
      where: { id: Number(id) }
    });
  }

  /**
   * Yeni oda oluştur
   */
  async createRoom(data) {
    return await RoomModel.create({ data });
  }

  /**
   * Odayı güncelle
   */
  async updateRoom(id, data) {
    return await RoomModel.update({
      where: { id: Number(id) },
      data
    });
  }

  /**
   * Odayı sil
   */
  async deleteRoom(id) {
    return await RoomModel.delete({
      where: { id: Number(id) }
    });
  }

  /**
   * Belirli bir duruma sahip odaları getir (örnek: sadece aktif odalar)
   */
  async getRoomsByStatus(status) {
    return await RoomModel.findMany({
      where: { status },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Sayfalı (paginated) oda listeleme + filtre
   */
  async searchRooms(filters = {}, page = 1, limit = 10) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive'
      };
    }

    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      RoomModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      RoomModel.count({ where })
    ]);

    return {
      data: rooms,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Belirli bir kapasiteye uygun odaları getir
   */
  async getRoomsByMinimumCapacity(minCapacity) {
    return await RoomModel.findMany({
      where: {
        capacity: { gte: minCapacity },
        status: 'available'
      },
      orderBy: { capacity: 'asc' }
    });
  }

  /**
   * Oda görselini güncelle
   */
  async updateRoomImage(id, imageUrl) {
    return await RoomModel.update({
      where: { id: Number(id) },
      data: { imageUrl }
    });
  }

  /**
   * Oda durumunu değiştir (örneğin bakım → aktif)
   */
  async changeRoomStatus(id, status) {
    return await RoomModel.update({
      where: { id: Number(id) },
      data: { status }
    });
  }
}

module.exports = new RoomRepository();
 