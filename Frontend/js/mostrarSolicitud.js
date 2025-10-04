const id_usuario = localStorage.getItem('id_usuario');
const id_trabajo = parseInt(localStorage.getItem('id_trabajo'), 10) ;
const id_proceso = parseInt(localStorage.getItem('rol'), 10) - 2;
const nombre_trabajo = localStorage.getItem('nombre_trabajo');
const input_nombre = document.getElementById('nombre_trabajo');
const input_proceso = document.getElementById('proceso');

console.log('ID Trabajo:', id_trabajo);
console.log('Nombre Trabajo:', nombre_trabajo);
console.log('ID Proceso:', id_proceso);
console.log('ID Usuario:', id_usuario);

const rolesProceso = [
    'PRIMER CORTE',
    'IMPRESIÓN',
    'DOBLADO',
    'COMPAGINADO',
    'ENGRAMPADO',
    'SEGUNDO CORTE'
];

input_proceso.value = rolesProceso[id_proceso];

input_nombre.value = nombre_trabajo;
