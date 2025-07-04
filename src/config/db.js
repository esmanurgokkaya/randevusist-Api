const mysql = require('mysql2');
require('dotenv').config();

const conn = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    port: Number(process.env.DB_PORT),
    password : process.env.DB_PASSWORD || null,
    database : process.env.DB_NAME
});

conn.connect((err) => {
    if(err){
        console.error("hata",err);
        return;
    }
    console.log("başarılı");
});

module.exports = conn;