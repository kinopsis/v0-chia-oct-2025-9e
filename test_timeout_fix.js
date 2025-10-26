#!/usr/bin/env node

/**
 * Script de prueba para verificar la solución del problema de timeout en el webhook de n8n
 * 
 * Este script prueba:
 * 1. La configuración de timeout en la base de datos
 * 2. El manejo de errores en los endpoints
 * 3. La respuesta del chat widget
 */

import { createClient } from './lib/supabase/server.js'

console.log('🔍 Iniciando pruebas de solución de timeout...\n')

// Prueba 1: Verificar configuración de timeout en la base de datos
async function testDatabaseConfig() {
    console.log('📋 Prueba 1: Verificando configuración de timeout en la base de datos')
    
    try {
        const supabase = createClient()
        const { data: config, error } = await supabase
            .from('n8n_config')
            .select('timeout_seconds, max_retries, is_active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            console.log('❌ Error al consultar la base de datos:', error.message)
            return false
        }

        console.log(`   ✅ Timeout configurado: ${config.timeout_seconds} segundos`)
        console.log(`   ✅ Reintentos máximos: ${config.max_retries}`)
        console.log(`   ✅ Integración activa: ${config.is_active}`)
        
        if (config.timeout_seconds >= 60) {
            console.log('   ✅ El timeout ha sido aumentado correctamente a 60s o más')
            return true
        } else {
            console.log('   ❌ El timeout sigue siendo menor a 60s')
            return false
        }
    } catch (error) {
        console.log('❌ Error en la prueba de base de datos:', error.message)
        return false
    }
}

// Prueba 2: Verificar manejo de errores en endpoints
function testEndpointTimeoutHandling() {
    console.log('\n📋 Prueba 2: Verificando manejo de timeouts en endpoints')
    
    // Verificar que los endpoints tengan el límite correcto
    const fs = require('fs')
    const path = require('path')
    
    try {
        // Verificar send-enhanced/route.ts
        const enhancedRoute = fs.readFileSync('./app/api/chat/send-enhanced/route.ts', 'utf8')
        if (enhancedRoute.includes('60000') && enhancedRoute.includes('Max 60s')) {
            console.log('   ✅ send-enhanced/route.ts: Límite de timeout actualizado a 60s')
        } else {
            console.log('   ❌ send-enhanced/route.ts: Límite de timeout no actualizado')
            return false
        }
        
        // Verificar send/route.ts
        const basicRoute = fs.readFileSync('./app/api/chat/send/route.ts', 'utf8')
        if (basicRoute.includes('60000') && basicRoute.includes('Max 60s')) {
            console.log('   ✅ send/route.ts: Límite de timeout actualizado a 60s')
        } else {
            console.log('   ❌ send/route.ts: Límite de timeout no actualizado')
            return false
        }
        
        return true
    } catch (error) {
        console.log('❌ Error al verificar endpoints:', error.message)
        return false
    }
}

// Prueba 3: Verificar formulario de administración
function testAdminForm() {
    console.log('\n📋 Prueba 3: Verificando formulario de administración')
    
    try {
        const fs = require('fs')
        const adminForm = fs.readFileSync('./components/admin/n8n-config-form.tsx', 'utf8')
        
        if (adminForm.includes('max="60"') && adminForm.includes('5-60 segundos')) {
            console.log('   ✅ Formulario de administración: Límite de timeout actualizado a 60s')
            return true
        } else {
            console.log('   ❌ Formulario de administración: Límite de timeout no actualizado')
            return false
        }
    } catch (error) {
        console.log('❌ Error al verificar formulario de administración:', error.message)
        return false
    }
}

// Prueba 4: Verificar manejo de errores en chat widget
function testChatWidgetErrorHandling() {
    console.log('\n📋 Prueba 4: Verificando manejo de errores en chat widget')
    
    try {
        const fs = require('fs')
        const chatWidget = fs.readFileSync('./components/chat-widget.tsx', 'utf8')
        
        if (chatWidget.includes('AbortError') && 
            chatWidget.includes('timeout') && 
            chatWidget.includes('Tiempo de espera agotado')) {
            console.log('   ✅ Chat widget: Manejo de errores de timeout mejorado')
            return true
        } else {
            console.log('   ❌ Chat widget: Manejo de errores de timeout no mejorado')
            return false
        }
    } catch (error) {
        console.log('❌ Error al verificar chat widget:', error.message)
        return false
    }
}

// Función principal de pruebas
async function runTests() {
    console.log('🚀 Iniciando suite de pruebas...\n')
    
    const tests = [
        await testDatabaseConfig(),
        testEndpointTimeoutHandling(),
        testAdminForm(),
        testChatWidgetErrorHandling()
    ]
    
    const passedTests = tests.filter(Boolean).length
    const totalTests = tests.length
    
    console.log(`\n📊 Resultados de las pruebas: ${passedTests}/${totalTests} pruebas pasadas`)
    
    if (passedTests === totalTests) {
        console.log('\n🎉 ¡Todas las pruebas han pasado! La solución ha sido implementada correctamente.')
        console.log('\n📋 Resumen de cambios realizados:')
        console.log('   • Timeout aumentado de 30s a 60s en la base de datos')
        console.log('   • Límite máximo de timeout actualizado a 60s en endpoints')
        console.log('   • Formulario de administración actualizado para permitir hasta 60s')
        console.log('   • Manejo de errores de timeout mejorado en chat widget')
        console.log('\n💡 El problema de "This operation was aborted" debería estar resuelto.')
        console.log('   Si el webhook de n8n tarda más de 60 segundos, se mostrará un mensaje de error más claro.')
    } else {
        console.log('\n⚠️  Algunas pruebas fallaron. Revise los errores anteriores.')
    }
    
    return passedTests === totalTests
}

// Ejecutar pruebas
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().then(success => {
        process.exit(success ? 0 : 1)
    }).catch(error => {
        console.error('❌ Error al ejecutar pruebas:', error)
        process.exit(1)
    })
}

export { runTests, testDatabaseConfig, testEndpointTimeoutHandling, testAdminForm, testChatWidgetErrorHandling }