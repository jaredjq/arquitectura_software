document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
 

  
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password }) // 
      });
  
      const result = await response.json();
  
      if (response.ok) {
        localStorage.setItem('rol', result.rol);
        localStorage.setItem('id_usuario', result.id_usuario);
        window.location.href = '/Bienvenidos.html';
      } else {
        alert(result.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error al iniciar sesión');
    }
  });
  