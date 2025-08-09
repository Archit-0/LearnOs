# LearnOs - Interactive Operating Systems Learning Platform

## Project Overview

LearnOs is a web-based platform designed to help users understand Operating Systems concepts through interactive simulations, quizzes, and structured learning paths. The platform aims to make complex OS topics more accessible and engaging for learners.

## Features

- **Animated Simulations**: Visual demonstrations of OS concepts like CPU scheduling, memory management, and paging.
- **Quizzes**: Interactive quizzes to assess understanding and reinforce learning.
- **Learning Paths**: Structured modules guiding users through various OS topics.
- **User Authentication**: Secure login and registration system to track progress.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Technologies Used

- **Frontend**: React, Redux, React Router, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, JWT Authentication
- **APIs**: RESTful API design with Axios for communication
- **Other**: React Hook Form for form validation

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Archit-0/LearnOs.git
   cd LearnOs
2. Install dependencies:
   ```bash
  cd backend
  npm install
  cd ../frontend
  npm install

   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory  of backend and add your 
   MONGO_URI="mongodb+srv://baniya8368:IJDqFsq4IcR2qmqS@cluster0.ahafqbb.mongodb.net/osLearningPlatform?retryWrites=true&w=majority&appName=Cluster0"

    JWT_SECRET= ""
    NODE_ENV=development
    PORT=5000
    OPENAI_API_KEY=your-openai-api-key-here
    FRONTEND_URL="".
    
4. Start the MongoDB server.
5. Run the backend server:
   ```bash
   npm run dev:server
   ```
6. Run the frontend server:
   ```bash
   npm run dev:client