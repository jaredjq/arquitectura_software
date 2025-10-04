document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-password-form");
  const nueva = document.getElementById("nueva");
  const confirmar = document.getElementById("confirmar");

  // Obtener token de la URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    alert("Token no encontrado en el enlace.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (nueva.value !== confirmar.value) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch("https://hilmart.site/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          newPassword: nueva.value
        })
      });

      const data = await response.json();
      alert(data.message);

      if (response.ok) {
        window.location.href = "/"; // o puedes redirigir al login
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al restablecer la contraseña.");
    }
  });
});
