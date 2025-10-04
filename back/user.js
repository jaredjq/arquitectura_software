const { raw } = require('body-parser');
const db = require('../back/db');
const bcrypt = require('bcryptjs');
let id_insumo_temp;
let id_trabajo_temp;
let id_insumoTrabajo_temp;

// Buscar usuario por correo
const findUserByEmail = (email, callback) => {
  const query = `SELECT *
                FROM USUARIOS 
                WHERE email = ?;`;
  db.query(query, [email], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) {
      return callback(null, null);  // Si no se encuentra el usuario
    }
    return callback(null, results[0]); // Si encuentra el usuario
  });
};

// Actualizar contraseña
const updatePassword = (email, hashedPassword, callback) => {
  const query = 'UPDATE USUARIOS SET password_hash = ? WHERE email = ?';
  db.query(query, [hashedPassword, email], (err, results) => {
    if (err) return callback(err);
    return callback(null, results);
  });
};

// Insertar Usuario

const insertarUsuario = (email, password, id_estado, id_condicion, callback) => {
  const sql = 'INSERT INTO USUARIOS (email, password_hash, id_estado, id_condicion) VALUES (?, ?, ?, ?)';
  db.query(sql, [email, password, id_estado, id_condicion], callback);
};

// Obtener usuarios con JOIN estado
const obtenerUsuariosConRol = (callback) => {
  const sql = `
        SELECT u.id_usuario, u.email, u.id_estado, u.id_condicion, e.descripcion 
        FROM USUARIOS u
        JOIN Estado e ON u.id_estado = e.id_estado
    `;
  db.query(sql, callback);
};

// Obtener usuarios con JOIN estado
const obtenerUsuariosCondicion = (callback) => {
  const sql = `
      SELECT 
        u.id_usuario, 
        u.email, 
        u.id_condicion, 
        e.descripcion AS estado_descripcion, 
        c.descripcion AS condicion_descripcion 
      FROM USUARIOS u
      JOIN Estado e ON u.id_estado = e.id_estado
      JOIN Condicion c ON u.id_condicion = c.id_condicion
  `;
  db.query(sql, callback);
};

// Actualizar rol de un usuario
const actualizarRol = (id, id_estado, callback) => {
  const sql = 'UPDATE USUARIOS SET id_estado = ? WHERE id_usuario = ?';
  db.query(sql, [id_estado, id], callback);
};

// Actualizar condicion de un usuario
const actualizarCondicion = (id, id_condicion, callback) => {
  const sql = 'UPDATE USUARIOS SET id_condicion = ? WHERE id_usuario = ?';
  db.query(sql, [id_condicion, id], callback);
};

