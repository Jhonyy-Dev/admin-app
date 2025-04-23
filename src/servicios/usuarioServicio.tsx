import axios from "@/libs/axios";



export const ListarUsuarios = async () => {
    try {
        const response = await axios.get("/api/usuario");
        return response.data;
    } catch (error) {
        console.error("Error al listar usuarios:", error);
        throw error;
    }
};





export const ObtenerUsuario = async (id: number) => {
    try {
        const response = await axios.get(`/api/usuario/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        throw error;
    }
};


export const CrearUsuario = async (data: any) => {
    try {
        const response = await axios.post("/api/usuario", data);
        return response.data;
    } catch (error) {
        console.error("Error al crear usuario:", error);
        throw error;
    }
};


export const ActualizarUsuario = async (id: number, data: any) => {
    try {
        const response = await axios.put(`/api/usuario/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        throw error;
    }
};









