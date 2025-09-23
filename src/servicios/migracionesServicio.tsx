import axios from "@/libs/axios";

interface ProcesoInmigracion {
    id?: number;
    usuario_id: number;
    fecha_audiencia: string | null;
    fecha_envio_asilo: string | null;
    fecha_permiso_trabajo: string | null;
    estado_caso: string;
    estado_asilo: string;
    fecha_cumple_asilo: string | null;
    nota: string;
    dias_recordatorios?: number | null;
}

export const ListarProcesos = async () => {
    try {
        const response = await axios.get("/api/inmigracion/");
        return response.data;
    } catch (error) {
        console.error("Error al listar procesos:", error);
        throw error;
    }
};

export const ObtenerProceso = async (id: number) => {
    try {
        const response = await axios.get(`/api/inmigracion/${id}/`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener proceso:", error);
        throw error;
    }
};

export const CrearProceso = async (data: ProcesoInmigracion) => {
    try {
        const response = await axios.post("/api/inmigracion/", data);
        return response.data;
    } catch (error) {
        console.error("Error al crear proceso:", error);
        throw error;
    }
};

export const ActualizarProceso = async (id: number, data: Partial<ProcesoInmigracion>) => {
    try {
        const response = await axios.put(`/api/inmigracion/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar proceso:", error);
        throw error;
    }

};

export const EliminarProceso = async (id: number) => {
    try {
        const response = await axios.delete(`/api/inmigracion/${id}/`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar proceso:", error);
        throw error;
    }
};
