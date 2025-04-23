import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plane, 
  Plus, 
  Search, 
  FileCheck, 
  User,
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FormularioMigracion from "./FormularioMigracion";
import { ListarUsuarios } from "@/servicios/usuarioServicio";
import { ListarProcesos, CrearProceso, ActualizarProceso, EliminarProceso } from "@/servicios/migracionesServicio";
import { toast } from "sonner";

// Interfaces
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
}

interface ClienteMigracion {
  id: number;
  usuario_id: number;
  usuarioNombre?: string;
  fecha_audiencia: string | null;
  fecha_envio_asilo: string | null;
  fecha_permiso_trabajo: string | null;
  estado_caso: string;
  estado_asilo: string;
  fecha_cumple_asilo: string | null;
  nota: string;
  dias_recordatorios?: number | null;
}

const Migraciones = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormulario, setShowFormulario] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteMigracion | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<ClienteMigracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clienteIdToDelete, setClienteIdToDelete] = useState<number | null>(null);

  // Cargar usuarios y procesos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuariosData, procesosData] = await Promise.all([
          ListarUsuarios(),
          ListarProcesos()
        ]);
        
        setUsuarios(usuariosData);
        
        // Agregar nombre de usuario a cada proceso
        const procesosConUsuarios = procesosData.map((proceso: ClienteMigracion) => {
          const usuario = usuariosData.find((u: Usuario) => u.id === proceso.usuario_id);
          return {
            ...proceso,
            usuarioNombre: usuario?.nombre
          };
        });
        
        setClientes(procesosConUsuarios);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Filtrar clientes basados en el término de búsqueda
  const filteredClientes = clientes.filter(
    (cliente) =>
      (cliente.usuarioNombre && cliente.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cliente.estado_caso.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para editar un cliente
  const handleEditCliente = (cliente: ClienteMigracion) => {
    setSelectedCliente(cliente);
    setShowFormulario(true);
  };

  // Función para mostrar el diálogo de confirmación de eliminación
  const handleShowDeleteDialog = (id: number) => {
    setClienteIdToDelete(id);
    setShowDeleteDialog(true);
  };

  // Función para eliminar un cliente
  const handleDeleteCliente = async () => {
    if (clienteIdToDelete) {
      try {
        await EliminarProceso(clienteIdToDelete);
        toast.success("Proceso eliminado exitosamente");
        
        // Actualizar la lista después de eliminar
        const procesosData = await ListarProcesos();
        const procesosConUsuarios = procesosData.map((proceso: ClienteMigracion) => {
          const usuario = usuarios.find(u => u.id === proceso.usuario_id);
          return {
            ...proceso,
            usuarioNombre: usuario?.nombre
          };
        });
        setClientes(procesosConUsuarios);
        setShowDeleteDialog(false);
        setClienteIdToDelete(null);
      } catch (error) {
        console.error("Error al eliminar proceso:", error);
        toast.error("Error al eliminar el proceso");
      }
    }
  };

  // Función para cancelar la eliminación
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setClienteIdToDelete(null);
  };

  // Función para crear un nuevo cliente
  const handleNewCliente = () => {
    setSelectedCliente(null);
    setShowFormulario(true);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (data: Partial<ClienteMigracion>) => {
    try {
      if (selectedCliente) {
        // Actualizar
        await ActualizarProceso(selectedCliente.id, data);
        toast.success("Proceso actualizado exitosamente");
      } else {
        // Crear
        await CrearProceso(data as ClienteMigracion);
        toast.success("Proceso creado exitosamente");
      }
      
      // Recargar la lista
      const procesosData = await ListarProcesos();
      const procesosConUsuarios = procesosData.map((proceso: ClienteMigracion) => {
        const usuario = usuarios.find(u => u.id === proceso.usuario_id);
        return {
          ...proceso,
          usuarioNombre: usuario?.nombre
        };
      });
      setClientes(procesosConUsuarios);
      
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar los datos");
    }
    
    setShowFormulario(false);
    setSelectedCliente(null);
  };

  // Renderizar el estado con un badge de color
  const renderEstado = (estado: string) => {
    let className = "";
    switch (estado.toLowerCase()) {
      case "completado":
        className = "bg-green-100 text-green-800";
        break;
      case "en proceso":
        className = "bg-blue-100 text-blue-800";
        break;
      case "urgente":
        className = "bg-red-100 text-red-800";
        break;
      default:
        className = "bg-yellow-100 text-yellow-800";
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
        {estado}
      </span>
    );
  };

 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Migraciones</h1>
        <Button className="flex items-center gap-2" onClick={handleNewCliente}>
          <Plus size={16} />
          <span>Nuevo Cliente</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Plane size={20} />
            <span>Clientes y Trámites Migratorios</span>
          </CardTitle>
          <CardDescription>
            Gestione la información migratoria de sus clientes, audiencias y plazos importantes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar clientes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario Asignado</TableHead>
                  <TableHead>Audiencia</TableHead>
                  <TableHead>Asilo</TableHead>
                  <TableHead>Permiso de Trabajo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.length > 0 ? (
                  filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        {cliente.usuarioNombre ? (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-blue-500" />
                            <span>{cliente.usuarioNombre}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">No asignado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {cliente.fecha_audiencia ? (
                          <div className="flex flex-col">
                            <span>{new Date(cliente.fecha_audiencia).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No asignada</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {cliente.estado_asilo === 'Sometido' ? (
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="text-sm">Sometido</span>
                            </span>
                            {cliente.fecha_cumple_asilo && (
                              <span className="text-xs text-muted-foreground">
                                Cumple año: {new Date(cliente.fecha_cumple_asilo).toLocaleDateString()}
                              </span>
                            )}
                            {cliente.dias_recordatorios > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Días para solicitar: {cliente.dias_recordatorios}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm">Pendiente</span>
                            </span>
                            {cliente.dias_recordatorios > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Días para solicitar: {cliente.dias_recordatorios}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {cliente.fecha_permiso_trabajo ? (
                          <span>{new Date(cliente.fecha_permiso_trabajo).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">No disponible</span>
                        )}
                      </TableCell>
                      <TableCell>{renderEstado(cliente.estado_caso)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditCliente(cliente)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleShowDeleteDialog(cliente.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      no hay migraciones...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FormularioMigracion
        isOpen={showFormulario}
        onClose={() => setShowFormulario(false)}
        onSubmit={handleSubmit}
        clienteSeleccionado={selectedCliente}
        usuarios={usuarios}
      />

      {/* Modal de confirmación para eliminar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar este proceso migratorio?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDelete}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCliente}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Migraciones;
