import axios from "@/libs/axios";

export const ListarCategorias = async () => {
    try {
        const response = await axios.get('/api/categoria');
        return response.data;

    } catch (error: any) {
        if (error.response) {
            return error.response;
        }
        throw new Error("Error de conexión con el servidor");
    }
}

export const CrearCategoria = async (data: FormData) => {
    const response = await axios.post('/api/categoria', data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const ActualizarCategoria = async (id: number, data: FormData) => {
    const response = await axios.post(`/api/categoria/${id}?_method=PUT`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};



export const EliminarCategoria = async (id: number) => {    
    try {
        const response = await axios.delete(`/api/categoria/${id}`);
        return response.data;

    } catch (error: any) {
        if (error.response) {
            return error.response;
        }
    }
}

export const ObtenerCategoria = async (id: number) => { 
    try {
        const response = await axios.get(`/api/categoria/${id}`);
        return response.data;

    } catch (error: any) {
        if (error.response) {
            return error.response;
        }
    }
}



