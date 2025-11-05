# Guía de Despliegue para Dokploy - Trámites App

Esta guía proporciona instrucciones completas para desplegar la aplicación de trámites en Dokploy con configuración optimizada para producción.

## 📋 Requisitos Previos

### Requisitos del Sistema
- **Docker** 20.10 o superior
- **Docker Compose** 1.29 o superior
- **Node.js** 18 o superior
- **Git** 2.30 o superior
- **openssl** (para generación de SSL)

### Requisitos de Infraestructura
- Servidor Linux (Ubuntu 20.04/22.04 recomendado)
- Mínimo 2GB RAM
- Mínimo 2GB espacio en disco
- Acceso root o sudo

## 🚀 Preparación del Entorno

### 1. Clonar el Repositorio
```bash
git clone <tu-repositorio>
cd tramites-app
```

### 2. Configurar Variables de Entorno
Cree un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edite el archivo `.env` con sus valores reales:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_JWT_SECRET=tu_jwt_secret
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role

# Environment
NODE_ENV=production

# Dokploy Configuration
DOKPLOY_APP_NAME=tramites-app
DOKPLOY_PROJECT_NAME=tramites-platform
```

### 3. Instalar Dependencias
```bash
npm install -g pnpm
pnpm install
```

## 🏗️ Configuración de Dokploy

### 1. Construir la Aplicación
```bash
pnpm run build
```

### 2. Configurar SSL
Para entornos de desarrollo, el script generará certificados auto-firmados:
```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=CO/ST=Antioquia/L=Medellin/O=TramitesApp/CN=localhost"
```

Para producción, coloque sus certificados SSL reales en la carpeta `ssl/`.

### 3. Desplegar con Script Automático
```bash
node scripts/deploy-dokploy.mjs
```

### 4. Desplegar Manualmente
```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

## ⚙️ Configuración de Dominios y SSL

### 1. Configuración de DNS
Apunte su dominio al servidor:
- A Record: `tu-dominio.com` → `IP_DEL_SERVIDOR`
- CNAME: `www.tu-dominio.com` → `tu-dominio.com`

### 2. Actualizar Nginx Config
Edite `nginx.conf` y cambie `server_name _;` por su dominio real:

```nginx
server_name tu-dominio.com www.tu-dominio.com;
```

### 3. Configurar Certificados SSL Reales
Para Let's Encrypt con Certbot:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Añadir: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Comandos de Despliegue y Verificación

### Comandos Básicos
```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Ver logs de Nginx
docker-compose logs -f nginx

# Detener servicios
docker-compose down

# Iniciar servicios
docker-compose up -d

# Reiniciar servicios
docker-compose restart

# Ver estado de los servicios
docker-compose ps
```

### Verificación del Despliegue
```bash
# Verificar que los contenedores están corriendo
docker-compose ps

# Verificar acceso a la aplicación
curl -I https://tu-dominio.com

# Verificar estado de salud
curl -f http://localhost:3000

# Verificar SSL
openssl s_client -connect tu-dominio.com:443
```

## 📊 Monitoreo Post-Despliegue

### 1. Métricas Básicas
```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f

# Ver historial de despliegues
git log --oneline -10
```

### 2. Health Checks
La aplicación incluye health checks automáticos:
- `/api/health` - Estado de la aplicación
- `/api/health/db` - Estado de la base de datos

### 3. Monitoreo de Rendimiento
```bash
# Ver métricas de Nginx
docker exec -it nginx nginx -T

# Ver estadísticas de conexión
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

## 🔍 Troubleshooting Común

### 1. Problemas de Construcción
```bash
# Limpiar caché de Docker
docker system prune -a

# Reconstruir imágenes
docker-compose build --no-cache

# Verificar dependencias
pnpm install --frozen-lockfile
```

### 2. Problemas de Conexión
```bash
# Verificar puertos abiertos
netstat -tulpn | grep :3000

# Verificar configuración de red
docker network ls
docker network inspect <network-name>

# Verificar DNS
nslookup tu-dominio.com
```

### 3. Problemas de SSL
```bash
# Verificar certificados
openssl x509 -in ssl/cert.pem -text -noout

# Verificar llave privada
openssl rsa -in ssl/key.pem -check

# Regenerar certificados
rm ssl/*
# Volver a generar
```

### 4. Problemas de Base de Datos
```bash
# Verificar conexión a Supabase
curl -I https://tu-proyecto.supabase.co/rest/v1/

# Verificar variables de entorno
docker-compose exec app printenv | grep SUPABASE
```

## 🔄 Procedimientos de Rollback

### 1. Rollback de Código
```bash
# Ver commits anteriores
git log --oneline

# Hacer rollback a commit específico
git revert <commit-hash>

# O volver a commit anterior
git reset --hard HEAD~1

# Volver a desplegar
pnpm run build
docker-compose up -d --force-recreate
```

### 2. Rollback de Base de Datos
```bash
# Verificar respaldos
# Restaurar desde Supabase dashboard
# O usar pg_dump/pg_restore
pg_restore -h localhost -U usuario -d base_de_datos backup.dump
```

### 3. Rollback de Configuración
```bash
# Verificar configuraciones anteriores
git checkout HEAD~1 -- nginx.conf
git checkout HEAD~1 -- docker-compose.yml

# Recargar configuración
docker-compose up -d --force-recreate
```

## 📝 Mantenimiento

### 1. Actualizaciones Regulares
```bash
# Actualizar dependencias
pnpm update

# Actualizar imágenes de Docker
docker-compose pull

# Reconstruir y desplegar
pnpm run build
docker-compose up -d --force-recreate
```

### 2. Limpieza de Logs
```bash
# Limpiar logs antiguos
docker-compose logs --tail=100 -f

# Limpiar imágenes y contenedores no utilizados
docker system prune -a
```

### 3. Copias de Seguridad
```bash
# Respaldar base de datos Supabase
# (Usar herramientas de Supabase o pg_dump)

# Respaldar archivos de configuración
tar -czf backup-config.tar.gz nginx.conf docker-compose.yml .env
```

## 🚨 Alertas y Notificaciones

### Configurar Alertas
1. **Monitorización de Salud**: Configurar health checks en Dokploy
2. **Alertas de SSL**: Monitorear vencimiento de certificados
3. **Alertas de Rendimiento**: Monitorizar uso de CPU/Memoria
4. **Alertas de Base de Datos**: Monitorizar conexiones y queries lentas

### Comandos de Emergencia
```bash
# Detener todo rápidamente
docker-compose down

# Acceder al contenedor de la app
docker-compose exec app bash

# Verificar estado del sistema
htop
df -h
free -h
```

## 📞 Soporte

### Documentación Adicional
- [Documentación de Dokploy](https://docs.dokploy.com)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)

### Contacto
Para soporte técnico, contacte al equipo de desarrollo con:
- Versión del código desplegado
- Logs relevantes
- Descripción del problema
- Pasos para reproducir

---

**Última Actualización**: $(date +%Y-%m-%d)
**Versión**: 1.0.0
**Autor**: Equipo de DevOps