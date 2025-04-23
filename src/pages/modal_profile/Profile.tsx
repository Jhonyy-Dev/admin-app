import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit2, Camera, Save } from "lucide-react";
import { DatosUsuario, ActualizarUsuario} from "@/servicios/perfilServicio";
import useAuthStore from '@/store/authStore';

const Perfil = () => {

  const [datosUsuario, setDatosUsuario] = useState<any>([]);
  const [imagenPrevia, setImagenPrevia] = useState(null);

  const [estaEditando, setEstaEditando] = useState(false);
  const [datosPerfil, setDatosPerfil] = useState({
    nombre: "",
    email: "",
    telefono: "",
    puesto: "",
    fechaIngreso: "",
    fechaNacimiento: "",
    codigoReferido: "",
    direccion: "",
    rol: "",
    imagen_ruta: "",
  });

  const [datosFormulario, setDatosFormulario] = useState({ ...datosPerfil });

  const manejarEdicion = () => {
    if (estaEditando) {
      // Guardar cambios
      setDatosPerfil({ ...datosFormulario });
    }
    setEstaEditando(!estaEditando);
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => ({ ...prev, [name]: value }));
  };

  const listarDatosUsuario = async () => {
    try {
      const respuesta = await DatosUsuario();
      
      setDatosUsuario(respuesta.data);
      // Actualizar los datos del perfil con la respuesta
      setDatosPerfil({
        nombre: respuesta.data[0].nombre,
        email: respuesta.data[0].email,
        telefono: respuesta.data[0].telefono,
        puesto: respuesta.data[0].rol, // Suponiendo que "rol" representa el puesto
        fechaIngreso: respuesta.data[0].created_at,
        fechaNacimiento: respuesta.data[0].fecha_nacimiento,
        codigoReferido: respuesta.data[0].codigo_referido,
        direccion: respuesta.data[0].direccion,
        rol: respuesta.data[0].rol,
        imagen_ruta: respuesta.data[0].imagen_ruta,
        
      });
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  };

  useEffect(() => {
    listarDatosUsuario();
  }, []);
  useEffect(() => {
    setDatosFormulario(datosPerfil);
  }, [datosPerfil]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Guardar la URL base64 para la vista previa
        setImagenPrevia({
          file: file,  // Guardar el archivo real
          preview: reader.result  // Guardar la URL base64 para la vista previa
        });
      };
      reader.readAsDataURL(file);  // Convertir el archivo a base64
    }
  };
  
  
  const guardarCambios = async () => {
    setEstaEditando(false);
      console.log("Guardando cambios...");
      console.log("Datos del formulario:", datosFormulario);
        const formData = new FormData();
        formData.append("nombre", datosFormulario.nombre);
        formData.append("email", datosFormulario.email);
        formData.append("telefono", datosFormulario.telefono);
        formData.append("fecha_nacimiento", datosFormulario.fechaNacimiento);
        formData.append("direccion", datosFormulario.direccion);

    if (imagenPrevia && imagenPrevia.file) {
      formData.append("imagen_url", imagenPrevia.file); 
    }

    try {
      const respuesta = await ActualizarUsuario(formData); 

      console.log(respuesta.data.usuario); 

      const user = respuesta.data.usuario;
      useAuthStore.getState().updateUser(user);

      
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
    
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Perfil</h1>
        {!estaEditando && (
    <button
      onClick={manejarEdicion}
      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium transition-colors"
    >
      <Edit2 size={16} />
      <span>Editar Perfil</span>
    </button>
  )}

  {/* Botón para guardar los cambios */}
  {estaEditando && (
    <button
      onClick={guardarCambios}
      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium transition-colors"
    >
      <Save size={16} />
      <span>Guardar Cambios</span>
    </button>
  )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Perfil */}
        <div className="bg-card rounded-lg border border-secondary/20 p-6 flex flex-col items-center">
          
        <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center text-white text-2xl font-medium">
              {imagenPrevia ? (
                <img src={imagenPrevia.preview} alt="Perfil" className="w-24 h-24 rounded-full" />
              ) : datosPerfil?.imagen_ruta ? (
                <img src={datosPerfil.imagen_ruta} alt="Perfil" className="w-24 h-24 rounded-full" />
              ) : (
                "JD"
              )}
            </div>
            {estaEditando && (
              <div className="relative">
                <button
                  onClick={() => document.getElementById('file-input').click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white"
                >
                  <Camera size={16} />
                </button>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            )}
          </div>

          
          <h2 className="text-xl font-bold text-white mb-1">{datosPerfil.nombre}</h2>
          <p className="text-gray-400 text-sm mb-4">{datosPerfil.puesto}</p>
          
          <div className="w-full border-t border-secondary/20 pt-4 mt-2">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">{datosPerfil.email}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">{datosPerfil.telefono}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">{datosPerfil.direccion}</span>
            </div>
          </div>
        </div>

        {/* Detalles del Perfil */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-secondary/20 p-6">
          <h2 className="text-lg font-bold text-white mb-6">Información Personal</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
                {estaEditando ? (
                  <input
                    type="text"
                    name="nombre"
                    value={datosFormulario.nombre}
                    onChange={manejarCambio}
                    className="w-full bg-secondary/30 border border-secondary text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <p className="text-white">{datosPerfil.nombre}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
                {estaEditando ? (
                  <input
                    type="email"
                    name="email"
                    value={datosFormulario.email}
                    onChange={manejarCambio}
                    className="w-full bg-secondary/30 border border-secondary text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <p className="text-white">{datosPerfil.email}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Número de Teléfono</label>
                {estaEditando ? (
                  <input
                    type="text"
                    name="telefono"
                    value={datosFormulario.telefono}
                    onChange={manejarCambio}
                    className="w-full bg-secondary/30 border border-secondary text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <p className="text-white">{datosPerfil.telefono}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Ubicación</label>
                {estaEditando ? (
                  <input
                    type="text"
                    name="direccion"
                    value={datosFormulario.direccion}
                    onChange={manejarCambio}
                    className="w-full bg-secondary/30 border border-secondary text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <p className="text-white">{datosPerfil.direccion}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rol</label>
               
                  <p className="text-white">{datosPerfil.puesto}</p>
              
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Nacimiento</label>
                {estaEditando ? (
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={datosFormulario.fechaNacimiento}
                    onChange={manejarCambio}
                    className="w-full bg-secondary/30 border border-secondary text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <p className="text-white">{datosPerfil.fechaNacimiento}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Código de Referido</label>
                <p className="text-white">{datosPerfil.codigoReferido}</p>
              </div>
              
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
