const mensaje = document.getElementById("mensaje");
const nombre_trabajo_mandado = localStorage.getItem('nombre_trabajo');

document.getElementById("btn_solicitud").addEventListener("click", async (e) => {
    e.preventDefault();

    const cantidadReal = document.getElementById("cantidad_salida_real").value;
    console.log(cantidadReal);
    const motivo = document.getElementById("motivo_solicitud").value;
    console.log(motivo);

      // Validación para la cantidad de hojas de la solicitud
    if (cantidadReal === "") {
        mensaje.textContent = "Ingrese la cantidad de hojas";
        return;
    } else if (!/^\d+$/.test(cantidadReal)) {
        mensaje.textContent = "La cantidad de hojas debe ser un número entero";
        return;
    } else if (parseInt(cantidadReal) <= 1000) {
        mensaje.textContent = "La cantidad de hojas debe ser mayor a 1000";
        return;
    }

    const solicitud = {
        id_usuario: parseInt(localStorage.getItem('id_usuario'), 10),
        id_trabajo: parseInt(localStorage.getItem('id_trabajo'), 10),
        id_proceso: (parseInt(localStorage.getItem('rol'), 10) - 1),
        cantidad_real: cantidadReal,
        descripcion: motivo
    }

    const confirmar = confirm(`Seguro que quieres crear la solicitud de cambio para la OT ${nombre_trabajo_mandado}`);
    if(!confirmar) return;


    const resultado = await fetch('https://hilmart.site/auth/crearSolicitud', {
        method: 'POST',
        headers:  { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitud)
    });

    const data = await resultado.json();
    alert(data.mensaje);
    window.location.href = "IngresoDatos.html";
})

document.getElementById("btn_salir").addEventListener("click", () => {
    window.location.href = "IngresoDatos.html";
});