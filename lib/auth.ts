// Simple authentication for admin access
const ADMIN_PASSWORD = "jw19141935" // In production, this should be environment variable

export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  const authToken = localStorage.getItem("admin_auth")
  return authToken === "authenticated"
}

export function setAdminAuthentication(authenticated: boolean) {
  if (typeof window === "undefined") return
  if (authenticated) {
    localStorage.setItem("admin_auth", "authenticated")
  } else {
    localStorage.removeItem("admin_auth")
  }
}
