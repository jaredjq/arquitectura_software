const btn_limpiar = document.getElementById("btn_limpiar");
const btn_buscar = document.getElementById("btn_buscar");
const mensaje = document.getElementById("mensaje");
const nombreOTElemento = document.getElementById("nombreOT");
const rol = parseInt(localStorage.getItem('rol'), 10);


btn_limpiar.addEventListener("click", () => {
  nombreOTElemento.value = "";
  mensaje.textContent = "";
})


document.getElementById("formu").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombreOT = nombreOTElemento.value.trim();

    if(nombreOT == ""){
      mensaje.textContent = "Ingrese un valor o cantidad";
    }
    else if (!/^[A-Z]\d+$/.test(nombreOT)) {
      mensaje.textContent = "Formato incorrecto de OT";
    }
    else{
      const res = await fetch('https://hilmart.site/auth/verificaOT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreOT })
      });
    
      const data = await res.json();
    
      if (data.encontrada) {
        window.location.href = "IngresoDatos.html";
      } else {
        if(rol === 1){
          const crear = confirm("OT no encontrada. ¿Quieres crear una?");
          if (crear) {
            localStorage.setItem('nombreOT', nombreOT);
            window.location.href = "creacionOT.html";
          }
        }
        else{
          alert("La OT ingresada no existe");
        }
      }
    }
});
document.getElementById("btn_salir").addEventListener("click", () => {
    window.location.href = "Bienvenidos.html";
});