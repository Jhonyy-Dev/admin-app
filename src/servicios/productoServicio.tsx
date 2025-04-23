import axios from "@/libs/axios";


export interface Producto {
  id?: number;
  categoria_id: number;
  nombre: string;
  precio_unitario: number;
  precio_compra: number;
  descripcion?: string;
  stock: number;
  stock_minimo?: number;
  fecha_vencimiento?: string;
  estado: "Activo" | "Inactivo";
  imagen?: File | string;
  imagen_url?: string;
}

export const ListarProductos = async () => {
  try {
    const response = await axios.get(`/api/productos`);
    return response;
  } catch (error) {
    console.error("Error al listar productos:", error);
    throw error;
  }
};

export const ObtenerProducto = async (id: number) => {
  try {
    const response = await axios.get(`/api/productos/${id}`);
    return response;
  } catch (error) {
    console.error("Error al obtener producto:", error);
    throw error;
  }
};

export const CrearProducto = async (formData: FormData) => {
  try {
    const response = await axios.post(`/api/productos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};

export const ActualizarProducto = async (id: number, formData: FormData) => {
  try {
    const response = await axios.post(`/api/productos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

export const EliminarProducto = async (id: number) => {
  try {
    const response = await axios.delete(`/api/productos/${id}`);
    return response;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};
