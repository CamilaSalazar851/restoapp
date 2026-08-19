// frontend admin handler: valida token y obtiene usuario
(async function() {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'login.html';

  try {
    const res = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) {
      localStorage.removeItem('token');
      return window.location.href = 'login.html';
    }
    const data = await res.json();
    const user = data.user;
    if (!user || user.role !== 'admin') {
      return window.location.href = 'index.html';
    }
    // ok: show admin name somewhere
    const h2 = document.querySelector('.contenedor-principal h2');
    if (h2) h2.textContent = `RestoApp - Administración (${user.name})`;
  } catch (err) {
    console.error(err);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }

  // logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  // product form (example) - requires backend product endpoints which are not implemented yet
  const form = document.getElementById('form-producto');
  const prodMsg = document.getElementById('prodMsg');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      prodMsg.textContent = 'Funcionalidad de productos no implementada en el backend aún.';
    });
  }
})();
