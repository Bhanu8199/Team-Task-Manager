const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getToken = () => localStorage.getItem('ttm_token');
const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
};

export const login = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const signup = (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
export const fetchProjects = () => request('/projects');
export const fetchTasks = () => request('/tasks');
export const fetchUsers = () => request('/users');
export const createProject = (payload) => request('/projects', { method: 'POST', body: JSON.stringify(payload) });
export const createTask = (payload) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) });
export const addProjectMember = (projectId, payload) => request(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify(payload) });
export const removeProjectMember = (projectId, userId) => request(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
export const updateTask = (taskId, payload) => request(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(payload) });
