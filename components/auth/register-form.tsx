'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { RegisterData, UserRole, ROLE_DESCRIPTIONS } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building, Phone } from 'lucide-react'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register, isLoading, error } = useAuth()
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    role: 'field_tech',
    company: '',
    phone: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== confirmPassword) {
      return
    }
    
    try {
      await register(formData)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration failed:', error)
    }
  }

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = formData.email && formData.password && formData.name && 
                     formData.password === confirmPassword && formData.password.length >= 6

  const passwordMismatch = formData.password && confirmPassword && formData.password !== confirmPassword

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
          Crear Cuenta
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Nombre Completo
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isLoading}
                required
              />
            </div>
          </div>

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

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">
              Rol de Usuario
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value as UserRole)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-400">
                <SelectValue placeholder="Selecciona tu rol" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_DESCRIPTIONS).map(([role, info]) => (
                  <SelectItem key={role} value={role} className="text-white">
                    <div className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <div>
                        <div className="font-medium">{info.title}</div>
                        <div className="text-xs text-gray-400">{info.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company Field */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-white">
              Empresa (Opcional)
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="company"
                type="text"
                placeholder="Mining Corp"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              Teléfono (Opcional)
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="phone"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isLoading}
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
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isLoading}
                required
                minLength={6}
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
            {formData.password && formData.password.length < 6 && (
              <p className="text-xs text-red-400">La contraseña debe tener al menos 6 caracteres</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirmar Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-xs text-red-400">Las contraseñas no coinciden</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </Button>
        </form>

        {/* Switch to Login */}
        {onSwitchToLogin && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                disabled={isLoading}
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
