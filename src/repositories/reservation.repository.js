const ReservationModel = require('../models/reservation.model'); // prisma.R

async function create(data) {
  return ReservationModel.create({ data });
}

async function getById(id) {
  return ReservationModel.findUnique({ where: { id } });
}

async function getByUser(userId) {
  return ReservationModel.findMany({
    where: {
      users: {
        equals: [userId], // JSON'da birebir eşleşme
      },
    },
    orderBy: { startDate: 'desc' }
  });
}

async function search(filters = {}, page = 1, limit = 10) {
  const where = {};

  if (filters.roomId) where.roomId = filters.roomId;
  if (filters.userId) where.users = { equals: [filters.userId] };
  if (filters.startDate) where.startDate = { gte: new Date(filters.startDate) };
  if (filters.endDate) where.startDate = { lte: new Date(filters.endDate) };

  return ReservationModel.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { startDate: "desc" },
  });
}

async function update(id, data) {
  return ReservationModel.update({
    where: { id },
    data,
  });
}

async function remove(id) {
  return ReservationModel.delete({ where: { id } });
}

module.exports = {
  create,
  getById,
  getByUser,
  update,
  remove,
  search,
};
