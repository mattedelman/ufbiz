import { User, Target, Heart, Lightbulb, Users } from 'lucide-react'
import SEO from '../components/SEO'

function About() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To provide a centralized platform where UF business students can easily discover organizations, programs, events, and opportunities that align with their career goals."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We believe in the power of community and collaboration. UFbiz aims to connect students with like-minded peers and mentors."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Inspired by successful student-run platforms like UF CSU, we're bringing tech innovation to the business community at UF."
    },
    {
      icon: Heart,
      title: "Student-Built",
      description: "Created by students, for students. We understand your needs because we share them."
    }
  ]

  const features = [
    "Comprehensive directory of business-related organizations and programs",
    "Interactive events calendar with powerful filtering",
    "Detailed organization and program information with contact details",
    "Mobile-friendly, responsive design",
    "Regular updates on upcoming events and opportunities",
    "Fast, easy-to-use search and filter functionality"
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Person",
      "name": "Matthew Edelman",
      "jobTitle": "Creator & Developer",
      "description": "Computer Science and Business Administration student at the University of Florida, creator of UFbiz platform.",
      "affiliation": {
        "@type": "EducationalOrganization",
        "name": "University of Florida"
      },
      "sameAs": [
        "https://www.linkedin.com/in/matthewedelman1/"
      ],
      "knowsAbout": [
        "Business Technology",
        "Web Development",
        "Student Organizations",
        "Community Building"
      ]
    },
    "about": {
      "@type": "SoftwareApplication",
      "name": "UFbiz",
      "applicationCategory": "Educational Platform",
      "description": "A comprehensive platform connecting University of Florida business students with organizations, programs, and events.",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="About UFbiz"
        description="Learn about UFbiz, a comprehensive platform connecting University of Florida business students with organizations, programs, and events. Created by students, for students."
        keywords="UFbiz about, UF business platform, UF student resources, University of Florida business community, Matthew Edelman"
        canonical="/about"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 border border-white rounded-full"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <span className="text-sm font-semibold text-white">Built by students, for students</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
            About
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
            Learn about UFbiz and how it helps UF students connect with the business community
          </p>
        </div>
      </div>

      {/* Story Section - Two Column Layout */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Our Story */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  UFbiz was founded in November 2025 by <span className="font-semibold text-uf-blue">Matthew Edelman</span>, a Computer Science and Business Administration student at the University of Florida.
                </p>
                <p>
                  Recognizing the need for a centralized platform to connect business students, Matthew was inspired to create a comprehensive resource for the business community at UF.
                </p>
                <p>
                  As someone interested in both tech and business, Matthew noticed that while there were many great business organizations and programs on campus, there wasn't a centralized place to discover them all. UFbiz was born to solve this problem.
                </p>
                <p>
                  Today, UFbiz serves as a go-to resource for business students looking to get involved, network, and build their professional skills at UF.
                </p>
              </div>
            </div>

            {/* Right Column - Profile Card */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <img 
                    src="https://media.licdn.com/dms/image/v2/D4E03AQEbgj0OkCWGDQ/profile-displayphoto-shrink_800_800/B4EZXt2yYvGYAc-/0/1743452319123?e=1764201600&v=beta&t=LoW3jHgoKlh275SEskfg_NGTHbjDpQ0_L0kkIkLCJ18"
                    alt="Matthew Edelman"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md mb-6"
                  />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Matthew Edelman</h3>
                  <p className="text-gray-600 mb-6">Creator & Developer</p>
                  
                  <a 
                    href="https://www.linkedin.com/in/matthewedelman1/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-uf-blue hover:text-blue-700 transition-colors font-medium"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* CTA Section - Compact */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Questions or want to contribute?
          </h2>
          <p className="text-gray-600 mb-6">
            Reach out at <a href="mailto:edelmanm@ufl.edu" className="text-uf-blue hover:text-blue-700 font-medium">edelmanm@ufl.edu</a>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/clubs" className="inline-flex items-center justify-center px-6 py-3 bg-uf-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
              Browse Organizations & Programs
            </a>
            <a href="/events" className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-uf-orange hover:text-uf-orange transition-all">
              View Events
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

