# Sistema de Gestión de Dependencias y Subdependencias

## Resumen del Proyecto

Se ha implementado un sistema completo para gestionar y visualizar las dependencias y subdependencias del municipio de Chía, reemplazando el sistema anterior basado en campos de texto con una estructura jerárquica organizada y validada.

## Estructura de Datos

### Tabla `dependencias`

```sql
CREATE TABLE dependencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_dependencia VARCHAR(10) UNIQUE NOT NULL,
  sigla VARCHAR(10),
  nombre VARCHAR(255) NOT NULL,
  tipo_dependencia VARCHAR(50) NOT NULL,
  dependencia_padre_id UUID REFERENCES dependencias(id),
  nivel INTEGER NOT NULL DEFAULT 0,
  estado BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos clave:**
- `codigo_dependencia`: Código único (ej: "000", "001", "010")
- `sigla`: Abreviatura (ej: "DA", "OAJ", "SP")
- `nombre`: Nombre completo de la dependencia
- `tipo_dependencia`: "Directo", "Dirección", "Oficina", etc.
- `dependencia_padre_id`: Relación jerárquica con dependencia padre
- `nivel`: Nivel en la jerarquía (0 = raíz, 1 = primer nivel, etc.)

## Funcionalidades Implementadas

### 1. API REST Completa

**Endpoints:**
- `GET /api/admin/dependencias` - Listar todas las dependencias
- `POST /api/admin/dependencias` - Crear nueva dependencia
- `GET /api/admin/dependencias/arbol` - Obtener estructura jerárquica en árbol
- `GET /api/admin/dependencias/{id}` - Obtener dependencia específica
- `PUT /api/admin/dependencias/{id}` - Actualizar dependencia
- `DELETE /api/admin/dependencias/{id}` - Eliminar dependencia
- `POST /api/admin/dependencias/import` - Importar desde CSV
- `GET /api/admin/dependencias/export` - Exportar a CSV

### 2. Interfaz de Gestión Administrativa

**Ubicación:** `app/admin/configuracion/page.tsx`

**Características:**
- Visualización jerárquica con árbol expandible
- Formulario de creación/edición con validación
- Selección de dependencia padre con validación de relaciones
- Drag & drop para reordenamiento jerárquico
- Importación/exportación de datos CSV
- Búsqueda y filtrado en tiempo real

### 3. Integración con Trámites

**Formulario de creación de trámites:** `app/admin/tramites/nuevo/page.tsx`

**Nuevos campos:**
- `dependencia_id`: Referencia a la dependencia principal
- `subdependencia_id`: Referencia a la subdependencia (opcional)
- `dependencias_relacionadas`: Array de dependencias relacionadas

**Compatibilidad:** Los campos antiguos (`dependencia`, `subdependencia`) se mantienen durante la transición.

### 4. Componentes Reutilizables

**Selector de Dependencias:** `components/admin/dependency-selector.tsx`

- Buscador con autocompletado
- Visualización jerárquica
- Validación de relaciones padre-hijo
- Soporte para selección múltiple

## Validaciones Implementadas

### 1. Validación Jerárquica
- No se permiten relaciones circulares
- Las subdependencias deben pertenecer a la misma dependencia padre
- Nivel máximo de profundidad controlado

### 2. Validación de Datos
- Códigos de dependencia únicos
- Relaciones padre-hijo válidas
- Tipos de dependencia permitidos
- Campos obligatorios completos

### 3. Validación CSV
- Estructura de archivo correcta
- Relaciones jerárquicas válidas
- No duplicados de códigos
- Dependencias padre existentes

## Scripts de Base de Datos

### 1. Creación de Tabla
`scripts/08-create-dependencias-table.sql`

### 2. Modificación de Trámites
`scripts/09-modify-tramites-table.sql`

### 3. Carga Inicial
`scripts/10-seed-dependencias.sql` - Carga los datos del CSV proporcionado

## Tipos TypeScript

`lib/types-dependencias.ts` - Define interfaces para:
- Dependencia básica
- Nodo de árbol jerárquico
- Resultados de API
- Errores de validación

## Seguridad

### 1. Autenticación
- Todas las rutas requieren autenticación de administrador
- Validación de sesión JWT
- Redirección a login si no autenticado

### 2. Autorización
- Políticas de seguridad de fila (RLS) en Supabase
- Control de acceso por roles
- Registro de auditoría

### 3. Validación de Entrada
- Validación Zod para todos los endpoints
- Límites de tamaño de archivo para CSV
- Sanitización de datos

## Pruebas Realizadas

✅ Conexión a base de datos verificada  
✅ Estructura de tablas creada correctamente  
✅ API REST funcional con autenticación  
✅ Componentes de interfaz renderizados  
✅ Validaciones jerárquicas implementadas  
✅ Importación/exportación CSV funcional  
✅ Integración con trámites completada  

## Estado Actual

**✅ IMPLEMENTACIÓN COMPLETA**

El sistema está listo para producción con todas las funcionalidades solicitadas:

1. **Gestión Completa**: Crear, leer, actualizar, eliminar dependencias
2. **Visualización Jerárquica**: Árbol expandible con drag & drop
3. **Integración con Trámites**: Selección de dependencias en formularios
4. **Importación/Exportación**: Soporte CSV con validación
5. **Seguridad**: Autenticación y autorización completa
6. **Compatibilidad**: Transición suave desde sistema anterior

## Próximos Pasos

1. **Capacitación de Usuarios**: Entrenar al personal administrativo
2. **Pruebas de Usuario Final**: Validar con usuarios reales
3. **Migración de Datos**: Poblar la base con datos oficiales
4. **Monitoreo**: Implementar métricas de uso y rendimiento

## Archivos Clave

- `scripts/dependencias.csv` - Datos iniciales proporcionados
- `app/admin/configuracion/page.tsx` - Interfaz de gestión
- `app/api/admin/dependencias/` - API REST completa
- `components/admin/dependency-selector.tsx` - Componente reutilizable
- `lib/types-dependencias.ts` - Tipos TypeScript

---

**Nota:** El sistema mantiene compatibilidad con los campos antiguos durante la transición, permitiendo una migración gradual sin interrupciones al servicio.