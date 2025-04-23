import { UsuarioCitas, UsuarioClass } from "./Citas";
import { obtenerCitaDatos } from "@/servicios/citasServicio";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalVerProps {
  id: number;
  onClose: () => void;
  isOpen: boolean;
}

const ModalVer = ({ id, onClose, isOpen }: ModalVerProps) => {
  const [cita, setCita] = useState<UsuarioCitas | null>(null);

  const obtenerCita = async (id: number) => {
    const citaData = await obtenerCitaDatos(id);
    if (citaData) {
      setCita(citaData);
    }
  };

  useEffect(() => {
    if (isOpen && id) {
      obtenerCita(id);
    }
  }, [id, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Resumen de Cita</DialogTitle>
          <DialogDescription>Detalles de la cita seleccionada.</DialogDescription>
        </DialogHeader>

        {cita && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Nombre del Cliente</h3>
                <p className="font-medium">{cita.usuario?.nombre || "No disponible"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fecha</h3>
                <p className="font-medium">{cita.fecha_cita}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Hora</h3>
                <p className="font-medium">{cita.hora_cita}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Asunto</h3>
                <p className="font-medium">{cita.asunto}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Sede</h3>
                <p className="font-medium">{cita.sede}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
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
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Notas Adicionales</h3>
              <p className="font-medium">{cita.nota}</p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalVer;