// Encontrar OT
const findOTByNombre = (nombreOT, callback) => {
  const query = ` 
    SELECT 
      t.id_trabajo,
      t.nombre_trabajo,
      t.fecha_inicio,
      t.fecha_fin_estimada,
      ti.id_insumo,
      ti.cantidad AS cantidad_insumo,
      i.precio_unitario,
      rp.id_proceso,
      rp.cantidad_salida_real,
      rp.precio_hoja
    FROM Trabajo t
    LEFT JOIN Trabajo_insumos ti ON t.id_trabajo = ti.id_trabajo
    LEFT JOIN Insumo i ON ti.id_insumo = i.id_insumo  -- JOIN con la tabla Insumo para obtener precio_unitario
    LEFT JOIN Registro_proceso rp ON ti.id_trabajo_insumo = rp.id_trabajo_insumo
    WHERE t.nombre_trabajo = ?
  `;

  console.log("Ejecutando consulta con nombre_ot: ", nombreOT);  // Verifica el nombre de OT que se está buscando

  db.query(query, [nombreOT], (err, results) => {
    if (err) {
      console.error("Error en la consulta SQL:", err);  // Imprime el error en caso de fallo
      return callback(err);
    }

    console.log("Resultados obtenidos de la consulta:", results);  // Imprime los resultados obtenidos

    if (results.length === 0) {
      return callback(null, null);  // No encontrada
    }

    // Estructura para los datos de la OT
    const otData = {
      id_trabajo: results[0].id_trabajo,
      nombre_trabajo: results[0].nombre_trabajo,
      fecha_inicio: results[0].fecha_inicio,
      fecha_fin_estimada: results[0].fecha_fin_estimada,
      insumos: []
    };

    results.forEach(row => {
      // Si no existe el insumo en la lista, agregarlo
      const insumo = otData.insumos.find(i => i.id_insumo === row.id_insumo);
      if (!insumo) {
        otData.insumos.push({
          id_insumo: row.id_insumo,
          cantidad: row.cantidad_insumo || null,  // Si no existe, ponemos null
          precio_unitario: row.precio_unitario || null,  // Si no existe, ponemos null
          procesos: []
        });
      }

      // Asociar los procesos al insumo correspondiente
      const proceso = otData.insumos.find(i => i.id_insumo === row.id_insumo).procesos;
      proceso.push({
        id_proceso: row.id_proceso || null,  // Si no existe, ponemos null
        cantidad_salida_real: row.cantidad_salida_real || null,  // Si no existe, ponemos null
        precio_hoja: row.precio_hoja || null  // Si no existe, ponemos null
      });
    });

    console.log("Data que se está enviando:", otData); // Verifica qué datos se están enviando
    return callback(null, otData);  // Retorna la data organizada
  });
};


const verificarOTExistente = (nombreOT, callback) => {
  const sql = 'SELECT * FROM Trabajo WHERE nombre_trabajo = ?';
  db.query(sql, [nombreOT], (err, results) => {
    if (err) return callback(err);
    if (results.length > 0) {
      return callback(null, true); // La OT ya existe
    }
    return callback(null, false); // La OT no existe
  });
};

const creacionOT = (nombreOT, fechaInicioOT, estadoTrabajo, privArchiv, callback) => {
  const sql = 'INSERT INTO Trabajo (nombre_trabajo, fecha_inicio, fecha_fin_estimada, estado_trabajo, cantidad_vendida, dinero_ganado_total, cantidad_perdida, dinero_perdido_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [nombreOT, fechaInicioOT, fechaInicioOT, estadoTrabajo, privArchiv, privArchiv, privArchiv, privArchiv], (err, result) => {
    if (err) return callback(err);
    id_trabajo_temp = result.insertId;
    return callback(null, result);
  });
};

const creacionInsumo = (precioHoja, callback) => {
  const sql = 'INSERT INTO Insumo (descripcion, precio_unitario) VALUES (?, ?)';
  db.query(sql, ['Papel Bond', precioHoja], (err, result) => {
    if (err) return callback(err);
    id_insumo_temp = result.insertId;
    return callback(null, result);
  });
};

const creacionCantidadInsumo = (cantidadHojasOT, callback) => {
  const sql = 'INSERT INTO Trabajo_insumos (id_trabajo, id_insumo, cantidad) VALUES (?, ?, ?)';
  db.query(sql, [id_trabajo_temp, id_insumo_temp, cantidadHojasOT], (err, result) => {
    if (err) return callback(err);
    id_insumoTrabajo_temp = result.insertId;
    return callback(null, result);
  });
};

