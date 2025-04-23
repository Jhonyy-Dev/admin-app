import { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, ChevronLeft, ChevronRight, User } from "lucide-react";

import { crearCita, actualizarCita } from "@/servicios/citasServicio";

interface ModalCrearActualizarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  citaToEdit?: any;
  usuarios: any[];
  categorias: any[];
}

interface FormData {
  usuario_id?: number;
  categoria_id?: number;
  fecha_cita: string;
  hora_cita: string;
  sede: string;
  nota: string;
  asunto: string;
  estado: string;
}

const horasDisponibles = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
];

const ModalCrearActualizar = ({
  isOpen,
  onClose,
  onSave,
  citaToEdit,
  usuarios,
  categorias,
}: ModalCrearActualizarProps) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<FormData>({
    usuario_id: undefined,
    categoria_id: undefined,  
    fecha_cita: "",
    hora_cita: "",
    sede: "",
    nota: "",
    asunto: "",
    estado: "Pendiente",
    
  });

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const resetForm = () => {
    setFormData({
      usuario_id: undefined,
      categoria_id: undefined,  
      fecha_cita: "",
      hora_cita: "",
      sede: "",
      nota: "",
      asunto: "",
      estado: "Pendiente",

    });
    setFormSubmitted(false);
    setTouched({});
    setCalendarMonth(new Date());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (citaToEdit) {
      setFormData({
        usuario_id: citaToEdit.usuario_id,
        categoria_id: citaToEdit.categoria_id,
        fecha_cita: citaToEdit.fecha_cita || "",
        hora_cita: citaToEdit.hora_cita || "",
        sede: citaToEdit.sede || "",
        nota: citaToEdit.nota || "",
        asunto: citaToEdit.asunto || "",
        estado: citaToEdit.estado || "Pendiente",
      });
    }
  }, [citaToEdit]);

  const isFieldInvalid = (field: keyof FormData) => {
    return formSubmitted && !formData[field] && field !== "nota";
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const CreacionCita = async () => {
    try {
      const response = await crearCita(formData);
      if (response) {
        onSave(formData);
        handleClose();
      }
    } catch (error) {
      console.error("Error al crear la cita:", error);
    }
  };

  const ActualizacionCita = async (id: number) => {
    try {
      const response = await actualizarCita(id, formData);
      if (response) {
        onSave(formData);
        handleClose();
      }
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
    }
  };

  const handleSaveCita = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const camposRequeridos = [
      "usuario_id",
      "fecha_cita",
      "hora_cita",
      "sede",
      "estado",
    ];
    const formValido = camposRequeridos.every(
      (campo) => formData[campo as keyof FormData]
    );

    if (!formValido) {
      return;
    }

    const datosFormateados = {
      ...formData,
      fecha_cita: new Date(formData.fecha_cita).toISOString().split("T")[0],
      usuario_id: Number(formData.usuario_id),
    };

    if (citaToEdit) {
      ActualizacionCita(citaToEdit.id);
    } else {
      CreacionCita();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {citaToEdit ? "Actualizar Cita" : "Agendar Nueva Cita"}
          </DialogTitle>
          <DialogDescription>
            Complete los detalles para{" "}
            {citaToEdit ? "actualizar la" : "agendar una nueva"} cita
            migratoria.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSaveCita} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="usuario_id"
                className={cn(isFieldInvalid("usuario_id") && "text-red-500")}
              >
                Seleccionar Usuario
              </Label>
              <Select
                value={formData.usuario_id?.toString() || ""}
                onValueChange={(value) =>
                  handleInputChange("usuario_id", parseInt(value))
                }
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    isFieldInvalid("usuario_id") &&
                      "border-red-500 ring-red-500"
                  )}
                >
                  <div className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Seleccione un usuario">
                      {(() => {
                        const selectedUser = formData.usuario_id
                          ? usuarios.find((u) => u.id === formData.usuario_id)
                          : null;
                        return selectedUser
                          ? `${selectedUser.nombre} (${selectedUser.email})`
                          : "Seleccione un usuario";
                      })()}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      {usuario.nombre} ({usuario.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFieldInvalid("usuario_id") && (
                <p className="text-xs text-red-500">
                  Debe seleccionar un usuario.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="categoria_id"
                className={cn(isFieldInvalid("categoria_id") && "text-red-500")}
              >
                Seleccionar Categoría
              </Label>
              <Select
                value={formData.categoria_id?.toString() || ""}
                onValueChange={(value) =>
                  handleInputChange("categoria_id", parseInt(value))
                }
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    isFieldInvalid("categoria_id") &&
                      "border-red-500 ring-red-500"
                  )}
                >
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFieldInvalid("categoria_id") && (
                <p className="text-xs text-red-500">
                  Debe seleccionar una categoría.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fecha_cita"
                className={cn(isFieldInvalid("fecha_cita") && "text-red-500")}
              >
                Fecha
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.fecha_cita && "text-muted-foreground",
                      isFieldInvalid("fecha_cita") &&
                        "border-red-500 ring-red-500"
                    )}
                    onClick={() =>
                      setTouched((prev) => ({ ...prev, fecha_cita: true }))
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.fecha_cita ? (
                      format(new Date(formData.fecha_cita), "PPP", {
                        locale: es,
                      })
                    ) : (
                      <span>Seleccione una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-0 bg-black text-white rounded-lg shadow-lg">
                    <div className="flex items-center justify-between p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-blue-900 text-white"
                        onClick={() =>
                          setCalendarMonth(subMonths(calendarMonth, 1))
                        }
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <div className="font-medium text-center text-lg">
                        {format(calendarMonth, "MMMM yyyy", { locale: es })}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-blue-900 text-white"
                        onClick={() =>
                          setCalendarMonth(addMonths(calendarMonth, 1))
                        }
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs p-4 pb-2">
                      {["D", "L", "M", "X", "J", "V", "S"].map((day, i) => (
                        <div key={i} className="font-medium text-gray-400 py-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 p-4 pt-0">
                      {eachDayOfInterval({
                        start: startOfMonth(calendarMonth),
                        end: endOfMonth(calendarMonth),
                      }).map((day, i) => {
                        const isSelected = formData.fecha_cita
                          ? isSameDay(day, new Date(formData.fecha_cita))
                          : false;
                        return (
                          <Button
                            key={i}
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-9 w-9 p-0 font-normal rounded-full transition-all",
                              !isSameMonth(day, calendarMonth) &&
                                "text-gray-600 opacity-50",
                              isSelected &&
                                "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                              isToday(day) &&
                                !isSelected &&
                                "border border-blue-400 text-blue-400 font-medium",
                              !isSelected &&
                                isSameMonth(day, calendarMonth) &&
                                "hover:bg-gray-800 text-white"
                            )}
                            onClick={() => {
                              handleInputChange(
                                "fecha_cita",
                                format(day, "yyyy-MM-dd")
                              );
                            }}
                          >
                            <time dateTime={format(day, "yyyy-MM-dd")}>
                              {format(day, "d")}
                            </time>
                          </Button>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-700 mt-2">
                      <Button
                        variant="ghost"
                        className="w-full text-blue-400 hover:bg-gray-800 rounded-none py-3"
                        onClick={() => {
                          handleInputChange(
                            "fecha_cita",
                            format(new Date(), "yyyy-MM-dd")
                          );
                        }}
                      >
                        Hoy
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {isFieldInvalid("fecha_cita") && (
                <p className="text-xs text-red-500">
                  Debe seleccionar una fecha.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="hora_cita"
                className={cn(isFieldInvalid("hora_cita") && "text-red-500")}
              >
                Hora
              </Label>
              <Select
                value={formData.hora_cita}
                onValueChange={(value) => handleInputChange("hora_cita", value)}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    isFieldInvalid("hora_cita") && "border-red-500 ring-red-500"
                  )}
                >
                  <SelectValue placeholder="Seleccione una hora" />
                </SelectTrigger>
                <SelectContent>
                  {horasDisponibles.map((hora) => (
                    <SelectItem key={hora} value={hora}>
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFieldInvalid("hora_cita") && (
                <p className="text-xs text-red-500">
                  Debe seleccionar una hora.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="asunto"
                className={cn(isFieldInvalid("asunto") && "text-red-500")}
              >
                Asunto
              </Label>
              <Input
                id="asunto"
                value={formData.asunto}
                onChange={(e) => handleInputChange("asunto", e.target.value)}
                className={cn(
                  "w-full",
                  isFieldInvalid("asunto") && "border-red-500 ring-red-500"
                )}
              />
              {isFieldInvalid("asunto") && (
                <p className="text-xs text-red-500">El asunto es requerido.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="sede"
                className={cn(isFieldInvalid("sede") && "text-red-500")}
              >
                Sede
              </Label>
              <Input
                id="sede"
                value={formData.sede}
                onChange={(e) => handleInputChange("sede", e.target.value)}
                className={cn(
                  "w-full",
                  isFieldInvalid("sede") && "border-red-500 ring-red-500"
                )}
                placeholder="Ingrese la dirección de la sede"
              />
              {isFieldInvalid("sede") && (
                <p className="text-xs text-red-500">La sede es requerida.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="estado"
                className={cn(isFieldInvalid("estado") && "text-red-500")}
              >
                Estado
              </Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleInputChange("estado", value)}
                required
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    isFieldInvalid("estado") && "border-red-500 ring-red-500"
                  )}
                >
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Confirmada">Confirmada</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              {isFieldInvalid("estado") && (
                <p className="text-xs text-red-500">
                  Debe seleccionar un estado.
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nota">Notas Adicionales (opcional)</Label>
              <Textarea
                id="nota"
                value={formData.nota}
                onChange={(e) => handleInputChange("nota", e.target.value)}
                placeholder="Información adicional relevante para la cita (opcional)"
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {citaToEdit ? "Actualizar" : "Guardar"} Cita
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCrearActualizar;
