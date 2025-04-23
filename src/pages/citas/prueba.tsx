import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Plus, Search, Clock, History, MapPin, User, Edit, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Tipo para los datos de usuario
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
}

// Tipo para los datos de cita
interface Cita {
  id: number;
  cliente: string;
  usuarioId?: number;
  fecha: string;
  hora: string;
  asunto: string;
  sede: string;
  estado: string;
  notas?: string;
}

// Tipo para el historial de cortes
interface HistorialCorte {
  id: number;
  fecha: string;
  sede: string;
  hora: string;
  resultado?: string;
}

const Citas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNuevaCitaDialog, setShowNuevaCitaDialog] = useState(false);
  const [showEditarCitaDialog, setShowEditarCitaDialog] = useState(false);
  const [showHistorialDialog, setShowHistorialDialog] = useState(false);
  const [showNotasDialog, setShowNotasDialog] = useState(false);
  const [showResumenDialog, setShowResumenDialog] = useState(false);
  const [selectedCitaId, setSelectedCitaId] = useState<number | null>(null);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState<Partial<Cita>>({
    cliente: "",
    usuarioId: undefined,
    fecha: "",
    hora: "",
    asunto: "",
    sede: "",
    estado: "Pendiente",
    notas: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Generar horas disponibles de 8 AM a 6 PM
  const horasDisponibles = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minutes = i % 2 === 0 ? "00" : "30";
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  });

  // Cargar los usuarios al montar el componente
  useEffect(() => {
    // En un caso real, esto podría ser una llamada a una API
    // Por ahora, usamos los datos de ejemplo
    const usuariosData = [
      { id: 1, nombre: "Juan Pérez", email: "juan@ejemplo.com", rol: "Administrador", estado: "Activo" },
      { id: 2, nombre: "María López", email: "maria@ejemplo.com", rol: "Vendedor", estado: "Activo" },
      { id: 3, nombre: "Carlos Rodríguez", email: "carlos@ejemplo.com", rol: "Cajero", estado: "Inactivo" },
      { id: 4, nombre: "Ana Martínez", email: "ana@ejemplo.com", rol: "Abogado", estado: "Activo" },
      { id: 5, nombre: "Roberto Gómez", email: "roberto@ejemplo.com", rol: "Asistente", estado: "Activo" },
    ];
    setUsuarios(usuariosData);
  }, []);

  // Datos de ejemplo para la tabla de citas
  const [citas, setCitas] = useState<Cita[]>([
    { 
      id: 1, 
      cliente: "Juan Pérez",
      usuarioId: 1,
      fecha: "2025-03-15", 
      hora: "10:00 AM", 
      asunto: "Cita Migratoria", 
      sede: "Miami, FL",
      estado: "Pendiente",
      notas: "Cliente necesita asistencia con documentación"
    },
    { 
      id: 2, 
      cliente: "María López",
      usuarioId: 2,
      fecha: "2025-03-16", 
      hora: "11:30 AM", 
      asunto: "Corte con el Juez", 
      sede: "New York, NY",
      estado: "Confirmada",
      notas: "Preparar documentos para la audiencia"
    },
    { 
      id: 3, 
      cliente: "Carlos Rodríguez",
      usuarioId: 3,
      fecha: "2025-03-14", 
      hora: "3:00 PM", 
      asunto: "Huellas Digitales para ID", 
      sede: "Los Angeles, CA",
      estado: "Completada",
      notas: "Trámite finalizado correctamente"
    },
  ]);

  // Datos de ejemplo para el historial de cortes
  const historialCortes: Record<number, HistorialCorte[]> = {
    1: [
      { id: 1, fecha: "2024-11-15", sede: "Miami, FL", hora: "09:30 AM", resultado: "Aplazada" },
      { id: 2, fecha: "2025-01-20", sede: "Miami, FL", hora: "10:45 AM", resultado: "Reprogramada" },
      { id: 3, fecha: "2025-03-15", sede: "Miami, FL", hora: "10:00 AM" }
    ],
    2: [
      { id: 1, fecha: "2024-10-05", sede: "New York, NY", hora: "08:00 AM", resultado: "Aplazada" },
      { id: 2, fecha: "2025-01-10", sede: "New York, NY", hora: "09:15 AM", resultado: "Reprogramada" },
      { id: 3, fecha: "2025-03-16", sede: "New York, NY", hora: "11:30 AM" }
    ],
    3: [
      { id: 1, fecha: "2024-12-10", sede: "Los Angeles, CA", hora: "02:00 PM", resultado: "Aplazada" },
      { id: 2, fecha: "2025-02-20", sede: "Los Angeles, CA", hora: "01:30 PM", resultado: "Reprogramada" },
      { id: 3, fecha: "2025-03-14", sede: "Los Angeles, CA", hora: "03:00 PM", resultado: "Completada" }
    ]
  };

  // Filtrar citas basadas en el término de búsqueda
  const filteredCitas = citas.filter(
    (cita) =>
      cita.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.fecha.includes(searchTerm) ||
      cita.sede.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });

    // Si se selecciona un usuario, actualizar también el cliente
    if (field === "usuarioId" && value) {
      const usuarioSeleccionado = usuarios.find(u => u.id === parseInt(value));
      if (usuarioSeleccionado) {
        setFormData(prev => ({
          ...prev,
          cliente: usuarioSeleccionado.nombre
        }));
      }
    }
  };

  // Función para guardar la cita
  const handleSaveCita = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editMode && selectedCitaId) {
      // Actualizar cita existente
      setCitas(prevCitas => 
        prevCitas.map(cita => 
          cita.id === selectedCitaId ? { ...cita, ...formData, id: selectedCitaId } : cita
        )
      );
      setShowEditarCitaDialog(false);
    } else {
      // Crear nueva cita
      const newCita: Cita = {
        id: citas.length > 0 ? Math.max(...citas.map(c => c.id)) + 1 : 1,
        cliente: formData.cliente || "",
        usuarioId: formData.usuarioId,
        fecha: formData.fecha || "",
        hora: formData.hora || "",
        asunto: formData.asunto || "",
        sede: formData.sede || "",
        estado: formData.estado || "Pendiente",
        notas: formData.notas
      };
      
      setCitas([...citas, newCita]);
      setShowNuevaCitaDialog(false);
    }
    
    // Limpiar el formulario
    setFormData({
      cliente: "",
      usuarioId: undefined,
      fecha: "",
      hora: "",
      asunto: "",
      sede: "",
      estado: "Pendiente",
      notas: ""
    });
    setEditMode(false);
  };

  // Función para mostrar el historial de una cita
  const handleShowHistorial = (citaId: number) => {
    setSelectedCitaId(citaId);
    setShowHistorialDialog(true);
  };

  // Función para editar una cita
  const handleEditCita = (citaId: number) => {
    const citaToEdit = citas.find(cita => cita.id === citaId);
    if (citaToEdit) {
      setFormData({ ...citaToEdit });
      setSelectedCitaId(citaId);
      setEditMode(true);
      setShowEditarCitaDialog(true);
    }
  };

  // Función para mostrar las notas de una cita
  const handleShowNotas = (cita: Cita) => {
    setSelectedCita(cita);
    setShowNotasDialog(true);
  };

  // Función para mostrar el resumen de la cita
  const handleVerResumen = (cita: Cita) => {
    setSelectedCita(cita);
    setShowResumenDialog(true);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      return format(new Date(year, month - 1, day), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Citas</h1>
        <Dialog open={showNuevaCitaDialog} onOpenChange={setShowNuevaCitaDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              <span>Nueva Cita</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Agendar Nueva Cita</DialogTitle>
              <DialogDescription>
                Complete los detalles para agendar una nueva cita migratoria.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveCita} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usuarioId">Seleccionar Usuario</Label>
                  <Select 
                    value={formData.usuarioId?.toString() || ""} 
                    onValueChange={(value) => handleInputChange("usuarioId", parseInt(value))}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <div className="flex items-center w-full">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Seleccione un usuario">
                          {(() => {
                            const selectedUser = formData.usuarioId ? usuarios.find(u => u.id === formData.usuarioId) : null;
                            return selectedUser ? `${selectedUser.nombre} (${selectedUser.email})` : "Seleccione un usuario";
                          })()}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map(usuario => (
                        <SelectItem key={usuario.id} value={usuario.id.toString()}>
                          {usuario.nombre} ({usuario.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cliente">Nombre del Cliente</Label>
                  <Input 
                    id="cliente" 
                    value={formData.cliente || ""} 
                    onChange={(e) => handleInputChange("cliente", e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.fecha && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fecha ? format(new Date(formData.fecha), "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-0 bg-black text-white rounded-lg shadow-lg">
                        <div className="flex items-center justify-between p-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-blue-900 text-white"
                            onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
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
                            onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
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
                            const isSelected = formData.fecha ? isSameDay(day, new Date(formData.fecha)) : false;
                            return (
                              <Button
                                key={i}
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-9 w-9 p-0 font-normal rounded-full transition-all",
                                  !isSameMonth(day, calendarMonth) && "text-gray-600 opacity-50",
                                  isSelected && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                                  isToday(day) && !isSelected && "border border-blue-400 text-blue-400 font-medium",
                                  !isSelected && isSameMonth(day, calendarMonth) && "hover:bg-gray-800 text-white"
                                )}
                                onClick={() => {
                                  handleInputChange("fecha", format(day, "yyyy-MM-dd"));
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
                              handleInputChange("fecha", format(new Date(), "yyyy-MM-dd"));
                            }}
                          >
                            Hoy
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Select 
                    value={formData.hora || ""} 
                    onValueChange={(value) => handleInputChange("hora", value)}
                    required
                  >
                    <SelectTrigger className="w-full">
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="asunto">Asunto</Label>
                  <Input 
                    id="asunto" 
                    value={formData.asunto || ""} 
                    onChange={(e) => handleInputChange("asunto", e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sede">Sede</Label>
                  <Input 
                    id="sede" 
                    value={formData.sede || ""} 
                    onChange={(e) => handleInputChange("sede", e.target.value)}
                    className="w-full"
                    required
                    placeholder="Ingrese la dirección de la sede"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select 
                    value={formData.estado || "Pendiente"} 
                    onValueChange={(value) => handleInputChange("estado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Confirmada">Confirmada</SelectItem>
                      <SelectItem value="Completada">Completada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notas">Notas Adicionales</Label>
                  <Textarea 
                    id="notas" 
                    value={formData.notas || ""} 
                    onChange={(e) => handleInputChange("notas", e.target.value)}
                    placeholder="Información adicional relevante para la cita"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowNuevaCitaDialog(false);
                    setEditMode(false);
                    setFormData({
                      cliente: "",
                      usuarioId: undefined,
                      fecha: "",
                      hora: "",
                      asunto: "",
                      sede: "",
                      estado: "Pendiente",
                      notas: ""
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cita</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Diálogo para editar cita */}
      <Dialog open={showEditarCitaDialog} onOpenChange={setShowEditarCitaDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Cita</DialogTitle>
            <DialogDescription>
              Modifique los detalles de la cita seleccionada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCita} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-usuarioId">Seleccionar Usuario</Label>
                <Select 
                  value={formData.usuarioId?.toString() || ""} 
                  onValueChange={(value) => handleInputChange("usuarioId", parseInt(value))}
                  required
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center w-full">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Seleccione un usuario">
                        {(() => {
                          const selectedUser = formData.usuarioId ? usuarios.find(u => u.id === formData.usuarioId) : null;
                          return selectedUser ? `${selectedUser.nombre} (${selectedUser.email})` : "Seleccione un usuario";
                        })()}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map(usuario => (
                      <SelectItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.nombre} ({usuario.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              

              
              <div className="space-y-2">
                <Label htmlFor="edit-fecha">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.fecha && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha ? format(new Date(formData.fecha), "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-0 bg-black text-white rounded-lg shadow-lg">
                      <div className="flex items-center justify-between p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-blue-900 text-white"
                          onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
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
                          onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
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
                          const isSelected = formData.fecha ? isSameDay(day, new Date(formData.fecha)) : false;
                          return (
                            <Button
                              key={i}
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-9 w-9 p-0 font-normal rounded-full transition-all",
                                !isSameMonth(day, calendarMonth) && "text-gray-600 opacity-50",
                                isSelected && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                                isToday(day) && !isSelected && "border border-blue-400 text-blue-400 font-medium",
                                !isSelected && isSameMonth(day, calendarMonth) && "hover:bg-gray-800 text-white"
                              )}
                              onClick={() => {
                                handleInputChange("fecha", format(day, "yyyy-MM-dd"));
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
                            handleInputChange("fecha", format(new Date(), "yyyy-MM-dd"));
                          }}
                        >
                          Hoy
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-hora">Hora</Label>
                <Select 
                  value={formData.hora || ""} 
                  onValueChange={(value) => handleInputChange("hora", value)}
                  required
                >
                  <SelectTrigger className="w-full">
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-asunto">Asunto</Label>
                <Input 
                  id="edit-asunto" 
                  value={formData.asunto || ""} 
                  onChange={(e) => handleInputChange("asunto", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-sede">Sede</Label>
                <Input 
                  id="edit-sede" 
                  value={formData.sede || ""} 
                  onChange={(e) => handleInputChange("sede", e.target.value)}
                  className="w-full"
                  required
                  placeholder="Ingrese la dirección de la sede"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-estado">Estado</Label>
                <Select 
                  value={formData.estado || "Pendiente"} 
                  onValueChange={(value) => handleInputChange("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Confirmada">Confirmada</SelectItem>
                    <SelectItem value="Completada">Completada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-notas">Notas Adicionales</Label>
                <Textarea 
                  id="edit-notas" 
                  value={formData.notas || ""} 
                  onChange={(e) => handleInputChange("notas", e.target.value)}
                  placeholder="Información adicional relevante para la cita"
                  className="min-h-[80px]"
                />
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEditarCitaDialog(false);
                  setEditMode(false);
                  setFormData({
                    cliente: "",
                    usuarioId: undefined,
                    fecha: "",
                    hora: "",
                    asunto: "",
                    sede: "",
                    estado: "Pendiente",
                    notas: ""
                  });
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Actualizar Cita</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <CalendarIcon size={20} />
            <span>Calendario de Citas</span>
          </CardTitle>
          <CardDescription>
            Gestione las citas migratorias de sus clientes en las diferentes sedes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar citas..."
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
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Sede</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCitas.length > 0 ? (
                  filteredCitas.map((cita) => (
                    <TableRow key={cita.id}>
                      <TableCell>{cita.id}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        <User size={14} className="text-blue-500" />
                        {cita.cliente}
                      </TableCell>
                      <TableCell>{cita.fecha}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Clock size={14} />
                        {cita.hora}
                      </TableCell>
                      <TableCell>{cita.asunto}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        <MapPin size={14} className="text-red-500" />
                        {cita.sede}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            cita.estado === "Pendiente"
                              ? "bg-yellow-100 text-yellow-800"
                              : cita.estado === "Confirmada"
                              ? "bg-blue-100 text-blue-800"
                              : cita.estado === "Cancelada"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1"
                            onClick={() => handleVerResumen(cita)}
                          >
                            <FileText className="h-4 w-4" />
                            <span>Ver</span>
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-1"
                            onClick={() => handleEditCita(cita.id)}
                          >
                            <Edit className="h-4 w-4" />
                            <span>Editar</span>
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1"
                            onClick={() => handleShowHistorial(cita.id)}
                          >
                            <History className="h-4 w-4" />
                            <span>Historial</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para mostrar el historial de cortes */}
      <Dialog open={showHistorialDialog} onOpenChange={setShowHistorialDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Historial de Cortes</DialogTitle>
            <DialogDescription>
              Registro de fechas de corte, sedes y horarios asignados anteriormente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedCitaId && historialCortes[selectedCitaId] ? (
              <div className="space-y-4">
                {historialCortes[selectedCitaId].map((item) => (
                  <div key={item.id} className="p-4 border rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{formatDate(item.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{item.hora}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{item.sede}</span>
                      </div>
                      {item.resultado && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.resultado === "Aplazada" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : item.resultado === "Reprogramada" 
                            ? "bg-blue-100 text-blue-800"
                            : item.resultado === "Completada"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {item.resultado}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No hay historial de cortes disponible para esta cita.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHistorialDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para mostrar las notas de la cita */}
      <Dialog open={showNotasDialog} onOpenChange={setShowNotasDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Notas del Cliente</span>
            </DialogTitle>
            <DialogDescription>
              {selectedCita?.cliente}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-muted/20 rounded-md border">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cita: {selectedCita?.fecha} - {selectedCita?.hora}</span>
              </div>
              <div className="mt-2 text-sm whitespace-pre-wrap">
                {selectedCita?.notas || "No hay notas adicionales para este cliente."}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowNotasDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Resumen de Cita */}
      <Dialog open={showResumenDialog} onOpenChange={setShowResumenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resumen de Cita</DialogTitle>
            <DialogDescription>
              Detalles de la cita seleccionada.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCita && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Seleccionar Usuario</h4>
                  <p className="text-base font-medium">
                    {(() => {
                      const usuario = usuarios.find(u => u.id === selectedCita.usuarioId);
                      return usuario ? `${usuario.nombre} (${usuario.email})` : 'No asignado';
                    })()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Nombre del Cliente</h4>
                  <p className="text-base font-medium">{selectedCita.cliente}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Fecha</h4>
                  <p className="text-base font-medium">{selectedCita.fecha ? format(new Date(selectedCita.fecha), "PPP", { locale: es }) : 'No especificada'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Hora</h4>
                  <p className="text-base font-medium">{selectedCita.hora}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Asunto</h4>
                  <p className="text-base font-medium">{selectedCita.asunto}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Sede</h4>
                  <p className="text-base font-medium">{selectedCita.sede}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Estado</h4>
                <div className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  selectedCita.estado === "Completada" && "bg-green-100 text-green-800",
                  selectedCita.estado === "Pendiente" && "bg-yellow-100 text-yellow-800",
                  selectedCita.estado === "Cancelada" && "bg-red-100 text-red-800"
                )}>
                  {selectedCita.estado}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Notas Adicionales</h4>
                <div className="p-3 bg-muted/20 rounded-md border text-sm">
                  {selectedCita.notas || 'No hay notas adicionales'}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowResumenDialog(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Citas;
