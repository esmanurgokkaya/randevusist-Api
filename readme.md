bu proje v2 gibi olacak proje modern bir yapıya getirilecek paketler en güncel optimize olanlar kullanılacak yeni özellikler getirilecek

1) ana projeyi geçir patternı uygula

2) prisma ekle db işlerini başka kullanıcılar için otomotikleştir

3) yeni özellikleri ekle 
    3.1) admin panel 
    3.2) çalışan ? panel 
    3.3) şifremi unuttum
    3.4) site içi bildirim
    3.5) odaya kullanıcı ekleyebilme
    3.6) oda ve kullanıcı resimleri 
    3.7) kullanıcı arama ?? ya da kullanıcı eklerken mail ile ekleme ve o kullanıcılara mail gönderme
    3.8) panel istatistik 
    3.9) oda boşa alma gibi işlemler kullanılamaz vs 
    3.10) çalışan tarafından rezervasyon ekleme
    3.11) log yapısı kur 
    


    Tüm endpointlerini **Scalerr, Postman, Insomnia veya benzeri bir REST istemcisi** ile test edebilmen için sana:

---

### ✅ GEREKLİ ARAÇLAR / DOSYALAR:

1. **.env dosyasındaki bilgiler doğru mu?**
2. **Server çalışıyor mu (`node index.js`)**
3. **Prisma DB ve migration tamamlandı mı**
4. **Seed ile kullanıcılar ve odalar eklendi mi**
5. **JWT token işlemleri düzgün mü**
6. **Endpointlerin URL path ve method’ları doğru mu**

---

### ✅ TEST SIRASI (Doğru akış)

---

## 🔐 1. AUTH (JWT) – `/api/auth`

#### ➤ POST `/api/auth/register`

```json
{
  "name": "Mehmet",
  "lastname": "Demir",
  "email": "mehmet@example.com",
  "phone": "5553331122",
  "password": "123456"
}
```

#### ➤ POST `/api/auth/login`

```json
{
  "email": "mehmet@example.com",
  "password": "123456"
}
```

✅ Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJrefresh..."
}
```

🛑 Bu `accessToken` ile aşağıdaki işlemlere devam edeceksin.

#### ➤ POST `/api/auth/refresh`

```json
{
  "refreshToken": "...."
}
```

#### ➤ POST `/api/auth/logout`

```json
{
  "refreshToken": "...."
}
```

---

## 👤 2. USER (profil) – `/api/users`

🟢 Tüm işlemlerde **Header’a** `Authorization: Bearer <accessToken>` eklemeyi **UNUTMA.**

#### ➤ GET `/api/users/me`

#### ➤ PUT `/api/users/me`

```json
{
  "name": "Mehmet",
  "lastname": "Demir",
  "phone": "5550001112"
}
```

#### ➤ DELETE `/api/users/me`

---

## 🏠 3. ROOM (Oda) – `/api/rooms`

#### ➤ GET `/api/rooms`

Tüm odaları getirir (public)

#### ➤ GET `/api/rooms/available`

Sadece `status = available` olan odaları getirir

#### ➤ GET `/api/rooms/search?name=Zemin`

**Admin role gerekir.** `Authorization: Bearer <adminToken>`

#### ➤ POST `/api/rooms`

```json
{
  "name": "2. Kat",
  "description": "Sessiz alan",
  "capacity": 6,
  "floor": 2,
  "status": "available"
}
```

#### ➤ PUT `/api/rooms/:id`

```json
{
  "name": "Güncellenmiş İsim",
  "capacity": 12
}
```

#### ➤ PATCH `/api/rooms/:id/status`

```json
{
  "status": "maintenance"
}
```

#### ➤ PATCH `/api/rooms/:id/image`

→ `Form-Data` içeriği:
`image`: \[dosya seç]

#### ➤ DELETE `/api/rooms/:id`

---

## 📅 4. RESERVATIONS – `/api/reservations`

🟢 Token zorunlu.

#### ➤ POST `/api/reservations`

```json
{
  "roomId": 1,
  "startDate": "2025-07-10",
  "startTime": "10:00",
  "endTime": "12:00"
}
```

#### ➤ GET `/api/reservations/me`

#### ➤ GET `/api/reservations/:id`

#### ➤ PUT `/api/reservations/:id`

```json
{
  "roomId": 1,
  "startDate": "2025-07-10",
  "startTime": "13:00",
  "endTime": "14:00"
}
```

#### ➤ DELETE `/api/reservations/:id`

#### ➤ GET `/api/reservations?date=2025-07-10&roomId=1`

---

## ✅ GEREKLİ HEADERS (her request’e ekle):

```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

---

### 🧪 TAVSİYE:

Scalerr ya da Postman kullanıyorsan:

* Otomatik test için: `Postman Collection` yapabilirim.
* `Token`ı environment’a ekleyip tüm testlerde kullan.
* Hatalarda `console.log`, `statusCode` ve `req.body` kontrollerini unutma.

İstersen tüm bu testler için **hazır bir `scalerr.json` ya da Postman Collection** da hazırlayabilirim. Onu ister misin?
