const mensaje = document.getElementById("mensaje");



document.getElementById("formu").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombreOT = document.getElementById("nombreOT").value.trim();
    const cantidadHojasOT = document.getElementById("cantidadHojasOT").value.trim();
    const precioHoja = document.getElementById("precioHoja").value.trim();
    const fechaInicioOT = document.getElementById("fechaInicioOT").value;
    const estadoTrabajo = "En proceso";
    const privArchiv = 0;
    const fechaHoy = new Date().toISOString().split('T')[0];
    const fechaInicioOTCompara = new Date(fechaInicioOT);
    const fechaHoyCompara = new Date().setHours(0, 0, 0, 0);
    console.log("La fecha que se guardará es: " + fechaInicioOT);
    console.log("La fecha con la que se compara: " + fechaHoy);
        


    // Validación para la el nombre de la OT
    if(nombreOT == ""){
      mensaje.textContent = "Ingrese un valor o cantidad";
    }
    else if (!/^[A-Z]\d+$/.test(nombreOT)) {
      mensaje.textContent = "Formato incorrecto de OT";
    }

      // Validación para la cantidad de hojas
    if (cantidadHojasOT === "") {
        mensaje.textContent = "Ingrese la cantidad de hojas";
        return;
    } else if (!/^\d+$/.test(cantidadHojasOT)) {
        mensaje.textContent = "La cantidad de hojas debe ser un número entero";
        return;
    } else if (parseInt(cantidadHojasOT) <= 1000) {
        mensaje.textContent = "La cantidad de hojas debe ser mayor a 1000";
        return;
    }

    // Validación para el precio por hoja
    if (precioHoja === "") {
      mensaje.textContent = "Ingrese el precio por hoja";
      return;
  } else if (!/^\d+(\.\d{1,4})?$/.test(precioHoja)) {
      mensaje.textContent = "El precio por hoja debe ser un número válido";
      return;
  } else if (parseFloat(precioHoja) <= 0) {
      mensaje.textContent = "El precio por hoja no puede ser negativo ni cero";
      return;
  }

  // Validación para la fecha de inicio
  if (fechaInicioOT === "") {
    mensaje.textContent = "Seleccione una fecha de inicio";
    return;
  } 
  else if (fechaInicioOTCompara < fechaHoyCompara) {
      mensaje.textContent = "La fecha de inicio no puede ser menor a la fecha actual";
      return;
  }

  const confirmar = confirm(`¿Seguro que quieres crear la OT: ${nombreOT}?`);
  if (!confirmar) return;

  const res = await fetch('https://hilmart.site/auth/crearOT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombreOT, cantidadHojasOT, precioHoja, fechaInicioOT, estadoTrabajo, privArchiv })
  });

  const data = await res.json();
  alert(data.mensaje);
  window.location.href = 'Busqueda.html';
});