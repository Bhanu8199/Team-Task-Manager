import { useEffect, useMemo, useState } from 'react';
import { fetchProjects, fetchTasks, fetchUsers, createProject, createTask, updateTask, addProjectMember, removeProjectMember } from '../services/api';
import { getStoredUser } from '../utils/auth';

const Dashboard = () => {
  const currentUser = getStoredUser();
  const isAdmin = currentUser?.role === 'admin';
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProject, setSavingProject] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', projectId: '', assignedTo: '', status: 'todo', dueDate: '' });
  const [memberForm, setMemberForm] = useState({ projectId: '', userId: '' });
  const [removeMemberProjectId, setRemoveMemberProjectId] = useState('');
  const [removeMemberUserId, setRemoveMemberUserId] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [taskData, projectData] = await Promise.all([fetchTasks(), fetchProjects()]);
        setTasks(taskData.tasks);
        setProjects(projectData.projects);
        if (isAdmin) {
          const userData = await fetchUsers();
          setUsers(userData.users);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isAdmin]);

  const statusCounts = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        acc[task.status] += 1;
        if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done') {
          acc.overdue += 1;
        }
        return acc;
      },
      { todo: 0, 'in-progress': 0, done: 0, overdue: 0 }
    );
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => statusFilter === 'all' || task.status === statusFilter);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleProjectChange = (event) => {
    setProjectForm({ ...projectForm, [event.target.name]: event.target.value });
  };

  const handleTaskChange = (event) => {
    setTaskForm({ ...taskForm, [event.target.name]: event.target.value });
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setError('');
    setSavingProject(true);
    try {
      const response = await createProject(projectForm);
      setProjects((prev) => [response.project, ...prev]);
      setProjectForm({ name: '', description: '' });
      showMessage('Project created successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProject(false);
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError('');
    setSavingTask(true);
    try {
      const response = await createTask(taskForm);
      setTasks((prev) => [response.task, ...prev]);
      setTaskForm({ title: '', description: '', projectId: '', assignedTo: '', status: 'todo', dueDate: '' });
      showMessage('Task created successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTask(false);
    }
  };

  const handleMemberChange = (event) => {
    setMemberForm({ ...memberForm, [event.target.name]: event.target.value });
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    setError('');
    setSavingMember(true);
    try {
      await addProjectMember(memberForm.projectId, { userId: memberForm.userId });
      const updated = await fetchProjects();
      setProjects(updated.projects);
      setMemberForm({ projectId: '', userId: '' });
      showMessage('Member added to project.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingMember(false);
    }
  };

  const handleRemoveMember = async (event) => {
    event.preventDefault();
    setError('');
    setSavingMember(true);
    try {
      await removeProjectMember(removeMemberProjectId, removeMemberUserId);
      const updated = await fetchProjects();
      setProjects(updated.projects);
      setRemoveMemberProjectId('');
      setRemoveMemberUserId('');
      showMessage('Member removed from project.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingMember(false);
    }
  };

  const handleStatusUpdate = async (taskId, nextStatus) => {
    setError('');
    try {
      const response = await updateTask(taskId, { status: nextStatus });
      setTasks((prev) => prev.map((task) => (task.id === taskId ? response.task : task)));
      showMessage('Task updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="hero-banner">
        <div className="hero-copy">
          <p className="eyebrow">Team Task Manager</p>
          <h1>Organize work with clarity</h1>
          <p className="hero-text">Create projects, assign tasks, and see progress at a glance with a responsive admin dashboard.</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="stat-card">
            <span>Overdue</span>
            <strong>{statusCounts.overdue}</strong>
          </div>
          <div className="stat-card">
            <span>Role</span>
            <strong>{currentUser?.role}</strong>
          </div>
        </div>
      </div>

      {(message || error) && (
        <div className={`notification ${message ? 'notification-success' : 'notification-error'}`}>
          {message || error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading your workspace...</div>
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="dashboard-card dashboard-card--highlight">
              <h2>Welcome back, {currentUser?.name}</h2>
              <p className="muted">Your role is <strong>{currentUser?.role}</strong>. Use the dashboard controls to manage tasks and teams.</p>
            </div>

            <div className="dashboard-card stats-panel">
              <div className="status-box status-box--todo">
                <span>Todo</span>
                <strong>{statusCounts.todo}</strong>
              </div>
              <div className="status-box status-box--progress">
                <span>In progress</span>
                <strong>{statusCounts['in-progress']}</strong>
              </div>
              <div className="status-box status-box--done">
                <span>Done</span>
                <strong>{statusCounts.done}</strong>
              </div>
              <div className="status-box status-box--overdue">
                <span>Overdue</span>
                <strong>{statusCounts.overdue}</strong>
              </div>
            </div>

            {isAdmin && (
              <div className="form-card">
                <h3>Create Project</h3>
                <form onSubmit={handleCreateProject}>
                  <div className="form-group">
                    <label>Name</label>
                    <input name="name" value={projectForm.name} onChange={handleProjectChange} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={projectForm.description} onChange={handleProjectChange} rows="3" />
                  </div>
                  <button type="submit" className="btn-primary" disabled={savingProject}>
                    {savingProject ? 'Creating project…' : 'Create Project'}
                  </button>
                </form>
              </div>
            )}

            {isAdmin && (
              <div className="form-card">
                <h3>Create Task</h3>
                <form onSubmit={handleCreateTask}>
                  <div className="form-group">
                    <label>Title</label>
                    <input name="title" value={taskForm.title} onChange={handleTaskChange} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={taskForm.description} onChange={handleTaskChange} rows="3" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Project</label>
                      <select name="projectId" value={taskForm.projectId} onChange={handleTaskChange} required>
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Assign to</label>
                      <select name="assignedTo" value={taskForm.assignedTo} onChange={handleTaskChange} required>
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={taskForm.status} onChange={handleTaskChange}>
                        <option value="todo">Todo</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Due date</label>
                      <input name="dueDate" type="date" value={taskForm.dueDate} onChange={handleTaskChange} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={savingTask}>
                    {savingTask ? 'Creating task…' : 'Create Task'}
                  </button>
                </form>
              </div>
            )}

            {isAdmin && (
              <div className="form-card">
                <h3>Project Members</h3>
                <form onSubmit={handleAddMember}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Project</label>
                      <select name="projectId" value={memberForm.projectId} onChange={handleMemberChange} required>
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>User</label>
                      <select name="userId" value={memberForm.userId} onChange={handleMemberChange} required>
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-secondary" disabled={savingMember}>
                    {savingMember ? 'Updating team…' : 'Add Member'}
                  </button>
                </form>

                <form onSubmit={handleRemoveMember} className="member-remove-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Project</label>
                      <select value={removeMemberProjectId} onChange={(e) => setRemoveMemberProjectId(e.target.value)} required>
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Member</label>
                      <select value={removeMemberUserId} onChange={(e) => setRemoveMemberUserId(e.target.value)} required>
                        <option value="">Select a member</option>
                        {projects
                          .find((project) => project.id === Number(removeMemberProjectId))
                          ?.members.map((member) => (
                            <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                          )) || []}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-danger" disabled={savingMember}>
                    Remove Member
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="dashboard-panel dashboard-panel--full">
            <div className="dashboard-card project-list-card">
              <h3>Projects</h3>
              {projects.length === 0 ? (
                <p className="muted">No projects yet. Create one to get started.</p>
              ) : (
                <div className="project-grid">
                  {projects.map((project) => (
                    <div className="project-card" key={project.id}>
                      <h4>{project.name}</h4>
                      <p>{project.description || 'No description provided.'}</p>
                      <div className="project-meta">
                        <span>{project.members.length} members</span>
                        <span>Created by {project.created_by}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-card task-list-card">
              <div className="task-list-header">
                <h3>Tasks</h3>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              {filteredTasks.length === 0 ? (
                <p className="muted">No tasks match this filter.</p>
              ) : (
                filteredTasks.map((task) => (
                  <div className="task-card" key={task.id}>
                    <div>
                      <h4>{task.title}</h4>
                      <p>{task.description || 'No task description.'}</p>
                      <div className="task-meta">
                        <span>Project: {task.project?.name}</span>
                        <span>Assigned to: {task.assignedUser?.name}</span>
                      </div>
                    </div>
                    <div className="task-card-footer">
                      <span className={`status-tag status-${task.status.replace(' ', '-')}`}>{task.status}</span>
                      <div className="task-card-actions">
                        <button className="btn-secondary" type="button" onClick={() => handleStatusUpdate(task.id, task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'done')}>
                          Advance
                        </button>
                        <span className="task-date">{task.dueDate || 'No due date'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;

