"use client"

import { CardHeader } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  Building2,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  Award,
  Plus,
  Check,
  ChevronsUpDown,
  Loader2,
  HelpCircle,
  CheckCircle2,
} from "lucide-react"
import {
  type Department,
  type Doctor,
  type Hospital,
} from "@/lib/mock-data"
import {
  getDoctorsFromSupabase,
  getHospitalsFromSupabase,
  getDepartmentsFromSupabase,
} from "@/lib/supabase/doctors"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { InstallPrompt } from "@/components/install-prompt"

type DoctorWithDetails = Doctor & {
  hospital: {
    name: string
    address: string
    phone: string
  }
  department: {
    name: string
  }
}

const ratingColors = {
  A: "bg-blue-100 text-blue-800",
  B: "bg-green-100 text-green-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-red-100 text-red-800",
}

const ratingLabels = {
  A: "협조의사",
  B: "협조의사",
  C: "일반의사",
  D: "비의료인",
}

export function DoctorSearchPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [selectedHospital, setSelectedHospital] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")

  const [appliedSearchQuery, setAppliedSearchQuery] = useState("")
  const [appliedRating, setAppliedRating] = useState<string>("all")
  const [appliedHospital, setAppliedHospital] = useState<string>("all")
  const [appliedDepartment, setAppliedDepartment] = useState<string>("all")

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRatingInfoOpen, setIsRatingInfoOpen] = useState(false)

  const [openDepartmentCombobox, setOpenDepartmentCombobox] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper functions to get hospital/department by ID
  const getHospitalById = (hospitalId: string): Hospital | undefined => {
    return hospitals.find((h) => h.id === hospitalId)
  }

  const getDepartmentById = (departmentId: string): Department | undefined => {
    return departments.find((d) => d.id === departmentId)
  }

  useEffect(() => {
    // Initial load from Supabase
    const loadData = async () => {
      try {
        setIsInitialLoading(true)
        setError(null)
        
        const [hospitalsData, departmentsData, doctorsData] = await Promise.all([
          getHospitalsFromSupabase(),
          getDepartmentsFromSupabase(),
          getDoctorsFromSupabase(),
        ])

        setHospitals(hospitalsData)
        setDepartments(departmentsData)
        setDoctors(doctorsData)
      } catch (err) {
        console.error("Failed to load data:", err)
        setError("데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.")
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredDoctors: DoctorWithDetails[] = doctors
    .map((doctor) => {
      const hospital = getHospitalById(doctor.hospital_id)
      const department = getDepartmentById(doctor.department_id)

      // Skip if hospital or department not found
      if (!hospital || !department) {
        return null
      }

      return {
        ...doctor,
        hospital: {
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
        },
        department: {
          name: department.name,
        },
      }
    })
    .filter((d): d is DoctorWithDetails => d !== null)
    .filter((d) => {
      if (appliedRating && appliedRating !== "all" && d.rating !== appliedRating) return false
      if (appliedHospital && appliedHospital !== "all" && d.hospital_id !== appliedHospital) return false
      if (appliedDepartment && appliedDepartment !== "all" && d.department_id !== appliedDepartment) return false
      if (appliedSearchQuery && appliedSearchQuery.trim()) {
        const query = appliedSearchQuery.toLowerCase()
        const experienceYearsStr = typeof d.experience_years === "string" 
          ? d.experience_years 
          : d.experience_years.toString()
        if (
          !d.name.toLowerCase().includes(query) && 
          !experienceYearsStr.toLowerCase().includes(query)
        ) return false
      }
      return true
    })
    .sort((a, b) => a.rating.localeCompare(b.rating))

  const totalCount = filteredDoctors.length

  const handleSearch = async () => {
    setIsLoading(true)
    // Simulate loading time for better UX
    await new Promise((resolve) => setTimeout(resolve, 800))

    setAppliedSearchQuery(searchQuery)
    setAppliedRating(selectedRating)
    setAppliedHospital(selectedHospital)
    setAppliedDepartment(selectedDepartment)
    setHasSearched(true)

    setIsLoading(false)
  }

  const handleReset = () => {
    setSearchQuery("")
    setSelectedRating("all")
    setSelectedHospital("all")
    setSelectedDepartment("all")
    setAppliedSearchQuery("")
    setAppliedRating("all")
    setAppliedHospital("all")
    setAppliedDepartment("all")
    setHasSearched(false)
  }

  const handleDoctorClick = (doctor: DoctorWithDetails) => {
    setSelectedDoctor(doctor)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <InstallPrompt />
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <header className="mb-8 text-center relative">
        <div className="flex justify-end">
          
    <Link href="/admin/login">
      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
        <ChevronsUpDown className="h-4 w-4" />
        관리자
      </Button>
    </Link>
  </div>
  <div className="mt-8 text-center">
    <h1 className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
      천안HLC 협조의사명단
    </h1>
    <p className="text-muted-foreground">
      협조의사/일반의사 등급별 검색 
    </p>
  </div>
        </header>

        <Card className="mb-6 shadow-xl border-none bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-slate-800/50">
        <CardHeader className="border-b border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-t-lg">
  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
   {/* Search by Name */}
   <div className="md:col-span-3 w-full">
               
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="의사명 또는 전문과목"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch()
                      }
                    }}
                    className="w-full pl-10 h-12 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
  </div>
</CardHeader>
          <CardContent className="pt-2">
            
            {/* Doctor Rating Tabs */}
            <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">의사 선택</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700"
                  onClick={() => setIsRatingInfoOpen(true)}
                >
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRating("all")}
                  className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedRating === "all"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setSelectedRating("A")}
                  className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedRating === "A"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-blue-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md"
                  }`}
                >
                  A급 <span className="ml-1 text-xs opacity-80">협조의사</span>
                </button>
                <button
                  onClick={() => setSelectedRating("B")}
                  className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedRating === "B"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50 scale-105"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-green-200 dark:border-slate-700 hover:border-green-400 hover:shadow-md"
                  }`}
                >
                  B급 <span className="ml-1 text-xs opacity-80">협조의사</span>
                </button>
                <button
                  onClick={() => setSelectedRating("C")}
                  className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedRating === "C"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/50 scale-105"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-yellow-200 dark:border-slate-700 hover:border-yellow-400 hover:shadow-md"
                  }`}
                >
                 일반의사
                </button>
                <button
                  onClick={() => setSelectedRating("D")}
                  className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedRating === "D"
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50 scale-105"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-red-200 dark:border-slate-700 hover:border-red-400 hover:shadow-md"
                  }`}
                >
                  비의료인
                </button>
              </div>
            </div>
