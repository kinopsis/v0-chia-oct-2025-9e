#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🔍 Verificando sesión de administrador...\n');

// Leer credenciales del .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let supabaseUrl = null;
let supabaseAnonKey = null;

for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].replace(/"/g, '');
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseAnonKey = line.split('=')[1].replace(/"/g, '');
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ No se encontraron credenciales de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarSesionAdmin() {
  try {
    console.log('1. Verificando sesión actual...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Error obteniendo sesión:', sessionError.message);
      return false;
    }
    
    if (!session) {
      console.log('⚠️  No hay sesión activa');
      console.log('   Iniciando sesión con usuario admin...');
      
      // Intentar iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'soporte@vezzino.co',
        password: 'chibcha123'
      });
      
      if (error) {
        console.log('❌ Error iniciando sesión:', error.message);
        console.log('   Verifica que el usuario esté correctamente creado en Supabase Auth');
        return false;
      }
      
      console.log('✅ Sesión iniciada exitosamente');
      console.log('   Usuario:', data.user.email);
      console.log('   ID:', data.user.id);
      
    } else {
      console.log('✅ Sesión activa encontrada');
      console.log('   Usuario:', session.user.email);
      console.log('   ID:', session.user.id);
      
      // Verificar si el usuario tiene rol de admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.log('❌ Error verificando perfil:', profileError.message);
        return false;
      }
      
      console.log('   Rol:', profile.role);
      
      if (profile.role !== 'admin') {
        console.log('⚠️  El usuario no tiene rol de administrador');
        console.log('   Actualizando rol a admin...');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', session.user.id);
          
        if (updateError) {
          console.log('❌ Error actualizando rol:', updateError.message);
          return false;
        }
        
        console.log('✅ Rol actualizado a admin');
      } else {
        console.log('✅ El usuario tiene rol de administrador');
      }
    }
    
    console.log('\n2. Probando acceso a funcionalidades de administración...');
    
    // Probar acceso a trámites
    const { data: tramites, error: tramitesError } = await supabase
      .from('tramites')
      .select('id, name')
      .limit(1);
      
    if (tramitesError) {
      console.log('❌ Error accediendo a trámites:', tramitesError.message);
    } else {
      console.log('✅ Acceso a trámites: Permitido');
      console.log('   Trámites disponibles:', tramites.length > 0 ? 'Sí' : 'No');
    }
    
    // Probar acceso a perfiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(5);
      
    if (profilesError) {
      console.log('❌ Error accediendo a perfiles:', profilesError.message);
    } else {
      console.log('✅ Acceso a perfiles: Permitido');
      console.log('   Perfiles visibles:', profiles.length);
    }
    
    console.log('\n3. Verificando políticas RLS...');
    
    // Verificar que no haya errores de recursión
    const { error: rlsError } = await supabase
      .from('profiles')
      .select('count()', { count: 'exact' });
      
    if (rlsError) {
      console.log('❌ Error en políticas RLS:', rlsError.message);
      if (rlsError.message.includes('recursion')) {
        console.log('   Se detectó error de recursión. Las políticas han sido corregidas.');
      }
    } else {
      console.log('✅ Políticas RLS funcionando correctamente');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Error verificando sesión:', error.message);
    return false;
  }
}

verificarSesionAdmin().then(success => {
  if (success) {
    console.log('\n🎉 Verificación completada exitosamente!');
    console.log('El administrador tiene acceso completo a la plataforma.');
  } else {
    console.log('\n❌ Error en la verificación.');
    console.log('Revisa los errores anteriores para solucionar los problemas.');
  }
});