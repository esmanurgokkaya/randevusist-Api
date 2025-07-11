import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,              // 5 eş-zamanlı sanal kullanıcı
  iterations: 5,       // her VU 1 kez çalışsın
};

const BASE = 'http://localhost:3001';

export default function () {
  /* 1️⃣  Register */
  const uid   = __VU;                          // 1…5
  const email = `test${uid}@example.com`;

  const registerRes = http.post(`${BASE}/auth/register`, JSON.stringify({
    name: `User${uid}`,
    lastname: 'Test',
    email,
    phone: '5550000000',
    password: 'Passw0rd!',                      // Zod kurallarına tam uyumlu
  }), { headers: { 'Content-Type': 'application/json' } });

  console.log(`REGISTER ${uid}:`, registerRes.status);

  /* 2️⃣  Login */
  const loginRes = http.post(`${BASE}/auth/login`, JSON.stringify({
    email,
    password: 'Passw0rd!',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'login 200': r => r.status === 200 });
  const token = loginRes.json('accessToken');
  console.log(`LOGIN ${uid}:`, loginRes.status);

  /* 3️⃣  Reservation */
  const reserveRes = http.post(`${BASE}/reservations/reservations`, JSON.stringify({
    roomId: 1,                                     // mevcut oda ID’si
    date: new Date().toISOString().slice(0, 10),   // yyyy-MM-dd
    startTime: '10:00',
    endTime: '12:00',
  }), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  check(reserveRes, { 'reserve 201': r => r.status === 201 });
  console.log(`RESERVE ${uid}:`, reserveRes.status);

  sleep(1);                                       // VU bitmeden 1 sn bekle
}