const creacionProcesos = (cantidadHojasOT, precioHoja, privArchiv, fechaInicioOT, callback) => {
  const procesos = [
    { id: 1, salida: privArchiv },
    { id: 2, salida: privArchiv },
    { id: 3, salida: privArchiv },
    { id: 4, salida: privArchiv },
    { id: 5, salida: privArchiv },
    { id: 6, salida: privArchiv }
  ];

  let cantidadEntrada = cantidadHojasOT;

  const insertarProceso = (index) => {
    if (index >= procesos.length) return callback(null, "Todos los procesos insertados");

    const proceso = procesos[index];
    const id_proceso = proceso.id;
    const cantidad_salida_real = privArchiv;
    let cantidad_salida_ideal, cantidad_perdida, costo_merma, coste_utilizado;

    // Reglas de negocio por índice
    if (index === 0) {
      cantidad_salida_ideal = cantidadEntrada * 2;
      cantidad_perdida = (cantidad_salida_ideal - cantidad_salida_real) / 2;
      costo_merma = cantidad_perdida * precioHoja * 2;
      coste_utilizado = cantidad_salida_real * precioHoja;
    } else if (index >= 1 && index <= 2) {
      cantidad_salida_ideal = cantidadEntrada;
      cantidad_perdida = cantidad_salida_ideal - cantidad_salida_real;
      costo_merma = cantidad_perdida * precioHoja;
      coste_utilizado = cantidad_salida_real * precioHoja;
    } else if (index === 3) {
      cantidad_salida_ideal = cantidadEntrada / 2;
      cantidad_perdida = (cantidad_salida_ideal - cantidad_salida_real) * 2;
      costo_merma = cantidad_perdida * precioHoja;
      coste_utilizado = cantidad_salida_real * 2 * precioHoja;
    } else {
      cantidad_salida_ideal = cantidadEntrada;
      cantidad_perdida = cantidad_salida_ideal - cantidad_salida_real;
      costo_merma = cantidad_perdida * precioHoja * 2;
      coste_utilizado = cantidad_salida_real * 2 * precioHoja;
    }

    const sql = `
      INSERT INTO Registro_proceso
        (id_trabajo_insumo, id_proceso, cantidad_entrada, cantidad_salida_ideal, cantidad_salida_real,
         cantidad_perdida, fecha_registro, coste_insumos_utilizados, coste_insumos_perdidos, precio_hoja)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
      id_insumoTrabajo_temp,
      id_proceso,
      cantidadEntrada,
      cantidad_salida_ideal,
      cantidad_salida_real,
      cantidad_perdida,
      fechaInicioOT,
      coste_utilizado,
      costo_merma,
      precioHoja
    ], (err) => {
      if (err) {
        console.error(`Error al insertar proceso ${id_proceso}:`, err);
        return callback(err);
      }

      cantidadEntrada = cantidad_salida_real; // Para el siguiente proceso
      insertarProceso(index + 1); // Recurre al siguiente
    });
  };
  insertarProceso(0); // Iniciar inserción recursiva
};

// Buscar trabajo por nombre
const findTrabajoByNombre = (nombreTrabajo, callback) => {
  const query = 'SELECT * FROM Trabajo WHERE nombre_trabajo = ?';
  db.query(query, [nombreTrabajo], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) {
      return callback(null, null);  // Si no se encuentra el trabajo
    }
    return callback(null, results[0]); // Si encuentra el trabajo
  });
};

const obtenerIdTrabajoPorNombre = (nombreTrabajo, callback) => {
  const sql = 'SELECT id_trabajo FROM Trabajo WHERE nombre_trabajo = ?';
  db.query(sql, [nombreTrabajo], (err, result) => {
    if (err) {
      console.error('Error en la consulta de la base de datos:', err);
      return callback(err, null);
    }
    if (!result || result.length === 0) {
      console.log(`No se encontró el trabajo con nombre ${nombreTrabajo}`);
      return callback(new Error('Trabajo no encontrado'), null);
    }
    console.log(`Trabajo encontrado: ${result[0].id_trabajo}`);
    callback(null, result[0].id_trabajo);
  });
};

const mostrarDatosGrafica = (nombredetrabajo, callback) => {
  console.log('Consultando datos para el trabajo:', nombredetrabajo);

  // Nueva consulta para obtener cantidad_perdida de Registro_proceso
  const sql = `
        SELECT 
            rp.cantidad_perdida, 
            p.nombre AS proceso
        FROM 
            Trabajo t
        JOIN 
            Trabajo_insumos ti ON t.id_trabajo = ti.id_trabajo
        JOIN 
            Registro_proceso rp ON ti.id_trabajo_insumo = rp.id_trabajo_insumo
        JOIN 
            Proceso p ON rp.id_proceso = p.id_proceso
        WHERE 
            t.nombre_trabajo = ?
    `;

  // Ejecutamos la consulta
  db.query(sql, [nombredetrabajo], (err, results) => {
    if (err) {
      console.error('Error en la consulta SQL:', err);
      return callback(err); // Si hay un error en la consulta, lo pasamos al callback
    }

    // Si encontramos resultados, los procesamos
    if (results.length > 0) {
      console.log('Datos encontrados:', results);

      // Preparamos los datos para la gráfica
      const data = {
        labels: results.map(row => row.proceso),  // Usamos los nombres de los procesos como etiquetas
        data: results.map(row => row.cantidad_perdida),  // Usamos la cantidad perdida como los valores
      };

      return callback(null, data); // Devolvemos los datos para la gráfica
    }

    console.log('No se encontraron resultados para el trabajo:', nombredetrabajo);
    return callback(null, false); // Si no hay datos, devolvemos `false`
  });
};

const mostrarDatosGrafica2 = (nombredetrabajo, callback) => {
    console.log('Consultando costos para el trabajo:', nombredetrabajo);

    const sql = `
        SELECT 
            p.nombre AS proceso,
            SUM(rp.coste_insumos_perdidos) AS costo_total
        FROM 
            Trabajo t
        JOIN 
            Trabajo_insumos ti ON t.id_trabajo = ti.id_trabajo
        JOIN 
            Registro_proceso rp ON ti.id_trabajo_insumo = rp.id_trabajo_insumo
        JOIN 
            Proceso p ON rp.id_proceso = p.id_proceso
        WHERE 
            t.nombre_trabajo = ?
        GROUP BY 
            p.nombre
    `;

    db.query(sql, [nombredetrabajo], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return callback(err);
        }

        if (results.length > 0) {
            console.log('Datos encontrados:', results);

            const data = {
                labels: results.map(row => row.proceso),
                data: results.map(row => row.costo_total)
            };

            return callback(null, data);
        }

        console.log('No se encontraron resultados para el trabajo:', nombredetrabajo);
        return callback(null, false);
    });
};

const listarProyectos = (callback) => {
  const sql = "SELECT nombre_trabajo FROM Trabajo";
  db.query(sql, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

const actualizarCorreo = (id, nuevoCorreo, callback) => {
  const sql = 'UPDATE USUARIOS SET email = ? WHERE id_usuario = ?';
  db.query(sql, [nuevoCorreo, id], callback);
};

const actualizarPasswordPorId = (id, hash, callback) => {
  const sql = 'UPDATE USUARIOS SET password_hash = ? WHERE id_usuario = ?';
  db.query(sql, [hash, id], callback);
};

const actualizarCorreoYPassword = (id, nuevoCorreo, hash, callback) => {
  const sql = 'UPDATE USUARIOS SET email = ?, password_hash = ? WHERE id_usuario = ?';
  db.query(sql, [nuevoCorreo, hash, id], callback);
};

const actualizarFechaFin = (idTrabajo, fechaFin, callback) => {
  const sql = 'UPDATE Trabajo SET fecha_fin_estimada = ? WHERE id_trabajo = ?';
  db.query(sql, [fechaFin, idTrabajo], callback);
};

// Buscar id_trabajo_insumo por id_trabajo
const findTraInsumoByIdTrabajo = (idTrabajo, callback) => {
  const query = 'SELECT * FROM Trabajo_insumos WHERE id_trabajo = ?';
  db.query(query, [idTrabajo], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) {
      return callback(null, null);  // Si no se encuentra el registro
    }
    return callback(null, results); // Si encuentra el id
  });
};

const actualizarCantidadHojas = (idTrabajoInsumo, cantidadHojas, callback) => {
  const sql = 'UPDATE Trabajo_insumos SET cantidad = ? WHERE id_trabajo_insumo = ?';
  db.query(sql, [cantidadHojas, idTrabajoInsumo], callback);
};

//Encontrar el precio de la BD del trabajo
const findPrecioTrabajo = (idTrabajo, callback) => {
  const sql = `
        SELECT 
            i.precio_unitario
        FROM 
            Trabajo t
        JOIN 
            Trabajo_insumos ti ON t.id_trabajo = ti.id_trabajo
        JOIN 
            Insumo i ON ti.id_insumo = i.id_insumo
        WHERE 
            t.id_trabajo = ?
    `;

  db.query(sql, [idTrabajo], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) {
      return callback(null, null);  // Si no se encuentra el registro
    }
    return callback(null, results); // Si encuentra el id
  });
};


const actualizarProcesos = (idTrabajoInsumo, nuevaCantidadEntrada, precioHoja, callback) => {
  const procesos = [1, 2, 3, 4, 5, 6];
  let cantidadEntrada = nuevaCantidadEntrada;
  let cantidad_salida_real = 0;

  const actualizarProceso = (index) => {
    if (index >= procesos.length) return callback(null, "Procesos actualizados");

    const id_proceso = procesos[index];
    let cantidad_salida_ideal, cantidad_perdida, coste_perdido, coste_utilizado;

    if (index === 0) {
      cantidad_salida_ideal = cantidadEntrada * 2;
      cantidad_perdida = (cantidad_salida_ideal - cantidad_salida_real) / 2;
      coste_utilizado = cantidad_salida_real * precioHoja;
      coste_perdido = cantidad_perdida * precioHoja * 2;
    } else if (index === 3) {
      cantidad_salida_ideal = cantidadEntrada / 2;
      cantidad_perdida = (cantidad_salida_ideal - cantidad_salida_real) *2;
      coste_utilizado = cantidad_salida_real * 2 * precioHoja;
      coste_perdido = cantidad_perdida * precioHoja;
    } else if (index >= 1 && index <= 2) {
      cantidad_salida_ideal = cantidadEntrada;
      cantidad_perdida = cantidad_salida_ideal - cantidad_salida_real;
      coste_utilizado = cantidad_salida_real * precioHoja;
      coste_perdido = cantidad_perdida * precioHoja;
    } else {
      cantidad_salida_ideal = cantidadEntrada;
      cantidad_perdida = cantidad_salida_ideal - cantidad_salida_real;
      coste_utilizado = cantidad_salida_real * 2 * precioHoja;
      coste_perdido = cantidad_perdida * precioHoja * 2;
    }

    const sql = `
      UPDATE Registro_proceso 
      SET cantidad_entrada = ?, cantidad_salida_ideal = ?, cantidad_salida_real = ?,
          cantidad_perdida = ?, coste_insumos_utilizados = ?, 
          coste_insumos_perdidos = ?
      WHERE id_trabajo_insumo = ? AND id_proceso = ?
    `;

    db.query(sql, [
      cantidadEntrada,
      cantidad_salida_ideal,
      cantidad_salida_real,
      cantidad_perdida,
      coste_utilizado,
      coste_perdido,
      idTrabajoInsumo,
      id_proceso
    ], (err) => {
      if (err){
        console.error(`Error al insertar proceso ${id_proceso}:`, err);
        return callback(err);
      }

      console.log(`Proceso ${id_proceso} actualizado correctamente`); 
      cantidadEntrada = cantidad_salida_real; // Para el siguiente proceso
      actualizarProceso(index + 1);; // Recurre al siguiente
    });
  };

  actualizarProceso(0);
};



const findInsumoByIdTrabajoInsumo = (idTrabajoInsumo, callback) => {
  const query = 'SELECT * FROM Trabajo_insumos WHERE id_trabajo_insumo = ?';
  db.query(query, [idTrabajoInsumo], (err, result) => {
    if (err) return callback(err);
    if (result.length === 0) {
      return callback(null, null);  // Si no se encuentra el registro
    }
    return callback(null, result); // Si encuentra el id
  });
};

const actualizarPrecioInsumo = (idInsumo, precioInsumo, callback) => {
  const sql = 'UPDATE Insumo SET precio_unitario = ? WHERE id_insumo = ?';
  db.query(sql, [precioInsumo, idInsumo], callback);
};

const obtenerProcesosPorTrabajo = (idTrabajoInsumo, callback) => {
  const sql = 'SELECT * FROM Registro_proceso WHERE id_trabajo_insumo = ? ORDER BY id_proceso ASC';
  db.query(sql, [idTrabajoInsumo], (err, procesos) => {
    if (err) return callback(err);
    if (procesos.length === 0) {
      return callback(null, null);  // Si no se encuentra el registro
    }
    return callback(null, procesos); // Si encuentra el id
  });
};

const actualizarCostosProcesos = (idTrabajoInsumo, nuevoPrecio, procesos, callback) => {

  const actualizarUnoPorUno = (index) => {
    if (index >= procesos.length) return callback(null, "Costos actualizados");

    const proceso = procesos[index];
    const { id_proceso, cantidad_salida_real, cantidad_perdida } = proceso;

    let coste_utilizado, coste_perdido;

    if (id_proceso === 1) {
      // Procesos con doble coste
      coste_utilizado = cantidad_salida_real * nuevoPrecio;
      coste_perdido = cantidad_perdida * nuevoPrecio * 2;
    } else if (id_proceso === 2 || id_proceso === 3) {
      coste_utilizado = cantidad_salida_real * nuevoPrecio;
      coste_perdido = cantidad_perdida * nuevoPrecio;
    } else if (id_proceso === 4) {
      // Compaginado (salida es la mitad de la entrada)
      coste_utilizado = cantidad_salida_real * 2 * nuevoPrecio;
      coste_perdido = cantidad_perdida * nuevoPrecio;
    } else {
      // Procesos normales
      coste_utilizado = cantidad_salida_real * 2 * nuevoPrecio;
      coste_perdido = cantidad_perdida * nuevoPrecio * 2;
    }

    const sqlUpdate = `
        UPDATE Registro_proceso
        SET coste_insumos_utilizados = ?, coste_insumos_perdidos = ?, precio_hoja = ?
        WHERE id_trabajo_insumo = ? AND id_proceso = ?
      `;

    db.query(sqlUpdate, [
      coste_utilizado,
      coste_perdido,
      nuevoPrecio,
      idTrabajoInsumo,
      id_proceso
    ], (err) => {
      if (err) return callback(err);
      actualizarUnoPorUno(index + 1);
    });
  };
  actualizarUnoPorUno(0);
};

const actualizarProcesosDesde = (idTrabajoInsumo, procesosEditados, precioHoja, procesosActuales, callback) => {
  const procesosOrdenados = [1, 2, 3, 4, 5, 6];

  // Mapear por ID para acceso rápido
  const cambios = {};
  procesosEditados.forEach(p => {
    cambios[p.id_proceso] = p.cantidad_salida_real;
  });

  const actualizados = procesosActuales.map(p => ({
    ...p,
    cantidad_salida_real: cambios[p.id_proceso] ?? p.cantidad_salida_real
  }));

  let indexCambio = procesosOrdenados.findIndex(p => cambios[p] !== undefined);
  if (indexCambio === -1) return callback(null, "Nada que actualizar");

  const actualizarDesde = (index) => {
    if (index >= procesosOrdenados.length) return callback(null, "Actualización completa");

    const id_proceso = procesosOrdenados[index];
    const proceso = actualizados.find(p => p.id_proceso === id_proceso);
    if (!proceso) return actualizarDesde(index + 1);

    //  Validar salida real
    const salidaReal = Number(proceso.cantidad_salida_real);
    if (isNaN(salidaReal)) return callback(new Error(`Salida real inválida en proceso ${id_proceso}`));
    // Calcular nuevas entradas y costos
    const cantidad_entrada = index === 0
      ? proceso.cantidad_entrada // primer proceso mantiene entrada
      : actualizados[index - 1].cantidad_salida_real;

    let cantidad_salida_ideal, cantidad_perdida, coste_utilizado, coste_perdido;

    if (id_proceso === 1) {
      cantidad_salida_ideal = cantidad_entrada * 2;
      cantidad_perdida = (cantidad_salida_ideal - salidaReal) / 2;
      coste_utilizado = salidaReal * precioHoja;
      coste_perdido = cantidad_perdida * precioHoja * 2;
    } else if (id_proceso === 2 || id_proceso === 3) {
      cantidad_salida_ideal = cantidad_entrada;
      cantidad_perdida = cantidad_salida_ideal - salidaReal;
      coste_utilizado = salidaReal * precioHoja;
      coste_perdido = cantidad_perdida * precioHoja;
    } else if (id_proceso === 4) {
      cantidad_salida_ideal = cantidad_entrada / 2;
      cantidad_perdida = cantidad_salida_ideal - salidaReal;
      coste_utilizado = salidaReal * 2 * precioHoja;
      coste_perdido = cantidad_perdida * precioHoja;
    } else {
      cantidad_salida_ideal = cantidad_entrada;
      cantidad_perdida = cantidad_salida_ideal - salidaReal;
      coste_utilizado = salidaReal * precioHoja * 2;
      coste_perdido = cantidad_perdida * precioHoja * 2;
    }

    // Formato decimal consistente
    coste_utilizado = parseFloat(coste_utilizado.toFixed(4));
    coste_perdido = parseFloat(coste_perdido.toFixed(4));

    // Guardar cambios en la BD
    const sql = `
        UPDATE Registro_proceso
        SET cantidad_entrada = ?, cantidad_salida_ideal = ?, cantidad_salida_real = ?, cantidad_perdida = ?,
            coste_insumos_utilizados = ?, coste_insumos_perdidos = ?
        WHERE id_trabajo_insumo = ? AND id_proceso = ?
      `;

    db.query(sql, [
      cantidad_entrada,
      cantidad_salida_ideal,
      salidaReal,
      cantidad_perdida,
      coste_utilizado,
      coste_perdido,
      idTrabajoInsumo,
      id_proceso
    ], (err) => {
      if (err) return callback(err);
      // Actualizar el array en memoria
      proceso.cantidad_entrada = cantidad_entrada;
      proceso.cantidad_salida_ideal = cantidad_salida_ideal;
      proceso.cantidad_perdida = cantidad_perdida;
      actualizarDesde(index + 1);
    });
  };

  actualizarDesde(indexCambio);
};


// 🔍 Buscar OT específica para la calculadora de merma
const buscarOTMerma = (nombreOT, callback) => {
    const sql = 'SELECT * FROM Trabajo WHERE nombre_trabajo = ?';
    db.query(sql, [nombreOT], (err, results) => {
        if (err) return callback(err);

        if (results.length > 0) {
            callback(null, results[0]);
        } else {
            callback(null, null);
        }
    });
};

// Obtener los procesos de una OT y comparar con su límite de merma
const obtenerProcesosConMerma = (id_trabajo, callback) => {
    const sql = `
        SELECT 
            p.nombre AS nombre_proceso,
            rp.cantidad_perdida,
            lm.limite AS limite_merma,
            CASE WHEN rp.cantidad_perdida > lm.limite THEN 1 ELSE 0 END AS excedido
        FROM Registro_proceso rp
        JOIN Proceso p ON rp.id_proceso = p.id_proceso
        JOIN Trabajo_insumos ti ON rp.id_trabajo_insumo = ti.id_trabajo_insumo
        JOIN Trabajo t ON ti.id_trabajo = t.id_trabajo
        JOIN Limite_merma lm ON lm.id_proceso = p.id_proceso
        WHERE t.id_trabajo = ?
    `;
    db.query(sql, [id_trabajo], (err, results) => {
        if (err) return callback(err);
        // Verifica que results sea un array
        if (!Array.isArray(results)) return callback(null, []);
        callback(null, results.map(row => ({
            nombre_proceso: row.nombre_proceso,
            cantidad_perdida: row.cantidad_perdida,
            limite: row.limite_merma,
            excedido: !!row.excedido
        })));
    });
};

// 🔍 Obtener las mermas por OT (cantidad perdida de cada proceso)
const obtenerMermasPorOT = (id_trabajo, callback) => {
    const query = `
        SELECT 
            p.id_proceso,
            p.nombre AS nombre_proceso,
            rp.cantidad_perdida
        FROM Trabajo t
        INNER JOIN Trabajo_insumos ti ON t.id_trabajo = ti.id_trabajo
        INNER JOIN Registro_proceso rp ON ti.id_trabajo_insumo = rp.id_trabajo_insumo
        INNER JOIN Proceso p ON rp.id_proceso = p.id_proceso
        WHERE t.id_trabajo = ?
        ORDER BY p.id_proceso
    `;

    console.log("🔍 Ejecutando obtenerMermasPorOT con id_trabajo:", id_trabajo);

    db.query(query, [id_trabajo], (err, results) => {
        if (err) {
            console.error("❌ Error SQL en obtenerMermasPorOT:", err);
            return callback(err);
        }

        const nombreProcesos = ["Corte 1", "Impresión", "Doblado", "Compaginado", "Engrapado", "Corte 2"];

        const datosOrdenados = nombreProcesos.map(nombre => {
            const item = results.find(r => r.nombre_proceso === nombre);
            return {
                nombre_proceso: nombre,
                cantidad_perdida: item ? item.cantidad_perdida : 0
            };
        });

        console.log("✅ Datos ordenados y listos:", datosOrdenados);
        callback(null, datosOrdenados);
    });
};

const creacionSolicitud = (id_usuario, id_trabajo, id_proceso, cantidad_real, descripcion, callback) => {
  const query  = `INSERT INTO Solicitudes (id_usuario, id_trabajo, id_proceso, cantidad_real, descripcion) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [id_usuario, id_trabajo, id_proceso, cantidad_real, descripcion], (err, result) => {
    if(err){
      console.log('Error al crear la solicitud', err)
      return callback(err);
    }
    console.log("Solicitud creada correctamente");
    callback(null);
  });
}

