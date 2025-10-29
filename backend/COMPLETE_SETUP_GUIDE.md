# 🚀 Complete Setup Guide - Amazon Delivery Dashboard

## What You're Getting

A **complete full-stack dashboard** with:
- ✅ FastAPI Backend (Python) - 4 REST API endpoints  
- ✅ React Frontend (JavaScript) - Beautiful interactive dashboard with charts
- ✅ BigQuery Integration - Real-time data from your database

---

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Node.js 14+** installed
3. **Google Cloud** service account with BigQuery access
4. **BigQuery** data in the specified project

---

## 🎯 Step-by-Step Setup

### Step 1: Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit with your Google Cloud credentials

# Start the backend
./run.sh
```

**Backend will run at:** http://localhost:8000

**Test it:** http://localhost:8000/docs

---

### Step 2: Frontend Setup (3 minutes)

```bash
# Open a NEW terminal window

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the frontend
npm start
```

**Frontend will open automatically at:** http://localhost:3000

---

## 🎨 What You'll See

### Dashboard Features:

1. **📈 Overall Stats Tab**
   - Summary cards with total metrics
   - Bar chart of conversations by quality dimension
   - Pie chart showing distribution
   - Detailed data table

2. **🌐 By Domain Tab**
   - Domain selector buttons
   - Quality metrics charts per domain
   - Comparative analysis

3. **👥 By Reviewer Tab**
   - Search functionality
   - Top 10 reviewers chart
   - Average scores visualization
   - Detailed reviewer cards

4. **🎭 By Role Tab**
   - Role selector
   - Quality metrics bar chart
   - Radar chart for score distribution
   - Comprehensive data tables

---

## 🔧 Configuration

### Backend Configuration (`.env` file)

```env
# Required
GCP_PROJECT_ID=turing-gpt
BIGQUERY_DATASET=prod_labeling_tool_z
PROJECT_ID_FILTER=254
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Optional
DEBUG=False
CORS_ORIGINS=http://localhost:3000
```

### Frontend Configuration (`src/App.js`)

```javascript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

---

## 🚀 Quick Commands

### Start Everything

**Terminal 1 - Backend:**
```bash
cd backend && ./run.sh
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm start
```

### Stop Everything

- Press `Ctrl+C` in both terminals

---

## 📊 API Endpoints

The frontend uses these 4 endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/overall` | Overall statistics |
| `GET /api/v1/by-domain` | Statistics by domain |
| `GET /api/v1/by-reviewer` | Statistics by reviewer |
| `GET /api/v1/by-human-role` | Statistics by human role |

---

## 🎯 Testing the Setup

### 1. Test Backend

```bash
# Health check
curl http://localhost:8000/health

# Get overall stats
curl http://localhost:8000/api/v1/overall
```

### 2. Test Frontend

1. Open http://localhost:3000
2. You should see the dashboard
3. If API connection fails, check backend is running

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Port 8000 already in use
```bash
# Find and kill process
lsof -i :8000
kill -9 <PID>
```

**Problem:** Authentication error
- Check `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`
- Verify service account has BigQuery permissions

**Problem:** No data returned
- Check BigQuery has data with `project_id = 254` and `status = 'completed'`

### Frontend Issues

**Problem:** API Not Available error
```bash
# Make sure backend is running
cd backend && ./run.sh
```

**Problem:** Port 3000 already in use
```bash
# Use different port
PORT=3001 npm start
```

**Problem:** Charts not displaying
- Check browser console for errors
- Verify API returns data
- Clear cache and reload

---

## 🌐 Production Deployment

### Backend (Docker)

```bash
cd backend
docker build -t dashboard-api .
docker run -p 8000:8000 --env-file .env dashboard-api
```

### Frontend (Netlify)

```bash
cd frontend
npm run build
netlify deploy --prod
```

---

## 📂 Project Structure

```
Dashboard/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # API entry point
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   └── schemas/           # Data models
│   ├── requirements.txt
│   ├── .env.example
│   └── run.sh
│
└── frontend/                   # React frontend
    ├── src/
    │   ├── App.js             # Main app
    │   ├── components/        # Dashboard views
    │   └── App.css            # Styles
    ├── package.json
    └── README.md
```

---

## 💡 Next Steps

1. **Customize Colors** - Edit CSS files to match your brand
2. **Add Authentication** - Protect your dashboard
3. **Add Export** - Export data to CSV/Excel
4. **Add Filters** - Add date range filters
5. **Add Notifications** - Real-time alerts

---

## 📚 Documentation

- **Backend API Docs**: http://localhost:8000/docs
- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`
- **API Reference**: `backend/API_DOCUMENTATION.md`
- **UI Team Guide**: `backend/UI_TEAM_GUIDE.md`

---

## 🎉 You're All Set!

Your complete dashboard is ready to use!

**Backend**: http://localhost:8000  
**Frontend**: http://localhost:3000  
**API Docs**: http://localhost:8000/docs  

---

## 📞 Need Help?

1. Check logs in both terminals
2. Visit http://localhost:8000/docs for API testing
3. Check browser console (F12) for frontend errors
4. Verify both servers are running

---

**Happy Analyzing! 📊✨**

