const prisma = require('../config/prismaClient');

class RoomService {
  // 📦 Tüm odaları getir (Admin & User)
  async listAllRooms() {
    return await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 📊 Yalnızca belirli duruma sahip odaları getir (örneğin: "available")
  async listRoomsByStatus(status) {
    return await prisma.room.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🔍 Sayfa + filtreli oda arama (Admin Panel)
  async searchRooms(filters = {}, page = 1, limit = 10) {
    const where = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const skip = (page - 1) * limit;

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
      data: rooms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 🆕 Oda oluştur
  async createRoom(roomData) {
    return await prisma.room.create({ data: roomData });
  }

  // 📝 Odayı güncelle
  async updateRoom(id, updateData) {
    return await prisma.room.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  // 📸 Görsel URL güncelle
  async updateImage(id, imageUrl) {
    return await prisma.room.update({
      where: { id: Number(id) },
      data: { imageUrl },
    });
  }

  // 🔄 Durum güncelle
  async changeStatus(id, status) {
    return await prisma.room.update({
      where: { id: Number(id) },
      data: { status },
    });
  }

  // ❌ Odayı sil
  async deleteRoom(id) {
    return await prisma.room.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new RoomService();
 