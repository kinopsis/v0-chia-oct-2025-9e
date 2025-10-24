#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🚀 Configurando administrador sin usuario de auth...\n');

// Leer credenciales del .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let supabaseUrl = null;
let supabaseServiceKey = null;

for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].replace(/"/g, '');
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseServiceKey = line.split('=')[1].replace(/"/g, '');
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ No se encontraron credenciales de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function configurarAdminBypass() {
  try {
    console.log('🔧 Configurando perfil de administrador para funcionar sin auth.user...\n');
    
    // 1. Verificar que el perfil exista
    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'soporte@torrecentral.com')
      .single();

    if (perfilError) {
      console.log('❌ No se encontró el perfil de administrador');
      return false;
    }

    console.log('✅ Perfil de administrador encontrado:');
    console.log('   Email:', perfil.email);
    console.log('   Nombre:', perfil.full_name || 'No especificado');
    console.log('   Rol:', perfil.role);
    console.log('   Dependencia:', perfil.department);

    // 2. Crear un UUID fijo para el administrador
    const adminUUID = '12345678-1234-1234-1234-123456789abc';
    
    // 3. Actualizar el perfil con el UUID fijo
    const { data: perfilActualizado, error: updateError } = await supabase
      .from('profiles')
      .update({
        id: adminUUID,
        is_active: true,
        role: 'admin',
        dependencia: 'Tecnología',
        subdependencia: 'Desarrollo',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'soporte@torrecentral.com')
      .select();

    if (updateError) {
      console.log('❌ Error actualizando perfil:', updateError.message);
      return false;
    }

    console.log('\n✅ Perfil de administrador configurado con UUID fijo');
    console.log('   UUID:', adminUUID);
    console.log('   Estado: Activo');
    console.log('   Rol: Admin');

    // 4. Verificar que no haya conflictos con auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', 'soporte@torrecentral.com')
      .single();

    if (authUser) {
      console.log('\n⚠️  Advertencia: Ya existe un usuario en auth.users con este email');
      console.log('   Esto podría causar conflictos de integridad referencial');
    } else {
      console.log('\n✅ No hay conflictos con auth.users');
    }

    console.log('\n📋 Instrucciones para usar este administrador:');
    console.log('1. En tu código, puedes usar este UUID fijo para autenticación');
    console.log('2. Crea una función de login que simule la autenticación');
    console.log('3. Usa el UUID: 12345678-1234-1234-1234-123456789abc');
    console.log('4. Email: soporte@torrecentral.com');
    console.log('5. Contraseña: chibcha123');

    console.log('\n💡 Código de ejemplo para login simulado:');
    console.log(`
// En tu función de login
const adminUUID = '12345678-1234-1234-1234-123456789abc';
const adminEmail = 'soporte@torrecentral.com';

// Simular autenticación
const { data: { session }, error } = await supabase.auth.signInWithPassword({
  email: adminEmail,
  password: 'chibcha123'
});

// Si falla (porque no hay usuario en auth), usa el UUID directamente
if (error) {
  // Usa el UUID fijo para operaciones que requieran user_id
  const userId = adminUUID;
  // Realiza operaciones con este userId
}
`);

    return true;

  } catch (error) {
    console.log('❌ Error configurando administrador:', error.message);
    return false;
  }
}

configurarAdminBypass().then(success => {
  if (success) {
    console.log('\n🎉 Configuración de administrador completada exitosamente!');
    console.log('El portal está listo para funcionar con autenticación simulada.');
  } else {
    console.log('\n❌ Error en la configuración del administrador.');
  }
});