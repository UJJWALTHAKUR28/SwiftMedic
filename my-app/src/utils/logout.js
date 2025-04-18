// src/utils/logout.js
export const logoutUser = async ({ endpoint = '/users/logout' } = {}) => {
    const token = localStorage.getItem('token');
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) throw new Error('Logout failed');
  
    localStorage.removeItem('token');
  };
  