const primerCorteE = document.getElementById("primer_corte");
const impresionE = document.getElementById("impresion");
const dobladoE = document.getElementById("doblado");
const compaginadoE = document.getElementById("compaginado");
const engrampadoE = document.getElementById("engrampado");
const segundoCorteE = document.getElementById("segundo_corte");
let modoEstadoE = false;

function actualizarCampos() {
  let estado = !modoEstadoE;
  primerCorteE.disabled = !estado;
  impresionE.disabled = !estado;
  dobladoE.disabled = !estado;
  compaginadoE.disabled = !estado;
  engrampadoE.disabled = !estado;
  segundoCorteE.disabled = !estado;
  modoEstadoE = estado; 
}

// Evento para generar el PDF
document.getElementById("btn_pdf").addEventListener("click", async () => {
  const nombre_trabajo = document.getElementById("nombre_trabajo").value;

  if (nombre_trabajo) {
    try {
      const response = await fetch(`/auth/generar-pdf/${nombre_trabajo}`);
      if (response.ok) {
        // Aquí puedes hacer algo con la respuesta, por ejemplo, descargar el PDF
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${nombre_trabajo}.pdf`;  // Nombre del archivo PDF
        link.click();
      } else {
        console.error("Error: La ruta no fue encontrada.");
        alert("No se pudo generar el PDF. La ruta es incorrecta.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Hubo un problema al generar el PDF. Intenta nuevamente.");
    }
  } else {
    console.error("No se ha encontrado el nombre del trabajo.");
    alert("Por favor, ingresa el nombre del trabajo.");
  }
});


// Evento para generar la gráfica (todavía por definir qué hace)
document.getElementById("btn_grafica").addEventListener("click", async () => {
  const nombreTrabajo = document.getElementById("nombre_trabajo").value;  // Obtener el valor directamente del campo de texto

  if (nombreTrabajo) {
    try {
      const response = await fetch('https://hilmart.site/auth/generar-grafica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_trabajo: nombreTrabajo }) // Enviar el nombre del trabajo en el cuerpo de la solicitud
      });

      const result = await response.json(); // Suponiendo que el servidor responde con un JSON

      if (response.ok) {
        // Almacenar los datos en localStorage antes de redirigir
        localStorage.setItem('graficaData', JSON.stringify(result)); // Guardamos los datos para usar en Grafica.html
        // Si la respuesta es exitosa, redirige a Grafica.html
        window.location.href = 'Grafica.html';
      } else {
        alert(result.message || 'No se pudo generar la gráfica');
      }
    } catch (error) {
      console.error('Error al generar la gráfica:', error);
      alert('Hubo un error al generar la gráfica');
    }
  } else {
    alert("Por favor, ingresa el nombre del trabajo.");
  }
});

// Evento para generar la gráfica (todavía por definir qué hace)
document.getElementById("btn_grafica2").addEventListener("click", async () => {
  const nombreTrabajo = document.getElementById("nombre_trabajo").value;  // Obtener el valor directamente del campo de texto

  if (nombreTrabajo) {
    try {
      const response = await fetch('https://hilmart.site/auth/generar-grafica2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_trabajo: nombreTrabajo }) // Enviar el nombre del trabajo en el cuerpo de la solicitud
      });

      const result = await response.json(); // Suponiendo que el servidor responde con un JSON

      if (response.ok) {
        // Almacenar los datos en localStorage antes de redirigir
        localStorage.setItem('graficaData', JSON.stringify(result)); // Guardamos los datos para usar en Grafica.html
        // Si la respuesta es exitosa, redirige a Grafica.html
        window.location.href = 'Grafica2.html';
      } else {
        alert(result.message || 'No se pudo generar la gráfica');
      }
    } catch (error) {
      console.error('Error al generar la gráfica:', error);
      alert('Hubo un error al generar la gráfica');
    }
  } else {
    alert("Por favor, ingresa el nombre del trabajo.");
  }
});

document.getElementById("btn_salir").addEventListener("click", () => {
  window.location.href = "Busqueda.html";
});

document.getElementById("btn-editar2").addEventListener("click", () => {

  window.modoEdicion = !window.modoEdicion;

  if (window.modoEdicion) {
    actualizarCampos();  // Esta sí está en app.js
  } else {
    if (typeof window.bloquearCampos === 'function') {
      window.bloquearCampos(); // Reactiva el bloqueo progresivo
    }
  }
});

document.getElementById("btn_salir").addEventListener("click", () => {
  window.location.href = "Busqueda.html";
});

document.getElementById("btn-solicitar").addEventListener("click", () => {
  window.location.href = "solicitudCambio.html";
});
