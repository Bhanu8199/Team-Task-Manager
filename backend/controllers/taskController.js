const { pool } = require('../models/db');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } = req.body;

    if (!title || !projectId || !assignedTo) {
      return res.status(400).json({ message: 'Title, projectId, and assignedTo are required.' });
    }

    const validStatus = ['todo', 'in-progress', 'done'];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status.' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, description, project_id, assigned_to, status, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description || '', projectId, assignedTo, status || 'todo', dueDate || null]
    );

    res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.project_id AS "projectId", t.assigned_to AS "assignedTo",
        t.status, t.due_date AS "dueDate", t.created_at AS "createdAt",
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS assignedUser,
        json_build_object('id', p.id, 'name', p.name) AS project
      FROM tasks t
      JOIN users u ON u.id = t.assigned_to
      JOIN projects p ON p.id = t.project_id
      WHERE t.assigned_to = $1
      ORDER BY t.due_date NULLS LAST`,
      [userId]
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Task status is required.' });
    }

    const validStatus = ['todo', 'in-progress', 'done'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (req.user.role !== 'admin' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task.' });
    }

    const updateResult = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, taskId]
    );

    res.json({ task: updateResult.rows[0] });
  } catch (error) {
    next(error);
  }
};
