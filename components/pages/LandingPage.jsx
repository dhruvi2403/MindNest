import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// import Navbar from "@/components/layout/Navbar"
import { Brain, Shield, Users, Star, ArrowRight } from "lucide-react"

export default function LandingPage() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Professional",
      content:
        "MindNest helped me understand my anxiety patterns and connect with the right therapist. The assessment was incredibly insightful.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Software Developer",
      content:
        "The platform's approach to mental health is refreshing. The ML predictions gave me clarity about my mental state.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Teacher",
      content: "Finding a therapist through MindNest was seamless. The matching system really works!",
      rating: 5,
    },
  ]

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Assessment",
      description:
        "Advanced machine learning algorithms analyze your responses to provide personalized mental health insights.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected. We prioritize your privacy and confidentiality above all.",
    },
    {
      icon: Users,
      title: "Expert Therapists",
      description: "Connect with verified, licensed therapists who specialize in your specific needs and concerns.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Journey to
            <span className="text-primary block">Mental Wellness</span>
            Starts Here
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            MindNest combines cutting-edge AI technology with expert human care to provide personalized mental health
            insights and connect you with the right therapist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link to="/signup">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3 bg-transparent">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose MindNest?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine technology and human expertise to provide comprehensive mental health support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-white to-blue-50">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How MindNest Works</h2>
            <p className="text-xl text-gray-600">Simple steps to better mental health</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Sign Up", description: "Create your secure account in minutes", icon: "🚀" },
              {
                step: "2",
                title: "Take Assessment",
                description: "Complete our comprehensive mental health questionnaire",
                icon: "📋"
              },
              {
                step: "3",
                title: "Get Insights",
                description: "Receive AI-powered analysis of your mental health status",
                icon: "🧠"
              },
              {
                step: "4",
                title: "Find Support",
                description: "Connect with therapists matched to your specific needs",
                icon: "🤝"
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-primary rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real stories from people who found help through MindNest</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Mental Health Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have found clarity and support through MindNest.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
            <Link to="/signup">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8" />
                <span className="text-xl font-bold">MindNest</span>
              </div>
              <p className="text-gray-400">Empowering mental wellness through technology and human connection.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/assessment" className="hover:text-white">
                    Assessment
                  </Link>
                </li>
                <li>
                  <Link to="/therapists" className="hover:text-white">
                    Find Therapists
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MindNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
