# 🔒 Informe de Auditoría de Seguridad OWASP Top 10
**Proyecto:** Portal Ciudadano - Municipio de Chía, Cundinamarca  
**Fecha:** 17 de junio de 2026  
**Auditor:** Security Engineer Agent  
**Alcance:** Revisión completa de código fuente + pruebas dinámicas en servidor localhost:3000  
**Stack:** Next.js 16.1.6, React 19, Supabase, Tailwind CSS, Turbopack

---

## 📊 Resumen Ejecutivo

### Estado General: 🔴 **RIESGO ALTO**

| Severidad | Cantidad | OWASP Categorías Afectadas |
|-----------|----------|---------------------------|
| 🔴 Crítica | **4** | A01, A02, A10 |
| 🟠 Alta | **6** | A01, A03, A05, A09 |
| 🟡 Media | **8** | A01, A02, A05, A06, A07, A08, A09 |
| 🟢 Baja | **4** | A05, A09 |
| **Total** | **22** | |

---

## 🔴 VULNERABILIDADES CRÍTICAS

---

### CRIT-01: SSRF sin autenticación en endpoint de prueba n8n
**Categoría OWASP:** A10:2021 – Server-Side Request Forgery (SSRF) + A01:2021 – Broken Access Control  
**Archivo:** `app/api/admin/n8n-config/test/route.ts` — Líneas 1–37  
**Severidad:** 🔴 CRÍTICA

**Descripción:**  
El endpoint `POST /api/admin/n8n-config/test` **no tiene ninguna verificación de autenticación ni autorización**. Cualquier persona, sin estar autenticada, puede enviar una URL arbitraria en el campo `webhook_url` y el servidor realizará una petición HTTP a esa URL.

**Impacto:**
- Un atacante externo puede usar este endpoint para escanear la red interna (cloud metadata endpoints, servicios internos)
- Posible pivote a bases de datos internas, servidores de metadata cloud (AWS, GCP, Azure)

**Corrección aplicada:** ✅ Añadida autenticación, verificación de rol admin, y validador SSRF `isValidN8nUrl()` que bloquea IPs privadas, localhost, y endpoints de metadata cloud.

---

### CRIT-02: Bypass de autorización en toggle de trámites
**Categoría OWASP:** A01:2021 – Broken Access Control  
**Archivo:** `app/api/admin/tramites/toggle/route.ts` — Líneas 1–25  
**Severidad:** 🔴 CRÍTICA

**Descripción:**  
El endpoint `POST /api/admin/tramites/toggle` verifica autenticación pero **NO verifica el rol del usuario**. Cualquier usuario autenticado puede activar/desactivar cualquier trámite.

**Corrección aplicada:** ✅ Añadida verificación `profile?.role !== "admin"` con respuesta 403 Forbidden.

---

### CRIT-03: Credenciales de Supabase expuestas en .env.local
**Categoría OWASP:** A02:2021 – Cryptographic Failures  
**Archivo:** `.env.local`  
**Severidad:** 🔴 CRÍTICA

**Descripción:** El archivo `.env.local` contiene credenciales reales de producción. `SUPABASE_SERVICE_ROLE_KEY` da control total de la base de datos.

**Recomendación:** Rotar claves desde Supabase Dashboard, generar JWT_SECRET real, verificar que .env.local está en .gitignore.

---

### CRIT-04: Inconsistencia de seguridad entre endpoints toggle
**Categoría OWASP:** A01:2021 – Broken Access Control  
**Archivos:** `app/api/admin/tramites/toggle/route.ts` vs `app/api/admin/users/toggle/route.ts`  
**Severidad:** 🔴 CRÍTICA

**Descripción:** El toggle de usuarios SÍ verificaba admin, pero el de trámites NO.

**Corrección aplicada:** ✅ Estandarizada verificación de rol admin en ambos endpoints.

---

## 🟠 VULNERABILIDADES ALTAS (6)

- HIGH-01: CSP con 'unsafe-eval' y 'unsafe-inline'
- HIGH-02: Información de sistema expuesta en errores de desarrollo
- HIGH-03: server.js expone uptime en health check público
- HIGH-04: Fallback inseguro de SERVICE_ROLE a ANON_KEY en setup-database.js
- HIGH-05: Exportación CSV sin sanitización anti-CSV-Injection
- HIGH-06: X-Powered-By: Next.js expuesto

