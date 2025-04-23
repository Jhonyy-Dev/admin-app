import axios from "@/libs/axios";

// Cache global para almacenar los datos
const citasCache = {
  listado: null,
  detalles: {},
  historial: {}
};

// Configuración para mejorar el rendimiento de axios
axios.defaults.timeout = 10000; // 10 segundos máximo de timeout

export const listarCitas = async () => {
    // Si ya tenemos datos en caché, devolverlos inmediatamente
    if (citasCache.listado) {
        return Promise.resolve(citasCache.listado);
    }
    
    try {
        const response = await axios.get("/api/citas");
        // Guardar en caché
        citasCache.listado = response.data;
        return response.data;
    } catch (error) {
        console.error("Error al obtener citas:", error);
        return [];
    }
}

export const obtenerCitaDatos = async (id: number) => {
    // Si ya tenemos datos en caché, devolverlos inmediatamente
    if (citasCache.detalles[id]) {
        return Promise.resolve(citasCache.detalles[id]);
    }
    
    try {
        const response = await axios.get(`/api/citas/${id}`);
        // Guardar en caché
        citasCache.detalles[id] = response.data;
        return response.data;
    } catch (error) {
        console.error("Error al obtener cita:", error);
        return null;
    }
}

export const crearCita = async (cita: any) => {
    try {
        const response = await axios.post("/api/citas", cita);
        
        // Actualizar caché con el nuevo elemento
        if (citasCache.listado) {
            citasCache.listado = [...citasCache.listado, response.data];
        }
        
        return response.data;
    } catch (error) {
        console.error("Error al crear cita:", error);
        throw error;
    }
}   

export const actualizarCita = async (id: number, cita: any) => {
    try {
        const response = await axios.put(`/api/citas/${id}`, cita);
        
        // Actualizar caché
        if (citasCache.listado) {
            citasCache.listado = citasCache.listado.map(item => 
                item.id === id ? {...item, ...cita} : item
            );
        }
        
        citasCache.detalles[id] = response.data;
        
        return response.data;
    } catch (error) {
        console.error("Error al actualizar cita:", error);
        throw error;
    }
}

export const historialCita = async (id: number) => {
    // Si ya tenemos datos en caché, devolverlos inmediatamente
    if (citasCache.historial[id]) {
        return Promise.resolve(citasCache.historial[id]);
    }
    
    try {
        const response = await axios.get(`/api/listar_historial_citas/${id}`);
        // Guardar en caché
        citasCache.historial[id] = response.data;
        return response.data;
    } catch (error) {
        console.error("Error al obtener historial de cita:", error);
        return [];
    }
}

export const eliminarCita = async (id: number) => {
    try {
        const response = await axios.delete(`/api/citas/${id}`);
        
        // Actualizar caché
        if (citasCache.listado) {
            citasCache.listado = citasCache.listado.filter(item => item.id !== id);
        }
        
        delete citasCache.detalles[id];
        delete citasCache.historial[id];
        
        return response.data;
    } catch (error) {
        console.error("Error al eliminar cita:", error);
        throw error;
    }
}

// Función para precargar todas las citas y sus detalles
export const precargarDatos = async () => {
    try {
        const citas = await listarCitas();
        
        // Precargar detalles de cada cita en paralelo
        await Promise.all(
            citas.map(cita => obtenerCitaDatos(cita.id))
        );
        
        return true;
    } catch (error) {
        console.error("Error al precargar datos:", error);
        return false;
    }
}
