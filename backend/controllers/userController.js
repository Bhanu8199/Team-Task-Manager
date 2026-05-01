const { pool } = require('../models/db');

exports.getUsers = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY name');
    res.json({ users: result.rows });
  } catch (error) {
    next(error);
  }
};
