document.getElementById("btn_salir").addEventListener("click", () => {
  // Limpiar localStorage para evitar sesión persistente
    localStorage.clear();
    window.location.href = "/index.html";
});

document.getElementById('forgot-password-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  console.log('Correo enviado:', email);  

  // Enviar la solicitud POST al backend para enviar el correo de recuperación
  try {
      const response = await fetch('https://hilmart.site/auth/forgot-password', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
      });

      const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();

      if (response.ok) {
        alert(result.message); // Mensaje de éxito
      } else {
        alert(result.message); // Mensaje de error
      }
    } else {
      const text = await response.text(); // Por si responde HTML (ej: error 404)
      console.error('Respuesta inesperada:', text);
      alert('Hubo un problema inesperado. Revisa la consola.');
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
    alert('Hubo un error al procesar tu solicitud');
  }
});