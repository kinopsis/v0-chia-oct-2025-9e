"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return {
    ...user,
    profile,
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.profile?.role !== "admin") {
    redirect("/admin")
  }
  return user
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

/**
 * Valida que una contraseña cumpla con los requisitos de seguridad
 * Basado en OWASP Authentication Cheat Sheet
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Longitud mínima de 12 caracteres (OWASP recommendation)
  if (password.length < 12) {
    errors.push("La contraseña debe tener al menos 12 caracteres")
  }
  
  // Debe incluir mayúsculas
  if (!/[A-Z]/.test(password)) {
    errors.push("Debe incluir al menos una letra mayúscula")
  }
  
  // Debe incluir minúsculas
  if (!/[a-z]/.test(password)) {
    errors.push("Debe incluir al menos una letra minúscula")
  }
  
  // Debe incluir números
  if (!/[0-9]/.test(password)) {
    errors.push("Debe incluir al menos un número")
  }
  
  // Debe incluir caracteres especiales
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password)) {
    errors.push("Debe incluir al menos un carácter especial (!@#$%^&*...)")
  }
  
  // Verificar contraseñas comunes (top 50 más usadas)
  const commonPasswords = [
    'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
    'admin123', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
    'login', 'passw0rd', 'shadow', 'sunshine', 'princess', 'football',
    'iloveyou', 'trustno1', 'superman', 'batman', 'starwars', 'hello',
    'charlie', 'donald', 'hunter', 'thomas', 'robert', 'soccer',
    'rachel', 'ginger', 'flower', 'cheese', 'sunflower', 'colombia',
    'chia123', 'alcalde', 'municipio'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Contraseña demasiado común. Por favor elija una más segura")
  }
  
  // Verificar patrones secuenciales
  if (/^(.)\1{7,}$/.test(password)) {
    errors.push("La contraseña no puede tener caracteres repetidos")
  }
  
  if (/1234|abcd|qwerty|asdf|zxcv/i.test(password)) {
    errors.push("La contraseña contiene patrones secuenciales muy comunes")
  }
  
  return { 
    valid: errors.length === 0, 
    errors 
  }
}
