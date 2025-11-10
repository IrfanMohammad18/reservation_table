export type UserRole = "customer" | "manager" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  restaurantId?: string // For managers
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@restaurant.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
  },
  {
    id: "2",
    email: "manager@restaurant.com",
    name: "Restaurant Manager",
    role: "manager",
    restaurantId: "rest-1",
    createdAt: new Date(),
  },
  {
    id: "3",
    email: "customer@example.com",
    name: "John Doe",
    role: "customer",
    createdAt: new Date(),
  },
]

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    this.currentUser = user
    localStorage.setItem("auth_user", JSON.stringify(user))
    return user
  }

  async register(email: string, password: string, name: string, role: UserRole = "customer"): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date(),
    }

    mockUsers.push(newUser)
    return newUser
  }

  async logout(): Promise<void> {
    this.currentUser = null
    localStorage.removeItem("auth_user")
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser

    const stored = localStorage.getItem("auth_user")
    if (stored) {
      this.currentUser = JSON.parse(stored)
    }
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }
}
