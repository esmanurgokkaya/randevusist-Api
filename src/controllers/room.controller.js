const roomService = require('../services/room.service');
const z = require('zod'); // Gelen verilerin doğruluğunu kontrol etmek için kullanılır

// 🧪 Oda oluşturma ve güncelleme işlemlerinde gelen verileri kontrol etmek için bir şema tanımlıyoruz
const roomSchema = z.object({
  name: z.string().min(2, "Oda adı en az 2 karakter olmalı."),
  description: z.string().optional(),
  capacity: z.number().int().min(1, "Kapasite pozitif tam sayı olmalı."),
  imageUrl: z.string().url("Geçerli bir görsel URL girin.").optional(),
  status: z.enum(["available", "maintenance", "unavailable"]).default("available")
});

// 🔍 Tüm odaları getirir (Admin ve kullanıcılar görür)
const listRooms = async (req, res) => {
  try {
    const rooms = await roomService.listAllRooms();
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error("Oda listeleme hatası:", err);
    res.status(500).json({ success: false, message: "Odalar getirilemedi." });
  }
};

// 📦 Oda araması yapar, filtreleme ve sayfalama destekler (admin panel için)
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

// 🆕 Yeni oda ekler (sadece admin tarafından yapılabilir)
const createRoom = async (req, res) => {
  const validation = roomSchema.safeParse(req.body); // Gelen veri şemaya uygun mu kontrol eder
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

// 📝 Mevcut bir odayı günceller (admin)
const updateRoom = async (req, res) => {
  const { id } = req.params;
  const validation = roomSchema.partial().safeParse(req.body); // Güncelleme için tüm alanlar zorunlu değil
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

// 🔄 Odanın durumunu günceller (örneğin: "maintenance", "available" gibi)
const updateRoomStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Geçerli status değilse reddet
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

// ❌ Odayı siler (admin)
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

// 📸 Odanın görsel URL’ini günceller (admin)
const updateRoomImage = async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;

  // Basit URL kontrolü
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

// 📊 Kullanıcı arayüzünde sadece "available" (müsait) odaları gösterir
const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await roomService.listRoomsByStatus("available");
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error("Uygun odalar getirilemedi:", err);
    res.status(500).json({ success: false, message: "Müsait odalar getirilemedi." });
  }
};

// Dışa aktarım
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
