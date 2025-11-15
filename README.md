# UFbiz - Business Resources at UF

A comprehensive web application for business-related resources, clubs, and events at the University of Florida. Created by Matthew Edelman, inspired by UF CSU.

## Features

- 🏢 **Clubs Directory** - Browse and search through 12+ business organizations at UF
- 📅 **Events Calendar** - Stay updated with upcoming workshops, networking events, and competitions
- 🎨 **Modern UI** - Beautiful, responsive design with UF branding colors
- 🔍 **Search & Filter** - Easily find clubs and events by category and keywords
- 📱 **Mobile Responsive** - Works seamlessly on all devices

## Tech Stack

- **Frontend**: React 18
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ufbiz
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
ufbiz/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with navigation and footer
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Clubs.jsx           # Clubs directory
│   │   └── Events.jsx          # Events calendar
│   ├── data/
│   │   ├── clubs.js            # Club data
│   │   └── events.js           # Events data
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles and Tailwind imports
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Customization

### Adding New Clubs

Edit `src/data/clubs.js` to add new clubs:

```javascript
{
  id: 13,
  name: "Your Club Name",
  category: "Category",
  description: "Club description",
  meetingTime: "Day Time",
  location: "Location",
  website: "https://...",
  email: "email@ufl.edu",
  members: "100+",
  image: "image-url"
}
```

### Adding New Events

Edit `src/data/events.js` to add new events:

```javascript
{
  id: 16,
  title: "Event Title",
  club: "Club Name",
  date: "YYYY-MM-DD",
  time: "Time Range",
  location: "Location",
  description: "Event description",
  category: "Category",
  rsvp: true/false
}
```

## Future Enhancements

- Backend integration for dynamic content management
- User authentication and profiles
- RSVP system for events
- Club admin dashboard
- Email notifications
- Calendar integration (Google Calendar, iCal)
- Advanced search with multiple filters
- Event registration system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Contact

Created by Matthew Edelman - CS student at UF

---

Go Gators! 🐊

