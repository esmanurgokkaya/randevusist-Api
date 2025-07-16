const db = require("../config/db");

/**
 * Dil bazlı odaları getirir
 * @param {string} locale Dil kodu (ör: 'tr', 'en')
 */
const getAllRooms = async (locale = 'tr') => {
  const query = `
    SELECT r.id, rt.name, r.cover, r.status
    FROM rooms r
    LEFT JOIN room_translations rt ON r.id = rt.room_id AND rt.locale = ?
  `;
  const [rows] = await db.execute(query, [locale]);
  return rows;
};

/**
 * Yeni oda oluşturur, önce rooms tablosuna ekler,
 * sonra çevirisini room_translations'a ekler
 * @param {string} cover Görsel yolu
 * @param {string} status Oda durumu
 * @param {Object} translations { locale: name } şeklinde ör: { tr: "Oda 101", en: "Room 101" }
 */
const createRoom = async (cover, status, translations) => {
  // 1) rooms tablosuna ekle
  const [result] = await db.execute(
    `INSERT INTO rooms (cover, status) VALUES (?, ?)`,
    [cover, status]
  );
  const roomId = result.insertId;

  // 2) translations ekle
  const translationInserts = Object.entries(translations).map(
    ([locale, name]) => [roomId, locale, name]
  );

  await db.query(
    `INSERT INTO room_translations (room_id, locale, name) VALUES ?`,
    [translationInserts]
  );

  return { id: roomId, cover, status, translations };
};

/**
 * Odayı günceller (rooms ve room_translations)
 */
const updateRoomById = async (id, cover, status, translations) => {
  // rooms tablosunu güncelle
  const [result] = await db.execute(
    `UPDATE rooms SET cover = ?, status = ? WHERE id = ?`,
    [cover, status, id]
  );

  // translations güncelle / insert işlemi
  for (const [locale, name] of Object.entries(translations)) {
    // Eğer var ise update, yoksa insert yap
    const [rows] = await db.execute(
      `SELECT id FROM room_translations WHERE room_id = ? AND locale = ?`,
      [id, locale]
    );
    if (rows.length > 0) {
      await db.execute(
        `UPDATE room_translations SET name = ? WHERE room_id = ? AND locale = ?`,
        [name, id, locale]
      );
    } else {
      await db.execute(
        `INSERT INTO room_translations (room_id, locale, name) VALUES (?, ?, ?)`,
        [id, locale, name]
      );
    }
  }

  return result;
};

const deleteRoomById = async (id) => {
  // room_translations için CASCADE silme ayarlı ise direkt rooms tablosunu silmek yeterlidir.
  const [result] = await db.execute(`DELETE FROM rooms WHERE id = ?`, [id]);
  return result;
};

module.exports = {
  getAllRooms,
  createRoom,
  updateRoomById,
  deleteRoomById,
};
