
// Obtención de referencias de los elementos de la interfaz
const primerCorte = document.getElementById("primer_corte");
const impresion = document.getElementById("impresion");
const doblado = document.getElementById("doblado");
const compaginado = document.getElementById("compaginado");
const engrampado = document.getElementById("engrampado");
const segundoCorte = document.getElementById("segundo_corte");


function bloquearCampos() {
    // Bloqueamos los campos que dependen del valor del campo anterior
    if (!primerCorte.value.trim()) {
        impresion.disabled = true;
        doblado.disabled = true;
        compaginado.disabled = true;
        engrampado.disabled = true;
        segundoCorte.disabled = true;
    } else {
        //primerCorte.disabled = true;
        impresion.disabled = false;
    }

    if (!impresion.value.trim()) {
        doblado.disabled = true;
        compaginado.disabled = true;
        engrampado.disabled = true;
        segundoCorte.disabled = true;
    } else {
        //impresion.disabled = true;
        doblado.disabled = false;
    }

    if (!doblado.value.trim()) {
        compaginado.disabled = true;
        engrampado.disabled = true;
        segundoCorte.disabled = true;
    } else {
        //doblado.disabled = true;
        compaginado.disabled = false;
    }

    if (!compaginado.value.trim()) {
        engrampado.disabled = true;
        segundoCorte.disabled = true;
    } else {
        //compaginado.disabled = true;
        engrampado.disabled = false;
    }

    if (!engrampado.value.trim()) {
        segundoCorte.disabled = true;
    } else {
        //engrampado.disabled = true;
        segundoCorte.disabled = false;
    }

    /*if(segundoCorte.value.trim()){
        segundoCorte.disabled = true;
    }*/

}


// Llamar a la función cada vez que el valor de un campo cambie
primerCorte.addEventListener("input", bloquearCampos);
impresion.addEventListener("input", bloquearCampos);
doblado.addEventListener("input", bloquearCampos);
compaginado.addEventListener("input", bloquearCampos);
engrampado.addEventListener("input", bloquearCampos);
segundoCorte.addEventListener("input", bloquearCampos);

// Llamar a la función al cargar la página para establecer el estado inicial
bloquearCampos();
window.bloquearCampos = bloquearCampos; 

function bloquearSiLleno(input) {
  if (input.value.trim() !== "") input.disabled = true;
}

