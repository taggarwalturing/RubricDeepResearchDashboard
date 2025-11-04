# Amazon Delivery Dashboard

A comprehensive full-stack dashboard for monitoring and analyzing delivery metrics, quality dimensions, and team performance.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Data Synchronization](#data-synchronization)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This dashboard provides real-time insights into delivery operations with multiple views:

- **Dashboard**: High-level metrics and visualizations
- **Pre-Delivery**: Analysis of tasks before delivery (Domain, Trainer, Reviewer, Task-level views)
- **Client Delivery**: Analysis of delivered tasks (Domain, Trainer, Reviewer, Delivery Tracker views)

## ✨ Features

### Data Views
- **Overall Statistics**: Task counts, quality metrics, team size
- **Domain-wise Analysis**: Performance by domain with task distribution charts
- **Trainer-wise Analysis**: Individual trainer performance with quality breakdowns
- **Reviewer-wise Analysis**: Reviewer metrics and quality assessments
- **Task-level Details**: Granular task information with full quality dimension data
- **Delivery Tracker**: Track deliveries by date with file information

### Advanced Filtering
- **Search & Multi-select**: Search and select multiple items (domains, trainers, reviewers)
- **Date Range Filters**: Filter data by date range (Date From/To)
- **Text Filters**: Contains, equals, starts with, ends with operators
- **Numeric Sliders**: Range filters for task counts and scores
- **Column Sorting**: Ascending/descending sort on all columns
- **Filter Chips**: Visual indicators for active filters with easy removal
- **Clear All**: One-click to remove all filters

### Visualizations
- **Bar Charts**: Task distribution across domains
- **Line Charts**: Quality trends over time
- **Scatter Plots**: Team performance distribution
- **Area Charts**: Weekly task completion velocity
- **Summary Cards**: Key metrics with color-coded indicators

### Data Management
- **Automatic Sync**: Hourly data synchronization from BigQuery
- **Manual Sync**: On-demand sync via API endpoint
- **S3 Integration**: Delivery file tracking from S3 buckets
- **PostgreSQL Storage**: Fast local data access with materialized views

## 🛠 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Primary database for derived data
- **BigQuery**: Source data warehouse
- **SQLAlchemy**: ORM and database toolkit
- **APScheduler**: Background job scheduling
- **Boto3**: AWS S3 integration
- **Pydantic**: Data validation

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **Material-UI (MUI)**: Component library
- **Recharts**: Data visualization
- **Axios**: HTTP client
- **React Router**: Navigation

## 📦 Prerequisites

### System Requirements
- **Python**: 3.12 or higher
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **npm**: 9.x or higher

### Access Requirements
- **Google Cloud**: Service account with BigQuery access
- **AWS**: Configured profile with S3 read permissions
- **PostgreSQL**: Database server running locally or remotely

## 🚀 Installation

### 1. Clone the Repository
```bash
cd /path/to/Dashboard_2
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. PostgreSQL Setup

```bash
# Create database
createdb RubricDeepResearch

# Or using psql
psql -U postgres
CREATE DATABASE "RubricDeepResearch";
\q
```

## ⚙️ Configuration

### Backend Configuration

Create or edit `backend/.env`:

```env
# Application Settings
APP_NAME=Amazon Delivery Dashboard API
APP_VERSION=1.0.0
DEBUG=False

# BigQuery Settings
GCP_PROJECT_ID=turing-gpt
BIGQUERY_DATASET=prod_labeling_tool_z
CONVERSATION_TABLE=conversation
REVIEW_TABLE=review
PROJECT_ID_FILTER=254

# Google Cloud Credentials
# Uncomment and set path to your service account JSON file
#GOOGLE_APPLICATION_CREDENTIALS=./path-to-your-service-account.json

# API Settings
API_PREFIX=/api

# CORS Settings
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001","http://localhost:5173"]

# Pagination
DEFAULT_PAGE_SIZE=100
MAX_PAGE_SIZE=1000

# PostgreSQL Settings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=RubricDeepResearch

# Data Sync Settings
SYNC_INTERVAL_HOURS=1
INITIAL_SYNC_ON_STARTUP=True

# S3 Settings
S3_BUCKET="s3_bucket_name"
S3_PREFIX="s3_prefix
S3_AWS_PROFILE="s3_profile"

# Project Settings
PROJECT_START_DATE=2025-09-26
```

### AWS Configuration

Ensure your AWS credentials are configured:

```bash
# Check if profile exists
aws configure list --profile amazon

# If not, configure it
aws configure --profile amazon
```

### Google Cloud Configuration

Set up service account credentials:

1. Download service account JSON from Google Cloud Console
2. Place it in the backend directory
3. Update `GOOGLE_APPLICATION_CREDENTIALS` in `.env`

## 🏃 Running the Application

### Option 1: Using Start Scripts (Recommended)

```bash
# Backend
cd backend
./start.sh

# Frontend (in a new terminal)
cd frontend
npm run dev
```

### Option 2: Manual Start

**Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Accessing the Application

- **Frontend**: http://localhost:3000 (or 3001, 3002 if ports are in use)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **API Redoc**: http://localhost:8000/redoc

## 📁 Project Structure

```
Dashboard_2/
├── backend/
│   ├── app/
│   │   ├── config.py              # Configuration management
│   │   ├── main.py                # FastAPI application
│   │   ├── models/
│   │   │   └── db_models.py       # SQLAlchemy models
│   │   ├── routers/
│   │   │   ├── stats.py           # Statistics endpoints
│   │   │   └── s3_ingestion.py    # S3 sync endpoint
│   │   ├── schemas/
│   │   │   └── response_schemas.py # Pydantic schemas
│   │   └── services/
│   │       ├── bigquery_service.py      # BigQuery queries
│   │       ├── data_sync_service.py     # Data synchronization
│   │       ├── db_service.py            # Database connection
│   │       ├── postgres_query_service.py # PostgreSQL queries
│   │       └── s3_ingestion_service.py  # S3 integration
│   ├── manual_sync.py             # Manual sync script
│   ├── requirements.txt           # Python dependencies
│   ├── start.sh                   # Backend start script
│   └── .env                       # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── clientdelivery/
│   │   │   │   └── DeliveryTracker.tsx
│   │   │   ├── predelivery/
│   │   │   │   ├── DomainWise.tsx
│   │   │   │   ├── TrainerWise.tsx
│   │   │   │   ├── ReviewerWise.tsx
│   │   │   │   └── TaskWise.tsx
│   │   │   ├── Layout.tsx         # Main layout with sidebar
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorDisplay.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Main dashboard
│   │   │   ├── PreDelivery.tsx    # Pre-delivery analysis
│   │   │   └── ClientDelivery.tsx # Client delivery analysis
│   │   ├── services/
│   │   │   └── api.ts             # API client
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   ├── App.tsx                # Root component
│   │   ├── main.tsx               # Entry point
│   │   └── theme.ts               # MUI theme
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

## 📡 API Documentation

### Statistics Endpoints

#### Overall Statistics
```
GET /api/overall
```
Returns overall aggregated statistics including task counts, quality metrics, and team size.

#### Domain Statistics
```
GET /api/by-domain
```
Returns statistics grouped by domain with quality dimension breakdowns.

#### Trainer Statistics
```
GET /api/by-trainer-level
```
Returns statistics grouped by trainer with performance metrics.

#### Reviewer Statistics
```
GET /api/by-reviewer
```
Returns statistics grouped by reviewer with quality assessments.

#### Task Level Information
```
GET /api/task-level
```
Returns detailed task-level information with all quality dimensions.

### Client Delivery Endpoints

All statistics endpoints have client delivery equivalents:
- `/api/client-delivery/overall`
- `/api/client-delivery/by-domain`
- `/api/client-delivery/by-trainer`
- `/api/client-delivery/by-reviewer`
- `/api/client-delivery/tracker`

### Data Synchronization

#### Manual Sync
```
POST /api/sync
```
Triggers manual data synchronization from BigQuery and/or S3.

Body (optional):
```json
{
  "sync_bigquery": true,
  "sync_s3": true
}
```

## 🔄 Data Synchronization

### Automatic Sync

- **Frequency**: Every 1 hour (configurable via `SYNC_INTERVAL_HOURS`)
- **Startup**: Initial sync runs on application startup
- **Tables Synced**:
  - `contributor` (lookup table)
  - `task_reviewed_info` (review status)
  - `task` (task details)
  - `review_detail` (quality dimensions)

### Manual Sync

#### Via API
```bash
curl -X POST http://localhost:8000/api/sync
```

#### Via Script
```bash
cd backend
python manual_sync.py
```

### S3 Sync

- **Trigger**: Manual only (POST /api/sync or via UI)
- **Purpose**: Sync delivered files from S3
- **Table**: `work_item`

## 🐛 Troubleshooting

### Backend Issues

**PostgreSQL Connection Error**
```
Solution: Check PostgreSQL is running and credentials in .env are correct
```

**BigQuery Authentication Error**
```
Solution: Verify GOOGLE_APPLICATION_CREDENTIALS path and service account permissions
```

**Port Already in Use**
```
Solution: Kill the process using port 8000
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**Port Already in Use**
```
Solution: Vite will automatically try the next available port (3001, 3002, etc.)
```

**API Connection Error**
```
Solution: Ensure backend is running on http://localhost:8000
```

**Module Not Found**
```
Solution: Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Data Issues

**No Data Showing**
```
Solution: Trigger manual sync
curl -X POST http://localhost:8000/api/sync
```

**Outdated Data**
```
Solution: Check sync logs and trigger manual sync if needed
```

**S3 Access Denied**
```
Solution: Verify AWS profile has S3 read permissions
aws s3 ls s3://agi-ds-turing/ --profile amazon
```

## 📝 Notes

- **First Run**: Initial data sync may take several minutes depending on data volume
- **Performance**: PostgreSQL materialized views provide fast query performance
- **Caching**: Frontend implements 5-minute cache for API responses
- **Filters**: All filters work together with AND logic
- **Date Filters**: Based on `updated_at` field from review data
- **Week Numbers**: Calculated from project start date (configurable)

## 🔒 Security

- Never commit `.env` files to version control
- Keep service account JSON files secure
- Use environment variables for all sensitive data
- Restrict database access to necessary IPs only
- Use HTTPS in production environments

## 📄 License

Internal use only - Turing/Amazon Delivery Project

## 👥 Support

For issues or questions, contact the development team.

---

**Last Updated**: November 2025
**Version**: 1.0.0
