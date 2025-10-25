'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ContactFieldsFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export function ContactFieldsForm({ formData, onChange, errors }: ContactFieldsFormProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span>Información de Contacto y Ubicación</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información de Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsable">Responsable</Label>
            <Input
              id="responsable"
              value={formData.responsable || ''}
              onChange={(e) => onChange('responsable', e.target.value)}
              placeholder="Nombre del funcionario responsable"
            />
            {errors?.responsable && (
              <p className="text-sm text-red-500">{errors.responsable}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo_electronico">Correo Electrónico</Label>
            <Input
              id="correo_electronico"
              type="email"
              value={formData.correo_electronico || ''}
              onChange={(e) => onChange('correo_electronico', e.target.value)}
              placeholder="correo@chia.gov.co"
            />
            {errors?.correo_electronico && (
              <p className="text-sm text-red-500">{errors.correo_electronico}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="extension_telefonica">Extensión Telefónica</Label>
            <Input
              id="extension_telefonica"
              value={formData.extension_telefonica || ''}
              onChange={(e) => onChange('extension_telefonica', e.target.value)}
              placeholder="1234"
            />
            {errors?.extension_telefonica && (
              <p className="text-sm text-red-500">{errors.extension_telefonica}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono_directo">Teléfono Directo</Label>
            <Input
              id="telefono_directo"
              value={formData.telefono_directo || ''}
              onChange={(e) => onChange('telefono_directo', e.target.value)}
              placeholder="311 123 4567"
            />
            {errors?.telefono_directo && (
              <p className="text-sm text-red-500">{errors.telefono_directo}</p>
            )}
          </div>
        </div>

        {/* Información de Ubicación */}
        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Textarea
            id="direccion"
            value={formData.direccion || ''}
            onChange={(e) => onChange('direccion', e.target.value)}
            placeholder="Carrera 11 Número 11-29, Chía, Cundinamarca"
            rows={3}
          />
          {errors?.direccion && (
            <p className="text-sm text-red-500">{errors.direccion}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="horario_atencion">Horario de Atención</Label>
            <Input
              id="horario_atencion"
              value={formData.horario_atencion || ''}
              onChange={(e) => onChange('horario_atencion', e.target.value)}
              placeholder="Lunes a Viernes 8:00 AM - 4:00 PM"
            />
            {errors?.horario_atencion && (
              <p className="text-sm text-red-500">{errors.horario_atencion}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enlace_web">Enlace Web</Label>
            <Input
              id="enlace_web"
              type="url"
              value={formData.enlace_web || ''}
              onChange={(e) => onChange('enlace_web', e.target.value)}
              placeholder="https://www.chia.gov.co/dependencia"
            />
            {errors?.enlace_web && (
              <p className="text-sm text-red-500">{errors.enlace_web}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}