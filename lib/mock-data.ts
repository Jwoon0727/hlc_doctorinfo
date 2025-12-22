// Mock data for doctors, hospitals, and departments

export type Doctor = {
  id: string
  name: string
  rating: "A" | "B" | "C" | "D"
  experience_years: string | number // 전문과목 (텍스트 또는 숫자)
  hospital_id: string
  department_id?: string | null // Optional department
  email: string
  phone?: string // Added phone field
  notes?: string
}

export type Hospital = {
  id: string
  name: string
  address: string
  phone: string
}

export type Department = {
  id: string
  name: string
}

export const hospitals: Hospital[] = [
  {
    id: "1",
    name: "서울대학교병원",
    address: "서울특별시 종로구 대학로 101",
    phone: "02-2072-2114",
  },
  {
    id: "2",
    name: "연세세브란스병원",
    address: "서울특별시 서대문구 연세로 50-1",
    phone: "02-2228-5800",
  },
  {
    id: "3",
    name: "삼성서울병원",
    address: "서울특별시 강남구 일원로 81",
    phone: "02-3410-2114",
  },
  {
    id: "4",
    name: "아산병원",
    address: "서울특별시 송파구 올림픽로43길 88",
    phone: "1688-7575",
  },
  {
    id: "5",
    name: "가톨릭대학교 서울성모병원",
    address: "서울특별시 서초구 반포대로 222",
    phone: "02-2258-5114",
  },
]

