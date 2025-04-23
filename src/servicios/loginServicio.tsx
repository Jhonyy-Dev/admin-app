import axios from "@/libs/axios";

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post('/api/loginAdmin', { email, password });
    return response;

  } catch (error: any) {
    if (error.response) {
     return error.response;
    }
    throw new Error("Error de conexión con el servidor");
  }
};


export const user = async () => {
  try {
    const response = await axios.get('/api/user');
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw new Error("Error de conexión con el servidor");
  }
};