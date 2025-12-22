// Simple authentication for admin access
const ADMIN_PASSWORD = "jw19141935" // In production, this should be environment variable
const AUTH_EXPIRY_HOURS = 24 // Authentication expires after 24 hours

export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  
  const authToken = localStorage.getItem("admin_auth")
  const authTime = localStorage.getItem("admin_auth_time")
  
  if (!authToken || authToken !== "authenticated" || !authTime) {
    return false
  }
  
  // Check if authentication has expired
  const authTimestamp = parseInt(authTime, 10)
  const now = Date.now()
  const expiryTime = AUTH_EXPIRY_HOURS * 60 * 60 * 1000 // Convert hours to milliseconds
  
  if (now - authTimestamp > expiryTime) {
    // Authentication expired, clear it
    localStorage.removeItem("admin_auth")
    localStorage.removeItem("admin_auth_time")
    return false
  }
  
  return true
}

export function setAdminAuthentication(authenticated: boolean) {
  if (typeof window === "undefined") return
  if (authenticated) {
    localStorage.setItem("admin_auth", "authenticated")
    localStorage.setItem("admin_auth_time", Date.now().toString())
  } else {
    localStorage.removeItem("admin_auth")
    localStorage.removeItem("admin_auth_time")
  }
}
