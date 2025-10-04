document.addEventListener("DOMContentLoaded", async () => {
    const tablaBody = document.querySelector("#tablaUsuarios tbody");
    const estadoActual = document.getElementById("rolActual");
    const nuevoEstado = document.getElementById("nuevoRol");
    const btnModificar = document.getElementById("btnAsignar");
    const btnCancelar = document.getElementById("btnCancelar");
    const btnSalir = document.getElementById("btnSalir");

    let solicitudes = []; //solicitudes
    let solicitudSeleccionada = null;

    // Cargar usuarios
    const cargarSolicitudes = async () => {
        const res = await fetch("https://hilmart.site/auth/obtenerSolicitudes");
        solicitudes = await res.json(); //solicitudes
        tablaBody.innerHTML = "";

        solicitudes.forEach((solicitud) => { //solicitudes - solicitud
            const tr = document.createElement("tr");
            tr.innerHTML = `
                    <td data-label="Trabajador">${solicitud.nombre_trabajador /*nombre_trabajador*/}</td> 
                    <td data-label="Orden de Trabajo">${solicitud.nombre_trabajo /*nombre_trabajado*/}</td>
                    <td data-label="Proceso">${solicitud.proceso /*proceso*/}</td>
                    <td data-label="Cambio">${solicitud.cantidad_solicitud}</td>
                    <td data-label="Descripcion">${solicitud.descripcion}</td>
                    <td data-label="Estado">${solicitud.estado}</td>
                    <td data-label="Acciones"><button class="cambiarEstadoBtn" data-id="${solicitud.id_solicitud}" data-rol="${solicitud.estado}" data-rol-nombre="${solicitud.estado}">MODIFICAR</button></td>
                `;
            tablaBody.appendChild(tr);
        });
    };

    tablaBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("cambiarEstadoBtn")) {
            const id = e.target.dataset.id;
            const rolNombre = e.target.dataset.rolNombre;
            const estadoActualNombre = e.target.dataset.rol;
            solicitudSeleccionada = { id, condiActual: estadoActualNombre };

            estadoActual.textContent = `Estado actual: ${rolNombre}`;
            nuevoEstado.innerHTML = "";

            const estados = [
                { id: 1, nombre: "Aceptada" },
                { id: 2, nombre: "Pendiente" },
                { id: 3, nombre: "Rechazada" }
            ];

            estados.filter(r => r.nombre !== estadoActualNombre).forEach((estado) => {
                const opt = document.createElement("option");
                opt.value = estado.nombre;
                opt.textContent = estado.nombre;
                nuevoEstado.appendChild(opt);
            });
        }
    });

    btnCancelar.addEventListener("click", () => {
        estadoActual.textContent = "Estado actual:";
        nuevoEstado.innerHTML = "";
    });

    btnModificar.addEventListener("click", async () => {
        const nuevaCondicion = nuevoEstado.value;
        const res = await fetch(`https://hilmart.site/auth/solicitudes/${solicitudSeleccionada.id}/cambiar-estado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevaCondicion }),
        });

        if (res.ok) {
            alert("Solicitud actualizada correctamente.");
            await cargarSolicitudes();
        } else {
            alert("Error al actualizar la solicitud");
        }
    });

    btnSalir.addEventListener("click", () => {
        window.location.href = "Bienvenidos.html";
    });

    await cargarSolicitudes();
});
