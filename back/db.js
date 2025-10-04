require('dotenv').config();
const mysql = require('mysql2');
console.log('Ejecutando');
console.log('Host:', process.env.DB_HOST);
console.log('Usuario:', process.env.DB_USER);
console.log('Base de datos:', process.env.DB_NAME);
console.log('Contra:', process.env.DB_PASSWORD);

// Configuración de la conexión MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,        // Usar la variable de entorno para el host
    user: process.env.DB_USER,        // Usar la variable de entorno para el usuario
    password: process.env.DB_PASSWORD, // Usar la variable de entorno para la contraseña
    database: process.env.DB_NAME,
    port: process.env.DB_PORT      // Usar la variable de entorno para el nombre de la base de datos
  });

// Conexión a la base de datos
db.connect((err) => {
  if (err) {
      console.error('Error de conexión: ' + err.stack);
      return;
  }
  console.log('Conectado a la base de datos con id ' + db.threadId);
  console.log('✅ Conexión a MySQL establecida correctamente');

  db.query('USE ' + process.env.DB_NAME, (err) => {
    if (err) {
      console.error('Error al seleccionar la base de datos: ' + err.stack);
    } else {
      console.log('Base de datos seleccionada correctamente');
    }
  });
  

});

module.exports = db;
