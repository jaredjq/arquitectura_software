
const input = document.getElementById("otInput").value.trim();
const mensaje = document.getElementById("mensaje");
const btn_buscar = document.getElementById("btn_buscar");
const btn_limpiar = document.getElementById("btn_limpiar");

btn_buscar.addEventListener("click", () => {
  if (input === "") {
    mensaje.textContent = "Ingrese un valor o cantidad";
  } else if (!/^\d+$/.test(input)) {
    mensaje.textContent = "Solo se permiten números";
  } else {
    mensaje.textContent = "";
    window.location.href = "IngresoDatos.html";
  }
})

btn_limpiar.addEventListener("click", () => {
  document.getElementById("otInput").value = "";
  document.getElementById("mensaje").textContent = "";
})