const obtenerSolicitudes = (callback) => {
  const query = `SELECT
                  s.id_solicitud,
                  u.email as nombre_trabajador,
                  t.nombre_trabajo,
                  p.nombre as proceso,
                  s.cantidad_real as cantidad_solicitud,
                  s.descripcion,
                  s.estado
                FROM
                  Solicitudes s
                JOIN
                  USUARIOS u ON s.id_usuario = u.id_usuario
                JOIN
                  Trabajo t ON s.id_trabajo = t.id_trabajo
                JOIN
                  Proceso p ON s.id_proceso = p.id_proceso
                  `;
  db.query(query, callback);
}

// Actualizar estado de la solicitud
const actualizarEstado = (id, estado, callback) => {
  const sql = 'UPDATE Solicitudes SET estado = ? WHERE id_solicitud = ?';
  db.query(sql, [estado, id], callback);
};

module.exports = {
  findUserByEmail,
  updatePassword,
  findOTByNombre,
  creacionOT,
  verificarOTExistente,
  findTrabajoByNombre,
  obtenerIdTrabajoPorNombre,
  mostrarDatosGrafica,
  mostrarDatosGrafica2,
  listarProyectos,
  insertarUsuario,
  obtenerUsuariosConRol,
  actualizarRol,
  actualizarCorreo,
  actualizarPasswordPorId,
  actualizarCorreoYPassword,
  obtenerUsuariosCondicion,
  actualizarCondicion,
  creacionInsumo,
  creacionCantidadInsumo,
  creacionProcesos,
  actualizarFechaFin,
  actualizarPrecioInsumo,
  actualizarCantidadHojas,
  findTraInsumoByIdTrabajo,
  findInsumoByIdTrabajoInsumo,
  actualizarProcesos,
  findPrecioTrabajo,
  obtenerProcesosPorTrabajo,
  actualizarCostosProcesos,
  actualizarProcesosDesde,
  buscarOTMerma,
  obtenerMermasPorOT,
  creacionSolicitud,
  obtenerSolicitudes,
  actualizarEstado,
  obtenerProcesosConMerma
};