export const departments: Department[] = [
  { id: "1", name: "내과" },
  { id: "2", name: "외과" },
  { id: "3", name: "정형외과" },
  { id: "4", name: "신경외과" },
  { id: "5", name: "소아청소년과" },
  { id: "6", name: "산부인과" },
  { id: "7", name: "안과" },
  { id: "8", name: "이비인후과" },
  { id: "9", name: "피부과" },
  { id: "10", name: "정신건강의학과" },
  { id: "11", name: "재활의학과" },
  { id: "12", name: "응급의학과" },
]

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "김철수",
    rating: "A",
    experience_years: 15,
    hospital_id: "1",
    department_id: "1",
    email: "kim.cs@snuh.org",
    phone: "02-2072-3456", // Added phone numbers to all doctors
    notes: "국내 최고 권위의 심장내과 전문의. 관상동맥 중재시술 분야 최다 케이스 보유. 복잡한 심장질환 수술 경험 풍부.",
  },
  {
    id: "2",
    name: "이영희",
    rating: "A",
    experience_years: 20,
    hospital_id: "1",
    department_id: "4",
    email: "lee.yh@snuh.org",
    phone: "02-2072-3457",
    notes: "뇌종양 및 뇌혈관 질환 수술의 최고 전문가. 미세 수술 기법에 능통하며 국제학회 다수 발표 경력 보유.",
  },
  {
    id: "3",
    name: "박민수",
    rating: "B",
    experience_years: 12,
    hospital_id: "2",
    department_id: "3",
    email: "park.ms@yuhs.ac",
    phone: "02-2228-5900",
    notes: "척추 내시경 수술 전문. 최소 침습 수술로 빠른 회복 가능. 디스크 및 척추협착증 치료 경험 풍부.",
  },
  {
    id: "4",
    name: "최지원",
    rating: "A",
    experience_years: 18,
    hospital_id: "3",
    department_id: "5",
    email: "choi.jw@samsung.com",
    phone: "02-3410-3000",
    notes: "선천성 심장질환 전문. 소아 심장 카테터 시술의 국내 최고 권위자. 부모 상담에 친절하고 자세함.",
  },
  {
    id: "5",
    name: "정수민",
    rating: "B",
    experience_years: 10,
    hospital_id: "2",
    department_id: "6",
    email: "jung.sm@yuhs.ac",
    phone: "02-2228-5901",
    notes: "고위험 임신 관리 전문. 정밀 초음파 검사에 능통. 유전 상담 및 산전 검사 해석 전문가.",
  },
  {
    id: "6",
    name: "강동훈",
    rating: "C",
    experience_years: 8,
    hospital_id: "4",
    department_id: "7",
    email: "kang.dh@amc.seoul.kr",
    phone: "1688-7576",
    notes: "당뇨망막병증 및 황반변성 치료 전문. 망막 레이저 시술 경험 풍부. 친절한 진료로 환자 만족도 높음.",
  },
  {
    id: "7",
    name: "윤서연",
    rating: "A",
    experience_years: 16,
    hospital_id: "3",
    department_id: "8",
    email: "yoon.sy@samsung.com",
    phone: "02-3410-3001",
    notes: "갑상선암 및 후두암 수술 전문가. 음성 보존 수술 기법에 능통. 수술 후 재활 프로그램 운영.",
  },
  {
    id: "8",
    name: "임재현",
    rating: "B",
    experience_years: 9,
    hospital_id: "5",
    department_id: "9",
    email: "lim.jh@cmcseoul.or.kr",
    phone: "02-2258-6000",
    notes: "여드름 흉터 및 색소질환 레이저 치료 전문. 최신 레이저 장비 보유. 피부 타입별 맞춤 치료 제공.",
  },
  {
    id: "9",
    name: "송유진",
    rating: "A",
    experience_years: 14,
    hospital_id: "4",
    department_id: "10",
    email: "song.yj@amc.seoul.kr",
    phone: "1688-7577",
    notes: "심리치료와 약물치료를 병행하는 통합적 접근. 청소년 및 성인 우울증 전문. 인지행동치료 전문가.",
  },
  {
    id: "10",
    name: "한지훈",
    rating: "C",
    experience_years: 7,
    hospital_id: "5",
    department_id: "11",
    email: "han.jh@cmcseoul.or.kr",
    phone: "02-2258-6001",
    notes: "운동선수 재활 경험 풍부. 스포츠 손상 예방 프로그램 운영. 맞춤형 운동 처방 제공.",
  },
  {
    id: "11",
    name: "오세영",
    rating: "B",
    experience_years: 11,
    hospital_id: "1",
    department_id: "2",
    email: "oh.sy@snuh.org",
    phone: "02-2072-3458",
    notes: "중증 외상 환자 치료 전문. 응급 수술 경험 다수. 외상 후 합병증 관리에 능통.",
  },
  {
    id: "12",
    name: "안민지",
    rating: "D",
    experience_years: 5,
    hospital_id: "2",
    department_id: "12",
    email: "ahn.mj@yuhs.ac",
    phone: "02-2228-5902",
    notes: "응급실 근무 경험 풍부. 신속한 초기 처치에 능함. 환자 및 보호자 설명에 친절함.",
  },
  {
    id: "13",
    name: "배준호",
    rating: "A",
    experience_years: 19,
    hospital_id: "3",
    department_id: "3",
    email: "bae.jh@samsung.com",
    phone: "02-3410-3002",
    notes: "무릎 및 어깨 관절경 수술 최고 전문가. 스포츠 손상 치료 권위자. 빠른 회복을 위한 최소 침습 수술 전문.",
  },
  {
    id: "14",
    name: "서하늘",
    rating: "B",
    experience_years: 13,
    hospital_id: "4",
    department_id: "1",
    email: "seo.hn@amc.seoul.kr",
    phone: "1688-7578",
    notes: "내시경 검사 및 치료 전문. 조기 위암 내시경 절제술 경험 풍부. 역류성 식도염 치료에 탁월.",
  },
  {
    id: "15",
    name: "남궁민",
    rating: "C",
    experience_years: 6,
    hospital_id: "5",
    department_id: "5",
    email: "namgung.m@cmcseoul.or.kr",
    phone: "02-2258-6002",
    notes: "소아 알레르기 및 천식 관리 전문. 면역치료 경험 보유. 아토피 피부염 통합 관리 프로그램 운영.",
  },
]

// Helper function to get hospital by id
export function getHospitalById(id: string): Hospital | undefined {
  return hospitals.find((h) => h.id === id)
}

// Helper function to get department by id
export function getDepartmentById(id: string): Department | undefined {
  return departments.find((d) => d.id === id)
}

// Helper function to filter doctors
// Removed filterDoctors function since it's now in the component
