export interface Usuario {
    id:               number;
    nombre:           string;
    email:            string;
    telefono?:        string;
    codigo_referido:  string;
    numero_referido:  number;
    fecha_nacimiento?: string;
    rol:              string;
    direccion?:       string;
}

export interface HistorialReferido {
    id:                    number;
    usuario_id_verificado: number;
    codigo:                string;
    usuario_id_referido:   number;
    created_at:            Date;
    usuario_referido:      UsuarioReferido;
}

export interface UsuarioReferido {
    id:     number;
    nombre: string;
    email:  string;
}

export interface RespuestaHistorialReferidos {
    usuario: Usuario;
    historial_referidos: HistorialReferido[];
}


