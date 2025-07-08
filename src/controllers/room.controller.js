const roomService = require('../services/room.service');
const z = require('zod');

// 🧪 Oda oluşturma ve güncelleme için doğrulama şeması
const roomSchema = z.object({
  name: z.string().min(2, "Oda adı en az 2 karakter olmalı."),
  description: z.string().optional(),
  capacity: z.number().int().min(1, "Kapasite pozitif tam sayı olmalı."),
  imageUrl: z.string().url("Geçerli bir görsel URL girin.").optional(),
  status: z.enum(["available", "maintenance", "unavailable"]).default("available")
});


// 🔍 Tüm odaları listele (Admin & User)
const listRooms = async (req, res) => {
  try {
    const rooms = await roomService.listAllRooms();
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error("Oda listeleme hatası:", err);
    res.status(500).json({ success: false, message: "Odalar getirilemedi." });
  }
};

// 📦 Sayfalı ve filtreli arama (Admin Panel)
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

// 🆕 Yeni oda oluştur (Admin)
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

// 📝 Oda güncelle (Admin)
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

// 🔄 Oda durumunu güncelle (Admin)
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

// ❌ Oda sil (Admin)
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

// 📸 Oda görseli güncelle (Admin)
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

// 📊 Kullanıcılara uygun (müsait) odaları getir (User tarafı)
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
 