import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Brain, Eye, EyeOff, User, Stethoscope } from "lucide-react"
import TherapistOnboardingModal from "../modals/TherapistOnboardingModal"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("client")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [errors, setErrors] = useState({})
  const { signup } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const validateName = (name) => {
    return name.trim().length >= 2
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateName(name)) {
      newErrors.name = "Name must be at least 2 characters long"
    }

    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    if (!agreeToTerms) {
      newErrors.terms = "Please agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const userData = await signup(name, email, password, role)
      toast({
        title: "Welcome to MindNest!",
        description: `Your ${role} account has been created successfully.`,
      })

      // If therapist, show onboarding modal immediately and don't redirect
      if (role === "therapist") {
        console.log("Therapist signup detected, showing onboarding modal");
        setShowOnboarding(true)
        // Don't navigate yet - wait for onboarding completion
      } else {
        // If client, redirect to dashboard
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("Signup error:", error)
      // Show error message under the form
      setErrors({
        general: error.message || "Signup failed. Please try again or contact support."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Brain className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-primary">MindNest</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>Join MindNest and start your mental wellness journey today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">I am joining as a:</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value)}>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="client" id="client" />
                    <User className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <Label htmlFor="client" className="font-medium cursor-pointer">
                        Client
                      </Label>
                      <p className="text-sm text-muted-foreground">Seeking mental health support and resources</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="therapist" id="therapist" />
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <Label htmlFor="therapist" className="font-medium cursor-pointer">
                        Therapist
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Licensed professional providing mental health services
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: "" }))
                    }
                  }}
                  className={errors.name ? "border-red-500" : ""}
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: "" }))
                    }
                  }}
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: "" }))
                      }
                    }}
                    className={errors.password ? "border-red-500" : ""}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: "" }))
                      }
                    }}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => {
                      setAgreeToTerms(checked)
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: "" }))
                      }
                    }}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Link to="#" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="#" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-500">{errors.terms}</p>
                )}
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : `Create ${role === "client" ? "Client" : "Therapist"} Account`}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Therapist Onboarding Modal */}
      {showOnboarding && (
        <TherapistOnboardingModal
          isOpen={showOnboarding}
          onComplete={() => {
            setShowOnboarding(false)
            navigate("/therapist-dashboard")
          }}
        />
      )}
    </div>
  )
}
