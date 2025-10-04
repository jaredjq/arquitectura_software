document.addEventListener('DOMContentLoaded', () => {
  const rol = parseInt(localStorage.getItem('rol'), 10);
  const textoBienvenida = document.getElementById('texto_bienvenida');
  const botonAdmin = document.getElementById('gestion_usuarios');
  const calcular_merma = document.getElementById('calcular_merma');
  const bandeja_solicitudes = document.getElementById('bandeja_solicitudes');

  const nombresRol = {
    1: "ADMINISTRADOR",
    2: "ENCARGADO DE PRIMER CORTE",
    3: "ENCARGADO DE IMPRESIÓN",
    4: "ENCARGADO DE DOBLADO",
    5: "ENCARGADO DE COMPAGINADO",
    6: "ENCARGADO DE ENGRAPADO",
    7: "ENCARGADO DE CORTE FINAL"
  };

  if (rol && nombresRol[rol]) {
    textoBienvenida.innerHTML = `BIENVENIDO <br> ${nombresRol[rol]}`;

    // Ejemplo: Solo Admin y Supervisor ven el botón
    if (rol === 1) {
      calcular_merma.style.display = 'inline-block';
      botonAdmin.style.display = 'inline-block';
      bandeja_solicitudes.style.display = 'inline-block';
    }
  } else {
    textoBienvenida.textContent = "BIENVENIDO";
  }
});


//let nuevaVentana = null;

document.getElementById("datos_ot").addEventListener("click", () => {
    window.location.href = "Busqueda.html";
    //nuevaVentana = window.open("IngresoDatos.html"); **POR SI SE QUIERE ABRIR EN OTRA VENTANA**
});
document.getElementById("cambiar_contra").addEventListener("click", () => {
    window.location.href = "OlvidoContra.html";
    //nuevaVentana = window.open("IngresoDatos.html"); **POR SI SE QUIERE ABRIR EN OTRA VENTANA**
});
document.getElementById("gestion_usuarios").addEventListener("click", () => {
    window.location.href = "gestionUsuarios.html";
    //nuevaVentana = window.open("IngresoDatos.html"); **POR SI SE QUIERE ABRIR EN OTRA VENTANA**
});

document.getElementById("calcular_merma").addEventListener("click", () => {
    window.location.href = "CalcularMerma.html";
});

document.getElementById("bandeja_solicitudes").addEventListener("click", () => {
    window.location.href = "BandejaSolicitudes.html";
});

document.getElementById("btn_salir").addEventListener("click", () => {
    window.location.href = "/index.html";
});
