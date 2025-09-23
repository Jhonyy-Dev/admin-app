import axios from "@/libs/axios";

export const DatosUsuario = async () => {
  try {
    const response = await axios.get('/api/user/');
    return response;

  } catch (error: any) {
    if (error.response) {
     return error.response;
    }
    throw new Error("Error de conexión con el servidor");
  }

  

};



export const ActualizarUsuario = async (data: any) => {
  try {
    const response = await axios.post('/api/actualizarPerfil/', data);
    return response;

  } catch (error: any) {
    if (error.response) {
     return error.response;
    }
    throw new Error("Error de conexión con el servidor");
  }

  
}



