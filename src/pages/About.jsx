import { User, Target, Heart, Lightbulb, Users } from 'lucide-react'

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
    "Interactive events calendar with filtering",
    "Detailed organization and program information and contact details",
    "Mobile-friendly responsive design",
    "Regular updates on upcoming events",
    "Easy-to-use search and filter functionality"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-uf-blue via-blue-700 to-uf-orange text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About UFbiz</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Connecting business students at the University of Florida with opportunities, resources, and community
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  UFbiz was founded in November 2025 by <span className="font-semibold text-uf-blue">Matthew Edelman</span>, 
                  a Computer Science and Business Administration student at the University of Florida .
                </p>
                <p>
                  After seeing the success of <span className="font-semibold">UF CSU</span> (UF Computing Student Union) 
                  in bringing together CS students, Matthew was inspired to create a similar resource for the business community at UF.
                </p>
                <p>
                  As someone interested in both tech and business, Matthew noticed that while there were many great 
                  business organizations and programs on campus, there wasn't a centralized place to discover them all. UFbiz was 
                  born to solve this problem.
                </p>
                <p>
                  Today, UFbiz serves as the go-to resource for business students looking to get involved, network, 
                  and build their professional skills at UF.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <img 
                  src="https://media.licdn.com/dms/image/v2/D4E03AQEbgj0OkCWGDQ/profile-displayphoto-shrink_800_800/B4EZXt2yYvGYAc-/0/1743452319123?e=1764201600&v=beta&t=LoW3jHgoKlh275SEskfg_NGTHbjDpQ0_L0kkIkLCJ18"
                  alt="Matthew Edelman"
                  className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-uf-orange"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Matthew Edelman</h3>
                  <p className="text-gray-600">Founder & Developer</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                "After trying to become more involved on campus with business clubs, I didn't have the best resources 
                and wanted to create something like UF CSU for business students."
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://www.linkedin.com/in/matthewedelman1/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-uf-blue hover:text-blue-700 transition-colors"
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

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at UFbiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-uf-orange/10 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-uf-orange" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What We Offer
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                UFbiz provides everything you need to connect with the business community at UF:
              </p>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-uf-orange rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h4 className="font-semibold text-gray-900 mb-2">50+ Organizations & Programs</h4>
                <p className="text-sm text-gray-600">From finance to marketing to entrepreneurship</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <Users className="h-10 w-10 text-uf-blue mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Active Community</h4>
                <p className="text-sm text-gray-600">500+ engaged business students</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <Target className="h-10 w-10 text-uf-orange mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">50+ Events</h4>
                <p className="text-sm text-gray-600">Workshops, panels, and networking</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <Lightbulb className="h-10 w-10 text-uf-blue mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Always Growing</h4>
                <p className="text-sm text-gray-600">New features and organizations added regularly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspiration Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-uf-blue to-blue-700 rounded-2xl p-8 md:p-12 text-white">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Inspired by UF CSU</h2>
              <p className="text-lg text-blue-100 mb-6">
                UFbiz takes inspiration from the UF Computing Student Union (UF CSU), which has successfully 
                built an amazing community for CS students at UF. Just as UF CSU provides resources, events, and 
                connections for computer science students, UFbiz aims to do the same for the business community.
              </p>
              <a 
                href="https://ufcsu.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-uf-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Visit UF CSU
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Involved?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore organizations, programs, and events, or reach out if you have questions or want to contribute!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/clubs" className="btn-primary inline-block">
              Browse Organizations & Programs
            </a>
            <a href="/events" className="btn-secondary inline-block">
              View Events
            </a>
            <a 
              href="mailto:contact@ufbiz.com" 
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-colors duration-200 inline-block"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

