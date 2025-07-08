/**
 * @swagger
 * tags:
 *   - name: Room
 *     description: Oda işlemleri (oluştur, listele, sil vb.)
 */

const roomService = require('../services/room.service');
const z = require('zod');

// ✅ Oda doğrulama şeması
const roomSchema = z.object({
  name: z.string().min(2, "Oda adı en az 2 karakter olmalı."),
  description: z.string().optional(),
  capacity: z.number().int().min(1, "Kapasite pozitif tam sayı olmalı."),
  imageUrl: z.string().url("Geçerli bir görsel URL girin.").optional(),
  status: z.enum(["available", "maintenance", "unavailable"]).default("available")
});

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Tüm odaları getir
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: Oda listesi başarıyla getirildi
 *       500:
 *         description: Sunucu hatası
 */
const listRooms = async (req, res) => {
  try {
    const rooms = await roomService.listAllRooms();
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error("Oda listeleme hatası:", err);
    res.status(500).json({ success: false, message: "Odalar getirilemedi." });
  }
};

/**
 * @swagger
 * /rooms/search:
 *   get:
 *     summary: Oda araması yap (filtre + sayfalama)
 *     tags: [Room]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, maintenance, unavailable] }
 *     responses:
 *       200:
 *         description: Filtreli oda listesi
 *       500:
 *         description: Hata oluştu
 */
const searchRooms = async (req, res) => {
  const { page = 1, limit = 10, name, status } = req.query;
  const filters = {};

  if (name) filters.name = name;
  if (status) filters.status = status;

  try {
    const result = await roomService.searchRooms(filters, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Oda arama hatası:", err);
    res.status(500).json({ success: false, message: "Arama yapılamadı." });
  }
};

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Yeni oda oluştur
 *     tags: [Room]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, capacity]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               capacity: { type: integer }
 *               imageUrl: { type: string }
 *               status: { type: string, enum: [available, maintenance, unavailable] }
 *     responses:
 *       201:
 *         description: Oda oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       500:
 *         description: Sunucu hatası
 */
const createRoom = async (req, res) => {
  const validation = roomSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  try {
    const newRoom = await roomService.createRoom(validation.data);
    res.status(201).json({ success: true, data: newRoom });
  } catch (err) {
    console.error("Oda oluşturma hatası:", err);
    res.status(500).json({ success: false, message: "Oda oluşturulamadı." });
  }
};

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Odayı güncelle
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               capacity: { type: integer }
 *               imageUrl: { type: string }
 *               status: { type: string, enum: [available, maintenance, unavailable] }
 *     responses:
 *       200:
 *         description: Oda güncellendi
 *       400:
 *         description: Geçersiz veri
 *       500:
 *         description: Sunucu hatası
 */
const updateRoom = async (req, res) => {
  const { id } = req.params;
  const validation = roomSchema.partial().safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  try {
    const updated = await roomService.updateRoom(id, validation.data);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Oda güncelleme hatası:", err);
    res.status(500).json({ success: false, message: "Güncelleme başarısız." });
  }
};

/**
 * @swagger
 * /rooms/{id}/status:
 *   patch:
 *     summary: Oda durumunu güncelle
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [available, maintenance, unavailable] }
 *     responses:
 *       200:
 *         description: Durum güncellendi
 *       400:
 *         description: Geçersiz durum
 *       500:
 *         description: Güncelleme hatası
 */
const updateRoomStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["available", "maintenance", "unavailable"].includes(status)) {
    return res.status(400).json({ success: false, message: "Geçersiz durum." });
  }

  try {
    await roomService.changeStatus(id, status);
    res.json({ success: true, message: "Durum güncellendi." });
  } catch (err) {
    console.error("Durum güncelleme hatası:", err);
    res.status(500).json({ success: false, message: "Durum güncellenemedi." });
  }
};

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Oda sil
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Oda silindi
 *       500:
 *         description: Silme hatası
 */
const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    await roomService.deleteRoom(id);
    res.json({ success: true, message: "Oda silindi." });
  } catch (err) {
    console.error("Oda silme hatası:", err);
    res.status(500).json({ success: false, message: "Silme işlemi başarısız." });
  }
};

/**
 * @swagger
 * /rooms/{id}/image:
 *   patch:
 *     summary: Oda görselini güncelle
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [imageUrl]
 *             properties:
 *               imageUrl: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Görsel güncellendi
 *       400:
 *         description: Geçersiz URL
 *       500:
 *         description: Güncelleme hatası
 */
const updateRoomImage = async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;

  if (!imageUrl || !imageUrl.startsWith('http')) {
    return res.status(400).json({ success: false, message: "Geçerli bir görsel URL girin." });
  }

  try {
    const updated = await roomService.updateImage(id, imageUrl);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Görsel güncelleme hatası:", err);
    res.status(500).json({ success: false, message: "Görsel güncellenemedi." });
  }
};

/**
 * @swagger
 * /rooms/available:
 *   get:
 *     summary: Müsait odaları getir (status available)
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: Uygun odalar getirildi
 *       500:
 *         description: Hata oluştu
 */
const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await roomService.listRoomsByStatus("available");
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error("Uygun odalar getirilemedi:", err);
    res.status(500).json({ success: false, message: "Müsait odalar getirilemedi." });
  }
};

module.exports = {
  listRooms,
  searchRooms,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  updateRoomImage,
  getAvailableRooms
};
