import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import CategoriaModal from "./categoriaModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ListarCategorias, CrearCategoria, ActualizarCategoria, EliminarCategoria } from "@/servicios/categoriaServicio";
import { useToast } from "@/components/ui/use-toast";


interface Categoria {
  id: number;
  nombre: string;
  imagen: string | null;
  imagen_ruta: string | null;
  created_at: string;
}

const Categorias = () => {
 
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null);
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const respuesta = await ListarCategorias();

        setCategorias(respuesta); 
        console.log(respuesta); 
    
    } catch (error) {
      mostrarError("No se pudieron cargar las categorías");
    } finally {
      setCargando(false);
    }
  };

  const manejarGuardarCategoria = async (nombre: string, id?: number, imagen?: File | null) => {
    try {
      setCargando(true);
  
      const formData = new FormData();
      
      formData.append("nombre", nombre);
      if (imagen) {
        formData.append("imagen", imagen);
      }
  
      if (id) {
        await ActualizarCategoria(id, formData); 
        toast({ title: "Categoría actualizada correctamente" });
      } else {
        await CrearCategoria(formData);
        toast({ title: "Categoría creada correctamente" });
      }
  
      setModalAbierto(false);
      cargarCategorias();
    } catch (error) {
      mostrarError("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };
  

  const manejarClickEditar = (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria);
    setModalAbierto(true);
  };

  const manejarClickEliminar = (categoria: Categoria) => {
    setCategoriaAEliminar(categoria);
    setModalEliminarAbierto(true);
  };

  const manejarConfirmarEliminar= async () => {
    if (categoriaAEliminar) {
      try {
        setCargando(true);

       const respuesta = await EliminarCategoria(categoriaAEliminar.id);

        mostrarExito("Categoría eliminada correctamente");

        await cargarCategorias();

        setModalEliminarAbierto(false);

        setCategoriaAEliminar(null);
    

      } catch (error) {
        mostrarError("Error de conexión con el servidor");
      } finally {
        setCargando(false);
      }
    }
  };

  const manejarCambioModal = (abierto: boolean) => {
    if (!abierto) {
      setCategoriaSeleccionada(null);
    }
    setModalAbierto(abierto);
  };

 
    const crearCategoria = async (formData: FormData) => {
      const respuesta = await CrearCategoria(formData);
    
      mostrarExito("Categoría creada correctamente");
      await cargarCategorias();
      setModalAbierto(false);
    };
    
    const actualizarCategoria = async (id: number, formData: FormData) => {
      const respuesta = await ActualizarCategoria(id, formData);
    
      mostrarExito("Categoría actualizada correctamente");
      await cargarCategorias();
      setModalAbierto(false);
      setCategoriaSeleccionada(null);
    };
  

  const mostrarExito = (mensaje: string) => {
    toast({
      title: "Éxito",
      description: mensaje
    });
  };

  const mostrarError = (mensaje: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: mensaje
    });
  };

  // Renderizado de componentes
  const renderizarEncabezado = () => (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium">Categorías</h2>
        <div className="bg-primary h-5 w-5 flex items-center justify-center rounded-full">
          <span className="text-xs text-white font-medium">{categorias.length}</span>
        </div>
      </div>
      
      <CategoriaModal
        isOpen={modalAbierto}
        onOpenChange={manejarCambioModal}
        onSave={manejarGuardarCategoria}
        category={categoriaSeleccionada || undefined}
        isLoading={cargando}
      />
    </div>
  );

  const renderizarTabla = () => (
    <div className="divide-y divide-border">
      <div className="grid grid-cols-3 p-4 text-sm font-medium text-muted-foreground">
        
        <div>Imagen</div> 
        <div>Nombre</div>
        <div className="text-right">Acciones</div>
      </div>
      
      {categorias.map((categoria) => (
        <div key={categoria.id} className="grid grid-cols-3 p-4 items-center">

          <div className="flex items-center gap-2">
            {categoria.imagen && (
              <img
                src={categoria.imagen_ruta}
                alt={categoria.nombre}
                className="w-10 h-10 rounded-full"
              />
            )}
            {!categoria.imagen && (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">C</span>
              </div>
            )}
          </div>
          <div>{categoria.nombre}</div>
          <div className="flex items-center justify-end gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="w-7 h-7 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
              onClick={() => manejarClickEditar(categoria)}
              disabled={cargando}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="w-7 h-7 bg-red-500/20 text-red-500 hover:bg-red-500/30"
              onClick={() => manejarClickEliminar(categoria)}
              disabled={cargando}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      
      {categorias.length === 0 && !cargando && (
        <div className="p-8 text-center text-muted-foreground">
          No hay categorías. Agrega una para comenzar.
        </div>
      )}

      {cargando && (
        <div className="p-8 text-center text-muted-foreground">
          Cargando...
        </div>
      )}
    </div>
  );

  const renderizarModalEliminar = () => (
    <AlertDialog open={modalEliminarAbierto} onOpenChange={setModalEliminarAbierto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la categoría
            "{categoriaAEliminar?.nombre}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cargando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600"
            onClick={manejarConfirmarEliminar}
            disabled={cargando}
          >
            {cargando ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="animate-fade-in p-8">
      <div className="max-w-4xl mx-auto bg-card rounded-lg border border-border overflow-hidden">
        {renderizarEncabezado()}
        {renderizarTabla()}
      </div>
      {renderizarModalEliminar()}
    </div>
  );
};

export default Categorias;