<br/>
            <div className="grid gap-6 md:grid-cols-3">
             

              {/* Hospital Filter */}
              <div>
                <Label
                  htmlFor="hospital"
                  className="mb-3 block text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4 text-blue-600" />
                  병원 선택
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                    <SelectTrigger
                      id="hospital"
                      className="relative h-14 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <SelectValue placeholder="전체 병원" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      <SelectItem value="all" className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          전체 병원
                        </div>
                      </SelectItem>
                      {hospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id} className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            {hospital.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <Label
                  htmlFor="department"
                  className="mb-3 block text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4 text-emerald-600" />
                  진료과 선택
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <Popover open={openDepartmentCombobox} onOpenChange={setOpenDepartmentCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDepartmentCombobox}
                        className="relative h-14 w-full justify-between border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-emerald-600" />
                          <span>
                            {selectedDepartment === "all"
                              ? "전체 진료과"
                              : departments.find((dept) => dept.id === selectedDepartment)?.name || "진료과 선택"}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 rounded-xl border-2">
                      <Command>
                        <CommandInput placeholder="진료과 검색..." className="h-12" />
                        <CommandList>
                          <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setSelectedDepartment("all")
                                setOpenDepartmentCombobox(false)
                              }}
                              className="font-medium py-3"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedDepartment === "all" ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <Stethoscope className="h-4 w-4 mr-2 text-emerald-500" />
                              전체 진료과
                            </CommandItem>
                            {departments.map((dept) => (
                              <CommandItem
                                key={dept.id}
                                value={dept.name}
                                onSelect={() => {
                                  setSelectedDepartment(dept.id)
                                  setOpenDepartmentCombobox(false)
                                }}
                                className="font-medium py-3"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedDepartment === dept.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <Plus className="h-4 w-4 mr-2 text-emerald-500" />
                                {dept.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Search Actions */}
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 h-12 border-2 hover:bg-slate-50 rounded-lg bg-transparent"
                >
                  초기화
                </Button>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-lg gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      검색 중...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      검색
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initial Loading */}
        {isInitialLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium text-slate-600">데이터를 불러오는 중...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <HelpCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading Overlay */}
        {isLoading && !isInitialLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium text-slate-600">의사 정보를 검색하고 있습니다...</p>
          </div>
        )}

        {/* Welcome Message */}
        {!hasSearched && !isLoading && !isInitialLoading && (
          <Card className="py-16 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-blue-300 dark:border-blue-700">
            <div className="p-4 space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Stethoscope className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                의사 검색
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                검색 조건을 선택하고 <span className="font-semibold text-blue-600 dark:text-blue-400">검색 버튼</span>을
                눌러 원하시는 의사를 찾아보세요.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span>의사 등급별 검색</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <span>병원별 검색</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-green-500" />
                  <span>진료과별 검색</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Results Section */}
        {hasSearched && !isLoading && !isInitialLoading && (
          <>
            {/* Total Count */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg">
                <Stethoscope className="h-5 w-5" />
                <span className="font-semibold text-lg">총 {totalCount}명의 의사</span>
              </div>
            </div>

{/* ----------------------------------------------------------------------------------------------------------------------------------- */}


            {/* Results Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleDoctorClick(doctor)}
                >
               <div className="p-4">
  <div className="flex items-start justify-between">
    <div>
      {/* 아이콘 + 이름 한 줄 */}
      <div className="flex items-center gap-2">
        <Stethoscope className="h-6 w-6" />
        <div className="text-xl font-bold">{doctor.name}</div>
      </div>

      {/* 부가 정보 */}
      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        {/* 여기에 과목, 병원명 등 */}
      </p>
    </div>
                      <Badge className={ratingColors[doctor.rating]}>{doctor.rating}급</Badge>
                    </div>

                    <div className="flex items-start gap-3 mt-2">
  <Building2 className="mt-1 h-5 w-5 text-muted-foreground" />
  <div>
  <div className="flex items-center gap-3">
  {/* 병원명 */}
  <div className="text-base font-medium">
    {doctor.hospital.name}
  </div>

  {/* 주소 */}
  <div className="flex items-center gap-1 text-sm text-muted-foreground">
    <MapPin className="h-4 w-4" />
    <span>{doctor.hospital.address}</span>
  </div>
</div>
    <div className="text-base font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md inline-block">
  {doctor.department.name}
</div>
  </div>
</div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground whitespace-nowrap">전문과목:</span>
                        <span className="font-medium">
                          {typeof doctor.experience_years === "string" 
                            ? doctor.experience_years 
                            : doctor.experience_years}
                        </span>
                      </div>


                     

                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-sm">병원대표:</span>
                        <a
                          href={`tel:${doctor.hospital.phone}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {doctor.hospital.phone}
                        </a>
                      </div>

                      {doctor.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <span className="text-muted-foreground text-sm">의사직통:</span>
                            <a
                              href={`tel:${doctor.phone}`}
                              className="ml-2 text-blue-600 hover:underline dark:text-blue-400 font-medium"
                            >
                              {doctor.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${doctor.email}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {doctor.email}
                        </a>
                      </div>

                      <div className="pt-2">
                        <Badge variant="secondary" className="text-xs">
                          {ratingLabels[doctor.rating]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {hasSearched && !isLoading && !isInitialLoading && filteredDoctors.length === 0 && (
          <Card className="py-12 text-center">
            <div className="p-4">
              <p className="text-lg text-muted-foreground">검색 조건에 맞는 의사를 찾을 수 없습니다.</p>
              <Button variant="link" onClick={handleReset} className="mt-4">
                검색 조건 초기화
              </Button>
            </div>
          </Card>
        )}

        {/* Rating Info Dialog */}
        <Dialog open={isRatingInfoOpen} onOpenChange={setIsRatingInfoOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Award className="h-6 w-6 text-blue-600" />
                등급별 의사 안내
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground mb-4">
                의사 등급은 종합적으로 평가한 지표입니다.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    A급
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">협조의사</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      언제든지 협조 가능한 의사입니다.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">
                        파란색으로 표시됩니다.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    B급
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">협조의사</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      협조의사지만 자문만을 구할 수 있습니다 
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">
                        초록색으로 표시됩니다.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    C
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">일반의사</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      포섭대상 의사입니다 
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-600">
                        노란색으로 표시됩니다.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    D
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">비의료인</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      비의료인에는 병원 인포, 과장 등이 포함됩니다 
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-medium text-red-600">빨간색으로 표시됩니다.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">※ 참고 : </span> 
                  올리톡 협조의사 명단 탭을 사용하시기 바랍니다.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

{/* ----------------------------------------------------------------------------------------------------------------------------------- */}




        {/* Doctor Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedDoctor && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                    <DialogTitle>
      <div className="flex items-center gap-2 text-2xl font-bold">
        <Stethoscope className="h-6 w-6 text-muted-foreground" />
        <span>{selectedDoctor.name}</span>
      </div>
    </DialogTitle>
                    </div>
                    <Badge className={`${ratingColors[selectedDoctor.rating]} text-lg px-3 py-1`}>
                      {selectedDoctor.rating}급
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="flex items-start gap-3 mt-2">
  <Building2 className="mt-1 h-5 w-5 text-muted-foreground" />
  <div>
  <div className="flex items-center gap-3">
  {/* 병원명 */}
  <div className="text-base font-medium">
    {selectedDoctor.hospital.name}
  </div>

  {/* 주소 */}
  <div className="flex items-center gap-1 text-sm text-muted-foreground">
    <MapPin className="h-4 w-4" />
    <span>{selectedDoctor.hospital.address}</span>
  </div>
</div>
    <div className="text-base font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md inline-block">
  {selectedDoctor.department.name}
</div>
  </div>
</div>

                <div className="space-y-6 pt-2">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-base">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">전문과목:</span>
                      <span className="font-semibold">
                        {typeof selectedDoctor.experience_years === "string" 
                          ? selectedDoctor.experience_years 
                          : selectedDoctor.experience_years}
                      </span>
                    </div>

                 

                    <div className="flex items-start gap-3 text-base">
                      <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div className="text-muted-foreground">{selectedDoctor.hospital.address}</div>
                    </div>

                    <div className="flex items-center gap-3 text-base">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${selectedDoctor.hospital.phone}`}
                        className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                      >
                        {selectedDoctor.hospital.phone}
                      </a>
                    </div>

                    {selectedDoctor.phone && (
                      <div className="flex items-center gap-3 text-base">
                        <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <span className="text-muted-foreground text-sm">직통:</span>
                          <a
                            href={`tel:${selectedDoctor.phone}`}
                            className="ml-2 text-blue-600 hover:underline dark:text-blue-400 font-medium"
                          >
                            {selectedDoctor.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-base">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${selectedDoctor.email}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {selectedDoctor.email}
                      </a>
                    </div>
                  </div>

                  {/* Special Notes Section */}
                  {selectedDoctor.notes && (
                    <div className="border-t pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold">특이사항</h3>
                      </div>
                      <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-4">
                        <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                          {selectedDoctor.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="border-t pt-4">
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      {ratingLabels[selectedDoctor.rating]} 의료진
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default DoctorSearchPage
