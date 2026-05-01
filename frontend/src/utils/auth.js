export const storeAuth = ({ user, token }) => {
  localStorage.setItem('ttm_user', JSON.stringify(user));
  localStorage.setItem('ttm_token', token);
};

export const getStoredUser = () => {
  const raw = localStorage.getItem('ttm_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('ttm_user');
  localStorage.removeItem('ttm_token');
};
