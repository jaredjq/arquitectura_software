let datosAnteriores = {}; // Variable global para almacenar los datos anteriores
datosAnteriores.procesos = {};
// NUEVO: Ocultar campos según el rol
const rol = parseInt(localStorage.getItem('rol'), 10);

// Mapeo de campos por rol
const camposPorRol = {
    1: ['primer_corte', 'impresion', 'doblado', 'compaginado', 'engrampado', 'segundo_corte', 'cantidad_hojas_ingresadas', 'precio_hoja'], // ADMIN
    2: ['primer_corte'],
    3: ['impresion'],
    4: ['doblado'],
    5: ['compaginado'],
    6: ['engrampado'],
    7: ['segundo_corte']
};

// Todos los IDs de campos procesables
const todosLosCampos = ['primer_corte', 'impresion', 'doblado', 'compaginado', 'engrampado', 'segundo_corte', 'cantidad_hojas_ingresadas', 'precio_hoja'];

// Ocultamos todo excepto nombre y fechas
todosLosCampos.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.parentElement.style.display = 'none';
    }
});

// Mostramos los campos del rol actual (excepto admin que ya los verá todos por defecto)
if (camposPorRol[rol]) {
    camposPorRol[rol].forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.parentElement.style.display = 'inline';
        }
    });
}

const botonesAdmin = ['btn_guardar', 'btn_pdf', 'btn_grafica', 'btn_grafica2', 'btn-editar2'];
const botonesTrabajador = ['btn-solicitar'];

if (rol !== 1) {
    botonesAdmin.forEach(id => {
        const boton = document.getElementById(id);
        if (boton) {
            boton.style.display = 'none';
        }
    });
}
else {
    const boton = document.getElementById(botonesTrabajador[0]);
    if (boton) {
        boton.style.display = 'none';
    }
}

if (rol !== 1) {
    const fechaFinal = document.getElementById('fecha_final');
    if (fechaFinal) fechaFinal.parentElement.style.display = 'none';
}

fetch('https://hilmart.site/auth/datosOT')
    .then(res => res.json())
    .then(data => {
        // NOMBRE DE TRABAJO
        document.getElementById('nombre_trabajo').value = data.nombre_trabajo;
        datosAnteriores.nombre_trabajo = data.nombre_trabajo;
        localStorage.setItem('id_trabajo', data.id_trabajo);
        localStorage.setItem('nombre_trabajo', datosAnteriores.nombre_trabajo);

        //FECHA INICIAL
        let fechaFormateada = data.fecha_inicio.split("T")[0];
        document.getElementById('fecha_inicial').value = fechaFormateada;

        // FECHA FINAL
        let fechaFormateadaFin = data.fecha_fin_estimada.split("T")[0];
        document.getElementById('fecha_final').value = fechaFormateadaFin;
        datosAnteriores.fecha_fin_estimada = fechaFormateadaFin;

        // INSUMOS
        document.getElementById('cantidad_hojas_ingresadas').value = data.insumos[0].cantidad || '';
        datosAnteriores.cantidadHojasIngre = data.insumos[0].cantidad || '';
        document.getElementById('precio_hoja').value = data.insumos[0].precio_unitario || '';
        datosAnteriores.precio_unitario = data.insumos[0].precio_unitario || '';

        // 🔐 Verificar si producción ya inició (basado en proceso 1)
        const claveAlerta = `alertaTrabajoIniciado_${data.nombre_trabajo}`;
        const yaMostroAlerta = sessionStorage.getItem(claveAlerta);
        // Desactivar campos si proceso 1 ya fue llenado
        const salidaProc1 = data.insumos[0].procesos[0].cantidad_salida_real || 0;
        if (parseInt(salidaProc1) > 0) {
            document.getElementById('cantidad_hojas_ingresadas').readOnly = true;
            document.getElementById('precio_hoja').readOnly = true;
            if (!yaMostroAlerta) {
                alert("⚠️ Producción ya iniciada. Precio y cantidad bloqueados");
                sessionStorage.setItem(claveAlerta, '1');
            }
            datosAnteriores.isTrabajoInicio = 1;
        }

        // Verifica si el campo del rol ya tiene valor → desactivar solo ese campo
        data.insumos.forEach(insumo => {
            insumo.procesos.forEach((proceso, procesoIndex) => {
                const campoMap = {
                    0: 'primer_corte',
                    1: 'impresion',
                    2: 'doblado',
                    3: 'compaginado',
                    4: 'engrampado',
                    5: 'segundo_corte'
                };

                const idCampo = campoMap[procesoIndex];
                if (idCampo && document.getElementById(idCampo)) {
                    document.getElementById(idCampo).value = proceso.cantidad_salida_real || '';
                    datosAnteriores.procesos[proceso.id_proceso] = proceso.cantidad_salida_real || '';

                    if (camposPorRol[rol] && camposPorRol[rol].includes(idCampo)) {
                        if (proceso.cantidad_salida_real && rol !== 1) {
                            document.getElementById(idCampo).disabled = true;
                        }
                    }
                }
            });
        });

        // 👇 --- LLAMA a la función de alerta justo aquí ---
        verificarAlertasMerma(data.id_trabajo, data.nombre_trabajo);
    });


