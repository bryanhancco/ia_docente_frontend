'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DocenteResponseDTO, DocenteUpdateDTO, apiService } from '../../lib/api';

interface FormData {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const [docente, setDocente] = useState<DocenteResponseDTO | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'photo' | 'password'>('profile');
  
  const router = useRouter();

  useEffect(() => {
    const loadDocenteData = async () => {
      try {
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) {
          router.push('/teacher/login');
          return;
        }

        const userData = JSON.parse(userDataString);
        const docenteData = await apiService.getDocente(userData.id);
        setDocente(docenteData);
        setFormData({
          nombre: docenteData.nombre,
          email: docenteData.correo,
          password: '',
          confirmPassword: ''
        });

        // Cargar foto actual si existe
        if (docenteData.foto) {
          // La URL ya incluye la ruta completa desde el backend
          setCurrentPhotoUrl(`https://lfl-devstream.s3.amazonaws.com${docenteData.foto}`);
        }
      } catch (error) {
        console.error('Error loading teacher data:', error);
        setError('Error al cargar los datos del profesor');
      }
    };

    loadDocenteData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Crear URL de vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById('foto') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docente) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: DocenteUpdateDTO = {
        nombre: formData.nombre,
        correo: formData.email
      };

      const updated = await apiService.updateDocente(docente.id, updateData);
      // Refresh local state with the updated docente
      setDocente(updated);
      setFormData(prev => ({ ...prev, nombre: updated.nombre, email: updated.correo }));
      setSuccess('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docente) return;

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiService.updateDocente(docente.id, { password: formData.password });
      setSuccess('Contraseña actualizada correctamente');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile || !docente) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiService.subirFotoDocente(docente.id, selectedFile);
      setSuccess('Foto actualizada correctamente');
      
      // Recargar datos del docente para obtener la nueva foto
      const updatedDocente = await apiService.getDocente(docente.id);
      setDocente(updatedDocente);
      
      if (updatedDocente.foto) {
        setCurrentPhotoUrl(`https://lfl-devstream.s3.amazonaws.com${updatedDocente.foto}`);
      }
      
      // Limpiar la vista previa
      setSelectedFile(null);
      setPreviewUrl(null);
      const fileInput = document.getElementById('foto') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Error al subir la foto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!docente) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiService.eliminarFotoDocente(docente.id);
      setSuccess('Foto eliminada correctamente');
      setCurrentPhotoUrl(null);
      
      // Actualizar el estado del docente
      setDocente((prev: DocenteResponseDTO | null) => prev ? { ...prev, foto: undefined, foto_caricatura: undefined } : null);
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError('Error al eliminar la foto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!docente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center"
        style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
      >
        <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
    >
      {/* Header */}
      <header className="backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-gray-800 text-xl font-bold">Configuración</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Card */}
        <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-white/20 backdrop-blur-md bg-white/40">
            <nav className="flex space-x-8 px-8 py-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('photo')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'photo'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Foto de Perfil
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'password'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Seguridad
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Messages */}
            {error && (
              <div className="mb-6 backdrop-blur-md bg-red-100/80 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 backdrop-blur-md bg-green-100/80 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-gray-800 text-lg font-semibold mb-2">Información Personal</h3>
                  <p className="text-gray-600 text-sm">Actualice sus datos de contacto</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full backdrop-blur-md bg-white/70 border border-white/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full backdrop-blur-md bg-white/70 border border-white/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Guardando...</span>
                      </div>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Photo Tab */}
            {activeTab === 'photo' && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-gray-800 text-lg font-semibold mb-2">Foto de Perfil</h3>
                  <p className="text-gray-600 text-sm">Administre su imagen de perfil profesional</p>
                </div>

                <div className="space-y-6">
                  {/* Current Photo */}
                  <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-white/20">
                    <label className="block text-gray-700 text-sm font-semibold mb-4">
                      Foto Actual
                    </label>
                    <div className="flex items-center justify-center">
                      {currentPhotoUrl ? (
                        <div className="relative">
                          <img
                            src={currentPhotoUrl}
                            alt="Foto actual"
                            className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                          />
                          <button
                            onClick={handleDeletePhoto}
                            disabled={isLoading}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload New Photo */}
                  <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-white/20">
                    <label className="block text-gray-700 text-sm font-semibold mb-4">
                      Subir Nueva Foto
                    </label>
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Vista previa"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                        {previewUrl && (
                          <button
                            type="button"
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      <input
                        type="file"
                        id="foto"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      <button
                        type="button"
                        onClick={() => document.getElementById('foto')?.click()}
                        className="backdrop-blur-md bg-blue-100/80 hover:bg-blue-200/80 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-blue-200"
                      >
                        Seleccionar Archivo
                      </button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
                      </p>
                      
                      {selectedFile && (
                        <button
                          onClick={handlePhotoUpload}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Subiendo...</span>
                            </div>
                          ) : (
                            'Subir Foto'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-gray-800 text-lg font-semibold mb-2">Seguridad</h3>
                  <p className="text-gray-600 text-sm">Actualice su contraseña para mantener su cuenta segura</p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full backdrop-blur-md bg-white/70 border border-white/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full backdrop-blur-md bg-white/70 border border-white/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                      placeholder="Repita la nueva contraseña"
                    />
                  </div>

                  <div className="backdrop-blur-md bg-amber-50/80 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <h4 className="text-amber-800 text-sm font-semibold mb-1">Recomendaciones de Seguridad</h4>
                        <ul className="text-amber-700 text-xs space-y-1">
                          <li>• Use al menos 6 caracteres</li>
                          <li>• Combine letras, números y símbolos</li>
                          <li>• Evite información personal</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Actualizando...</span>
                      </div>
                    ) : (
                      'Cambiar Contraseña'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
