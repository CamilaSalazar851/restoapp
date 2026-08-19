// frontend login handler
const form = document.getElementById('form-login');
const userInput = document.getElementById('user');
const passInput = document.getElementById('pass');
const authMsg = document.getElementById('authMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  authMsg.textContent = '';
  const email = userInput.value.trim();
  const password = passInput.value;
  if (!email || !password) { authMsg.textContent = 'Completa ambos campos'; return; }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { authMsg.textContent = data.message || 'Error'; return; }
    // Guarda token
    if (data.token) localStorage.setItem('token', data.token);
    // Redirige según role
    const role = data.user && data.user.role;
    if (role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  } catch (err) {
    console.error(err);
    authMsg.textContent = 'Error de conexión';
  }
});
