document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("crearUsuarioForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const estadoSelect = document.getElementById("estado");
        const id_estado = estadoSelect.value;
        const nombreEstado = estadoSelect.options[estadoSelect.selectedIndex].text;
        

        if (!email || !password || !id_estado) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
            alert("Por favor, ingresa un correo válido.");
            return;
            }

        const confirmacion = confirm(`¿Deseas crear el usuario con correo: ${email} y rol: ${nombreEstado}?`);
        if (!confirmacion) return;

        try {
            const response = await fetch('https://hilmart.site/auth/crearUsuario', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, id_estado: parseInt(id_estado) }),
            });

            if (response.ok) {
                alert("Usuario creado exitosamente.");
                form.reset();
            } else {
                const errorText = await response.text();
                alert("Error al crear el usuario: " + errorText);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error de red o del servidor.");
        }
    });
});

document.getElementById("btn_salir").addEventListener("click", () => {
    window.location.href = "gestionUsuarios.html";
});