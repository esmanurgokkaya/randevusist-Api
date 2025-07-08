const repo = require("../repositories/reservation.repository");

async function createReservation(data) {
  return await repo.create(data);
}

async function getReservation(id) {
  return await repo.getById(id);
}

async function getReservationsByUser(userId) {
  return await repo.getByUser(userId);
}

async function updateReservation(id, data) {
  return await repo.update(id, data);
}

async function deleteReservation(id) {
  return await repo.remove(id);
}

async function searchReservations(filters, page, limit) {
  return await repo.search(filters, page, limit);
}

module.exports = {
  createReservation,
  getReservation,
  getReservationsByUser,
  updateReservation,
  deleteReservation,
  searchReservations,
};
