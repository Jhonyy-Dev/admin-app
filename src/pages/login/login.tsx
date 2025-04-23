import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

import { login } from '@/servicios/loginServicio';

import useAuthStore from '@/store/authStore';


const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const [errorMensaje, setErrorMensaje] = useState('');

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: ''
    };

    // Validación de email
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
      isValid = false;
    }

    // Validación de password
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error al escribir
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMensaje('');
    try {
      const response = await login(formData.email, formData.password);
      if (response.status === 200) {
      
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        const user = response.data.user;
        useAuthStore.getState().setUser(user);
        

        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        });
        
        navigate('/dashboard/usuarios');

      } else {
        setErrorMensaje(response.data.mensaje || "Error al iniciar sesión");

        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.mensaje || "Error al iniciar sesión",
        });

      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error de conexión con el servidor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border border-secondary/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Iniciar Sesión</h2>
          <p className="text-muted-foreground mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-secondary/30 border ${
                errors.email ? 'border-destructive' : 'border-secondary'
              } rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary`}
              disabled={isLoading}

            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-secondary/30 border ${
                errors.password ? 'border-destructive' : 'border-secondary'
              } rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <span className="mt-2 text-sm text-destructive block">
            {errorMensaje && errorMensaje}
          </span>


          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
