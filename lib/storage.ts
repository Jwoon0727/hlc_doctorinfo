// Local storage helper for managing doctors, hospitals, and departments data
import {
  type Doctor,
  type Hospital,
  type Department,
  doctors as initialDoctors,
  hospitals as initialHospitals,
  departments as initialDepartments,
  getHospitalById,
  getDepartmentById,
} from "./mock-data"

const STORAGE_KEY = "doctors_data"
const HOSPITALS_STORAGE_KEY = "hospitals_data"
const DEPARTMENTS_STORAGE_KEY = "departments_data"
const STORAGE_CHANGE_EVENT = "doctors_storage_changed"

export type { Doctor, Hospital, Department }
export { getHospitalById, getDepartmentById }

export function getDoctors(): Doctor[] {
  if (typeof window === "undefined") return initialDoctors

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return initialDoctors
    }
  }
  return initialDoctors
}

export { getDoctors as getDoctorsFromStorage }

export function getHospitals(): Hospital[] {
  if (typeof window === "undefined") return initialHospitals

  const stored = localStorage.getItem(HOSPITALS_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return initialHospitals
    }
  }
  return initialHospitals
}

export function getDepartments(): Department[] {
  if (typeof window === "undefined") return initialDepartments

  const stored = localStorage.getItem(DEPARTMENTS_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return initialDepartments
    }
  }
  return initialDepartments
}

function saveDoctorsToStorage(doctors: Doctor[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doctors))
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT))
  window.dispatchEvent(new CustomEvent("doctors_data_change"))
}

export function addDoctorToStorage(doctor: Doctor) {
  const doctors = getDoctors()
  doctors.push(doctor)
  saveDoctorsToStorage(doctors)
}

export function updateDoctorInStorage(doctorId: string, updatedDoctor: Doctor) {
  const doctors = getDoctors()
  const index = doctors.findIndex((d) => d.id === doctorId)
  if (index !== -1) {
    doctors[index] = updatedDoctor
    saveDoctorsToStorage(doctors)
  }
}

export function deleteDoctorFromStorage(doctorId: string) {
  const doctors = getDoctors()
  const filtered = doctors.filter((d) => d.id !== doctorId)
  saveDoctorsToStorage(filtered)
}

function saveHospitalsToStorage(hospitals: Hospital[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hospitals))
  window.dispatchEvent(new CustomEvent("hospitals_data_change"))
}

export function addHospitalToStorage(hospital: Hospital) {
  const hospitals = getHospitals()
  hospitals.push(hospital)
  saveHospitalsToStorage(hospitals)
}

export function deleteHospitalFromStorage(hospitalId: string) {
  const hospitals = getHospitals()
  const filtered = hospitals.filter((h) => h.id !== hospitalId)
  saveHospitalsToStorage(filtered)
}

function saveDepartmentsToStorage(departments: Department[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments))
  window.dispatchEvent(new CustomEvent("departments_data_change"))
}

export function addDepartmentToStorage(department: Department) {
  const departments = getDepartments()
  departments.push(department)
  saveDepartmentsToStorage(departments)
}

export function deleteDepartmentFromStorage(departmentId: string) {
  const departments = getDepartments()
  const filtered = departments.filter((d) => d.id !== departmentId)
  saveDepartmentsToStorage(filtered)
}

export { STORAGE_CHANGE_EVENT }
