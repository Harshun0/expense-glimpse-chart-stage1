# Expense Glimpse Chart

A simple web application for tracking personal finances in Indian Rupees (₹).

## Features

- Add, edit, and delete transactions (amount, date, description, type)
- View transactions in a list with filtering and sorting options
- Visualize monthly income and expenses with bar charts
- Track overall balance, total income, and total expenses
- Responsive design with loading states and form validation

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Data Visualization:** Recharts
- **Form Handling:** React Hook Form, Zod validation
- **Database:** MongoDB
- **Backend:** Express, Mongoose

## Getting Started

### Prerequisites

Make sure you have the following installed:
- Node.js (v14 or later)
- npm
- MongoDB Atlas account (for database)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/harshnebhnani/expense-glimpse-chart.git
   cd expense-glimpse-chart
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up MongoDB Atlas:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Create a new cluster
   - Under Security > Database Access, create a new database user with read/write privileges
   - Under Security > Network Access, add your IP address to the allowlist
   - Under Databases > Connect, click "Connect your application" and copy the connection string

4. Create a `.env` file in the root directory with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
   ```

   Replace `<username>`, `<password>`, `<cluster-url>`, and `<db-name>` with your MongoDB Atlas credentials.

5. Start the development servers:
   ```sh
   # In one terminal, start the backend server
   npm run dev:server
   
   # In another terminal, start the frontend
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:8080`

## Deployment

1. Build the frontend:
   ```sh
   npm run build
   ```

2. Start the production server:
   ```sh
   npm start
   ```

## Project Structure

```
expense-glimpse-chart/
├── src/                    # Frontend source files
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API client
│   ├── models/             # Mongoose models (TypeScript)
│   ├── pages/              # Application pages
│   └── types/              # TypeScript type definitions
├── server/                 # Backend server code
│   └── models/             # Mongoose models (JavaScript)
├── public/                 # Static assets
└── .env                    # Environment variables (not checked into git)
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
