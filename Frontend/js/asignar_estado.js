document.addEventListener("DOMContentLoaded", async () => {
    const tablaBody = document.querySelector("#tablaUsuarios tbody");
    const rolActualText = document.getElementById("rolActual");
    const formularioMod = document.getElementById("formularioMod");
    const btnAsignar = document.getElementById("btnAsignar");
    const btnCancelar = document.getElementById("btnCancelar");
    const btnSalir = document.getElementById("btnSalir");

    let usuarios = [];
    let usuarioSeleccionado = null;

    const cargarUsuarios = async () => {
        const res = await fetch("https://hilmart.site/auth/obtenerUsuarios");
        usuarios = await res.json();
        tablaBody.innerHTML = "";

        usuarios.forEach((usuario) => {
            const tr = document.createElement("tr");
            if(usuario.id_condicion == 1){
                tr.innerHTML = `
                    <td data-label="Correo">${usuario.email}</td>
                    <td data-label="Rol Actual">${usuario.descripcion}</td>
                    <td data-label="Contraseña">**********</td>
                    <td data-label="Modificar">
                        <button class="cambiarDatoBtn" data-id="${usuario.id_usuario}" data-email="${usuario.email}">Modificar</button>
                    </td>
                    <td data-label="Opciones">
                        <select class="opcionModificacion" data-id="${usuario.id_usuario}">
                            <option value="correo">Correo</option>
                            <option value="password">Contraseña</option>
                            <option value="ambos">Ambos</option>
                        </select>
                    </td>
                `;
                tablaBody.appendChild(tr);
            }
        });
    };

    tablaBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("cambiarDatoBtn")) {
            const id = e.target.dataset.id;
            const email = e.target.dataset.email;
            const opcion = document.querySelector(`.opcionModificacion[data-id="${id}"]`).value;
            usuarioSeleccionado = { id, email, opcion };

            rolActualText.textContent = `Correo actual: ${email}`;
            let contenido = "";

            if (opcion === "correo") {
                contenido = `<label>Nuevo Correo:</label><input type="email" id="nuevoCorreo">`;
            } else if (opcion === "password") {
                contenido = `<label>Nueva Contraseña:</label><input type="password" id="nuevaPassword">`;
            } else {
                contenido = `
                    <label>Nuevo Correo:</label><input type="email" id="nuevoCorreo">
                    <label>Nueva Contraseña:</label><input type="password" id="nuevaPassword">
                `;
            }

            formularioMod.innerHTML = contenido;
        }
    });

    btnCancelar.addEventListener("click", () => {
        rolActualText.textContent = "Correo actual:";
        formularioMod.innerHTML = "";
    });

    btnAsignar.addEventListener("click", async () => {
        const { id, opcion } = usuarioSeleccionado;
        let payload = {};

        if (opcion === "correo") {
            const nuevoCorreo = document.getElementById("nuevoCorreo").value.trim();
            if (!nuevoCorreo) return alert("Ingrese un nuevo correo.");
            payload.email = nuevoCorreo;
        } else if (opcion === "password") {
            const nuevaPassword = document.getElementById("nuevaPassword").value.trim();
            if (!nuevaPassword) return alert("Ingrese una nueva contraseña.");
            payload.password = nuevaPassword;
        } else {
            const nuevoCorreo = document.getElementById("nuevoCorreo").value.trim();
            const nuevaPassword = document.getElementById("nuevaPassword").value.trim();
            if (!nuevoCorreo || !nuevaPassword) return alert("Complete ambos campos.");
            payload.email = nuevoCorreo;
            payload.password = nuevaPassword;
        }

        try {
            const res = await fetch(`https://hilmart.site/auth/usuarios/${id}/modificar-datos`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("Datos actualizados correctamente.");
                await cargarUsuarios();
                formularioMod.innerHTML = "";
                rolActualText.textContent = "Correo actual:";
            } else {
                const err = await res.text();
                alert("Error al actualizar: " + err);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Fallo la conexión con el servidor.");
        }
    });

    btnSalir.addEventListener("click", () => {
        window.location.href = "gestionUsuarios.html";
    });

    await cargarUsuarios();
});