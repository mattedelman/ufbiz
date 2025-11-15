import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function Calendar({ events, onDayClick, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showQuickJump, setShowQuickJump] = useState(false)

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)

  // Get events for a specific date
  const getEventsForDate = (day) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => event.date === dateString)
  }

  // Check if a date is today
  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  // Check if a date is selected
  const isSelectedDay = (day) => {
    if (!selectedDate) return false
    // Parse the date string directly without timezone conversion
    const [year, month, dayNum] = selectedDate.split('-').map(Number)
    return (
      day === dayNum &&
      currentDate.getMonth() === month - 1 &&
      currentDate.getFullYear() === year
    )
  }


  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          
          <div className="text-center">
            {showQuickJump ? (
              <div className="flex items-center gap-2">
                <select
                  value={currentDate.getMonth()}
                  onChange={(e) => {
                    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))
                    setShowQuickJump(false)
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-uf-orange cursor-pointer"
                  autoFocus
                >
                  {monthNames.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                
                <select
                  value={currentDate.getFullYear()}
                  onChange={(e) => {
                    setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))
                    setShowQuickJump(false)
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-uf-orange cursor-pointer"
                >
                  {[2025, 2026, 2027].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => setShowQuickJump(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowQuickJump(true)}
                className="text-xl font-bold text-gray-900 hover:text-uf-orange transition-colors px-2 py-1 rounded hover:bg-gray-50"
                title="Click to jump to a different month/year"
              >
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </button>
            )}
          </div>

          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 py-1 text-xs"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the first day of month */}
          {[...Array(firstDayOfMonth)].map((_, index) => (
            <div key={`empty-${index}`} className="h-16" />
          ))}

          {/* Days of the month */}
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1
            const dayEvents = getEventsForDate(day)
            const isCurrentDay = isToday(day)
            const isSelected = isSelectedDay(day)
            const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

            return (
              <div
                key={day}
                onClick={() => onDayClick(dateString, dayEvents)}
                className={`h-16 flex flex-col items-center justify-start p-1 relative transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-uf-blue text-white rounded-lg shadow-md'
                    : isCurrentDay
                    ? 'bg-orange-50 rounded-lg'
                    : 'hover:bg-gray-50 rounded-lg'
                }`}
              >
                <div
                  className={`text-base font-medium mb-1 ${
                    isSelected 
                      ? 'text-white' 
                      : isCurrentDay 
                      ? 'text-uf-orange font-bold' 
                      : 'text-gray-800'
                  }`}
                >
                  {day}
                </div>
                
                {/* Event indicators - red dots (one per event, max 3) */}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 items-center">
                    {dayEvents.slice(0, 3).map((_, idx) => (
                      <div key={idx} className="w-1 h-1 bg-red-500 rounded-full"></div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Jump to Today */}
      <div className="border-t px-4 py-2 bg-gray-50">
        <div className="flex justify-end">
          <button
            onClick={goToToday}
            className="text-xs text-uf-orange hover:text-orange-600 font-medium transition-colors"
          >
            Jump to Today
          </button>
        </div>
      </div>
    </div>
  )
}

export default Calendar

