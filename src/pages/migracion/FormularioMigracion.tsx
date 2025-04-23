import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

// Interfaces
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
}

interface ClienteMigracion {
  id?: number;
  usuario_id: number;
  fecha_audiencia: string | null;
  fecha_envio_asilo: string | null;
  fecha_permiso_trabajo: string | null;
  estado_caso: string;
  estado_asilo: string;
  fecha_cumple_asilo: string | null;
  nota: string;
  dias_recordatorios?: number | null;

}

interface FormularioMigracionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ClienteMigracion>) => void;
  clienteSeleccionado: ClienteMigracion | null;
  usuarios: Usuario[];
}

const FormularioMigracion = ({
  isOpen,
  onClose,
  onSubmit,
  clienteSeleccionado,
  usuarios
}: FormularioMigracionProps) => {
  const initialFormData = {
    usuario_id: 0,
    fecha_audiencia: null,
    fecha_envio_asilo: null,
    fecha_permiso_trabajo: null,
    estado_caso: "",
    estado_asilo: "",
    fecha_cumple_asilo: null,
    nota: "",
    dias_recordatorios: 0,
  };

  const [formData, setFormData] = useState<Partial<ClienteMigracion>>(
    clienteSeleccionado || initialFormData
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manejador personalizado para cerrar el diálogo
  const handleClose = () => {
    setErrors({});
    setFormData(initialFormData);
    onClose();
  };

  // Resetear el formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setFormData(clienteSeleccionado || initialFormData);
      setErrors({});
    }
  }, [isOpen, clienteSeleccionado]);

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.usuario_id || formData.usuario_id === 0) {
      newErrors.usuario_id = "Debe seleccionar un usuario";
    }
    if (!formData.fecha_audiencia) {
      newErrors.fecha_audiencia = "La fecha de audiencia es requerida";
    }
    if (!formData.fecha_envio_asilo) {
      newErrors.fecha_envio_asilo = "La fecha de envío del asilo es requerida";
    }
    if (!formData.fecha_permiso_trabajo) {
      newErrors.fecha_permiso_trabajo = "La fecha de permiso de trabajo es requerida";
    }
    if (!formData.estado_caso) {
      newErrors.estado_caso = "El estado del caso es requerido";
    }

    if (!formData.estado_asilo) {
      newErrors.estado_asilo = "El estado asido es requerido";
    }
   
    if (formData.estado_asilo === 'Sometido' && !formData.fecha_cumple_asilo) {
      newErrors.fecha_cumple_asilo = "La fecha de cumple año del asilo es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ""
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {clienteSeleccionado ? "Editar Proceso Migratorio" : "Nuevo Proceso Migratorio"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="usuario_id">Seleccionar Usuario *</Label>
                <Select 
                  value={formData.usuario_id?.toString() || ""} 
                  onValueChange={(value) => handleInputChange("usuario_id", parseInt(value))}
                >
                  <SelectTrigger className={errors.usuario_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Seleccione un usuario</SelectItem>
                    {usuarios.map(usuario => (
                      <SelectItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.nombre} ({usuario.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.usuario_id && <p className="text-sm text-red-500 mt-1">{errors.usuario_id}</p>}
              </div>
              
              <div>
                <Label htmlFor="estado_caso">Estado del Caso *</Label>
                <Select 
                  value={formData.estado_caso} 
                  onValueChange={(value) => handleInputChange("estado_caso", value)}
                >
                  <SelectTrigger className={errors.estado_caso ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado_caso && <p className="text-sm text-red-500 mt-1">{errors.estado_caso}</p>}
              </div>

              <div>
                <Label htmlFor="estado_asilo">Estado del Asilo *</Label>
                <Select 
                  value={formData.estado_asilo} 
                  onValueChange={(value) => handleInputChange("estado_asilo", value)}
                >
                  <SelectTrigger className={errors.estado_asilo ? "border-red-500" : ""}>
                    <SelectValue placeholder="Estado del asilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sometido">Sometido</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado_asilo && <p className="text-sm text-red-500 mt-1">{errors.estado_asilo}</p>}
              </div>
              
            

              <div>
                <Label htmlFor="nota">Notas Adicionales (Opcional)</Label>
                <Textarea 
                  id="nota" 
                  value={formData.nota || ""} 
                  onChange={(e) => handleInputChange("nota", e.target.value)}
                  placeholder="Información adicional relevante para el caso"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            {/* Fechas y detalles */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="fecha_audiencia">Fecha de Audiencia *</Label>
                  <Input 
                    id="fecha_audiencia" 
                    type="date" 
                    value={formData.fecha_audiencia || ""} 
                    onChange={(e) => handleInputChange("fecha_audiencia", e.target.value)}
                    className={errors.fecha_audiencia ? "border-red-500" : ""}
                  />
                  {errors.fecha_audiencia && <p className="text-sm text-red-500 mt-1">{errors.fecha_audiencia}</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="fecha_envio_asilo">Fecha de Envío del Asilo *</Label>
                <Input 
                  id="fecha_envio_asilo" 
                  type="date" 
                  value={formData.fecha_envio_asilo || ""} 
                  onChange={(e) => handleInputChange("fecha_envio_asilo", e.target.value)}
                  className={errors.fecha_envio_asilo ? "border-red-500" : ""}
                />
                {errors.fecha_envio_asilo && <p className="text-sm text-red-500 mt-1">{errors.fecha_envio_asilo}</p>}
              </div>
              
              {formData.estado_asilo === 'Sometido' && (
                <div>
                  <Label htmlFor="fecha_cumple_asilo">Fecha Cumple Año Asilo *</Label>
                  <Input 
                    id="fecha_cumple_asilo" 
                    type="date" 
                    value={formData.fecha_cumple_asilo || ""} 
                    onChange={(e) => handleInputChange("fecha_cumple_asilo", e.target.value)}
                    className={errors.fecha_cumple_asilo ? "border-red-500" : ""}
                  />
                  {errors.fecha_cumple_asilo && <p className="text-sm text-red-500 mt-1">{errors.fecha_cumple_asilo}</p>}
                </div>
              )}
              
              <div>
                <Label htmlFor="fecha_permiso_trabajo">Fecha para Solicitar Permiso de Trabajo *</Label>
                <Input 
                  id="fecha_permiso_trabajo" 
                  type="date" 
                  value={formData.fecha_permiso_trabajo || ""} 
                  onChange={(e) => handleInputChange("fecha_permiso_trabajo", e.target.value)}
                  className={errors.fecha_permiso_trabajo ? "border-red-500" : ""}
                />
                {errors.fecha_permiso_trabajo && <p className="text-sm text-red-500 mt-1">{errors.fecha_permiso_trabajo}</p>}
              </div>

              <div>
                  <Label>Días Para Solicitar Asilo</Label>
                  <Input 
                    type="number" 
                    min="0"
                    value={formData.dias_recordatorios || ""}
                    onChange={(e) => handleInputChange("dias_recordatorios", parseInt(e.target.value) || null)}
                    />

              </div>

            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Información</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioMigracion; 