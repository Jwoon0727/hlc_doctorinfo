"use client"

import { createClient } from "./client"
import type { Doctor, Hospital, Department } from "@/lib/mock-data"

// Convert Supabase doctor to app Doctor type
function supabaseDoctorToDoctor(supabaseDoctor: any, hospital?: Hospital, department?: Department): Doctor {
  return {
    id: supabaseDoctor.id,
    name: supabaseDoctor.name,
    rating: supabaseDoctor.rating as "A" | "B" | "C" | "D",
    experience_years: supabaseDoctor.experience_years || "",
    hospital_id: supabaseDoctor.hospital_id,
    department_id: supabaseDoctor.department_id,
    email: supabaseDoctor.email || "",
    phone: supabaseDoctor.phone || "",
    notes: supabaseDoctor.notes || "",
  }
}

// Convert app Doctor type to Supabase format
function doctorToSupabase(doctor: Doctor) {
  return {
    name: doctor.name,
    rating: doctor.rating,
    hospital_id: doctor.hospital_id,
    department_id: doctor.department_id || null,
    experience_years: doctor.experience_years,
    email: doctor.email,
    phone: doctor.phone || null,
    notes: doctor.notes || null,
  }
}

// Doctors CRUD
export async function getDoctorsFromSupabase(): Promise<Doctor[]> {
  const supabase = createClient()
  
  // 먼저 doctors만 가져오기 (관계형 쿼리는 나중에 별도로 처리)
  const { data: doctorsData, error: doctorsError } = await supabase
    .from("doctors")
    .select("*")
    .order("created_at", { ascending: false })

  if (doctorsError) {
    console.error("Error fetching doctors:", {
      message: doctorsError.message,
      details: doctorsError.details,
      hint: doctorsError.hint,
      code: doctorsError.code,
    })
    throw doctorsError
  }

  if (!doctorsData || doctorsData.length === 0) {
    return []
  }

  // 병원 및 진료과 ID 수집
  const hospitalIds = [...new Set(doctorsData.map((d: any) => d.hospital_id))]
  const departmentIds = [...new Set(doctorsData.map((d: any) => d.department_id).filter(Boolean))]

  // 병원 정보 일괄 조회
  const { data: hospitalsData } = await supabase
    .from("hospitals")
    .select("*")
    .in("id", hospitalIds)

  // 진료과 정보 일괄 조회 (department_id가 있는 경우만)
  const { data: departmentsData } = departmentIds.length > 0 
    ? await supabase
        .from("departments")
        .select("*")
        .in("id", departmentIds)
    : { data: [] }

  // 병원 및 진료과를 Map으로 변환하여 빠른 조회
  const hospitalsMap = new Map(
    (hospitalsData || []).map((h: any) => [h.id, {
      id: h.id,
      name: h.name,
      address: h.address || "",
      phone: h.phone || "",
    }])
  )

  const departmentsMap = new Map(
    (departmentsData || []).map((d: any) => [d.id, {
      id: d.id,
      name: d.name,
    }])
  )

  // doctors 데이터와 병원/진료과 정보 결합
  return doctorsData.map((doctor: any) => {
    const hospital = hospitalsMap.get(doctor.hospital_id)
    const department = departmentsMap.get(doctor.department_id)
    return supabaseDoctorToDoctor(doctor, hospital, department)
  })
}

export async function addDoctorToSupabase(doctor: Omit<Doctor, "id">): Promise<Doctor> {
  const supabase = createClient()
  
  const doctorData = doctorToSupabase(doctor as Doctor)
  
  const { data, error } = await supabase
    .from("doctors")
    .insert(doctorData)
    .select()
    .single()

  if (error) {
    console.error("Error adding doctor:", error)
    throw error
  }

  // Fetch related data
  const { data: hospital } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", data.hospital_id)
    .single()

  const { data: department } = data.department_id
    ? await supabase
        .from("departments")
        .select("*")
        .eq("id", data.department_id)
        .single()
    : { data: null }

  return supabaseDoctorToDoctor(data, hospital, department)
}

export async function updateDoctorInSupabase(doctorId: string, updatedDoctor: Doctor): Promise<Doctor> {
  const supabase = createClient()
  
  const doctorData = doctorToSupabase(updatedDoctor)
  
  const { data, error } = await supabase
    .from("doctors")
    .update(doctorData)
    .eq("id", doctorId)
    .select()
    .single()

  if (error) {
    console.error("Error updating doctor:", error)
    throw error
  }

  // Fetch related data
  const { data: hospital } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", data.hospital_id)
    .single()

  const { data: department } = data.department_id
    ? await supabase
        .from("departments")
        .select("*")
        .eq("id", data.department_id)
        .single()
    : { data: null }

  return supabaseDoctorToDoctor(data, hospital, department)
}

export async function deleteDoctorFromSupabase(doctorId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("doctors")
    .delete()
    .eq("id", doctorId)

  if (error) {
    console.error("Error deleting doctor:", error)
    throw error
  }
}

// Hospitals CRUD
export async function getHospitalsFromSupabase(): Promise<Hospital[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching hospitals:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw error
  }

  return (data || []).map((hospital: any) => ({
    id: hospital.id,
    name: hospital.name,
    address: hospital.address || "",
    phone: hospital.phone || "",
  }))
}

export async function addHospitalToSupabase(hospital: Omit<Hospital, "id">): Promise<Hospital> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("hospitals")
    .insert({
      name: hospital.name,
      address: hospital.address,
      phone: hospital.phone,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding hospital:", error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    address: data.address || "",
    phone: data.phone || "",
  }
}

export async function deleteHospitalFromSupabase(hospitalId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("hospitals")
    .delete()
    .eq("id", hospitalId)

  if (error) {
    console.error("Error deleting hospital:", error)
    throw error
  }
}

// Departments CRUD
export async function getDepartmentsFromSupabase(): Promise<Department[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching departments:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw error
  }

  return (data || []).map((department: any) => ({
    id: department.id,
    name: department.name,
  }))
}

export async function addDepartmentToSupabase(department: Omit<Department, "id">): Promise<Department> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("departments")
    .insert({
      name: department.name,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding department:", error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
  }
}

export async function deleteDepartmentFromSupabase(departmentId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("id", departmentId)

  if (error) {
    console.error("Error deleting department:", error)
    throw error
  }
}

