import { createClient } from "./server"
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

// Server-side data fetching functions for API routes
export async function getDoctorsServer(): Promise<Doctor[]> {
  const supabase = await createClient()
  
  // First fetch doctors
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

  // Collect hospital and department IDs
  const hospitalIds = [...new Set(doctorsData.map((d: any) => d.hospital_id))]
  const departmentIds = [...new Set(doctorsData.map((d: any) => d.department_id).filter(Boolean))]

  // Fetch hospitals in bulk
  const { data: hospitalsData } = await supabase
    .from("hospitals")
    .select("*")
    .in("id", hospitalIds)

  // Fetch departments in bulk (only if department_id exists)
  const { data: departmentsData } = departmentIds.length > 0 
    ? await supabase
        .from("departments")
        .select("*")
        .in("id", departmentIds)
    : { data: [] }

  // Convert to Maps for quick lookup
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

  // Combine doctors data with hospital/department info
  return doctorsData.map((doctor: any) => {
    const hospital = hospitalsMap.get(doctor.hospital_id)
    const department = departmentsMap.get(doctor.department_id)
    return supabaseDoctorToDoctor(doctor, hospital, department)
  })
}

export async function getHospitalsServer(): Promise<Hospital[]> {
  const supabase = await createClient()
  
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

export async function getDepartmentsServer(): Promise<Department[]> {
  const supabase = await createClient()
  
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

