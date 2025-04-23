import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface HistorialCita {
  id: number;
  fecha_cita: string;
  hora_cita: string;
  sede: string;
  estado: string;
  cita: Cita;
}

interface Cita {
  id: number;
  fecha_cita: string;
  hora_cita: string;
  sede: string;
  estado: string;
}

interface ModalHistorialProps {
  isOpen: boolean;
  onClose: () => void;
  historial: HistorialCita[];
}

const ModalHistorial = ({ isOpen, onClose, historial }: ModalHistorialProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Historial de Citas</DialogTitle>
          {/* El botón de cierre ya está incluido en DialogContent por defecto */}
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-4">
            Registro de fechas de cita, sedes y horarios asignados anteriormente.
          </p>
          
          <div className="space-y-4">
            {historial && historial.length > 0 ? (
              historial.map((cita) => (
                <div
                  key={cita.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">
                        {cita.cita.fecha_cita}
                      </span>
                      <span className="text-gray-500">
                        {cita.cita.hora_cita}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {cita.cita.sede}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      cita.cita.estado === "Aplazada"
                        ? "bg-yellow-100 text-yellow-800"
                        : cita.cita.estado === "Reprogramada"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {cita.cita.estado}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No hay registros de historial para esta cita.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalHistorial;
