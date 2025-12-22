"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus, LogOut, Trash2, Building2, Stethoscope, Edit, Loader2, Search, X } from "lucide-react"
import Link from "next/link"
import { isAdminAuthenticated, setAdminAuthentication } from "@/lib/auth"
import {
  addDoctorToSupabase,
  getDoctorsFromSupabase,
  updateDoctorInSupabase,
  deleteDoctorFromSupabase,
  getHospitalsFromSupabase,
  getDepartmentsFromSupabase,
  addHospitalToSupabase,
  deleteHospitalFromSupabase,
  addDepartmentToSupabase,
  deleteDepartmentFromSupabase,
} from "@/lib/supabase/doctors"
import type { Doctor, Hospital, Department } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function AddDoctorPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAddingHospital, setIsAddingHospital] = useState(false)
  const [isDeletingHospital, setIsDeletingHospital] = useState<string | null>(null)
  const [isAddingDepartment, setIsAddingDepartment] = useState(false)
  const [isDeletingDepartment, setIsDeletingDepartment] = useState<string | null>(null)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null)

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingDoctors, setExistingDoctors] = useState<Doctor[]>([])
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [hospitalsList, setHospitalsList] = useState<Hospital[]>([])
  const [departmentsList, setDepartmentsList] = useState<Department[]>([])
  const [newHospital, setNewHospital] = useState({ name: "", address: "", phone: "" })
  const [newDepartment, setNewDepartment] = useState({ name: "" })

  // Pagination states
  const [doctorsPage, setDoctorsPage] = useState(1)
  const [hospitalsPage, setHospitalsPage] = useState(1)
  const [departmentsPage, setDepartmentsPage] = useState(1)
  const itemsPerPage = 5

  // Search states
  const [doctorsSearch, setDoctorsSearch] = useState("")
  const [hospitalsSearch, setHospitalsSearch] = useState("")
  const [departmentsSearch, setDepartmentsSearch] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    rating: "B" as "A" | "B" | "C" | "D",
    experience_years: "",
    hospital_id: "",
    department_id: "",
    email: "",
    phone: "", // Added phone field to form state
    notes: "",
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    rating: "B" as "A" | "B" | "C" | "D",
    experience_years: "",
    hospital_id: "",
    department_id: "",
    email: "",
    phone: "", // Added phone field to edit form state
    notes: "",
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    const checkAuth = () => {
      const authenticated = isAdminAuthenticated()
      setIsAuthenticated(authenticated)
      setIsCheckingAuth(false)
      
      if (!authenticated) {
        router.replace("/admin/login")
      } else {
        loadDoctors()
        loadHospitalsAndDepartments()
      }
    }
    
    checkAuth()
  }, [router, isMounted])

  const loadDoctors = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const doctors = await getDoctorsFromSupabase()
      setExistingDoctors(doctors)
    } catch (err) {
      console.error("Failed to load doctors:", err)
      setError("의사 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadHospitalsAndDepartments = async () => {
    try {
      setError(null)
      const [hospitals, departments] = await Promise.all([
        getHospitalsFromSupabase(),
        getDepartmentsFromSupabase(),
      ])
      setHospitalsList(hospitals)
      setDepartmentsList(departments)
    } catch (err) {
      console.error("Failed to load hospitals/departments:", err)
      setError("병원/진료과 목록을 불러오는데 실패했습니다.")
    }
  }

  // Removed event listeners as we're using Supabase now

  const handleLogout = () => {
    setAdminAuthentication(false)
    router.push("/admin/login")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const newDoctor = {
        name: formData.name,
        rating: formData.rating,
        experience_years: formData.experience_years, // 전문과목 (텍스트)
        hospital_id: formData.hospital_id,
        department_id: formData.department_id && formData.department_id !== "none" ? formData.department_id : null,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
      }

      await addDoctorToSupabase(newDoctor)
      
      // Refresh cache to reflect changes on main page
      await fetch('/api/doctors', { method: 'POST' })
      
      setSuccess(true)
      await loadDoctors()

      setFormData({
        name: "",
        rating: "B",
        experience_years: "",
        hospital_id: "",
        department_id: "",
        email: "",
        phone: "",
        notes: "",
      })

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to add doctor:", err)
      setError("의사 추가에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Helper functions to get names from IDs, used in the doctor list display
  const getHospitalName = (hospitalId: string) => {
    return hospitalsList.find((h) => h.id === hospitalId)?.name || "알 수 없음"
  }

  const getDepartmentName = (departmentId: string) => {
    return departmentsList.find((d) => d.id === departmentId)?.name || "알 수 없음"
  }

  // Helper to get full hospital object by ID
  const getHospitalById = (hospitalId: string) => {
    return hospitalsList.find((h) => h.id === hospitalId)
  }

  // Helper to get full department object by ID
  const getDepartmentById = (departmentId?: string | null) => {
    if (!departmentId) return undefined
    return departmentsList.find((d) => d.id === departmentId)
  }

  const handleEditClick = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setEditFormData({
      name: doctor.name,
      rating: doctor.rating,
      experience_years: typeof doctor.experience_years === "number" ? doctor.experience_years.toString() : doctor.experience_years,
      hospital_id: doctor.hospital_id,
      department_id: doctor.department_id || "none",
      email: doctor.email,
      phone: doctor.phone || "", // Include phone in edit form
      notes: doctor.notes || "",
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateDoctor = async () => {
    if (!editingDoctor) return

    setIsUpdating(true)
    setError(null)

    try {
      const updatedDoctor: Doctor = {
        ...editingDoctor,
        name: editFormData.name,
        rating: editFormData.rating,
        experience_years: editFormData.experience_years, // 전문과목 (텍스트)
        hospital_id: editFormData.hospital_id,
        department_id: editFormData.department_id && editFormData.department_id !== "none" ? editFormData.department_id : null,
        email: editFormData.email,
        phone: editFormData.phone,
        notes: editFormData.notes,
      }

      await updateDoctorInSupabase(editingDoctor.id, updatedDoctor)
      
      // Refresh cache to reflect changes on main page
      await fetch('/api/doctors', { method: 'POST' })
      
      await loadDoctors()
      setEditingDoctor(null)
      setIsEditModalOpen(false)
    } catch (err) {
      console.error("Failed to update doctor:", err)
      setError("의사 정보 수정에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteDoctor = async (doctorId: string) => {
    setIsDeleting(doctorId)
    setError(null)

    try {
      await deleteDoctorFromSupabase(doctorId)
      
      // Refresh cache to reflect changes on main page
      await fetch('/api/doctors', { method: 'POST' })
      
      await loadDoctors()
      setDeleteConfirmId(null)
    } catch (err) {
      console.error("Failed to delete doctor:", err)
      setError("의사 삭제에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHospital.name || !newHospital.address || !newHospital.phone) return

    setIsAddingHospital(true)
    setError(null)

    try {
      const hospital = {
        name: newHospital.name,
        address: newHospital.address,
        phone: newHospital.phone,
      }

      await addHospitalToSupabase(hospital)
      
      // Refresh cache to reflect changes on main page
      await fetch('/api/hospitals', { method: 'POST' })
      
      setNewHospital({ name: "", address: "", phone: "" })
      await loadHospitalsAndDepartments()
    } catch (err) {
      console.error("Failed to add hospital:", err)
      setError("병원 추가에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsAddingHospital(false)
    }
  }

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDepartment.name) return

    setIsAddingDepartment(true)
    setError(null)

    try {
      const department = {
        name: newDepartment.name,
      }

      await addDepartmentToSupabase(department)
      
      // Refresh cache to reflect changes on main page
      await fetch('/api/departments', { method: 'POST' })
      
      setNewDepartment({ name: "" })
      await loadHospitalsAndDepartments()
    } catch (err) {
      console.error("Failed to add department:", err)
      setError("진료과 추가에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsAddingDepartment(false)
    }
  }

  const handleDeleteHospital = async (hospitalId: string) => {
    // Check if any doctors are using this hospital
    const doctorsUsingHospital = existingDoctors.filter((doctor) => doctor.hospital_id === hospitalId)
    
    if (doctorsUsingHospital.length > 0) {
      setDeleteErrorMessage(
        `이 병원을 사용하는 의사가 ${doctorsUsingHospital.length}명 있어 삭제할 수 없습니다.\n먼저 해당 의사들의 병원을 변경해주세요.`
      )
      return
    }

    if (confirm("이 병원을 삭제하시겠습니까?")) {
      setIsDeletingHospital(hospitalId)
      setError(null)

      try {
        await deleteHospitalFromSupabase(hospitalId)
        
        // Refresh cache to reflect changes on main page
        await fetch('/api/hospitals', { method: 'POST' })
        
        await loadHospitalsAndDepartments()
      } catch (err) {
        console.error("Failed to delete hospital:", err)
        setError("병원 삭제에 실패했습니다. 다시 시도해주세요.")
      } finally {
        setIsDeletingHospital(null)
      }
    }
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    // Check if any doctors are using this department
    const doctorsUsingDepartment = existingDoctors.filter((doctor) => doctor.department_id === departmentId)
    
    if (doctorsUsingDepartment.length > 0) {
      setDeleteErrorMessage(
        `이 진료과를 사용하는 의사가 ${doctorsUsingDepartment.length}명 있어 삭제할 수 없습니다.\n먼저 해당 의사들의 진료과를 변경해주세요.`
      )
      return
    }

    if (confirm("이 진료과를 삭제하시겠습니까?")) {
      setIsDeletingDepartment(departmentId)
      setError(null)

      try {
        await deleteDepartmentFromSupabase(departmentId)
        
        // Refresh cache to reflect changes on main page
        await fetch('/api/departments', { method: 'POST' })
        
        await loadHospitalsAndDepartments()
      } catch (err) {
        console.error("Failed to delete department:", err)
        setError("진료과 삭제에 실패했습니다. 다시 시도해주세요.")
      } finally {
        setIsDeletingDepartment(null)
      }
    }
  }

  // Generic delete handler for doctors, used in the list
  const handleDelete = (doctorId: string) => {
    setDeleteConfirmId(doctorId)
  }

  // Form handler for editing doctor (called from DialogFooter)
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUpdateDoctor()
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            메인 페이지로
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 text-red-600 hover:text-red-700 bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="doctors" className="text-base">
              <UserPlus className="w-4 h-4 mr-2" />
              의사 관리
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="text-base">
              <Building2 className="w-4 h-4 mr-2" />
              병원 관리
            </TabsTrigger>
            <TabsTrigger value="departments" className="text-base">
              <Stethoscope className="w-4 h-4 mr-2" />
              진료과 관리
            </TabsTrigger>
          </TabsList>

          {/* Doctors Tab */}
          <TabsContent value="doctors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Doctor Form */}
              <Card className="shadow-xl">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">의사 명단 추가</CardTitle>
                      <CardDescription>새로운 의사 정보를 입력하세요</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          의사명 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="예: 김철수"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          required
                        />
                      </div>

                      {/* Rating */}
                      <div className="space-y-2">
                        <Label htmlFor="rating">
                          등급 <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.rating} onValueChange={(value) => handleChange("rating", value)}>
                          <SelectTrigger id="rating">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A 급 협조의사</SelectItem>
                            <SelectItem value="B">B 급 협조의사</SelectItem>
                            <SelectItem value="C">일반의사</SelectItem>
                            <SelectItem value="D">비의료인</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Specialty Subject */}
                      <div className="space-y-2">
                        <Label htmlFor="experience">
                          전문과목 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="experience"
                          type="text"
                          placeholder="예: 심장내과, 정형외과 등"
                          value={formData.experience_years}
                          onChange={(e) => handleChange("experience_years", e.target.value)}
                          required
                        />
                      </div>

                      {/* Hospital */}
                      <div className="space-y-2">
                        <Label htmlFor="hospital">
                          병원 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.hospital_id}
                          onValueChange={(value) => handleChange("hospital_id", value)}
                        >
                          <SelectTrigger id="hospital">
                            <SelectValue placeholder="병원 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {hospitalsList.map((hospital) => (
                              <SelectItem key={hospital.id} value={hospital.id}>
                                {hospital.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Department */}
                      <div className="space-y-2">
                        <Label htmlFor="department">진료과</Label>
                        <Select
                          value={formData.department_id}
                          onValueChange={(value) => handleChange("department_id", value)}
                        >
                          <SelectTrigger id="department">
                            <SelectValue placeholder="진료과 선택 (선택사항)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">선택 안함</SelectItem>
                            {departmentsList.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          이메일 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="예: doctor@hospital.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone">전화번호</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="예: 02-1234-5678"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                        />
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes">특이사항</Label>
                        <Textarea
                          id="notes"
                          placeholder="의사의 전문 분야, 특기, 경험, 진료 시간 등의 추가 정보를 입력하세요"
                          value={formData.notes}
                          onChange={(e) => handleChange("notes", e.target.value)}
                          className="min-h-[100px] resize-y"
                        />
                      </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">✓ 의사 정보가 성공적으로 추가되었습니다.</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">✗ {error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button type="submit" disabled={isLoading} className="w-full h-11 text-base font-semibold">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          추가 중...
                        </>
                      ) : (
                        "의사 추가"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Doctor List */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">기존 의사 명단</CardTitle>
                  <CardDescription>
                    {doctorsSearch
                      ? `검색 결과: ${(() => {
                          const filtered = existingDoctors.filter((doctor) => {
                            const searchLower = doctorsSearch.toLowerCase()
                            const hospital = getHospitalById(doctor.hospital_id)
                            const department = getDepartmentById(doctor.department_id)
                            return (
                              doctor.name.toLowerCase().includes(searchLower) ||
                              (typeof doctor.experience_years === "string"
                                ? doctor.experience_years.toLowerCase().includes(searchLower)
                                : doctor.experience_years.toString().toLowerCase().includes(searchLower)) ||
                              hospital?.name.toLowerCase().includes(searchLower) ||
                              department?.name.toLowerCase().includes(searchLower) ||
                              doctor.email.toLowerCase().includes(searchLower) ||
                              (doctor.phone && doctor.phone.includes(searchLower))
                            )
                          })
                          return filtered.length
                        })()}명 (전체 ${existingDoctors.length}명)`
                      : `등록된 의사 목록 (총 ${existingDoctors.length}명)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search Input */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="의사명, 전문과목, 병원명으로 검색..."
                        value={doctorsSearch}
                        onChange={(e) => {
                          setDoctorsSearch(e.target.value)
                          setDoctorsPage(1) // Reset to first page on search
                        }}
                        className="pl-10 pr-10"
                      />
                      {doctorsSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => {
                            setDoctorsSearch("")
                            setDoctorsPage(1)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      // Filter doctors based on search
                      const filteredDoctors = existingDoctors.filter((doctor) => {
                        if (!doctorsSearch.trim()) return true
                        const searchLower = doctorsSearch.toLowerCase()
                        const hospital = getHospitalById(doctor.hospital_id)
                        const department = getDepartmentById(doctor.department_id)
                        return (
                          doctor.name.toLowerCase().includes(searchLower) ||
                          (typeof doctor.experience_years === "string"
                            ? doctor.experience_years.toLowerCase().includes(searchLower)
                            : doctor.experience_years.toString().toLowerCase().includes(searchLower)) ||
                          hospital?.name.toLowerCase().includes(searchLower) ||
                          department?.name.toLowerCase().includes(searchLower) ||
                          doctor.email.toLowerCase().includes(searchLower) ||
                          (doctor.phone && doctor.phone.includes(searchLower))
                        )
                      })

                      const startIndex = (doctorsPage - 1) * itemsPerPage
                      const endIndex = startIndex + itemsPerPage
                      const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex)
                      const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)

                      return (
                        <>
                          {paginatedDoctors.map((doctor) => {
                            const hospital = getHospitalById(doctor.hospital_id)
                            const department = getDepartmentById(doctor.department_id)

                            return (
                              <div
                                key={doctor.id}
                                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="font-semibold text-lg">{doctor.name}</h3>
                                      <span
                                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                                          doctor.rating === "A"
                                            ? "bg-red-100 text-red-700"
                                            : doctor.rating === "B"
                                              ? "bg-orange-100 text-orange-700"
                                              : doctor.rating === "C"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                      >
                                        {doctor.rating}등급
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {hospital?.name}{department?.name ? ` · ${department.name}` : ""}
                                    </p>
                                    <p className="text-sm text-muted-foreground">전문과목: {doctor.experience_years}</p>
                                    <p className="text-sm text-muted-foreground">전화번호: {doctor.phone}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditClick(doctor)}
                                      className="gap-1"
                                    >
                                      <Edit className="w-3 h-3" />
                                      수정
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDelete(doctor.id)}
                                      disabled={isDeleting === doctor.id}
                                      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      {isDeleting === doctor.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3 h-3" />
                                      )}
                                      삭제
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          {filteredDoctors.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                              {doctorsSearch ? "검색 결과가 없습니다." : "등록된 의사가 없습니다."}
                            </p>
                          )}
                          {filteredDoctors.length > 0 && totalPages > 1 && (
                            <div className="mt-6">
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (doctorsPage > 1) setDoctorsPage(doctorsPage - 1)
                                      }}
                                      className={doctorsPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          setDoctorsPage(page)
                                        }}
                                        isActive={doctorsPage === page}
                                      >
                                        {page}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  <PaginationItem>
                                    <PaginationNext
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (doctorsPage < totalPages) setDoctorsPage(doctorsPage + 1)
                                      }}
                                      className={doctorsPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hospitals">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Hospital Form */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">병원 추가</CardTitle>
                  <CardDescription>새로운 병원 정보를 입력하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddHospital} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hospital-name">
                        병원명 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="hospital-name"
                        placeholder="예: 서울대학교병원"
                        value={newHospital.name}
                        onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospital-address">
                        주소 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="hospital-address"
                        placeholder="예: 서울시 종로구"
                        value={newHospital.address}
                        onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospital-phone">
                        전화번호 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="hospital-phone"
                        type="tel"
                        placeholder="예: 02-2072-2114"
                        value={newHospital.phone}
                        onChange={(e) => setNewHospital({ ...newHospital, phone: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isAddingHospital} className="w-full">
                      {isAddingHospital ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          추가 중...
                        </>
                      ) : (
                        "병원 추가"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Hospital List */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">등록된 병원</CardTitle>
                  <CardDescription>
                    {hospitalsSearch
                      ? `검색 결과: ${hospitalsList.filter((h) => {
                          const searchLower = hospitalsSearch.toLowerCase()
                          return (
                            h.name.toLowerCase().includes(searchLower) ||
                            h.address.toLowerCase().includes(searchLower) ||
                            h.phone.includes(searchLower)
                          )
                        }).length}개 (전체 ${hospitalsList.length}개)`
                      : `총 ${hospitalsList.length}개`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search Input */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="병원명, 주소, 전화번호로 검색..."
                        value={hospitalsSearch}
                        onChange={(e) => {
                          setHospitalsSearch(e.target.value)
                          setHospitalsPage(1)
                        }}
                        className="pl-10 pr-10"
                      />
                      {hospitalsSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => {
                            setHospitalsSearch("")
                            setHospitalsPage(1)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      // Filter hospitals based on search
                      const filteredHospitals = hospitalsList.filter((hospital) => {
                        if (!hospitalsSearch.trim()) return true
                        const searchLower = hospitalsSearch.toLowerCase()
                        return (
                          hospital.name.toLowerCase().includes(searchLower) ||
                          hospital.address.toLowerCase().includes(searchLower) ||
                          hospital.phone.includes(searchLower)
                        )
                      })

                      const startIndex = (hospitalsPage - 1) * itemsPerPage
                      const endIndex = startIndex + itemsPerPage
                      const paginatedHospitals = filteredHospitals.slice(startIndex, endIndex)
                      const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage)

                      return (
                        <>
                          {paginatedHospitals.map((hospital) => (
                            <div
                              key={hospital.id}
                              className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-lg">{hospital.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{hospital.address}</p>
                                  <p className="text-sm text-gray-600">{hospital.phone}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteHospital(hospital.id)}
                                  disabled={isDeletingHospital === hospital.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  {isDeletingHospital === hospital.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                          {filteredHospitals.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                              {hospitalsSearch ? "검색 결과가 없습니다." : "등록된 병원이 없습니다."}
                            </p>
                          )}
                          {filteredHospitals.length > 0 && totalPages > 1 && (
                            <div className="mt-6">
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (hospitalsPage > 1) setHospitalsPage(hospitalsPage - 1)
                                      }}
                                      className={hospitalsPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          setHospitalsPage(page)
                                        }}
                                        isActive={hospitalsPage === page}
                                      >
                                        {page}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  <PaginationItem>
                                    <PaginationNext
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (hospitalsPage < totalPages) setHospitalsPage(hospitalsPage + 1)
                                      }}
                                      className={hospitalsPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Department Form */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">진료과 추가</CardTitle>
                  <CardDescription>새로운 진료과를 입력하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddDepartment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="department-name">
                        진료과명 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="department-name"
                        placeholder="예: 정형외과"
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment({ name: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isAddingDepartment} className="w-full">
                      {isAddingDepartment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          추가 중...
                        </>
                      ) : (
                        "진료과 추가"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Department List */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">등록된 진료과</CardTitle>
                  <CardDescription>
                    {departmentsSearch
                      ? `검색 결과: ${departmentsList.filter((d) =>
                          d.name.toLowerCase().includes(departmentsSearch.toLowerCase())
                        ).length}개 (전체 ${departmentsList.length}개)`
                      : `총 ${departmentsList.length}개`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search Input */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="진료과명으로 검색..."
                        value={departmentsSearch}
                        onChange={(e) => {
                          setDepartmentsSearch(e.target.value)
                          setDepartmentsPage(1)
                        }}
                        className="pl-10 pr-10"
                      />
                      {departmentsSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => {
                            setDepartmentsSearch("")
                            setDepartmentsPage(1)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      // Filter departments based on search
                      const filteredDepartments = departmentsList.filter((dept) => {
                        if (!departmentsSearch.trim()) return true
                        return dept.name.toLowerCase().includes(departmentsSearch.toLowerCase())
                      })

                      const startIndex = (departmentsPage - 1) * itemsPerPage
                      const endIndex = startIndex + itemsPerPage
                      const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex)
                      const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage)

                      return (
                        <>
                          {paginatedDepartments.map((dept) => (
                            <div key={dept.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">{dept.name}</h3>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteDepartment(dept.id)}
                                  disabled={isDeletingDepartment === dept.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  {isDeletingDepartment === dept.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                          {filteredDepartments.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                              {departmentsSearch ? "검색 결과가 없습니다." : "등록된 진료과가 없습니다."}
                            </p>
                          )}
                          {filteredDepartments.length > 0 && totalPages > 1 && (
                            <div className="mt-6">
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (departmentsPage > 1) setDepartmentsPage(departmentsPage - 1)
                                      }}
                                      className={departmentsPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          setDepartmentsPage(page)
                                        }}
                                        isActive={departmentsPage === page}
                                      >
                                        {page}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  <PaginationItem>
                                    <PaginationNext
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (departmentsPage < totalPages) setDepartmentsPage(departmentsPage + 1)
                                      }}
                                      className={departmentsPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog for Doctors */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>의사 삭제 확인</DialogTitle>
            <DialogDescription>정말로 이 의사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={isDeleting !== null}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteDoctor(deleteConfirmId)}
              disabled={isDeleting !== null}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Error Dialog */}
      <Dialog open={deleteErrorMessage !== null} onOpenChange={() => setDeleteErrorMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>삭제할 수 없습니다</DialogTitle>
            <DialogDescription className="whitespace-pre-line">{deleteErrorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteErrorMessage(null)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>의사 정보 수정</DialogTitle>
            <DialogDescription>의사 정보를 수정하세요</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Edit Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">의사명</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  required
                />
              </div>

              {/* Edit Rating */}
              <div className="space-y-2">
                <Label htmlFor="edit-rating">등급</Label>
                <Select
                  value={editFormData.rating}
                  onValueChange={(value) => handleEditChange("rating", value as "A" | "B" | "C" | "D")}
                >
                  <SelectTrigger id="edit-rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A 등급</SelectItem>
                    <SelectItem value="B">B 등급</SelectItem>
                    <SelectItem value="C">C 등급</SelectItem>
                    <SelectItem value="D">D 등급</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Edit Specialty Subject */}
              <div className="space-y-2">
                <Label htmlFor="edit-experience">전문과목</Label>
                <Input
                  id="edit-experience"
                  type="text"
                  placeholder="예: 심장내과, 정형외과 등"
                  value={editFormData.experience_years}
                  onChange={(e) => handleEditChange("experience_years", e.target.value)}
                  required
                />
              </div>

              {/* Edit Hospital */}
              <div className="space-y-2">
                <Label htmlFor="edit-hospital">병원</Label>
                <Select
                  value={editFormData.hospital_id}
                  onValueChange={(value) => handleEditChange("hospital_id", value)}
                >
                  <SelectTrigger id="edit-hospital">
                    <SelectValue placeholder="병원 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitalsList.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Edit Department */}
              <div className="space-y-2">
                <Label htmlFor="edit-department">진료과</Label>
                <Select
                  value={editFormData.department_id}
                  onValueChange={(value) => handleEditChange("department_id", value)}
                >
                  <SelectTrigger id="edit-department">
                    <SelectValue placeholder="진료과 선택 (선택사항)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택 안함</SelectItem>
                    {departmentsList.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Edit Email */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-email">이메일</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                  required
                />
              </div>

              {/* Edit Phone */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-phone">전화번호</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => handleEditChange("phone", e.target.value)}
                />
              </div>

              {/* Edit Notes */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-notes">특이사항</Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.notes}
                  onChange={(e) => handleEditChange("notes", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating}>
                취소
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    수정 중...
                  </>
                ) : (
                  "수정 완료"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
