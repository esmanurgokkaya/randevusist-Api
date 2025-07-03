const db = require('../config/db.js');

const createUser = (username, email, password, callback) => {
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, password], callback);

};

// email ile 

const findUserByEmail = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
};

// id ile 
const findUserById =  (id, callback) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], callback);
};
// kullanıcı adı ile
// güncelle

// sil



module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};