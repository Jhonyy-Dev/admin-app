import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Search, Eye, Edit, User, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ListarUsuarios, ObtenerUsuario, CrearUsuario, ActualizarUsuario } from "@/servicios/usuarioServicio";

import { Usuario, HistorialReferido } from "./types";

import { ModalUsuario } from "./modalUsuario";

const Usuarios = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  
  const [showReferidosModal, setShowReferidosModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | undefined>(undefined);

  const [usuario, setUsuario] = useState<Usuario>();
  const [listarUsuarios, setListarUsuarios] = useState<Usuario[]>([]);
  const [listarHistorialReferidos, setListarHistorialReferidos] = useState<HistorialReferido[]>([]);

  const obtenerUsuarios = async () => {
      const response = await ListarUsuarios();
      setListarUsuarios(response);
      console.log(response);
  }


  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerHistorialReferidos = async (id: number) => {
    const response = await ObtenerUsuario(id);
    setSelectedUser(response.usuario);
    setListarHistorialReferidos(response.historial_referidos);
  }


 
  // Función para abrir el modal de referidos
  const handleVerReferidos = async (id: number) => {
    await obtenerHistorialReferidos(id);
    setShowReferidosModal(true);
  };

  // Filtrar usuarios basados en el término de búsqueda
  const filteredUsuarios = listarUsuarios.filter(
    (usuario) =>
      (usuario.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (usuario.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (usuario.telefono?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (usuario.codigo_referido?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditar(usuario);
    setShowModal(true);
  };

  const handleNuevoUsuario = () => {
    setUsuarioEditar(undefined);
    setShowModal(true);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>

        <ModalUsuario 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          usuario={usuarioEditar}
          onSubmit={() => {}}
          actualizarListado={obtenerUsuarios}
        />

        <Button className="flex items-center gap-2" onClick={handleNuevoUsuario}>
          <Plus size={16} />
          <span>Nuevo Usuario</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Users size={20} />
            <span>Usuarios del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Celular</TableHead>
                  <TableHead>Código de referidos</TableHead>
                  <TableHead>Cantidad de referidos</TableHead>
                 
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length > 0 ? (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>{usuario.nombre}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefono}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {usuario.codigo_referido}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{usuario.numero_referido}</span>
                      </TableCell>
                     
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleVerReferidos(usuario.id)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleEditarUsuario(usuario)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


      {/* Modal de Referidos */}
      <Dialog open={showReferidosModal} onOpenChange={setShowReferidosModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" /> 
              Información de Referidos
            </DialogTitle>
            <DialogDescription>
              Historial de referidos de {selectedUser?.nombre}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Información del usuario y código */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Usuario</h3>
                <p className="text-base font-medium">{selectedUser?.nombre}</p>
                <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Código de Referido</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 text-sm">
                    {selectedUser?.codigo_referido}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Resumen de referidos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span>Referidos ({selectedUser?.numero_referido || 0})</span>
                </h3>
              </div>
              
              {listarHistorialReferidos.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Fecha de Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listarHistorialReferidos.map((referido, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{referido.usuario_referido.nombre}</TableCell>
                          <TableCell>{referido.usuario_referido.email}</TableCell>
                          <TableCell>{new Date(referido.created_at).toLocaleDateString()}</TableCell>

                        </TableRow>
                      ))}
                    </TableBody>
                  </Table> 
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <h4 className="text-lg font-medium">Sin referidos</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este usuario aún no tiene referidos registrados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>






    </div>
  );
};

export default Usuarios;
