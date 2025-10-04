require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../back/user');
const hacerPDF = require('../back/databaseAndPDF');

// Enviar correo de recuperación de contraseña
const sendResetPasswordEmail = (req, res) => {
  const { email } = req.body;
  console.log('Correo recibido:', email); // Verifica que el correo que se recibe es correcto

  // Buscar al usuario en la base de datos
  User.findUserByEmail(email, (err, user) => {
    if (err || !user) {
      console.error('Error al encontrar el usuario:', err);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar token de recuperación
    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Crear el enlace de restablecimiento
    const resetLink = `${process.env.APP_URL}auth/reset-password?token=${resetToken}`;

    // Configurar nodemailer para enviar el correo
    const transporter = nodemailer.createTransport({
      host: 'c2810714.ferozo.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Recuperación de Contraseña',
      text: `Para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetLink}`,
    };

    // Enviar correo
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
        return res.status(500).json({ message: 'Error al enviar el correo' });
      }
      console.log('Correo enviado exitosamente:', info);
      return res.status(200).json({ message: 'Correo de recuperación enviado' });
    });
  });
};

// Restablecer contraseña
const resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  // Verificar el token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Si el token es inválido o ha expirado, retorna un error
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Buscar usuario en la base de datos
    User.findUserByEmail(decoded.email, (err, user) => {
      if (err || !user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Hashear la nueva contraseña
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: 'Error al hashear la contraseña' });
        }

        // Actualizar la contraseña
        User.updatePassword(decoded.email, hashedPassword, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error al actualizar la contraseña' });
          }
          return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
        });
      });
    });
  });
};

const login = (req, res) => {
  console.log("💡 Se llamó a /auth/login");
  const { email, password } = req.body;

  User.findUserByEmail(email, (err, user) => {
    console.log("Usuario encontrado en la base de datos:", user);
    if (err || !user) {
      console.log("Error al encontrar el usuario:", err);
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    console.log("Usuario encontrado:", user);


    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err || !isMatch) {
        console.log("Contraseña incorrecta para el usuario:", user.email);
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log("Token generado:", token);
      res.status(200).json({ message: 'Inicio de sesión exitoso', token: token, rol: user.id_estado, id_usuario: user.id_usuario});
    });
  });
};

// crear Usuario

const creacionUsuario = async (req, res) => {
  const { email, password, id_estado } = req.body;

  // Validaciones básicas
  if (!email || !password || !id_estado) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Correo inválido.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // id_condicion siempre será 1 (por defecto)
    const id_condicion = 1;

    // Llama al modelo User para insertar
    User.insertarUsuario(email, hashedPassword, id_estado, id_condicion, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'El correo ya está registrado.' });
        }
        console.error('Error al insertar en la base de datos:', err);
        return res.status(500).json({ error: 'Error del servidor.' });
      }

      res.status(200).json({ mensaje: 'Usuario creado con éxito.' });
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Obtener todos los usuarios con sus roles (JOIN)
const listarUsuarios = (req, res) => {
  User.obtenerUsuariosConRol((err, results) => {
    if (err) {
      console.error("Error al listar usuarios:", err);
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }
    res.status(200).json(results);
  });
};

// Obtener todos los usuarios con su condicion (JOIN)
const listarUsuariosCondicion = (req, res) => {
  User.obtenerUsuariosCondicion((err, results) => {
    if (err) {
      console.error("Error al listar usuarios:", err);
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }
    res.status(200).json(results);
  });
};


