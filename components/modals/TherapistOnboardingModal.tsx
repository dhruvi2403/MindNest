
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useToast } from "../../src/hooks/use-toast"
import { Stethoscope, GraduationCap, MapPin, Award } from "lucide-react"

interface TherapistOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const specializations = [
  "Anxiety Disorders",
  "Depression",
  "Trauma and PTSD",
  "Cognitive Behavioral Therapy (CBT)",
  "Dialectical Behavior Therapy (DBT)",
  "Family Therapy",
  "Couples Counseling",
  "Addiction Counseling",
  "Eating Disorders",
  "ADHD",
  "Autism Spectrum Disorders",
  "Grief and Loss",
  "Stress Management",
  "Mindfulness-Based Therapy",
  "EMDR",
  "Group Therapy",
  "Child and Adolescent Therapy",
  "Geriatric Psychology",
]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function TherapistOnboardingModal({ isOpen, onClose, onComplete }: TherapistOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    specialization: [] as string[],
    bio: "",
    location: "",
    availability: [] as string[],
    licenseNumber: "",
    education: "",
    yearsOfPractice: "",
  })

  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        specialization: [...prev.specialization, specialization],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        specialization: prev.specialization.filter((s) => s !== specialization),
      }))
    }
  }

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        availability: [...prev.availability, day],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        availability: prev.availability.filter((d) => d !== day),
      }))
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/therapists/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to complete onboarding")
      }

      toast({
        title: "Profile Created Successfully!",
        description: "Your therapist profile has been submitted for verification.",
      })

      onComplete()
    } catch (error: any) {
      toast({
        title: "Onboarding Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isStep1Valid = formData.specialization.length > 0 && formData.bio.trim().length > 0
  const isStep2Valid = formData.location.trim().length > 0 && formData.availability.length > 0
  const isStep3Valid =
    formData.licenseNumber.trim().length > 0 &&
    formData.education.trim().length > 0 &&
    formData.yearsOfPractice.trim().length > 0

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-green-600" />
            <span>Complete Your Therapist Profile</span>
          </DialogTitle>
          <DialogDescription>
            Help us verify your credentials and create your professional profile. This information will be reviewed
            before your profile goes live.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: Specialization & Bio */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Professional Expertise</span>
              </CardTitle>
              <CardDescription>Tell us about your specializations and professional background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">Areas of Specialization</Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {specializations.map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={spec}
                        checked={formData.specialization.includes(spec)}
                        onCheckedChange={(checked) => handleSpecializationChange(spec, checked as boolean)}
                      />
                      <Label htmlFor={spec} className="text-sm cursor-pointer">
                        {spec}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-base font-medium">
                  Professional Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Describe your approach to therapy, experience, and what makes you unique as a therapist..."
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="min-h-32 mt-2"
                  maxLength={1000}
                />
                <p className="text-sm text-muted-foreground mt-1">{formData.bio.length}/1000 characters</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location & Availability */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Practice Details</span>
              </CardTitle>
              <CardDescription>Where do you practice and when are you available?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="location" className="text-base font-medium">
                  Practice Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, NY or Remote/Online"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Available Days</Label>
                <div className="grid grid-cols-2 gap-3">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.availability.includes(day)}
                        onCheckedChange={(checked) => handleAvailabilityChange(day, checked as boolean)}
                      />
                      <Label htmlFor={day} className="cursor-pointer">
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Credentials */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Professional Credentials</span>
              </CardTitle>
              <CardDescription>Verify your professional qualifications and licensing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="licenseNumber" className="text-base font-medium">
                  License Number
                </Label>
                <Input
                  id="licenseNumber"
                  placeholder="Enter your professional license number"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="education" className="text-base font-medium">
                  Education & Qualifications
                </Label>
                <Textarea
                  id="education"
                  placeholder="e.g., Ph.D. in Clinical Psychology, University of California, 2015"
                  value={formData.education}
                  onChange={(e) => setFormData((prev) => ({ ...prev, education: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="yearsOfPractice" className="text-base font-medium">
                  Years of Practice
                </Label>
                <Input
                  id="yearsOfPractice"
                  type="number"
                  placeholder="e.g., 8"
                  value={formData.yearsOfPractice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, yearsOfPractice: e.target.value }))}
                  className="mt-2"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid) ||
                  (currentStep === 3 && !isStep3Valid)
                }
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isStep3Valid || loading}>
                {loading ? "Submitting..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
