import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { useToast } from "../../src/hooks/use-toast"
import { X, Stethoscope, GraduationCap, MapPin, Clock } from "lucide-react"

export default function TherapistOnboardingModal({ isOpen, onClose, onComplete }) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    specialization: [],
    bio: "",
    location: "",
    availability: [],
    licenseNumber: "",
    education: "",
    yearsOfPractice: "",
  })

  const specializations = [
    "Anxiety Disorders",
    "Depression",
    "Trauma & PTSD",
    "Relationship Issues",
    "Addiction",
    "Eating Disorders",
    "OCD",
    "Bipolar Disorder",
    "Grief & Loss",
    "Stress Management",
    "Career Counseling",
    "Family Therapy",
    "Child & Adolescent",
    "Couples Therapy",
    "Group Therapy",
  ]

  const availabilityOptions = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecializationChange = (specialization) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(specialization)
        ? prev.specialization.filter(s => s !== specialization)
        : [...prev.specialization, specialization]
    }))
  }

  const handleAvailabilityChange = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.specialization.length > 0 && formData.bio.trim() !== ""
      case 2:
        return formData.location.trim() !== "" && formData.availability.length > 0
      case 3:
        return formData.licenseNumber.trim() !== "" && formData.education.trim() !== "" && formData.yearsOfPractice !== ""
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    } else {
      toast({
        title: "Please complete all required fields",
        description: "All fields marked with * are required to continue.",
        variant: "destructive",
      })
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please complete all required fields",
        description: "All fields marked with * are required to continue.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/therapists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Profile submitted successfully!",
          description: "Your profile is under review. You'll be notified once it's approved.",
        })
        onComplete()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit profile")
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Complete Your Therapist Profile</h2>
              <p className="text-sm text-gray-600">Step {currentStep} of 3</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Professional Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tell us about your expertise and background to help clients find the right therapist.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Specializations * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {specializations.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={spec}
                          checked={formData.specialization.includes(spec)}
                          onCheckedChange={() => handleSpecializationChange(spec)}
                        />
                        <Label htmlFor={spec} className="text-sm cursor-pointer">
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Professional Bio * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Describe your approach, experience, and how you help clients
                  </p>
                  <Textarea
                    id="bio"
                    placeholder="I am a licensed therapist with expertise in..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Location & Availability</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Help clients understand where you practice and when you're available.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">
                    Practice Location * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">City, State or Remote</p>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY or Remote"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Available Days * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Select the days you're available for sessions</p>
                  <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
                    {availabilityOptions.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.availability.includes(day)}
                          onCheckedChange={() => handleAvailabilityChange(day)}
                        />
                        <Label htmlFor={day} className="text-sm cursor-pointer">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Credentials & Experience</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Verify your professional qualifications and experience.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="licenseNumber" className="text-sm font-medium">
                    License Number * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Your professional license number</p>
                  <Input
                    id="licenseNumber"
                    placeholder="e.g., LCSW12345"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="education" className="text-sm font-medium">
                    Education * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Your highest degree and institution</p>
                  <Input
                    id="education"
                    placeholder="e.g., Master's in Social Work, NYU"
                    value={formData.education}
                    onChange={(e) => handleInputChange("education", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="yearsOfPractice" className="text-sm font-medium">
                    Years of Practice * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">How long you've been practicing</p>
                  <Select
                    value={formData.yearsOfPractice}
                    onValueChange={(value) => handleInputChange("yearsOfPractice", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select years of practice" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, "20+"].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year === "20+" ? "20+ years" : `${year} year${year === 1 ? "" : "s"}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit Profile"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
