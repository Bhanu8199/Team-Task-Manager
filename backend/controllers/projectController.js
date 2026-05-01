const { pool } = require('../models/db');

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;
    const createdBy = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const result = await pool.query(
      'INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, description || '', createdBy]
    );

    const project = result.rows[0];
    const memberIds = Array.isArray(members) ? [...new Set(members)] : [];
    memberIds.push(createdBy);

    const insertPromises = memberIds.map((userId) => {
      return pool.query(
        'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [project.id, userId]
      );
    });

    await Promise.all(insertPromises);

    const projectResult = await pool.query(
      `SELECT p.id, p.name, p.description, p.created_by, p.created_at,
        json_agg(json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'role', u.role)) AS members
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id
      JOIN users u ON u.id = pm.user_id
      WHERE p.id = $1
      GROUP BY p.id`,
      [project.id]
    );

    const fullProject = projectResult.rows[0];
    res.status(201).json({ project: fullProject });
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.created_by, p.created_at,
        json_agg(json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'role', u.role)) AS members
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id
      JOIN users u ON u.id = pm.user_id
      WHERE p.id IN (
        SELECT project_id FROM project_members WHERE user_id = $1
      )
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ projects: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.addProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Member userId is required.' });
    }

    await pool.query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [projectId, userId]
    );

    res.json({ message: 'Member added to project.' });
  } catch (error) {
    next(error);
  }
};

exports.removeProjectMember = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;

    await pool.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
    res.json({ message: 'Member removed from project.' });
  } catch (error) {
    next(error);
  }
};
