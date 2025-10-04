document.addEventListener("DOMContentLoaded", async () => {
    const tablaBody = document.querySelector("#tablaUsuarios tbody");
    const condActualText = document.getElementById("rolActual");
    const nuevoCondSelect = document.getElementById("nuevoRol");
    const btnModificar = document.getElementById("btnAsignar");
    const btnCancelar = document.getElementById("btnCancelar");

    let usuarios = [];
    let usuarioSeleccionado = null;

    // Cargar usuarios
    const cargarUsuarios = async () => {
        const res = await fetch("https://hilmart.site/auth/obtenerUsuariosCondicion");
        usuarios = await res.json();
        tablaBody.innerHTML = "";

        usuarios.forEach((usuario) => {
            const tr = document.createElement("tr");
            if(usuario.id_condicion == 1){
                tr.innerHTML = `
                    <td data-label="Correo">${usuario.email}</td>
                    <td data-label="Rol Actual">${usuario.estado_descripcion}</td>
                    <td data-label="Condicion">${usuario.condicion_descripcion}</td>
                    <td data-label="Acciones"><button class="cambiarRolBtn" data-id="${usuario.id_usuario}" data-rol="${usuario.id_condicion}" data-rol-nombre="${usuario.condicion_descripcion}">MODIFICAR</button></td>
                `;
                tablaBody.appendChild(tr);
            }
        });
    };

    tablaBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("cambiarRolBtn")) {
            const id = e.target.dataset.id;
            const rolNombre = e.target.dataset.rolNombre;
            const condiActual = parseInt(e.target.dataset.rol);
            usuarioSeleccionado = { id, condiActual };

            condActualText.textContent = `Condicion actual: ${rolNombre}`;
            nuevoCondSelect.innerHTML = "";

            const condiciones = [
                { id: 1, nombre: "HABILITADO" },
                { id: 2, nombre: "DESHABILITADO" }
            ];

            condiciones.filter(r => r.id !== condiActual).forEach((condi) => {
                const opt = document.createElement("option");
                opt.value = condi.id;
                opt.textContent = condi.nombre;
                nuevoCondSelect.appendChild(opt);
            });
        }
    });

    btnCancelar.addEventListener("click", () => {
        condActualText.textContent = "Condición actual:";
        nuevoCondSelect.innerHTML = "";
    });

    btnModificar.addEventListener("click", async () => {
        const nuevaCondicion = parseInt(nuevoCondSelect.value);
        const res = await fetch(`https://hilmart.site/auth/usuarios/${usuarioSeleccionado.id}/cambiar-condicion`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_condicion: nuevaCondicion }),
        });

        if (res.ok) {
            alert("Condición actualizada correctamente.");
            await cargarUsuarios();
        } else {
            alert("Error al actualizar la condición");
        }
    });

    btnSalir.addEventListener("click", () => {
        window.location.href = "gestionUsuarios.html";
    });

    await cargarUsuarios();
});
