

import Citas from "@/pages/citas/Citas";
import Documentos from "@/pages/documento/Documentos";
import Migraciones from "@/pages/migracion/Migraciones";
import Usuarios from "@/pages/usuarios/Usuarios";
import Login from "@/pages/login/login";
import Dashboard from "@/layout/page";
import Categorias from "@/pages/categorias/Categorias";
import Profile from "@/pages/modal_profile/Profile";


export const routes = [
  { path: "/", element: <Login /> },
  
  {
    path: "/dashboard",
    element: <Dashboard />,

    children: [
      { index: true, element: <Usuarios />},
     
      { path: "citas", element: <Citas /> },
      { path: "documentos", element: <Documentos /> },
      { path: "migraciones", element: <Migraciones /> },
      { path: "usuarios", element: <Usuarios /> },
      { path: "categorias", element: <Categorias /> },
      { path: "perfil", element: <Profile /> },
    
      
    ],
  },
];
