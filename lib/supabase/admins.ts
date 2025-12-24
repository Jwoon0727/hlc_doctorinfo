"use client"

import { createClient } from "./client"

export type Admin = {
  id: string
  name: string
  password_hash: string
  created_at: string
  updated_at: string
}

// Simple hash function (in production, use bcrypt or similar)
function simpleHash(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use a proper library like bcrypt
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}

export async function registerAdmin(name: string, password: string): Promise<Admin> {
  const supabase = createClient()
  
  // Hash the password
  const passwordHash = simpleHash(password)
  
  const { data, error } = await supabase
    .from("admins")
    .insert({
      name,
      password_hash: passwordHash,
    })
    .select()
    .single()

  if (error) {
    console.error("Error registering admin:", error)
    throw error
  }

  return data
}

export async function verifyAdmin(name: string, password: string): Promise<boolean> {
  const supabase = createClient()
  
  // Hash the password
  const passwordHash = simpleHash(password)
  
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("name", name)
    .eq("password_hash", passwordHash)
    .single()

  if (error || !data) {
    return false
  }

  return true
}

export async function getAdmins(): Promise<Admin[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admins:", error)
    throw error
  }

  return data || []
}

export async function deleteAdmin(adminId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("admins")
    .delete()
    .eq("id", adminId)

  if (error) {
    console.error("Error deleting admin:", error)
    throw error
  }
}

export async function checkAdminExists(name: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("admins")
    .select("id")
    .eq("name", name)
    .single()

  if (error || !data) {
    return false
  }

  return true
}

