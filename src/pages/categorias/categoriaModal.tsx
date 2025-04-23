import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Categoria {
  id: number;
  nombre: string;
}

interface CategoriaModalProps {
  isOpen: boolean;
  onOpenChange: (abierto: boolean) => void;
  onSave: (nombre: string, id?: number, imagen?: File | null) => void;
  category?: Categoria;
  trigger?: React.ReactNode;
  isLoading?: boolean;
}

const CategoriaModal = ({ 
  isOpen, 
  onOpenChange, 
  onSave, 
  category,
  trigger,
  isLoading = false
}: CategoriaModalProps) => {
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [imagenCategoria, setImagenCategoria] = useState<File | null>(null);

  useEffect(() => {
    if (category) {
      setNombreCategoria(category.nombre);
      setImagenCategoria(null); 
    } else {
      setNombreCategoria("");
      setImagenCategoria(null);
    }
  }, [category, isOpen]);

  const manejarGuardar = () => {
    if (nombreCategoria.trim()) {
      onSave(nombreCategoria.trim(), category?.id, imagenCategoria);
    }
  };

  const renderizarTrigger = () => {
    if (trigger) {
      return <DialogTrigger asChild>{trigger}</DialogTrigger>;
    }

    return (
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1">
          <span className="text-sm font-medium">+</span>
          <span>Agregar Categoría</span>
        </Button>
      </DialogTrigger>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {renderizarTrigger()}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoría" : "Agregar Nueva Categoría"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <Input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            disabled={isLoading}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImagenCategoria(file);
            }}
            disabled={isLoading}
          />

          {imagenCategoria && (
            <div className="text-center">
              <img
                src={URL.createObjectURL(imagenCategoria)}
                alt="Vista previa"
                className="max-h-40 mx-auto object-contain rounded-md"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={manejarGuardar}
            disabled={!nombreCategoria.trim() || isLoading}
          >
            {isLoading ? (
              category ? "Guardando..." : "Agregando..."
            ) : (
              category ? "Guardar" : "Agregar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoriaModal;
