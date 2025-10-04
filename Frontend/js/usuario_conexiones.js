document.getElementById("crear_usuario").addEventListener("click", () => {
    window.location.href = "CrearUsuario.html";
    //nuevaVentana = window.open("IngresoDatos.html"); **POR SI SE QUIERE ABRIR EN OTRA VENTANA**
});

document.getElementById("asignar_roles").addEventListener("click", () => {
    window.location.href = "AsignarRoles.html";
});

document.getElementById("btn_salir").addEventListener("click", () => {
    window.location.href = "Bienvenidos.html";
});

document.getElementById("editar_usuario").addEventListener("click", () => {
    window.location.href = "EditarUsuario.html";
});

document.getElementById("eliminar_usuario").addEventListener("click", () => {
    window.location.href = "EliminarUsuario.html";
});