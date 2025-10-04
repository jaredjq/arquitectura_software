const db = require('../back/db');
const PDFDocument = require('pdfkit');

// Función para formatear la fecha en formato dd/mm/yyyy
function formatearFecha(fecha) {
  if (!fecha) return "---";
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Función para generar el PDF
const generarPDF = (idTrabajo, res) => {
  console.log("Generando PDF para el trabajo con ID:", idTrabajo);
  const sql = `
    SELECT t.nombre_trabajo, t.fecha_inicio, t.fecha_fin_estimada,
       ti.cantidad AS hojas_ingresadas,
       p.nombre AS proceso, 
       rp.cantidad_salida_real, rp.cantidad_perdida, rp.coste_insumos_perdidos,
       rp.coste_insumos_utilizados, rp.precio_hoja
FROM Trabajo t
JOIN Trabajo_insumos ti ON t.id_trabajo = ti.id_trabajo
JOIN Registro_proceso rp ON ti.id_trabajo_insumo = rp.id_trabajo_insumo
JOIN Proceso p ON rp.id_proceso = p.id_proceso
WHERE t.id_trabajo = ?
ORDER BY rp.id_proceso;
  `;

  db.query(sql, [idTrabajo], (err, rows) => {
    if (err || rows.length === 0) {
      console.error("Error al obtener datos de la base de datos:", err);
      return res.status(404).send("No se encontraron datos para ese trabajo.");
    }
    console.log("Datos obtenidos de la base de datos:", rows);

    const precio_unitario = parseFloat(rows[0].precio_hoja);

    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      // Modificamos aquí para enviar el archivo como una descarga
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="reporte_merma.pdf"');  // Fuerza la descarga del archivo
      res.send(pdfData);
      console.log("PDF generado y enviado con éxito.");
    });


    // ENCABEZADOS
    const startX = 50;
    const startY = 200;
    const colWidths = [100, 90, 50, 90, 50, 100];

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("", startX, 100)
      .text("REPORTE DE MERMA", { align: "center" });

    const trabajo = rows[0];
    doc.moveDown();
    doc
      .fontSize(14)
      .font("Helvetica")
      .text(`Pedido de trabajo: ${trabajo.nombre_trabajo}`, startX, 150, {
        continued: true,
      })
      .text(
        `Fecha: ${formatearFecha(trabajo.fecha_inicio)} a ${formatearFecha(
          trabajo.fecha_fin_estimada
        )}`,
        { align: "right" }
      );

    doc.fontSize(13).font("Helvetica-Bold").text("\n");

    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(`Material Ingresado: ${trabajo.hojas_ingresadas} HJ`);
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(
        `Costo de Material por Unidad (Pliego): S/. ${precio_unitario.toFixed(
          2
        )}`
      );

    doc.fontSize(13).font("Helvetica-Bold").text("\n");
    doc.moveDown();

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Proceso", startX, startY + 50);
    doc.text("Material\nProcesado", startX + colWidths[0], startY + 50);
    doc.text("Unidad", startX + colWidths[0] + colWidths[1], startY + 50);
    doc.text(
      "Merma\nObtenida",
      startX + 20 + colWidths[0] + colWidths[1] + colWidths[2],
      startY + 50
    );
    doc.text(
      "Unidad",
      startX + 20 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      startY + 50
    );
    doc.text(
      "Costo de \nMerma",
      startX +
      45 +
      colWidths[0] +
      colWidths[1] +
      colWidths[2] +
      colWidths[3] +
      colWidths[4],
      startY + 50
    );

    doc
      .moveTo(startX, startY + 80)
      .lineTo(startX + 510, startY + 80)
      .stroke();

    let posY = startY + 90;
    let total_merma = 0;
    let total_costo = 0;

    doc.font("Helvetica").fontSize(11);

    rows.forEach((row, index) => {
      let unidad_material = index <= 2 ? "PL" : "PPL";
      let unidad_merma = index === 0 ? "HJ" : index <= 3 ? "PL" : "PPL";

      doc.text(row.proceso, startX, posY);
      doc.text(row.cantidad_salida_real || 0, startX + 8 + colWidths[0], posY);
      doc.text(
        unidad_material,
        startX + 10 + colWidths[0] + colWidths[1],
        posY
      );
      doc.text(
        row.cantidad_perdida || 0,
        startX + 30 + colWidths[0] + colWidths[1] + colWidths[2],
        posY
      );
      doc.text(
        unidad_merma,
        startX + 30 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
        posY
      );
      doc.text(
        `S/. ${(parseFloat(row.coste_insumos_perdidos) || 0).toFixed(2)}`,
        startX +
        50 +
        colWidths[0] +
        colWidths[1] +
        colWidths[2] +
        colWidths[3] +
        colWidths[4],
        posY
      );

      total_merma += parseFloat(row.cantidad_perdida) || 0;
      total_costo += parseFloat(row.coste_insumos_perdidos) || 0;
      posY += 25;
    });

    doc.fontSize(13).font("Helvetica-Bold").text("\n");

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text(`Total Material en Merma : ${total_merma}`, startX, posY + 20);
    doc.text(
      `Total Costo de Merma: S/. ${(parseFloat(total_costo) || 0).toFixed(2)}`,
      startX,
      posY + 60
    );

    doc.font("Helvetica-Bold").fontSize(6);
    doc.text(
      `LEYENDA:  ¨HJ: Hojas   ¨PL: Pliegos   ¨PP: Par-Pliegos `,
      startX,
      posY + 140,
      { align: "right" }
    );
    doc.end();
  });
};

module.exports = { generarPDF };
