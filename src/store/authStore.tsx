import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: number;
  nombre: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  codigo_referido: string;
  numero_referido: string;
  rol: string;
  dias_recordatorios: string | null;
  imagen_url: string | null;
  imagen_ruta: string | null;
  direccion: string;
  created_at: string;
};

type AuthState = {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (updatedFields: Partial<User>) => void;  // Nueva función para actualizar los campos
  logout: () => void;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updatedFields) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,  // Combina el estado actual con los campos actualizados
        })),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useAuthStore;
