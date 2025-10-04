CREATE TABLE IF NOT EXISTS Solicitudes (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_trabajo INT NOT NULL,
    id_proceso INT NOT NULL,
    cantidad_real INT NOT NULL,
    descripcion VARCHAR(255),
    estado ENUM('Pendiente', 'Aceptada', 'Rechazada') NOT NULL DEFAULT 'Pendiente',
    
    -- Claves foráneas
    CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario),
    CONSTRAINT fk_trabajo FOREIGN KEY (id_trabajo) REFERENCES Trabajo(id_trabajo),
    CONSTRAINT fk_proceso FOREIGN KEY (id_proceso) REFERENCES Proceso(id_proceso)
);
