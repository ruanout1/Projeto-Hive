import { useState } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import React from 'react';


export default function PhotoUploadSection() {
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (type: 'before' | 'after', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      if (type === 'before') {
        setBeforePhotos(prev => [...prev, ...newPhotos]);
      } else {
        setAfterPhotos(prev => [...prev, ...newPhotos]);
      }
    }
  };

  const removePhoto = (type: 'before' | 'after', index: number) => {
    if (type === 'before') {
      setBeforePhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const recentUploads = [
    { service: "Limpeza Geral - Shopping Norte", date: "22/09/2024", beforeCount: 3, afterCount: 4, status: "completed" },
    { service: "Limpeza de Vidros - Prédio Comercial", date: "21/09/2024", beforeCount: 2, afterCount: 3, status: "completed" },
    { service: "Enceramento - Escritório Corporate", date: "20/09/2024", beforeCount: 4, afterCount: 4, status: "completed" }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="mb-6">
        <h2>Documentação Fotográfica</h2>
        <p className="text-black">
          Registre o antes e depois dos serviços para controle de qualidade e satisfação do cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload de Fotos "Antes" */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Camera className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Fotos "Antes"
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="before-photos"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload('before', e)}
                  className="hidden"
                />
                <label htmlFor="before-photos" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-black">Clique para adicionar fotos</p>
                  <p className="text-xs text-gray-500">PNG, JPG até 10MB cada</p>
                </label>
              </div>

              {beforePhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {beforePhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Antes ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removePhoto('before', index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload de Fotos "Depois" */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Camera className="h-5 w-5 mr-2" style={{ color: '#8B20EE' }} />
              Fotos "Depois"
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="after-photos"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload('after', e)}
                  className="hidden"
                />
                <label htmlFor="after-photos" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-black">Clique para adicionar fotos</p>
                  <p className="text-xs text-gray-500">PNG, JPG até 10MB cada</p>
                </label>
              </div>

              {afterPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {afterPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Depois ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removePhoto('after', index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Enviar */}
      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <div className="flex justify-center">
          <Button 
            className="px-8 py-2"
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            <Check className="h-4 w-4 mr-2" />
            Enviar Documentação
          </Button>
        </div>
      )}

      {/* Histórico de Uploads */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle className="text-black">Uploads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUploads.map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-black">{upload.service}</p>
                  <p className="text-sm text-gray-600">{upload.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-black">
                    {upload.beforeCount} antes, {upload.afterCount} depois
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-none">
                    Enviado
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}