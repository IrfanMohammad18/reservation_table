import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card/30 to-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(2,132,199,0.1),transparent_50%)]"></div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="mb-6">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TableBook
            </h1>
            <div className="w-20 h-1 gradient-primary mx-auto mt-3 rounded-full"></div>
          </div>
          <p className="text-muted-foreground text-xl font-semibold">Restaurant Reservation System</p>
          <p className="text-muted-foreground/80 mt-2 text-lg">Create your account to get started</p>
        </div>

        <div className="gradient-card backdrop-blur-md rounded-3xl shadow-2xl border border-border/20 p-10">
          <RegisterForm />
        </div>

        <div className="text-center mt-8 text-muted-foreground/60 font-medium">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Secure</span>
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Reliable</span>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Professional</span>
          </div>
        </div>
      </div>
    </div>
  )
}