## 🟡 VULNERABILIDADES MEDIAS (8)

- MED-01: lodash 4.17.23 — Prototype Pollution
- MED-02: Script de VoiceGlow sin SRI
- MED-03: Sin estrategia de caché
- MED-04: Sin protección CSRF en rutas API
- MED-05: Rate limiting solo en nginx
- MED-06: NEXT_PUBLIC_ENABLE_DEBUG=true en desarrollo
- MED-07: CORS con origen potencialmente amplio
- MED-08: csv-parse sin límites de tamaño

## 🟢 VULNERABILIDADES BAJAS (4)

- LOW-01: NEXT_PUBLIC_PASSWORD_MIN_LENGTH=8 (debería ser 12)
- LOW-02: Cross-Origin headers comentados
- LOW-03: Health endpoint duplicado
- LOW-04: Header Permissions-Policy incluye interest-cohort (obsoleto)

---

## ✅ ASPECTOS POSITIVOS (14)

1. ✅ requireAdmin() en páginas server-side
2. ✅ Validación de contraseñas robusta (OWASP: 12+ chars)
3. ✅ Sanitización de logging (campos sensibles)
4. ✅ Manejo seguro de errores centralizado
5. ✅ Validación de origen en OAuth callback
6. ✅ CSV Injection mitigation en importación
7. ✅ RLS Policies en Supabase
8. ✅ Rate limiting en nginx
9. ✅ Separación de roles (admin, supervisor, user)
10. ✅ Audit logging estructurado
11. ✅ CORS configurado apropiadamente
12. ✅ frame-ancestors 'none' en CSP (anti-clickjacking)
13. ✅ Strict-Transport-Security con preload
14. ✅ X-Content-Type-Options: nosniff

---

## 📋 PLAN DE ACCIÓN PRIORIZADO

### 🔴 INMEDIATO — Completado
| # | Acción | Estado |
|---|--------|--------|
| 1 | Añadir autenticación + anti-SSRF a n8n-config/test | ✅ HECHO |
| 2 | Añadir verificación de rol admin al toggle de trámites | ✅ HECHO |
| 3 | Rotar claves de Supabase | ⚠️ PENDIENTE |
| 4 | Generar JWT_SECRET real | ⚠️ PENDIENTE |

### 🟠 CORTO PLAZO (1 semana)
| # | Acción |
|---|--------|
| 5 | Remover 'unsafe-eval' del CSP |
| 6 | Usar createSafeErrorResponse en TODOS los endpoints |
| 7 | Sanitizar exportación CSV anti-injection |
| 8 | Ocultar X-Powered-By en nginx |
| 9 | Auditar TODOS los endpoints toggle |
| 10 | Corregir fallback inseguro en setup-database.js |

## 📊 COMPARATIVA CON AUDITORÍA ANTERIOR (Marzo 2026)

| Vulnerabilidad (Marzo 2026) | Estado (Junio 2026) |
|-----------------------------|---------------------|
| CRIT-01: Credenciales en .env.local | ❌ NO CORREGIDO |
| CRIT-02: CSV Injection en importar | ✅ CORREGIDO |
| CRIT-03: Uso inseguro de service_role_key | ⚠️ PARCIAL |
| HIGH-04: Falta de rate limiting backend | ❌ NO CORREGIDO |
| HIGH-05: Validación débil de contraseñas | ✅ CORREGIDO |
| HIGH-06: Falta de logging de auditoría | ✅ CORREGIDO |
| HIGH-07: CSP demasiado permisiva | ❌ NO CORREGIDO |
| HIGH-08: Exposición de datos en errores | ⚠️ PARCIAL |
| MED-10: Callback sin validación de origen | ✅ CORREGIDO |

**Progreso:** 4 de 11 corregidos completamente (36%), 3 parcialmente, 4 sin corregir.

---

**Documento generado por:** Security Engineer Agent  
**Fecha:** 17 de junio de 2026  
**Próxima auditoría recomendada:** Septiembre 2026 (trimestral)
