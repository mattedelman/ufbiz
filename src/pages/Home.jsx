import { Link } from 'react-router-dom'
import { Calendar, Users, TrendingUp, HelpCircle, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { clubs } from '../data/clubs'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What is UFbiz?",
      answer: "UFbiz is a comprehensive resource platform for business-related organizations, programs, and events at the University of Florida. It helps students discover organizations, programs, find events, and connect with the business community on campus."
    },
    {
      question: "How do I join a club?",
      answer: "Each club has contact information listed on their profile page. You can reach out via email or visit their website to learn about membership requirements and meeting times."
    },
    {
      question: "Are the events free to attend?",
      answer: "Most events are free for UF students, though some may require RSVP or have limited capacity. Check the event details for specific information about registration and any fees."
    },
    {
      question: "How do I add my club or event?",
      answer: "If you'd like to add your business club or event to UFbiz, please contact us through the About page. We're always looking to expand our directory!"
    },
    {
      question: "Is UFbiz only for business majors?",
      answer: "No! UFbiz is open to all UF students interested in business, regardless of major. Many clubs welcome students from various academic backgrounds."
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

function ClubLogosAnimation() {
  // Filter clubs that have images
  const clubsWithImages = clubs.filter(club => club.image && club.image.trim() !== '')
  
  // Duplicate the array to create seamless loop
  const duplicatedClubs = [...clubsWithImages, ...clubsWithImages]

  return (
    <div className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-uf-blue">Organizations</span> & <span className="text-uf-orange">Programs</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the diverse community of business organizations and programs at UF
          </p>
        </div>
        
        {/* Scrolling Animation Container */}
        <div className="relative overflow-hidden">
          {/* Scrolling logos */}
          <div className="flex gap-8 animate-scroll">
            {duplicatedClubs.map((club, index) => (
              <div
                key={`${club.id}-${index}`}
                className="flex-shrink-0 w-28 h-28 rounded-full hover:scale-110 transition-transform duration-300 cursor-pointer"
                title={club.name}
              >
                <img
                  src={club.image}
                  alt={club.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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

  const stats = [
    { number: "50+", label: "Organizations & Programs" },
    { number: "500+", label: "Active Members" },
    { number: "50+", label: "Annual Events" },
    { number: "100+", label: "Company Partners" }
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-uf-blue via-blue-700 to-uf-orange text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your gateway to business at <span className="text-uf-orange">UF</span>
            </h1>
            <div className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              <p className="mb-2">
                Business resources at the University of Florida
              </p>
              <p className="flex items-center justify-center gap-2 flex-wrap">
                <span>for</span>
                <RotatingMajor />
                <span>students</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/clubs" className="btn-primary inline-block">
                Explore Organizations
              </Link>
              <Link to="/events" className="bg-white text-uf-blue hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-colors duration-200 inline-block">
                View Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-uf-orange mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
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

      {/* Club Logos Animation Section */}
      <ClubLogosAnimation />

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
            Connect with like-minded business students and start building your professional network today
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