// Cambiar rol de un usuario
const actualizarRol = (req, res) => {
  const id = req.params.id;
  const { id_estado } = req.body;

  if (!id_estado) {
    return res.status(400).json({ error: "El nuevo rol es obligatorio" });
  }

  User.actualizarRol(id, id_estado, (err, result) => {
    if (err) {
      console.error("Error al actualizar rol:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({ mensaje: "Rol actualizado correctamente" });
  });
};

// Cambiar rol de un usuario
const actualizarCondicion = (req, res) => {
  const id = req.params.id;
  const { id_condicion } = req.body;

  if (!id_condicion) {
    return res.status(400).json({ error: "La nueva condicion es obligatoria" });
  }

  User.actualizarCondicion(id, id_condicion, (err, result) => {
    if (err) {
      console.error("Error al actualizar la condicion:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({ mensaje: "Condición actualizada correctamente" });
  });
};


const modificarDatosUsuario = async (req, res) => {
  const id = req.params.id;
  const { email, password } = req.body;

  if (!email && !password) {
    return res.status(400).json({ error: "Debe proporcionar al menos un campo a modificar." });
  }

  try {
    if (email && password) {
      const hash = await bcrypt.hash(password, 10);
      User.actualizarCorreoYPassword(id, email, hash, (err, result) => {
        if (err) return res.status(500).json({ error: "Error en BD" });
        return res.status(200).json({ mensaje: "Correo y contraseña actualizados" });
      });
    } else if (email) {
      User.actualizarCorreo(id, email, (err, result) => {
        if (err) return res.status(500).json({ error: "Error en BD" });
        return res.status(200).json({ mensaje: "Correo actualizado" });
      });
    } else if (password) {
      const hash = await bcrypt.hash(password, 10);
      User.actualizarPasswordPorId(id, hash, (err, result) => {
        if (err) return res.status(500).json({ error: "Error en BD" });
        return res.status(200).json({ mensaje: "Contraseña actualizada" });
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error interno" });
  }
};


const verificarOrdenTrabajo = (req, res) => {
  const { nombreOT } = req.body;

  User.findOTByNombre(nombreOT, (err, otData) => {
    console.log("Data que se recibe es: ", otData);
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (!otData) {
      return res.json({ encontrada: false });
    }

    req.session.ot = otData;
    console.log("ID Trabajo seleccionado", otData.id_trabajo);
    res.json({ encontrada: true });
  });
};

const traerdatosTrabajo = (req, res) => {
  if (!req.session.ot) return res.status(404).send('No hay OT cargada');
  res.json(req.session.ot);
};

const crearOrdenTrabajo = (req, res) => {
  const { nombreOT, cantidadHojasOT, precioHoja, fechaInicioOT, estadoTrabajo, privArchiv } = req.body;

  // Verificar si la OT ya existe en la base de datos
  User.verificarOTExistente(nombreOT, (err, existe) => {
    if (err) {
      console.error('Error al verificar la OT:', err);
      return res.status(500).json({ mensaje: 'Error al verificar la existencia de la OT' });
    }

    if (existe) {
      // Si la OT ya existe, respondemos con un mensaje indicando que no se puede insertar
      return res.status(400).json({ mensaje: 'La OT con este nombre ya existe' });
    }

    // Si la OT no existe, proceder con la inserción
    User.creacionOT(nombreOT, fechaInicioOT, estadoTrabajo, privArchiv, (err, result) => {
      if (err) {
        console.error('Error al crear la OT:', err);
        return res.status(500).json({ mensaje: 'Error al crear OT' });
      }
      User.creacionInsumo(precioHoja, (err, result2) => {
        if (err) {
          console.error('Error al crear el insumo:', err);
          return res.status(500).json({ mensaje: 'Error al crear el insumo' });
        }
        User.creacionCantidadInsumo(cantidadHojasOT, (err, result3) => {
          if (err) {
            console.error('Error al crear la cantidad del insumo:', err);
            return res.status(500).json({ mensaje: 'Error al crear la cantidad del insumo' });
          }
          User.creacionProcesos(cantidadHojasOT, precioHoja, privArchiv, fechaInicioOT, (err, result4) => {
            if (err) {
              console.error('Error al crear los registros por proceso', err);
              return res.status(500).json({ mensaje: 'Error al crear los registros por proceso' });
            }
            // Responder con éxito
            res.status(200).json({ mensaje: 'OT creada exitosamente 🎉' });
          });
        });
      });
    });
  });
};


// Función para generar el PDF del trabajo
const generarReportePDF = (req, res) => {
  const nombreTrabajo = req.params.nombre_trabajo;  // Obtenemos el nombre del trabajo desde la URL
  if (!nombreTrabajo) {
    return res.status(400).send("No se proporcionó un nombre de trabajo.");
  }

  // Llamamos a la función para obtener el id_trabajo usando el nombre_trabajo
  User.obtenerIdTrabajoPorNombre(nombreTrabajo, (err, idTrabajo) => {
    if (err) {
      console.error('Error al obtener id_trabajo:', err);
      return res.status(500).send("Error al obtener el trabajo");
    }

    if (!idTrabajo) {
      return res.status(404).send("No se encontraron datos para ese trabajo.");
    }

    try {
      // Si la consulta fue exitosa, generamos el PDF con el id_trabajo
      hacerPDF.generarPDF(idTrabajo, res);  // Llamamos a la función para generar el PDF con el id_trabajo
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      return res.status(500).send("Hubo un error al generar el PDF.");
    }
  });
};

// Obtener procesos con comparación de merma
const obtenerProcesosMerma = (req, res) => {
    const id_trabajo = req.params.id_trabajo;
    User.obtenerProcesosConMerma(id_trabajo, (err, procesos) => {
        if (err) {
            console.error("Error al consultar procesos de merma:", err); // <-- AGREGA ESTO
            return res.status(500).json({ error: "Error al consultar procesos" });
        }
        console.log("Procesos devueltos:", procesos); // <-- AGREGA ESTO
        res.json(procesos);
    });
};


// Funcion para generar graficas
const generarGraficas = (req, res) => {
  console.log('Solicitud recibida para generar gráfica');
  const nombreTrabajo = req.body.nombre_trabajo; // Obtener el nombre del trabajo desde el cuerpo de la solicitud
  console.log('Nombre del trabajo recibido:', nombreTrabajo);

  // Verifica si recibimos el nombre del trabajo correctamente
  if (!nombreTrabajo) {
    console.log('Nombre del trabajo no proporcionado');
    return res.status(400).json({ message: 'Nombre del trabajo es requerido' });
  }

  // Llamar a la función del modelo para obtener los datos
  User.mostrarDatosGrafica(nombreTrabajo, (err, data) => {
    if (err) {
      console.error('Error al obtener los datos de la base de datos:', err);
      return res.status(500).json({ message: 'Error al obtener los datos de la gráfica', error: err });
    }

    console.log('Datos recibidos de la base de datos:', data);
    if (data) {
      return res.json(data); // Si los datos están disponibles, devolverlos
    }

    console.log('No se encontraron datos para el trabajo:', nombreTrabajo);
    return res.status(404).json({ message: 'Datos no encontrados' });
  });
};

// Funcion para generar graficas
const generarGraficas2 = (req, res) => {
  console.log('Solicitud recibida para generar gráfica');
  const nombreTrabajo = req.body.nombre_trabajo; // Obtener el nombre del trabajo desde el cuerpo de la solicitud
  console.log('Nombre del trabajo recibido:', nombreTrabajo);

  // Verifica si recibimos el nombre del trabajo correctamente
  if (!nombreTrabajo) {
    console.log('Nombre del trabajo no proporcionado');
    return res.status(400).json({ message: 'Nombre del trabajo es requerido' });
  }

  // Llamar a la función del modelo para obtener los datos
  User.mostrarDatosGrafica2(nombreTrabajo, (err, data) => {
    if (err) {
      console.error('Error al obtener los datos de la base de datos:', err);
      return res.status(500).json({ message: 'Error al obtener los datos de la gráfica', error: err });
    }

    console.log('Datos recibidos de la base de datos:', data);
    if (data) {
      return res.json(data); // Si los datos están disponibles, devolverlos
    }

    console.log('No se encontraron datos para el trabajo:', nombreTrabajo);
    return res.status(404).json({ message: 'Datos no encontrados' });
  });
};

const listarProyectos = (req, res) => {
  User.listarProyectos((err, results) => {
    if (err) {
      console.error('Error al listar los proyectos:', err);
      return res.status(500).json({ message: 'Error al obtener los proyectos' });
    }
    res.json(results);
  });
};

const actualizarOT = (req, res) => {
  const nombreOT = req.body.nombre_trabajo;
  const fechaFin = req.body.fechaFin;
  const precioInsumo = req.body.precio_insumo;
  const cantidadHojas = req.body.cantidad_insumo;
  const procesos = Array.isArray(req.body.procesos) ? req.body.procesos : [];
  let esperados = 0;
  let terminados = 0;
  let errores = 0;

  function verificarFinal() {
    terminados++;
    if (terminados === esperados) {
      if (errores > 0) {
        return res.status(500).json({ error: "Hubo errores en la actualización" });
      }
      return res.json({ mensaje: "Actualización realizada correctamente" });
    }
  }

  User.findTrabajoByNombre(nombreOT, (err, trabajo) => {
    if (err) {
      console.error('Error al obtener id_trabajo:', err);
      return res.status(500).json("Error al obtener el trabajo");
    }

    if (!trabajo || !trabajo.id_trabajo) {
      return res.status(404).json("No se encontraron datos para ese trabajo.");
    }

    let idTrabajo = trabajo.id_trabajo;

    if (fechaFin !== undefined) {
      esperados++; 
      User.actualizarFechaFin(idTrabajo, fechaFin, (err, result) => {
        if (err) return res.status(500).json({ error: "Error en BD al actualizar la fecha Fin" });

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "No se actualizó ninguna fila (ID no encontrado)" });
        }
        console.log("Fecha fin actualizada");
        verificarFinal();
      });
    }

    if (cantidadHojas !== undefined) {
      esperados++; 
      User.findTraInsumoByIdTrabajo(idTrabajo, (err, TrabajoInsumo) => {
        if (err) {
          console.error('Error al obtener id_trabajo_insumo:', err);
          return res.status(500).json("Error al obtener el id_trabajo_insumo");
        }

        if (!TrabajoInsumo || TrabajoInsumo.length === 0) {
          return res.status(404).json("No se encontraron datos para este registro.");
        }

        let idTrabajoInsumo = TrabajoInsumo[0].id_trabajo_insumo;

        User.findPrecioTrabajo(idTrabajo, (err, precioBD) => {
          if (err) {
            console.error('Error al obtener precio del trabajo', err);
            return res.status(500).json("Error al obtener el precio del trabajo");
          }

          if (!precioBD) {
            return res.status(404).json("No se encontraron datos para este registro.");
          }

          const precioUnitario = precioBD[0].precio_unitario;

          User.actualizarCantidadHojas(idTrabajoInsumo, cantidadHojas, (err, result) => {
            if (err) return res.status(500).json({ error: "Error en BD al actualizar la cantidad de hojas" });
            console.log("Cantidad de hojas actualizada");

            User.actualizarProcesos(idTrabajoInsumo, cantidadHojas, precioUnitario, (err, result) => {
              if (err) return res.status(500).json({ error: "Error en BD al actualizar los procesos" });
              console.log("Procesos actualizados correctamente");
              verificarFinal();
            });
          });
        });
      });
    }

    if (precioInsumo !== undefined) {
      esperados++; 
      User.findTraInsumoByIdTrabajo(idTrabajo, (err, TrabajoInsumo) => {
        if (err) {
          console.error('Error al obtener id_trabajo_insumo:', err);
          return res.status(500).json("Error al obtener el id_trabajo_insumo");
        }

        if (!TrabajoInsumo || TrabajoInsumo.length === 0) {
          return res.status(404).json("No se encontraron datos para este registro.");
        }

        let idTrabajoInsumo = TrabajoInsumo[0].id_trabajo_insumo;

        User.findInsumoByIdTrabajoInsumo(idTrabajoInsumo, (err, Insumo) => {
          if (err) {
            console.error('Error al obtener id_insumo:', err);
            return res.status(500).json("Error al obtener el id_insumo");
          }

          const idInsumo = Insumo[0].id_insumo

          if (!idInsumo) {
            return res.status(404).json("No se encontraron datos para este registro.");
          }

          User.actualizarPrecioInsumo(idInsumo, precioInsumo, (err, result) => {
            if (err) return res.status(500).json({ error: "Error en BD al actualizar el precio del insumo" });
            if(result.affectedRows === 0){
              console.warn("No se actualizó el precio: el ID no existe o el valor es el mismo.");
            }
            else{
              console.log("Precio del insumo actualizado");
            }

            User.obtenerProcesosPorTrabajo(idTrabajoInsumo, (err, procesos) => {
              if (err) return res.status(500).json({ error: "Error en BD al buscar los procesos" });
              if (!procesos) return res.status(404).json("No hay procesos registrados para esta OT.");
              console.log("Procesos adquiridos correctamente");

              User.actualizarCostosProcesos(idTrabajoInsumo, precioInsumo, procesos, (err, result) => {
                if (err) return res.status(500).json({ error: "Error al actualizar costos" });
                console.log("Precios y costos actualizados correctamente");
                verificarFinal();
              });
            });
          });
        });
      });
    }
    if (procesos && procesos.length > 0 && fechaFin === undefined && cantidadHojas === undefined && precioInsumo === undefined) {
      esperados++; 
      User.findTraInsumoByIdTrabajo(idTrabajo, (err, TrabajoInsumo) => {
        if (err) {
          console.error('Error al obtener id_trabajo_insumo:', err);
          return res.status(500).json("Error al obtener el id_trabajo_insumo");
        }

        if (!TrabajoInsumo || TrabajoInsumo.length === 0) {
          return res.status(404).json("No se encontraron datos para este registro.");
        }

        let idTrabajoInsumo = TrabajoInsumo[0].id_trabajo_insumo;

        User.findPrecioTrabajo(idTrabajo, (err, precioBD) => {
          if (err) {
            console.error('Error al obtener precio del trabajo', err);
            return res.status(500).json("Error al obtener el precio del trabajo");
          }

          if (!precioBD) {
            return res.status(404).json("No se encontraron datos para este registro.");
          }

          const precioUnitario = precioBD[0].precio_unitario;

          User.obtenerProcesosPorTrabajo(idTrabajoInsumo, (err, procesosActuales) => {
            if (err) return res.status(500).json({ error: "Error en BD al buscar los procesos" });
            if (!procesosActuales) return res.status(404).json("No hay procesos registrados para esta OT.");
            console.log("Procesos adquiridos correctamente");

            User.actualizarProcesosDesde(idTrabajoInsumo, procesos, precioUnitario, procesosActuales, (err, result) => {
              if (err) return res.status(500).json({ error: "Error al actualizar los procesos en cascada" });
              console.log("Procesos actualizados correctamente");
              verificarFinal();
            });
          });
        });
      });
    }
    //return res.status(200).json({ mensaje: "Datos actualizados correctamente" });
  });
};





// 🔍 Verificar si la OT existe para la calculadora de merma
const verificarOTMerma = (req, res) => {
    const { nombreOT } = req.body;

    User.buscarOTMerma(nombreOT, (err, otData) => {
        if (err) {
            console.error("Error al verificar la OT:", err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }

        if (!otData) {
            return res.status(404).json({ error: "OT no encontrada" });
        }

        res.json({
            encontrada: true,
            id_trabajo: otData.id_trabajo
        });
    });
};

// 🔎 Obtener las mermas de los procesos de una OT
const obtenerMermaOT = (req, res) => {
    const { id_trabajo } = req.body;

    User.obtenerMermasPorOT(id_trabajo, (err, mermas) => {
        if (err) {
            console.error("Error al obtener mermas:", err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }

        if (!mermas || mermas.length === 0) {
            return res.status(404).json({ error: "No se encontraron datos de merma" });
        }

        res.json({
            datos: mermas
        });
    });
};

const crearSolicitud = (req, res) => {
  const {id_usuario, id_trabajo, id_proceso, cantidad_real, descripcion} = req.body;

  User.creacionSolicitud(id_usuario, id_trabajo, id_proceso, cantidad_real, descripcion, (err, result) => {
    if(err){
      console.log("Error al insertar en la base de datos", err);
      return res.status(500).json({err: "Error en el servidor"});
    }
    res.status(200).json({mensaje: "Solicitud creada con éxito"});
  })
}

// Obtener todos los usuarios con su condicion (JOIN)
const listarSolicitudes= (req, res) => {
  User.obtenerSolicitudes((err, results) => {
    if (err) {
      console.error("Error al listar usuarios:", err);
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }
    res.status(200).json(results);
  });
};

// Cambiar rol de un usuario
const actualizarEstado = (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: "El nuevo estado es obligatoria" });
  }

  User.actualizarEstado(id, estado, (err, result) => {
    if (err) {
      console.error("Error al actualizar el estado:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    res.status(200).json({ mensaje: "Solicitud actualizada correctamente" });
  });
};


module.exports = { 
  sendResetPasswordEmail, 
  resetPassword, 
  login, 
  verificarOrdenTrabajo, 
  traerdatosTrabajo, 
  crearOrdenTrabajo, 
  generarReportePDF, 
  generarGraficas, 
  generarGraficas2, 
  listarProyectos, 
  creacionUsuario, 
  listarUsuarios, 
  actualizarRol, 
  modificarDatosUsuario, 
  listarUsuariosCondicion, 
  actualizarCondicion, 
  actualizarOT, 
  verificarOTMerma, 
  obtenerMermaOT, 
  crearSolicitud, 
  listarSolicitudes, 
  actualizarEstado,
  obtenerProcesosMerma};
