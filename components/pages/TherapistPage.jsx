"use client"

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
import Navbar from "@/components/layout/Navbar"
import { Search, MapPin, Star, Calendar, Clock, Filter, Users, Award, MessageCircle } from "lucide-react"

export default function TherapistPage() {
  const [therapists, setTherapists] = useState([])
  const [filteredTherapists, setFilteredTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [selectedTherapist, setSelectedTherapist] = useState(null)
  const { toast } = useToast()

  const specializations = [
    "Anxiety",
    "Depression",
    "Stress Management",
    "Trauma",
    "Family Therapy",
    "Relationship Counseling",
    "Addiction",
    "PTSD",
    "Mindfulness",
    "Cognitive Behavioral Therapy",
  ]

  const locations = ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Austin, TX", "Seattle, WA", "Denver, CO"]

  useEffect(() => {
    fetchTherapists()
  }, [])

  useEffect(() => {
    filterAndSortTherapists()
  }, [therapists, searchTerm, selectedSpecialization, selectedLocation, sortBy])

  const fetchTherapists = async () => {
    try {
      const response = await fetch("/api/therapists", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch therapists")
      }

      const data = await response.json()
      setTherapists(data.therapists)
    } catch (error) {
      // Mock data for demo
      const mockTherapists = [
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
      setTherapists(mockTherapists)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortTherapists = () => {
    const filtered = therapists.filter((therapist) => {
      const matchesSearch =
        therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.specialization.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
        therapist.bio.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSpecialization =
        selectedSpecialization === "all" ||
        therapist.specialization.some((spec) => spec.toLowerCase().includes(selectedSpecialization.toLowerCase()))

      const matchesLocation = selectedLocation === "all" || therapist.location === selectedLocation

      return matchesSearch && matchesSpecialization && matchesLocation
    })

    // Sort therapists
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "experience":
          return b.experience - a.experience
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredTherapists(filtered)
  }

  const handleBookAppointment = (therapist) => {
    toast({
      title: "Booking Request Sent",
      description: `Your appointment request with ${therapist.name} has been sent. They will contact you within 24 hours.`,
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
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}

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
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  {locations.map((location) => (
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredTherapists.length} of {therapists.length} therapists
          </p>
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
      </div>
    </div>
  )
}
