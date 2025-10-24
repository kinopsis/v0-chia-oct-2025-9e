#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Leer credenciales del .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let supabaseUrl = null;
let supabaseKey = null;

for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].replace(/"/g, '');
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseKey = line.split('=')[1].replace(/"/g, '');
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ No se encontraron credenciales de Supabase');
  process.exit(1);
}

console.log('🚀 Creando usuario administrador en Supabase...');

// Crear cliente con clave de servicio para operaciones de administración
const supabase = createClient(supabaseUrl, supabaseKey);

async function crearUsuarioAdmin() {
  try {
    // Crear usuario en Supabase Auth
    console.log('📧 Creando usuario: soporte@torrecentral.com');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'soporte@torrecentral.com',
      password: 'chibcha123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Usuario Administrador',
        role: 'admin'
      }
    });

    if (error) {
      console.log('❌ Error creando usuario:', error.message);
      
      // Si el usuario ya existe, intentar actualizar
      if (error.code === 'user_already_exists') {
        console.log('⚠️  Usuario ya existe, intentando actualizar perfil...');
        return actualizarPerfilAdmin();
      }
      return false;
    }

    console.log('✅ Usuario creado exitosamente:', data.user.id);
    
    // Actualizar el perfil existente con el ID del usuario
    return await actualizarPerfilConUserId(data.user.id);
    
  } catch (error) {
    console.log('❌ Error creando usuario:', error.message);
    
    // Intentar actualizar perfil existente
    console.log('⚠️  Intentando actualizar perfil existente...');
    return await actualizarPerfilAdmin();
  }
}

async function actualizarPerfilConUserId(userId) {
  try {
    console.log('🔄 Actualizando perfil con ID de usuario...');
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        id: userId,
        email: 'soporte@torrecentral.com',
        full_name: 'Usuario Administrador',
        role: 'admin',
        dependencia: 'Tecnología',
        subdependencia: 'Desarrollo',
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'soporte@torrecentral.com');

    if (error) {
      console.log('❌ Error actualizando perfil:', error.message);
      return false;
    }

    console.log('✅ Perfil actualizado exitosamente');
    return true;
  } catch (error) {
    console.log('❌ Error actualizando perfil:', error.message);
    return false;
  }
}

async function actualizarPerfilAdmin() {
  try {
    console.log('🔄 Buscando perfil existente...');
    
    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'soporte@torrecentral.com')
      .single();

    if (perfilError || !perfil) {
      console.log('❌ No se encontró perfil existente');
      return false;
    }

    console.log('✅ Perfil encontrado, verificando usuario...');
    
    // Verificar si el usuario existe en auth
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', 'soporte@torrecentral.com')
      .single();

    if (authError || !authUser) {
      console.log('⚠️  Usuario no existe en auth, necesita crearse manualmente en Supabase Dashboard');
      return false;
    }

    // Actualizar perfil con ID correcto
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        id: authUser.id,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'soporte@torrecentral.com');

    if (error) {
      console.log('❌ Error actualizando perfil:', error.message);
      return false;
    }

    console.log('✅ Perfil asociado correctamente con usuario de auth');
    return true;
  } catch (error) {
    console.log('❌ Error en actualización de perfil:', error.message);
    return false;
  }
}

async function restaurarRestriccion() {
  try {
    console.log('🔒 Intentando restaurar restricción de clave foránea...');
    
    // Verificar que todos los perfiles tengan usuarios correspondientes
    const { data: perfiles, error: perfilesError } = await supabase
      .from('profiles')
      .select('id, email');

    if (perfilesError) {
      console.log('❌ Error obteniendo perfiles:', perfilesError.message);
      return false;
    }

    for (const perfil of perfiles) {
      const { data: authUser, error: authError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('id', perfil.id)
        .single();

      if (authError || !authUser) {
        console.log(`⚠️  Perfil ${perfil.email} no tiene usuario correspondiente en auth`);
        console.log('   Restricción no puede ser restaurada hasta que todos los perfiles tengan usuarios válidos');
        return false;
      }
    }

    console.log('✅ Todos los perfiles tienen usuarios correspondientes');
    console.log('🔒 Restricción de clave foránea puede ser restaurada manualmente en Supabase SQL Editor');
    return true;
    
  } catch (error) {
    console.log('❌ Error verificando restricción:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n📋 Proceso de creación de usuario administrador:\n');
  
  const exito = await crearUsuarioAdmin();
  
  if (exito) {
    console.log('\n🎉 ¡Usuario administrador creado exitosamente!');
    console.log('📧 Email: soporte@torrecentral.com');
    console.log('🔐 Contraseña: chibcha123');
    console.log('👤 Rol: admin');
    console.log('🏢 Dependencia: Tecnología');
    
    await restaurarRestriccion();
    
    console.log('\n✅ Acceso al panel de administración:');
    console.log('   1. Accede a: http://localhost:9000/admin');
    console.log('   2. Inicia sesión con: soporte@torrecentral.com / chibcha123');
    console.log('   3. Gestiona trámites, usuarios y configuración n8n');
    
  } else {
    console.log('\n⚠️  No se pudo crear el usuario automáticamente.');
    console.log('   Necesitas crear el usuario manualmente en el Supabase Dashboard:');
    console.log('   1. Ve a tu proyecto de Supabase');
    console.log('   2. Navega a Authentication > Users');
    console.log('   3. Crea usuario: soporte@torrecentral.com con contraseña chibcha123');
    console.log('   4. El perfil ya está configurado y se asociará automáticamente');
  }
}

main().catch(console.error);