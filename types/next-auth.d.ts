import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: string
      image?: string | null
      subjects: string[]
      classes: string[]
    }
  }

  interface User {
    id: string
    email: string
    name: string | null
    role: string
    subjects: string[]
    classes: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    subjects: string[]
    classes: string[]
  }
}
