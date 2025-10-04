document.addEventListener("DOMContentLoaded", async () => {
    const tablaBody = document.querySelector("#tablaUsuarios tbody");
    const rolActualText = document.getElementById("rolActual");
    const nuevoRolSelect = document.getElementById("nuevoRol");
    const btnAsignar = document.getElementById("btnAsignar");
    const btnCancelar = document.getElementById("btnCancelar");

    let usuarios = [];
    let usuarioSeleccionado = null;

    // Cargar usuarios
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
                    <td data-label="Acciones"><button class="cambiarRolBtn" data-id="${usuario.id_usuario}" data-rol="${usuario.id_estado}" data-rol-nombre="${usuario.descripcion}">Cambiar Rol</button></td>
                `;
                tablaBody.appendChild(tr);
            }
        });
    };

    tablaBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("cambiarRolBtn")) {
            const id = e.target.dataset.id;
            const rolNombre = e.target.dataset.rolNombre;
            const rolActual = parseInt(e.target.dataset.rol);
            usuarioSeleccionado = { id, rolActual };

            rolActualText.textContent = `Rol actual: ${rolNombre}`;
            nuevoRolSelect.innerHTML = "";

            const roles = [
                { id: 1, nombre: "Administrador" },
                { id: 2, nombre: "Encargado Primer Corte" },
                { id: 3, nombre: "Encargado Impresion" },
                { id: 4, nombre: "Encargado Doblado" },
                { id: 5, nombre: "Encargado Compaginado" },
                { id: 6, nombre: "Encargado Engrapado" },
                { id: 7, nombre: "Encargado Corte Final" },
            ];

            roles.filter(r => r.id !== rolActual).forEach((rol) => {
                const opt = document.createElement("option");
                opt.value = rol.id;
                opt.textContent = rol.nombre;
                nuevoRolSelect.appendChild(opt);
            });
        }
    });

    btnCancelar.addEventListener("click", () => {
        rolActualText.textContent = "Rol actual:";
        nuevoRolSelect.innerHTML = "";
    });

    btnAsignar.addEventListener("click", async () => {
        const nuevoRol = parseInt(nuevoRolSelect.value);
        const res = await fetch(`https://hilmart.site/auth/usuarios/${usuarioSeleccionado.id}/cambiar-rol`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estado: nuevoRol }),
        });

        if (res.ok) {
            alert("Rol actualizado correctamente.");
            await cargarUsuarios();
        } else {
            alert("Error al actualizar el rol.");
        }
    });

    btnSalir.addEventListener("click", () => {
        window.location.href = "gestionUsuarios.html";
    });

    await cargarUsuarios();
});
