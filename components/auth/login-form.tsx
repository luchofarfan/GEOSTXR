'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { LoginCredentials } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await login(formData)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error)
    }
  }

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = formData.email && formData.password

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🌐</div>
        <h1 className="text-3xl font-bold text-white mb-2">
          GeoStXR
        </h1>
        <p className="text-gray-400">
          Sistema de Análisis Estructural
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Iniciar Sesión
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => handleInputChange('rememberMe', !!checked)}
              className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              disabled={isLoading}
            />
            <Label htmlFor="rememberMe" className="text-white text-sm">
              Recordar sesión
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Switch to Register */}
        {onSwitchToRegister && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                disabled={isLoading}
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        )}

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-white font-medium mb-2 text-sm">Credenciales de Prueba:</h3>
          <div className="space-y-1 text-xs text-gray-400">
            <div><strong>Admin:</strong> admin@geostxr.com / admin123</div>
            <div><strong>PM:</strong> pm@geostxr.com / pm123</div>
            <div><strong>Geólogo:</strong> geologo@geostxr.com / geo123</div>
            <div><strong>Técnico:</strong> tecnico@geostxr.com / tech123</div>
          </div>
        </div>
      </div>
    </div>
  )
}
