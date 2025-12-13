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
import { ArrowLeft, UserPlus, LogOut, Trash2, Building2, Stethoscope, Edit, Loader2 } from "lucide-react"
import Link from "next/link"
import { isAdminAuthenticated, setAdminAuthentication } from "@/lib/auth"
import {
  addDoctorToStorage,
  getDoctorsFromStorage,
  updateDoctorInStorage,
  deleteDoctorFromStorage,
  getHospitals, // Added
  getDepartments, // Added
  addHospitalToStorage, // Added
  deleteHospitalFromStorage, // Added
  addDepartmentToStorage, // Added
  deleteDepartmentFromStorage, // Added
} from "@/lib/storage"
import type { Doctor, Hospital, Department } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Added

export default function AddDoctorPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAddingHospital, setIsAddingHospital] = useState(false)
  const [isDeletingHospital, setIsDeletingHospital] = useState<string | null>(null)
  const [isAddingDepartment, setIsAddingDepartment] = useState(false)
  const [isDeletingDepartment, setIsDeletingDepartment] = useState<string | null>(null)

  const [success, setSuccess] = useState(false)
  const [existingDoctors, setExistingDoctors] = useState<Doctor[]>([])
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [hospitalsList, setHospitalsList] = useState<Hospital[]>([])
  const [departmentsList, setDepartmentsList] = useState<Department[]>([])
  const [newHospital, setNewHospital] = useState({ name: "", address: "", phone: "" })
  const [newDepartment, setNewDepartment] = useState({ name: "" })

  const [formData, setFormData] = useState({
    name: "",
    rating: "B" as "A" | "B" | "C" | "D",
    specialization: "",
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
    specialization: "",
    experience_years: "",
    hospital_id: "",
    department_id: "",
    email: "",
    phone: "", // Added phone field to edit form state
    notes: "",
  })

  useEffect(() => {
    const authenticated = isAdminAuthenticated()
    setIsAuthenticated(authenticated)
    if (!authenticated) {
      router.push("/admin/login")
    } else {
      loadDoctors()
      loadHospitalsAndDepartments()
    }
  }, [router])

  const loadDoctors = () => {
    const doctors = getDoctorsFromStorage()
    setExistingDoctors(doctors)
  }

  const loadHospitalsAndDepartments = () => {
    setHospitalsList(getHospitals())
    setDepartmentsList(getDepartments())
  }

  useEffect(() => {
    const handleHospitalsChange = () => {
      loadHospitalsAndDepartments()
    }

    const handleDepartmentsChange = () => {
      loadHospitalsAndDepartments()
    }

    window.addEventListener("hospitals_data_change", handleHospitalsChange)
    window.addEventListener("departments_data_change", handleDepartmentsChange)

    return () => {
      window.removeEventListener("hospitals_data_change", handleHospitalsChange)
      window.removeEventListener("departments_data_change", handleDepartmentsChange)
    }
  }, [])

  const handleLogout = () => {
    setAdminAuthentication(false)
    router.push("/admin/login")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)

    const newDoctor = {
      id: Date.now().toString(),
      name: formData.name,
      rating: formData.rating,
      specialization: formData.specialization,
      experience_years: Number.parseInt(formData.experience_years),
      hospital_id: formData.hospital_id,
      department_id: formData.department_id,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
    }

    setTimeout(() => {
      addDoctorToStorage(newDoctor)
      setSuccess(true)
      setIsLoading(false)
      loadDoctors()

      setFormData({
        name: "",
        rating: "B",
        specialization: "",
        experience_years: "",
        hospital_id: "",
        department_id: "",
        email: "",
        phone: "",
        notes: "",
      })

      setTimeout(() => setSuccess(false), 3000)
    }, 800)
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
  const getDepartmentById = (departmentId: string) => {
    return departmentsList.find((d) => d.id === departmentId)
  }

  const handleEditClick = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setEditFormData({
      name: doctor.name,
      rating: doctor.rating,
      specialization: doctor.specialization,
      experience_years: doctor.experience_years.toString(),
      hospital_id: doctor.hospital_id,
      department_id: doctor.department_id,
      email: doctor.email,
      phone: doctor.phone || "", // Include phone in edit form
      notes: doctor.notes || "",
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateDoctor = () => {
    if (!editingDoctor) return

    setIsUpdating(true)

    const updatedDoctor: Doctor = {
      ...editingDoctor,
      name: editFormData.name,
      rating: editFormData.rating,
      specialization: editFormData.specialization,
      experience_years: Number.parseInt(editFormData.experience_years),
      hospital_id: editFormData.hospital_id,
      department_id: editFormData.department_id,
      email: editFormData.email,
      phone: editFormData.phone,
      notes: editFormData.notes,
    }

    setTimeout(() => {
      updateDoctorInStorage(editingDoctor.id, updatedDoctor)
      loadDoctors()
      setIsUpdating(false)
      setEditingDoctor(null)
      setIsEditModalOpen(false)
    }, 800)
  }

  const handleDeleteDoctor = (doctorId: string) => {
    setIsDeleting(doctorId)

    setTimeout(() => {
      deleteDoctorFromStorage(doctorId)
      loadDoctors()
      setDeleteConfirmId(null)
      setIsDeleting(null)
    }, 800)
  }

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHospital.name || !newHospital.address || !newHospital.phone) return

    setIsAddingHospital(true)

    const hospital: Hospital = {
      id: Date.now().toString(),
      name: newHospital.name,
      address: newHospital.address,
      phone: newHospital.phone,
    }

    setTimeout(() => {
      addHospitalToStorage(hospital)
      setNewHospital({ name: "", address: "", phone: "" })
      loadHospitalsAndDepartments()
      setIsAddingHospital(false)
    }, 800)
  }

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDepartment.name) return

    setIsAddingDepartment(true)

    const department: Department = {
      id: Date.now().toString(),
      name: newDepartment.name,
    }

    setTimeout(() => {
      addDepartmentToStorage(department)
      setNewDepartment({ name: "" })
      loadHospitalsAndDepartments()
      setIsAddingDepartment(false)
    }, 800)
  }

  const handleDeleteHospital = (hospitalId: string) => {
    if (confirm("이 병원을 삭제하시겠습니까?")) {
      setIsDeletingHospital(hospitalId)

      setTimeout(() => {
        deleteHospitalFromStorage(hospitalId)
        loadHospitalsAndDepartments()
        setIsDeletingHospital(null)
      }, 800)
    }
  }

  const handleDeleteDepartment = (departmentId: string) => {
    if (confirm("이 진료과를 삭제하시겠습니까?")) {
      setIsDeletingDepartment(departmentId)

      setTimeout(() => {
        deleteDepartmentFromStorage(departmentId)
        loadHospitalsAndDepartments()
        setIsDeletingDepartment(null)
      }, 800)
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
                            <SelectItem value="A">A 등급</SelectItem>
                            <SelectItem value="B">B 등급</SelectItem>
                            <SelectItem value="C">C 등급</SelectItem>
                            <SelectItem value="D">D 등급</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Specialization */}
                      <div className="space-y-2">
                        <Label htmlFor="specialization">
                          전문분야 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="specialization"
                          placeholder="예: 심장내과"
                          value={formData.specialization}
                          onChange={(e) => handleChange("specialization", e.target.value)}
                          required
                        />
                      </div>

                      {/* Experience Years */}
                      <div className="space-y-2">
                        <Label htmlFor="experience">
                          경력 (년) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="experience"
                          type="number"
                          min="0"
                          placeholder="예: 15"
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
                        <Label htmlFor="department">
                          진료과 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.department_id}
                          onValueChange={(value) => handleChange("department_id", value)}
                        >
                          <SelectTrigger id="department">
                            <SelectValue placeholder="진료과 선택" />
                          </SelectTrigger>
                          <SelectContent>
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
                  <CardDescription>등록된 의사 목록 (총 {existingDoctors.length}명)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                    {existingDoctors.map((doctor) => {
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
                              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                              <p className="text-sm text-muted-foreground">
                                {hospital?.name} · {department?.name}
                              </p>
                              <p className="text-sm text-muted-foreground">경력: {doctor.experience_years}년</p>
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
                    {existingDoctors.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">등록된 의사가 없습니다.</p>
                    )}
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
                  <CardDescription>총 {hospitalsList.length}개</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {hospitalsList.map((hospital) => (
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
                  <CardDescription>총 {departmentsList.length}개</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {departmentsList.map((dept) => (
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

              {/* Edit Specialization */}
              <div className="space-y-2">
                <Label htmlFor="edit-specialization">전문분야</Label>
                <Input
                  id="edit-specialization"
                  value={editFormData.specialization}
                  onChange={(e) => handleEditChange("specialization", e.target.value)}
                  required
                />
              </div>

              {/* Edit Experience */}
              <div className="space-y-2">
                <Label htmlFor="edit-experience">경력 (년)</Label>
                <Input
                  id="edit-experience"
                  type="number"
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
                    <SelectValue placeholder="진료과 선택" />
                  </SelectTrigger>
                  <SelectContent>
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
