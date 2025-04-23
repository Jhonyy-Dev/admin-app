export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  categoria: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
} 