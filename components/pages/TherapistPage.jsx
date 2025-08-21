import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, MapPin, Star, Calendar, Clock, Filter, Users, Award, MessageCircle } from "lucide-react"
import AppointmentBookingModal from "../modals/AppointmentBookingModal"

export default function TherapistPage() {
  const [therapists, setTherapists] = useState([])
  const [filteredTherapists, setFilteredTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")
  const [selectedRating, setSelectedRating] = useState("all")
  const [selectedExperience, setSelectedExperience] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [selectedTherapist, setSelectedTherapist] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingTherapist, setBookingTherapist] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

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
    "Mindfulness",
    "Cognitive Behavioral Therapy",
  ]

  const availabilityOptions = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ]

  const ratingOptions = [
    { value: "4.5", label: "4.5+ Stars" },
    { value: "4.0", label: "4.0+ Stars" },
    { value: "3.5", label: "3.5+ Stars" },
    { value: "3.0", label: "3.0+ Stars" },
  ]

  const experienceOptions = [
    { value: "10", label: "10+ Years" },
    { value: "5", label: "5+ Years" },
    { value: "2", label: "2+ Years" },
    { value: "1", label: "1+ Years" },
  ]

  useEffect(() => {
    fetchTherapists()
  }, [])

  useEffect(() => {
    filterAndSortTherapists()
  }, [therapists, searchTerm, selectedSpecialization, selectedLocation, selectedAvailability, selectedRating, selectedExperience, sortBy])

  const fetchTherapists = async () => {
    try {
      const response = await fetch("/api/therapists", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Normalize therapist data from API - data is directly the therapists array
        const normalizedTherapists = Array.isArray(data) ? data.map(normalizeTherapist) : []
        setTherapists(normalizedTherapists)
      } else {
        throw new Error("Failed to fetch therapists")
      }
    } catch (error) {
      console.error("Error fetching therapists:", error)
      // Fallback to static data if API fails
      setTherapists(getStaticTherapists())
      toast({
        title: "Using Demo Data",
        description: "Showing sample therapists while we connect to the database.",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }

  const normalizeTherapist = (t) => ({
    id: t.id ?? t._id ?? crypto.randomUUID(),
    name: t.userId?.name || t.name || "Therapist",
    bio: t.bio ?? "",
    location: t.location ?? "—",
    rating: Number.isFinite(+t.rating) ? +t.rating : 4.5,
    experience: Number.isFinite(+t.experience) ? +t.experience : 5,
    profileImage: t.profileImage ?? "/placeholder.svg",
    verified: Boolean(t.verified),
    specialization: Array.isArray(t.specialization)
      ? t.specialization
      : typeof t.specializations === "string"
        ? t.specializations.split(",").map(s => s.trim()).filter(Boolean)
        : Array.isArray(t.specializations)
          ? t.specializations
          : ["General Therapy"],
    availability: Array.isArray(t.availability) ? t.availability : ["Monday", "Wednesday", "Friday"],
  })

  const getStaticTherapists = () => [
    {
      id: "1",
      name: "Dr. Sarah Wilson",
      specialization: ["Anxiety", "Depression", "Cognitive Behavioral Therapy"],
      bio: "Licensed clinical psychologist with 8 years of experience specializing in anxiety and mood disorders. I use evidence-based approaches including CBT and mindfulness techniques.",
      experience: 8,
      rating: 4.9,
      location: "New York, NY",
      availability: ["Monday", "Wednesday", "Friday"],
      profileImage: "/professional-therapist-woman.png",
      verified: true,
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialization: ["Stress Management", "Trauma", "EMDR"],
      bio: "Trauma specialist with expertise in EMDR therapy and stress management techniques. Helping clients heal from traumatic experiences and build resilience.",
      experience: 12,
      rating: 4.8,
      location: "Los Angeles, CA",
      availability: ["Tuesday", "Thursday", "Saturday"],
      profileImage: "/professional-therapist-man.png",
      verified: true,
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialization: ["Family Therapy", "Relationship Counseling", "Depression"],
      bio: "Family and couples therapist helping individuals and families build stronger relationships and overcome communication challenges.",
      experience: 6,
      rating: 4.7,
      location: "Chicago, IL",
      availability: ["Monday", "Tuesday", "Thursday"],
      profileImage: "/hispanic-therapist.png",
      verified: true,
    },
    {
      id: "4",
      name: "Dr. James Thompson",
      specialization: ["Addiction", "Behavioral Therapy", "Group Therapy"],
      bio: "Addiction specialist with extensive experience in behavioral therapy and group counseling. Supporting clients in recovery and building healthy coping mechanisms.",
      experience: 15,
      rating: 4.9,
      location: "Austin, TX",
      availability: ["Wednesday", "Friday", "Saturday"],
      profileImage: "/older-male-therapist.png",
      verified: true,
    },
    {
      id: "5",
      name: "Dr. Lisa Park",
      specialization: ["Mindfulness", "Meditation", "Stress Reduction"],
      bio: "Mindfulness-based therapist integrating meditation and stress reduction techniques. Helping clients find inner peace and emotional balance.",
      experience: 10,
      rating: 4.8,
      location: "Seattle, WA",
      availability: ["Monday", "Wednesday", "Friday", "Sunday"],
      profileImage: "/asian-woman-therapist.png",
      verified: true,
    },
    {
      id: "6",
      name: "Dr. Robert Martinez",
      specialization: ["PTSD", "Veterans Counseling", "Crisis Intervention"],
      bio: "Specialized in working with veterans and first responders dealing with PTSD and trauma. Providing compassionate care for those who serve.",
      experience: 14,
      rating: 4.9,
      location: "Denver, CO",
      availability: ["Tuesday", "Thursday", "Saturday"],
      profileImage: "/latino-therapist.png",
      verified: true,
    },
  ]

  const filterAndSortTherapists = () => {
    const q = (searchTerm || "").toLowerCase()

    const filtered = (therapists || []).filter((therapist) => {
      const name = (therapist.name || "").toLowerCase()
      const bio = (therapist.bio || "").toLowerCase()
      const specs = Array.isArray(therapist.specialization) ? therapist.specialization : []
      const loc = therapist.location || "—"
      const availability = Array.isArray(therapist.availability) ? therapist.availability : []
      const rating = therapist.rating ?? 0
      const experience = therapist.experience ?? therapist.yearsOfPractice ?? 0

      const matchesSearch =
        name.includes(q) ||
        specs.some((s) => (s || "").toLowerCase().includes(q)) ||
        bio.includes(q) ||
        loc.toLowerCase().includes(q)

      const matchesSpecialization =
        selectedSpecialization === "all" ||
        specs.some((s) =>
          (s || "").toLowerCase().includes((selectedSpecialization || "").toLowerCase())
        )

      const matchesLocation =
        selectedLocation === "all" ||
        loc.toLowerCase().includes((selectedLocation || "").toLowerCase())

      const matchesAvailability =
        selectedAvailability === "all" ||
        availability.includes(selectedAvailability)

      const matchesRating =
        selectedRating === "all" ||
        rating >= parseFloat(selectedRating)

      const matchesExperience =
        selectedExperience === "all" ||
        parseFloat(experience) >= parseFloat(selectedExperience)

      return matchesSearch && matchesSpecialization && matchesLocation &&
             matchesAvailability && matchesRating && matchesExperience
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0)
        case "experience":
          return (parseFloat(b.experience ?? b.yearsOfPractice ?? 0)) - (parseFloat(a.experience ?? a.yearsOfPractice ?? 0))
        case "name":
          return (a.name || "").localeCompare(b.name || "")
        case "location":
          return (a.location || "").localeCompare(b.location || "")
        default:
          return 0
      }
    })

    setFilteredTherapists(filtered)
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedSpecialization("all")
    setSelectedLocation("all")
    setSelectedAvailability("all")
    setSelectedRating("all")
    setSelectedExperience("all")
    setSortBy("rating")
  }

  const getUniqueLocations = () => {
    const locations = [...new Set(therapists.map(t => t.location).filter(Boolean))]
    return locations.sort()
  }

  const handleBookAppointment = (therapist) => {
    setBookingTherapist(therapist)
    setShowBookingModal(true)
  }

  const handleBookingComplete = (appointment) => {
    // Refresh therapists data to show updated availability
    fetchTherapists()
    toast({
      title: "Appointment Booked Successfully!",
      description: `Your appointment has been scheduled. You can view it in your dashboard.`,
    })
  }

  const handleSendMessage = (therapist) => {
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${therapist.name}. They will respond within 24 hours.`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Therapist</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with verified, licensed mental health professionals who specialize in your specific needs.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Search & Filter</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'More Filters'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Basic Filters - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search therapists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Specialization Filter */}
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec.toLowerCase()}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {getUniqueLocations().map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Availability Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Available Days</label>
                    <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Day</SelectItem>
                        {availabilityOptions.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Minimum Rating</label>
                    <Select value={selectedRating} onValueChange={setSelectedRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        {ratingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Experience Level</label>
                    <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Experience</SelectItem>
                        {experienceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredTherapists.length} of {therapists.length} therapists
            </p>

            {/* Active Filters */}
            <div className="flex items-center space-x-2">
              {(searchTerm || selectedSpecialization !== "all" || selectedLocation !== "all" ||
                selectedAvailability !== "all" || selectedRating !== "all" || selectedExperience !== "all") && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedSpecialization !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedSpecialization}
                    </Badge>
                  )}
                  {selectedLocation !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedLocation}
                    </Badge>
                  )}
                  {selectedAvailability !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedAvailability}
                    </Badge>
                  )}
                  {selectedRating !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {ratingOptions.find(r => r.value === selectedRating)?.label}
                    </Badge>
                  )}
                  {selectedExperience !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {experienceOptions.find(e => e.value === selectedExperience)?.label}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Therapist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist) => (
            <Card key={therapist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={therapist.profileImage || "/placeholder.svg"}
                    alt={therapist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{therapist.name}</CardTitle>
                      {therapist.verified && <Award className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{therapist.rating}</span>
                      <span className="text-sm text-gray-500">• {therapist.experience} years exp.</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{therapist.location}</span>
                </div>

                {/* Specializations */}
                <div>
                  <div className="flex flex-wrap gap-1">
                    {therapist.specialization.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {therapist.specialization.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{therapist.specialization.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bio Preview */}
                <p className="text-sm text-gray-600 line-clamp-3">{therapist.bio}</p>

                {/* Availability */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Available: {therapist.availability.join(", ")}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => setSelectedTherapist(therapist)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <img
                            src={therapist.profileImage || "/placeholder.svg"}
                            alt={therapist.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span>{therapist.name}</span>
                              {therapist.verified && <Award className="h-4 w-4 text-blue-500" />}
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>
                                {therapist.rating} • {therapist.experience} years experience
                              </span>
                            </div>
                          </div>
                        </DialogTitle>
                        <DialogDescription asChild>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">About</h4>
                              <p className="text-sm text-gray-600">{therapist.bio}</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Specializations</h4>
                              <div className="flex flex-wrap gap-2">
                                {therapist.specialization.map((spec) => (
                                  <Badge key={spec} variant="secondary">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Location & Availability</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{therapist.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>Available: {therapist.availability.join(", ")}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                              <Button onClick={() => handleBookAppointment(therapist)} className="flex-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                Book Appointment
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleSendMessage(therapist)}
                                className="flex-1 bg-transparent"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Send Message
                              </Button>
                            </div>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" onClick={() => handleBookAppointment(therapist)} className="flex-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTherapists.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedSpecialization("all")
                setSelectedLocation("all")
              }}
              className="bg-transparent"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Appointment Booking Modal */}
        {showBookingModal && bookingTherapist && (
          <AppointmentBookingModal
            isOpen={showBookingModal}
            therapist={bookingTherapist}
            onClose={() => setShowBookingModal(false)}
            onBookingComplete={handleBookingComplete}
          />
        )}
      </div>
    </div>
  )
}
