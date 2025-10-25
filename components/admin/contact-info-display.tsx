'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Link as LinkIcon,
  User 
} from 'lucide-react';

interface ContactInfoDisplayProps {
  dependencia: {
    responsable?: string | null;
    correo_electronico?: string | null;
    extension_telefonica?: string | null;
    telefono_directo?: string | null;
    direccion?: string | null;
    horario_atencion?: string | null;
    enlace_web?: string | null;
  };
  className?: string;
}

export function ContactInfoDisplay({ dependencia, className = '' }: ContactInfoDisplayProps) {
  const hasContactInfo = dependencia.responsable || 
                        dependencia.correo_electronico || 
                        dependencia.extension_telefonica ||
                        dependencia.direccion;

  if (!hasContactInfo) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No hay información de contacto disponible para esta dependencia.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Información de Contacto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Responsable */}
        {dependencia.responsable && (
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{dependencia.responsable}</p>
              <p className="text-xs text-gray-500">Responsable</p>
            </div>
          </div>
        )}

        {/* Correo Electrónico */}
        {dependencia.correo_electronico && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <a 
                href={`mailto:${dependencia.correo_electronico}`}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block"
              >
                {dependencia.correo_electronico}
              </a>
              <p className="text-xs text-gray-500">Correo Electrónico</p>
            </div>
          </div>
        )}

        {/* Teléfonos */}
        {(dependencia.extension_telefonica || dependencia.telefono_directo) && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {dependencia.extension_telefonica && (
                <p className="text-sm text-gray-900">Ext: {dependencia.extension_telefonica}</p>
              )}
              {dependencia.telefono_directo && (
                <p className="text-sm text-gray-900">Directo: {dependencia.telefono_directo}</p>
              )}
              <p className="text-xs text-gray-500">Teléfonos</p>
            </div>
          </div>
        )}

        {/* Dirección */}
        {dependencia.direccion && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 leading-relaxed">{dependencia.direccion}</p>
              <p className="text-xs text-gray-500">Dirección</p>
            </div>
          </div>
        )}

        {/* Horario de Atención */}
        {dependencia.horario_atencion && (
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{dependencia.horario_atencion}</p>
              <p className="text-xs text-gray-500">Horario de Atención</p>
            </div>
          </div>
        )}

        {/* Enlace Web */}
        {dependencia.enlace_web && (
          <div className="flex items-center gap-3">
            <LinkIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <a 
                href={dependencia.enlace_web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block"
              >
                Visitar sitio web
              </a>
              <p className="text-xs text-gray-500">Enlace Web</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}