document.addEventListener("DOMContentLoaded", () => {
    const procesosVisuales = [
        "1 CORTE",
        "IMPRESION",
        "DOBLADO",
        "COMPAGINADO",
        "ENGRAMPADO",
        "2 CORTE"
    ];

    const tabla = document.getElementById("tablaCuerpo");

    procesosVisuales.forEach((proceso, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${proceso}</td>
            <td><input type="number" id="merma-${index}" placeholder="0" readonly></td>
            <td><input type="text" id="valorUnidad-${index}" placeholder="S/. 0.00"></td>
            <td><input type="text" id="valorTotal-${index}" value="S/. 0.00" readonly></td>
            <td><button onclick="calcularFila(${index})">Calculo P${index + 1}</button></td>
        `;
        tabla.appendChild(tr);

        // Formatear valor unidad al salir del input
        const valorUnidadInput = document.getElementById(`valorUnidad-${index}`);
        valorUnidadInput.addEventListener("blur", () => {
            let valor = parseFloat(valorUnidadInput.value.replace("S/.", "").trim());
            if (!isNaN(valor)) {
                valorUnidadInput.value = `S/. ${valor.toFixed(2)}`;
            } else {
                valorUnidadInput.value = "S/. 0.00";
            }
        });
    });
});

// 👉 Calculo por fila
function calcularFila(index) {
    const merma = parseFloat(document.getElementById(`merma-${index}`).value) || 0;
    const valorUnidadStr = document.getElementById(`valorUnidad-${index}`).value.replace("S/.", "").trim();
    const valorUnidad = parseFloat(valorUnidadStr) || 0;

    const total = merma * valorUnidad;
    document.getElementById(`valorTotal-${index}`).value = `S/. ${total.toFixed(2)}`;
}

// 👉 Calculo total general
function calcularTotal() {
    let totalGeneral = 0;
    for (let i = 0; i < 6; i++) {
        const valorStr = document.getElementById(`valorTotal-${i}`).value.replace("S/.", "").trim();
        const totalFila = parseFloat(valorStr) || 0;
        totalGeneral += totalFila;
    }
    document.getElementById("totalGeneral").textContent = `S/. ${totalGeneral.toFixed(2)}`;
}

// 🔍 Funcionalidad buscador OT
const btn_limpiar = document.getElementById("btn_limpiar");
const btn_salir = document.getElementById("btn_salir");
const nombreOTElemento = document.getElementById("nombreOT");

btn_limpiar.addEventListener("click", () => {
    nombreOTElemento.value = "";
    limpiarCampos();
});

btn_salir.addEventListener("click", () => {
    window.location.href = "Bienvenidos.html";
});

// 🔍 Buscar OT
document.getElementById("formu").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombreOT = nombreOTElemento.value.trim().toUpperCase();

    if (nombreOT === "") {
        alert("⚠️ Ingrese un valor en el campo OT.");
        return;
    }

    if (!/^[A-Z]\d+$/.test(nombreOT)) {
        alert("⚠️ Formato incorrecto de OT. Ejemplo: R0525");
        return;
    }

    try {
        // 🔍 Verificar existencia OT
        const resVerificar = await fetch('https://hilmart.site/auth/verificarOTMerma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreOT })
        });

        const dataVerificar = await resVerificar.json();

        if (!dataVerificar.encontrada) {
            alert("❌ OT no encontrada.");
            limpiarCampos();
            return;
        }

        const id_trabajo = dataVerificar.id_trabajo;

        // 🔎 Obtener mermas
        const resMerma = await fetch('https://hilmart.site/auth/obtenerMerma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_trabajo })
        });

        const dataMerma = await resMerma.json();

        if (!dataMerma.datos || dataMerma.datos.length === 0) {
            alert("⚠️ No se encontraron datos de merma.");
            limpiarCampos();
            return;
        }

        // 🔥 Mapeo BD -> Visual
        const mapeoProcesos = {
            "Corte 1": "1 CORTE",
            "Impresión": "IMPRESION",
            "Doblado": "DOBLADO",
            "Compaginado": "COMPAGINADO",
            "Engrapado": "ENGRAMPADO",
            "Corte 2": "2 CORTE"
        };

        const procesosVisuales = [
            "1 CORTE",
            "IMPRESION",
            "DOBLADO",
            "COMPAGINADO",
            "ENGRAMPADO",
            "2 CORTE"
        ];

        procesosVisuales.forEach((procesoVisual, index) => {
            const nombreProcesoBD = Object.keys(mapeoProcesos).find(key => mapeoProcesos[key] === procesoVisual);
            const procesoData = dataMerma.datos.find(p => p.nombre_proceso === nombreProcesoBD);
            const inputMerma = document.getElementById(`merma-${index}`);

            if (procesoData) {
                inputMerma.value = procesoData.cantidad_perdida;
            } else {
                inputMerma.value = 0;
            }
        });

        alert("✅ OT encontrada y mermas cargadas correctamente.");

    } catch (error) {
        console.error("❌ Error al buscar datos:", error);
        alert("❌ Error al buscar datos.");
    }
});

// 🔄 Limpiar campos
function limpiarCampos() {
    for (let i = 0; i < 6; i++) {
        document.getElementById(`merma-${i}`).value = "";
        document.getElementById(`valorUnidad-${i}`).value = "S/. 0.00";
        document.getElementById(`valorTotal-${i}`).value = "S/. 0.00";
    }
    document.getElementById("totalGeneral").textContent = "S/. 0.00";
}
