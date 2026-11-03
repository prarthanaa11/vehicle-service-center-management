# Vehicle Service Center Management System

A web-based Vehicle Service Center Management System designed to manage customers, vehicles, service bookings, mechanics, services, spare parts, invoices, payments, and repair history.

The system combines a relational database with AI-powered semantic search to help manage service center operations efficiently.

## Technologies Used

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Python, FastAPI
- **Database:** MySQL
- **Vector Database:** ChromaDB
- **Tools:** VS Code, Git, GitHub

## Features

- **Dashboard:** View customer, vehicle, booking, and invoice summaries.
- **Customer Management:** Add, view, update, and manage customer records.
- **Vehicle Management:** Maintain vehicle details and customer associations.
- **Booking Management:** Create and manage vehicle service bookings.
- **Mechanic Management:** Maintain mechanic information.
- **Service Management:** Manage available services and pricing.
- **Spare Parts Management:** Maintain spare parts and stock information.
- **Invoice Management:** Generate and manage service invoices.
- **Payment Management:** Record and manage customer payments.
- **Repair History:** Store and search previous repair records.
- **Semantic Search:** Use ChromaDB to find similar repair descriptions.

## Project Structure

```text
vehicle-service-center/
│
├── chroma_service/
│   └── main.py
│
├── web/
│   ├── app/
│   │   ├── api/
│   │   │   ├── bookings/
│   │   │   ├── customers/
│   │   │   ├── dashboard/
│   │   │   ├── invoices/
│   │   │   ├── mechanics/
│   │   │   ├── payments/
│   │   │   ├── repair-history/
│   │   │   ├── services/
│   │   │   ├── spare-parts/
│   │   │   └── vehicles/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── lib/
│   │   └── db.ts
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── chroma_test.py
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- Python 3
- MySQL Server 8.0
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/prarthanaa11/vehicle-service-center.git
cd vehicle-service-center
```

### 2. Set up MySQL

- Start MySQL Server.
- Create the database named `vehicle_service_center`.
- Execute your project SQL schema and sample data scripts.
- Configure the database connection in `web/.env.local`.

Example environment variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vehicle_service_center
DB_PORT=3306
```

Use your own MySQL credentials. Never commit environment files or passwords to GitHub.

### 3. Set up the Next.js application

```bash
cd web
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

If port 3000 is occupied, Next.js may use another available port.

### 4. Set up the ChromaDB service

Open another terminal:

```bash
cd chroma_service
python -m venv .venv
```

Activate the environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install the Python dependencies required by the service:

```bash
pip install fastapi uvicorn chromadb
```

Start the service:

```bash
python -m uvicorn main:app --reload --port 8001
```

The ChromaDB service will be available at:

```text
http://localhost:8001
```

## Database

The system uses MySQL to manage structured information, including:

- Customers
- Vehicles
- Mechanics
- Services
- Bookings
- Booking Services
- Spare Parts
- Booking Parts
- Invoices
- Payments
- Users

ChromaDB is used for storing and searching repair-history information through semantic similarity.

## Future Enhancements

- Role-based authentication and authorization.
- Advanced reporting and analytics.
- Improved service scheduling.
- Enhanced repair-history recommendations.

## Author

Vehicle Service Center Management System

**Repository:** https://github.com/prarthanaa11/vehicle-service-center