// --- BANDEJA DE ALERTAS ---
// --- Aquí la nueva lógica para limpiar, crear y eliminar el div ---

function renderBandejaAlertas(alertas) {
    let bandeja = document.getElementById("bandejaAlertas");
    const esAdmin = localStorage.getItem('rol') === '1';
    // Si no eres admin o no hay alertas, elimina el div completamente y reorganiza layout
    if (!esAdmin || !alertas.length) {
        if (bandeja && bandeja.parentNode) {
            bandeja.parentNode.removeChild(bandeja);
        }
        return;
    }
    // Si el div no existe pero sí hay alertas y eres admin, créalo
    if (!bandeja) {
        bandeja = document.createElement('div');
        bandeja.id = 'bandejaAlertas';
        bandeja.className = 'bandeja-alertas';
        document.querySelector('.contenedor-flex-form-bandeja').appendChild(bandeja);
    }
    // Mostrar las alertas
    bandeja.style.display = "flex";
    bandeja.innerHTML = "";
    alertas.forEach((alerta, idx) => {
        const alertaDiv = document.createElement("div");
        alertaDiv.className = "alerta-merma";
        alertaDiv.innerHTML = `
            <div>
                <strong>${alerta.titulo}</strong><br>
                <span>${alerta.mensaje}</span>
            </div>
            <button class="btn-cerrar-alerta" data-idx="${idx}">✖</button>
        `;
        bandeja.appendChild(alertaDiv);
    });
    if (alertas.length) {
        const vaciarBtn = document.createElement("button");
        vaciarBtn.className = "btn-vaciar-bandeja";
        vaciarBtn.textContent = "Vaciar Bandeja";
        vaciarBtn.onclick = () => {
            // Limpia SOLO las alertas de esta OT
            guardarAlertasPorOT(otActual, []);
            renderBandejaAlertas([]);
        };
        bandeja.appendChild(vaciarBtn);
    }
}

// --- Almacenamiento de alertas por OT y por usuario ---
function getKeyAlertasOT() {
    const usuario = localStorage.getItem('email') || '';
    const ot = otActual || '';
    return `alertasMermaOT_${usuario}_${ot}`;
}
function cargarAlertasPorOT(ot) {
    const usuario = localStorage.getItem('email') || '';
    const key = `alertasMermaOT_${usuario}_${ot || ''}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
}
function guardarAlertasPorOT(ot, alertas) {
    const usuario = localStorage.getItem('email') || '';
    const key = `alertasMermaOT_${usuario}_${ot || ''}`;
    localStorage.setItem(key, JSON.stringify(alertas));
}

let otActual = ""; // Guarda la OT actual para gestionar las alertas

function agregarAlertaMerma(titulo, mensaje) {
    const alertas = cargarAlertasPorOT(otActual);
    alertas.push({ titulo, mensaje });
    guardarAlertasPorOT(otActual, alertas);
    renderBandejaAlertas(alertas);
}

// Maneja cierre individual
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-cerrar-alerta")) {
        const idx = +e.target.dataset.idx;
        const alertas = cargarAlertasPorOT(otActual);
        alertas.splice(idx, 1);
        guardarAlertasPorOT(otActual, alertas);
        renderBandejaAlertas(alertas);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Detecta cuál es la OT inicial
    otActual = localStorage.getItem('nombre_trabajo') || '';
    const alertas = cargarAlertasPorOT(otActual);
    renderBandejaAlertas(alertas);
});

// --- Lógica para verificar alertas y evitar duplicados por OT y usuario ---
async function verificarAlertasMerma(id_trabajo, nombre_trabajo) {
    otActual = nombre_trabajo || '';
    // SOLO PARA ADMIN
    if (localStorage.getItem('rol') !== '1') {
        renderBandejaAlertas([]);
        return;
    }
    // Limpia alertas de la OT anterior
    renderBandejaAlertas([]);
    // IMPORTANTE: Ajusta la ruta si tu API tiene prefijo /auth/
    const res = await fetch(`/auth/ot/${id_trabajo}/procesos-merma`);
    const procesos = await res.json();
    if (!Array.isArray(procesos)) {
        console.error('Respuesta inesperada:', procesos);
        return;
    }
    let alertasNuevas = [];
    procesos.forEach(proc => {
        if (proc.excedido) {
            alertasNuevas.push({
                titulo: `¡Merma excedida en ${proc.nombre_proceso}!`,
                mensaje: `Permitido: ${proc.limite} | Real: ${proc.cantidad_perdida}`
            });
        }
    });
    guardarAlertasPorOT(otActual, alertasNuevas);
    renderBandejaAlertas(alertasNuevas);
}
