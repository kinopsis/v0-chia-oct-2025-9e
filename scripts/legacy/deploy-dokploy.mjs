#!/usr/bin/env node

/**
 * Script de despliegue para Dokploy
 * Optimizado para trámites-app
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DokployDeployer {
  constructor() {
    this.projectDir = process.cwd();
    this.config = {
      appName: process.env.DOKPLOY_APP_NAME || 'tramites-app',
      projectName: process.env.DOKPLOY_PROJECT_NAME || 'tramites-platform',
      port: process.env.PORT || 3000,
      environment: process.env.NODE_ENV || 'production',
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async checkPrerequisites() {
    this.log('Verificando requisitos previos...', 'info');
    
    // Verificar Docker
    try {
      execSync('docker --version', { stdio: 'pipe' });
      this.log('✓ Docker disponible', 'success');
    } catch {
      throw new Error('Docker no está instalado o no está en el PATH');
    }

    // Verificar Docker Compose
    try {
      execSync('docker-compose --version', { stdio: 'pipe' });
      this.log('✓ Docker Compose disponible', 'success');
    } catch {
      throw new Error('Docker Compose no está instalado o no está en el PATH');
    }

    // Verificar variables de entorno
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
    }

    this.log('✓ Requisitos previos verificados', 'success');
  }

  async buildApplication() {
    this.log('Construyendo la aplicación...', 'info');
    
    try {
      // Instalar dependencias
      this.log('Instalando dependencias...', 'info');
      execSync('npm install -g pnpm && pnpm install', { 
        stdio: 'inherit',
        cwd: this.projectDir
      });
      
      // Construir aplicación
      this.log('Construyendo aplicación Next.js...', 'info');
      execSync('pnpm run build', { 
        stdio: 'inherit',
        cwd: this.projectDir
      });
      
      this.log('✓ Aplicación construida exitosamente', 'success');
    } catch (error) {
      throw new Error(`Error al construir la aplicación: ${error.message}`);
    }
  }

  async createSSLConfig() {
    this.log('Configurando SSL...', 'info');
    
    const sslDir = path.join(this.projectDir, 'ssl');
    
    // Crear directorio SSL si no existe
    if (!fs.existsSync(sslDir)) {
      fs.mkdirSync(sslDir, { recursive: true });
    }

    // Generar certificado auto-firmado para desarrollo
    // En producción, estos archivos deberían ser reemplazados por certificados reales
    const certPath = path.join(sslDir, 'cert.pem');
    const keyPath = path.join(sslDir, 'key.pem');
    
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      this.log('Generando certificado SSL auto-firmado...', 'warning');
      try {
        execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/C=CO/ST=Antioquia/L=Medellin/O=TramitesApp/CN=localhost"`, 
          { stdio: 'inherit' });
        this.log('✓ Certificado SSL generado', 'success');
      } catch (error) {
        this.log('⚠ No se pudo generar SSL automáticamente. Asegúrese de colocar sus certificados en la carpeta ssl/', 'warning');
      }
    } else {
      this.log('✓ Certificados SSL existentes encontrados', 'success');
    }
  }

  async createDokployConfig() {
    this.log('Creando configuración para Dokploy...', 'info');
    
    const dokployConfig = {
      version: '1.0.0',
      name: this.config.appName,
      project: this.config.projectName,
      services: {
        app: {
          image: `${this.config.appName}:latest`,
          ports: [`${this.config.port}:3000`],
          environment: [
            'NODE_ENV=production',
            'NEXT_TELEMETRY_DISABLED=1',
            ...Object.keys(process.env)
              .filter(key => key.startsWith('NEXT_PUBLIC_') || 
                             key.startsWith('SUPABASE_') ||
                             key === 'NODE_ENV')
              .map(key => `${key}=${process.env[key]}`)
          ],
          restart: 'unless-stopped',
          healthcheck: {
            test: ['CMD', 'curl', '-f', 'http://localhost:3000'],
            interval: '30s',
            timeout: '10s',
            retries: 3,
            start_period: '40s'
          }
        },
        nginx: {
          image: 'nginx:alpine',
          ports: ['80:80', '443:443'],
          volumes: [
            './nginx.conf:/etc/nginx/nginx.conf:ro',
            './ssl:/etc/nginx/ssl:ro'
          ],
          depends_on: ['app'],
          restart: 'unless-stopped'
        }
      },
      networks: {
        app-network: {
          driver: 'bridge'
        }
      }
    };

    const configPath = path.join(this.projectDir, 'dokploy.config.json');
    fs.writeFileSync(configPath, JSON.stringify(dokployConfig, null, 2));
    
    this.log('✓ Configuración de Dokploy creada', 'success');
  }

  async startServices() {
    this.log('Iniciando servicios...', 'info');
    
    try {
      // Construir imágenes
      execSync('docker-compose build', { 
        stdio: 'inherit',
        cwd: this.projectDir
      });
      
      // Iniciar servicios
      execSync('docker-compose up -d', { 
        stdio: 'inherit',
        cwd: this.projectDir
      });
      
      this.log('✓ Servicios iniciados exitosamente', 'success');
    } catch (error) {
      throw new Error(`Error al iniciar servicios: ${error.message}`);
    }
  }

  async verifyDeployment() {
    this.log('Verificando despliegue...', 'info');
    
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        execSync('curl -f http://localhost:3000', { stdio: 'pipe' });
        this.log('✓ Aplicación accesible', 'success');
        return true;
      } catch {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('La aplicación no está respondiendo después de 60 segundos');
  }

  async showDeploymentInfo() {
    this.log('\n=== Información del Despliegue ===', 'success');
    this.log(`Nombre de la aplicación: ${this.config.appName}`, 'info');
    this.log(`Nombre del proyecto: ${this.config.projectName}`, 'info');
    this.log(`URL de la aplicación: https://localhost`, 'info');
    this.log(`Puerto: ${this.config.port}`, 'info');
    this.log(`Entorno: ${this.config.environment}`, 'info');
    
    console.log('\nComandos útiles:');
    console.log('  docker-compose logs -f app      # Ver logs de la aplicación');
    console.log('  docker-compose logs -f nginx    # Ver logs de Nginx');
    console.log('  docker-compose down             # Detener servicios');
    console.log('  docker-compose up -d            # Iniciar servicios');
  }

  async deploy() {
    try {
      this.log('🚀 Iniciando despliegue en Dokploy...', 'info');
      
      await this.checkPrerequisites();
      await this.buildApplication();
      await this.createSSLConfig();
      await this.createDokployConfig();
      await this.startServices();
      await this.verifyDeployment();
      
      this.log('\n🎉 Despliegue completado exitosamente!', 'success');
      await this.showDeploymentInfo();
      
    } catch (error) {
      this.log(`❌ Error durante el despliegue: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Ejecutar despliegue
if (require.main === module) {
  const deployer = new DokployDeployer();
  deployer.deploy();
}

module.exports = DokployDeployer;