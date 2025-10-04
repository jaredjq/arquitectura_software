const guardarDatos = (d, callback) => {
  const trabajo_nombre = d.nombre_trabajo;
  const hojas_ingresadas = parseInt(d.cantidad_hojas_ingresadas);
  const precio_hoja = parseFloat(d.precio_hoja);

  const procesos = [
    { id: 1, salida: parseInt(d.salida_corte1) },
    { id: 2, salida: parseInt(d.salida_impresion) },
    { id: 3, salida: parseInt(d.salida_doblado) },
    { id: 4, salida: parseInt(d.salida_compaginado) },
    { id: 5, salida: parseInt(d.salida_engrapado) },
    { id: 6, salida: parseInt(d.salida_corte2) },
  ];

  db.query(
    "INSERT INTO trabajo (nombre_trabajo, fecha_inicio, fecha_fin_estimada, estado_trabajo, cantidad_vendida) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE fecha_inicio = VALUES(fecha_inicio), fecha_fin_estimada = VALUES(fecha_fin_estimada), cantidad_vendida = VALUES(cantidad_vendida)",
    [
      trabajo_nombre,
      d.fecha_inicial,
      d.fecha_final,
      "En proceso",
      hojas_ingresadas,
    ],
    (err) => {
      if (err) {
        console.error("Error al insertar trabajo:", err);
        return callback(err);
      }

      // Insertar el precio de la hoja
      db.query(
        "INSERT INTO insumo (descripcion, precio_unitario) VALUES ('Papel', ?)",
        [precio_hoja],
        (err2, result2) => {
          if (err2) {
            console.error("Error insertando en insumo:", err2);
            return callback(err2);
          }

          const id_insumo = result2.insertId;

          db.query(
            "SELECT id_trabajo FROM trabajo WHERE nombre_trabajo = ?",
            [trabajo_nombre],
            (err, result) => {
              if (err || result.length === 0) {
                return callback("No se encontró el trabajo.");
              }

              const id_trabajo = result[0].id_trabajo;

              db.query(
                "INSERT IGNORE INTO trabajo_insumos (id_trabajo, id_insumo, cantidad) VALUES (?, ?, ?)",
                [id_trabajo, id_insumo, hojas_ingresadas],
                (err) => {
                  if (err) {
                    console.error("Error en trabajo_insumos:", err);
                    return callback(err);
                  }

                  db.query(
                    "SELECT id_trabajo_insumo FROM trabajo_insumos WHERE id_trabajo = ? AND id_insumo = ?",
                    [id_trabajo, id_insumo],
                    (err, result) => {
                      if (err || result.length === 0) {
                        return callback("No se encontró el trabajo_insumo.");
                      }

                      const id_trabajo_insumo = result[0].id_trabajo_insumo;

                      let cantidad_entrada = hojas_ingresadas;

                      procesos.forEach((proceso, index) => {
                        let cantidad_salida_ideal = cantidad_entrada;
                        const cantidad_salida_real = proceso.salida;

                        let cantidad_perdida = cantidad_entrada - cantidad_salida_real;
                        let costo_merma;
                        let coste_utilizado;

                        // Aquí deberías agregar la lógica de cálculo de mermas y costos según tus reglas de negocio

                        db.query(
                          "INSERT INTO registro_proceso (id_trabajo_insumo, id_proceso, cantidad_entrada, cantidad_salida_ideal, cantidad_salida_real, cantidad_perdida, fecha_registro, coste_insumos_utilizados, coste_insumos_perdidos, precio_hoja) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                          [
                            id_trabajo_insumo,
                            proceso.id,
                            cantidad_entrada,
                            cantidad_salida_ideal,
                            cantidad_salida_real,
                            cantidad_perdida,
                            d.fecha_inicial,
                            coste_utilizado,
                            costo_merma,
                            precio_hoja,
                          ],
                          (err) => {
                            if (err) {
                              console.error("Error en registro_proceso:", err);
                            }
                          }
                        );

                        cantidad_entrada = cantidad_salida_real;
                      });

                      callback(null, "Datos guardados correctamente.");
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
