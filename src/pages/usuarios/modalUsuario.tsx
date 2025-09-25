import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Usuario } from "./types";
import { CrearUsuario, ActualizarUsuario, ObtenerUsuario } from "@/servicios/usuarioServicio";
import { Eye, EyeOff } from "lucide-react";

const formSchema = (isEditing: boolean) => z.object({
  tipo_servicio: z.enum(['medico', 'migratorio'], {
    required_error: "Debe seleccionar un tipo de servicio.",
  }),
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Ingrese un correo electrónico válido.",
  }),
  telefono: z.string().optional(),
  password: isEditing 
    ? z.string().optional()
    : z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  fecha_nacimiento: z.string().optional(),
  codigo_referido: z.string().optional(), 
  direccion: z.string().optional(),
  

});

interface FormularioUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  usuario?: Usuario;
  onSubmit: (data: z.infer<ReturnType<typeof formSchema>>) => void;
  actualizarListado: () => void;
}

export const ModalUsuario = ({ isOpen, onClose, usuario, onSubmit, actualizarListado }: FormularioUsuarioProps) => {
  
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(!!usuario)),
    defaultValues: {
      tipo_servicio: undefined,
      nombre: "",
      email: "",
      telefono: "",
      password: "",
      fecha_nacimiento: "",
      codigo_referido: "",
      direccion: "",

    },
  });

  const handleClose = () => {
    form.reset({
      tipo_servicio: undefined,
      nombre: "",
      email: "",
      telefono: "",
      password: "",
      fecha_nacimiento: "",
      codigo_referido: "",
      direccion: "",
    });

    setError(null),

    onClose();
  };

  useEffect(() => {
    
    const cargarDatosUsuario = async () => {
      if (usuario?.id) {
        try {
          const datosUsuario = await ObtenerUsuario(usuario.id);
       
          form.reset({
            tipo_servicio: datosUsuario.usuario.tipo_servicio || undefined,
            nombre: datosUsuario.usuario.nombre,
            email: datosUsuario.usuario.email,
            telefono: datosUsuario.usuario.telefono || "",
            fecha_nacimiento: datosUsuario.usuario.fecha_nacimiento || "",
            codigo_referido: datosUsuario.usuario.codigo_referido || "",
            direccion: datosUsuario.usuario.direccion || "",
          });
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
        }
      } else {
        form.reset({
          tipo_servicio: undefined,
          nombre: "",
          email: "",
          telefono: "",
          password: "",
          fecha_nacimiento: "",
          codigo_referido: "",
          direccion: "",

        });
      }
    };

    cargarDatosUsuario();
  }, [usuario, form]);

  const handleSubmit = async (data: z.infer<ReturnType<typeof formSchema>>) => {
    try {
      if (usuario?.id) {
        // Si estamos editando, eliminamos el campo password si está vacío
        const dataToUpdate = { ...data };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        const response = await ActualizarUsuario(usuario.id, dataToUpdate);
        console.log(response);
      } else {
        const response = await CrearUsuario(data);
       
      }
      actualizarListado();
      onClose();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      setError(error.response?.data?.message || "Ocurrió un error al guardar el usuario.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
        </DialogHeader>
        <Form {...form}   >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6  rounded-lg shadow-lg">
      
        {/* Campo obligatorio de tipo de servicio */}
        <FormField control={form.control} name="tipo_servicio" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Tipo de Servicio *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Seleccione el tipo de servicio" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="medico">Situación Médica</SelectItem>
                <SelectItem value="migratorio">Situación Migratoria</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="nombre" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Nombre</FormLabel>
              <FormControl>
                <Input className="rounded-lg" placeholder="Nombre completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Correo electrónico</FormLabel>
              <FormControl>
                <Input type="email" className="rounded-lg" placeholder="correo@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />


        <FormField control={form.control} name="telefono" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Teléfono</FormLabel>
            <FormControl>
              <Input className="rounded-lg" placeholder="Número de teléfono" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {!usuario && (
        <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem className="relative">
            <FormLabel className="text-gray-300">Contraseña</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="rounded-lg pr-10"
                  placeholder="******"
                  {...field}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
        )}

        <FormField control={form.control} name="fecha_nacimiento" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Fecha de nacimiento (opcional)</FormLabel>
            <FormControl>
              <Input type="date" className="rounded-lg text-white " {...field}  />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {!usuario && (
          <FormField control={form.control} name="codigo_referido" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Código de referido (opcional)</FormLabel>
              <FormControl>
                <Input className="rounded-lg" placeholder="Código de referido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <FormField control={form.control} name="direccion" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Direccion</FormLabel>
            <FormControl>
              <Input 
              type="text" className="rounded-lg" {...field} 
             
              placeholder="Ingrese la direccion" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

     {error && <li className="text-red-500 list-disc list-inside">{error}</li>}

  
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" type="button" onClick={handleClose} className="border-gray-400 text-gray-300 hover:bg-gray-700">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
              {usuario ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </form>

        </Form>
      </DialogContent>
    </Dialog>
  );
}; 