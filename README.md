# World Athletics Points Calculator

A full-stack web application for converting athletic performances to World Athletics points and vice versa. This tool provides accurate scoring calculations, wind adjustments, and competition level comparisons for track and field events.

## Features

- **Bidirectional Conversion:**
  - Performance → Points calculation
  - Points → Performance calculation
  - Support for all track and field events

- **Specialized Calculations:**
  - Wind adjustment for relevant events (sprints, hurdles, jumps)
  - Competition level bonus points
  - Equivalent performance calculations across events

- **Season Support:**
  - Indoor season events
  - Outdoor season events

- **Competition Categories:**
  - Olympic Games & World Championships (OW)
  - Diamond League Final (DF)
  - Gold Level World Athletics Events (GW)
  - Diamond League Meetings (GL)
  - Category A-F Competitions

## Tech Stack

### Frontend
- React.js
- CSS3 for styling
- Responsive design
- Modern ES6+ JavaScript

### Backend
- Node.js
- Express.js
- RESTful API architecture

## Project Structure 
world-athletics-calculator/
├── iaaf-frontend/ # Frontend React application
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── utils/ # Utility functions
│ │ ├── App.js # Main application component
│ │ └── index.js # Entry point
│ └── public/ # Static files
└── iaaf-backend/ # Backend Node.js application
├── src/
│ ├── routes/ # API routes
│ ├── controllers/ # Business logic
│ └── utils/ # Helper functions
└── server.js # Server entry point

## Installation

1. **Clone the repository:**

bash
git clone https://github.com/yourusername/world-athletics-calculator.git
cd world-athletics-calculator

2. **Install dependencies:**
bash

# Install frontend dependencies
cd iaaf-frontend
npm install

# Install backend dependencies
cd iaaf-backend
npm install

3. **Set up environment variables:**

bash:README.md


# In iaaf-backend directory

cp .env.example .env

Example `.env` file:

README.md
PORT=5001
NODE_ENV=development

4. **Run the application:**

bash

# Start backend server (from iaaf-backend directory)
npm start


# Server runs on http://localhost:5001

# Start frontend development server (from iaaf-frontend directory)
npm start



# Frontend runs on http://localhost:3000
```

## API Documentation

### Calculate Points
```
POST /api/calculate-points
```
Request body:
```json

{
"event_type": "100m",
"performance": "10.04",
"gender": "mens",
"season": "outdoor"
}

### Calculate Performance

POST /api/calculate-performance

Request body:
```json
{
"event_type": "100m",
"points": 1000,
"gender": "mens",
"season": "outdoor"
}
```