document.getElementById("form_produccion").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!window.modoEdicion) {
    bloquearSiLleno(primerCorte);
    bloquearSiLleno(impresion);
    bloquearSiLleno(doblado);
    bloquearSiLleno(compaginado);
    bloquearSiLleno(engrampado);
    bloquearSiLleno(segundoCorte);
    }

    // Recolectamos los valores de los campos del formulario
    const nombreOT = document.getElementById("nombre_trabajo").value.trim();
    const cantidadHojasOT = document.getElementById("cantidad_hojas_ingresadas").value.trim();
    const precioMaterial = document.getElementById("precio_hoja").value.trim();
    const fechaInicioOT = document.getElementById("fecha_inicial").value;
    const fechaFinOT = document.getElementById("fecha_final").value;

    // Recolectamos los procesos (que son campos dependientes)
    const procesos = [
        { id_proceso: 1, cantidad_salida_real: document.getElementById("primer_corte").value.trim() },
        { id_proceso: 2, cantidad_salida_real: document.getElementById("impresion").value.trim() },
        { id_proceso: 3, cantidad_salida_real: document.getElementById("doblado").value.trim() },
        { id_proceso: 4, cantidad_salida_real: document.getElementById("compaginado").value.trim() },
        { id_proceso: 5, cantidad_salida_real: document.getElementById("engrampado").value.trim() },
        { id_proceso: 6, cantidad_salida_real: document.getElementById("segundo_corte").value.trim() }
    ];

    // Validaciones generales antes de guardar
    if (!/^\d+$/.test(cantidadHojasOT)) {
        alert("La cantidad de hojas debe ser un número entero");
        return;
    } else if (parseInt(cantidadHojasOT) <= 1000) {
        alert("La cantidad de hojas debe ser mayor a 1000");
        return;
    }

    // Validación para el precio por hoja
    if (!/^\d+(\.\d{1,4})?$/.test(precioMaterial)) {
        alert("El precio por hoja debe ser un número válido");
        return;
    } else if (parseFloat(precioMaterial) <= 0) {
        alert("El precio por hoja no puede ser negativo ni cero");
        return;
    }

    /*Validación para la fecha de fin - corregir valid - fijate en crear OT
    if (fechaFinOT < fechaInicioOT) {
        alert("La fecha de fin no puede ser menor a la fecha de inicio");
        return;
    }*/

    // Determinar en que tabla se hará el UPDATE
    const cambiosTrabajo = {};
    const cambiosInsumo = {};
    const cambiosTrabajoInsumo = {};

    // Función para comparar el valor anterior con el valor actual
    const compararValor = (valorAnterior, valorNuevo, clave, Tipo, esNumero = false) => {
        let anterior = valorAnterior;
        let nuevo = valorNuevo;

        if (esNumero) {
            anterior = Number(valorAnterior);
            nuevo = Number(valorNuevo);
        }
        // Si el valor anterior es vacío o null y el nuevo valor no lo es, es un INSERT
        if (anterior !== nuevo) {
            Tipo[clave] = valorNuevo;  // Se considera un insert
        }
    };

    if (datosAnteriores.isTrabajoInicio !== 1) {
        console.log(datosAnteriores.cantidadHojasIngre);
        console.log(cantidadHojasOT);
        compararValor(datosAnteriores.cantidadHojasIngre, cantidadHojasOT, 'cantidad_hojas_ingresadas', cambiosTrabajoInsumo, true);
        console.log(datosAnteriores.precio_unitario);
        console.log(precioMaterial);
        compararValor(datosAnteriores.precio_unitario, precioMaterial, 'precio_hoja', cambiosInsumo, true);
    }
    else {
        console.log(datosAnteriores.fecha_fin_estimada);
        console.log(fechaFinOT);
        compararValor(datosAnteriores.fecha_fin_estimada, fechaFinOT, 'fecha_fin_estimada', cambiosTrabajo);
    }

    const procesosCambiados = [];
    procesos.forEach((proceso) => {
        console.log(datosAnteriores.procesos[proceso.id_proceso]);
        console.log(proceso.cantidad_salida_real);
        const nuevoValorRaw = proceso.cantidad_salida_real;
        const valorAnterior = Number(datosAnteriores.procesos[proceso.id_proceso]);

        // Ignorar si está vacío o nulo
        if (nuevoValorRaw === null || nuevoValorRaw === undefined || nuevoValorRaw.trim() === '') {
            return; // No hacemos nada si no hay valor nuevo
        }
        
        const nuevoValor = Number(nuevoValorRaw);
        // Validamos si realmente cambió
        if (!isNaN(nuevoValor) && nuevoValor !== valorAnterior) {
            procesosCambiados.push(proceso);
        }
    });

    const payload = {};
    let isEmpty = 0;
    payload.nombre_trabajo = nombreOT;
    // Si hay cambios, enviamos actualización
    if (Object.keys(cambiosTrabajo).length > 0) {
        payload.fechaFin = fechaFinOT;
    }
    if (Object.keys(cambiosInsumo).length > 0) {
        payload.precio_insumo = precioMaterial;
    }
    if (Object.keys(cambiosTrabajoInsumo).length > 0) {
        payload.cantidad_insumo = cantidadHojasOT;
    }
    if (procesosCambiados.length > 0) {
        payload.procesos = procesosCambiados;
    }

    // Evaluar si todos los objetos están vacíos (no se cumplió ninguna condición)
    if (
        Object.keys(cambiosTrabajo).length === 0 &&
        Object.keys(cambiosInsumo).length === 0 &&
        Object.keys(cambiosTrabajoInsumo).length === 0 &&
        procesosCambiados.length === 0
    ) {
        isEmpty = 1;
    }

    if (isEmpty === 0) {
        fetch('https://hilmart.site/auth/actualizarProcesos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                alert("Actualización realizada correctamente");
                console.log(data);
            })
            .catch(err => {
                alert("Hubo un error al actualizar");
                console.error(err);
            });
    } else {
        alert("No se detectaron cambios para guardar");
    }
});