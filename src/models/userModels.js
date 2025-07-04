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

// kullanıcıyı id ile silme
const deleteUserById = (id, callback) => {
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], callback);
};

// kullanıcı bilgileri güncelleme id ile 

const updateUserById = (id, username, email, password, callback) => {
  const query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
  db.query(query, [username, email, password, id], callback);
};


const isEmailTakenByAnotherUser = (email, currentUserId, callback) => {
  const query = 'SELECT * FROM users WHERE email = ? AND id != ?';
  db.query(query, [email, currentUserId], callback);
};



module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    deleteUserById,
    updateUserById,
    isEmailTakenByAnotherUser
};