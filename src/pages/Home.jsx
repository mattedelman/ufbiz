import { Link } from 'react-router-dom'
import { Calendar, Users, TrendingUp, HelpCircle, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { clubs } from '../data/clubs'
import SEO from '../components/SEO'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What is UFbiz?",
      answer: "UFbiz is a student-built hub for business-related organizations, programs, and events at the University of Florida. It helps you discover clubs, track events, and plug into the business community on campus."
    },
    {
      question: "How do I join a club?",
      answer: "Each club has contact information listed on its profile page. You can reach out via email or visit their website to learn about membership requirements, interest forms, and meeting times."
    },
    {
      question: "Are the events free to attend?",
      answer: "Most events are free for UF students, though some may require RSVP or have limited capacity. Check the event details for information about registration, deadlines, and any fees."
    },
    {
      question: "How do I add my club or event?",
      answer: "If you'd like to add your business club or event to UFbiz, contact us through the About page. We're always looking to expand the directory with new organizations and opportunities."
    },
    {
      question: "Is UFbiz only for business majors?",
      answer: "No. UFbiz is open to all UF students interested in business, regardless of major. Many clubs welcome students from a wide range of academic backgrounds."
    }
  ]

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">{faq.question}</span>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 transition-transform flex-shrink-0 ml-4 ${
                openIndex === index ? 'transform rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function RotatingMajor() {
  const majors = [
    "Business Administration",
    "Accounting",
    "Finance",
    "Information Systems",
    "Marketing",
    "Advertising",
    "Business Management",
    "Non-Business"
  ]
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % majors.length)
        setFade(true)
      }, 300)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className={`font-bold text-uf-orange transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
      style={{ display: 'inline-block' }}
    >
      {majors[currentIndex]}
    </span>
  )
}

function Home() {
  const features = [
    {
      icon: Users,
      title: "Discover Clubs",
      description: "Explore 50+ business organizations and programs tailored to your interests and career goals."
    },
    {
      icon: Calendar,
      title: "Find Events",
      description: "Stay updated with workshops, networking events, and competitions happening on campus."
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Connect with industry professionals and gain valuable experience for your future career."
    }
  ]

  return (
    <div>
      <SEO 
        title="Business Resources at UF"
        description="Discover 50+ business organizations, programs, and events at the University of Florida. Connect with the UF business community, find networking opportunities, and grow your career."
        keywords="UF business, University of Florida business organizations, UF business clubs, UF business events, UF networking, UF career resources"
        canonical="/"
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-uf-blue via-blue-700 to-uf-orange text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your gateway to business at <span className="text-uf-orange">UF</span>
            </h1>
            <div className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              <p className="mb-2">
                All your UF business clubs, programs, and events in one place.
              </p>
              <p className="flex items-center justify-center gap-2 flex-wrap">
                <span>for</span>
                <RotatingMajor />
                <span>students</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/clubs" className="btn-primary inline-block">
                Explore Organizations & Programs
              </Link>
              <Link to="/events" className="bg-white text-uf-blue hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-colors duration-200 inline-block">
                View Events Calendar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations & Programs Info Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              50+ <span className="text-uf-blue">Organizations</span> & <span className="text-uf-orange">Programs</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our directory includes a diverse mix of student-run clubs and official School of Business programs, all designed to help you grow professionally and connect with the business community at UF.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Student Clubs & Organizations</h3>
              <p className="text-gray-600 mb-3">
                Join student-run clubs focused on specific industries, career paths, or interests. Some clubs require an application process, while others welcome all interested students.
              </p>
              <p className="text-sm text-gray-500">
                Examples: Finance clubs, consulting societies, marketing organizations, entrepreneurship groups
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">School of Business Programs</h3>
              <p className="text-gray-600 mb-3">
                Official programs and initiatives directly hosted by the UF Warrington College of Business. These programs provide structured learning opportunities and professional development.
              </p>
              <p className="text-sm text-gray-500">
                Examples: Leadership programs, certificate programs, professional development initiatives
              </p>
            </div>
          </div>

          {/* Club Logos - Integrated into this section */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <p className="text-gray-600 font-medium">Explore some of our featured organizations</p>
            </div>
            <div className="relative overflow-hidden">
              <div className="flex gap-8 animate-scroll">
                {(() => {
                  const clubsWithImages = clubs.filter(club => club.image && club.image.trim() !== '')
                  const duplicatedClubs = [...clubsWithImages, ...clubsWithImages]
                  return duplicatedClubs.map((club, index) => (
                    <div
                      key={`${club.id}-${index}`}
                      className="flex-shrink-0 w-28 h-28 rounded-full hover:scale-110 transition-transform duration-300 cursor-pointer"
                      title={club.name}
                    >
                      <img
                        src={club.image}
                        alt={club.name}
                        className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-uf-blue">UF</span><span className="text-uf-orange">biz</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in business at UF, all in one place
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-uf-orange/10 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-uf-orange" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-uf-orange/10 rounded-full mb-4">
              <HelpCircle className="h-8 w-8 text-uf-orange" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about <span className="text-uf-blue font-semibold">UF</span><span className="text-uf-orange font-semibold">biz</span>
            </p>
          </div>
          <FAQ />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Community at UF
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect with business-minded students across campus and start building your network today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/clubs" className="btn-primary inline-block">
              Explore Organizations
            </Link>
            <Link to="/events" className="btn-secondary inline-block">
              View Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

