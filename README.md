# Campusor 🎓

> A university campus platform — Marketplace, Events, and Lost & Found.
> Built with Django REST Framework + React + Tailwind CSS + PostgreSQL.

---

## 🚀 Quick Start

### Backend

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 2. Install packages
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 4. Run migrations
python manage.py makemigrations users
python manage.py makemigrations marketplace
python manage.py makemigrations events
python manage.py makemigrations lost_found
python manage.py migrate

# 5. Create admin
python manage.py createsuperuser

# 6. Run server
python manage.py runserver
```

Backend live at: http://localhost:8000

### Frontend

```bash
cd frontend

# 1. Install packages
npm install

# 2. Set up environment
cp .env.example .env
# .env contains: REACT_APP_API_URL=http://localhost:8000/api

# 3. Run dev server
npm start
```

Frontend live at: http://localhost:3000

---

## 📁 Project Structure

```
Campusor/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile              # Render deployment
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── apps/
│       ├── users/            # Auth — StudentUser, JWT
│       ├── marketplace/      # Products, Categories
│       ├── events/           # Events, RSVP
│       └── lost_found/       # Lost & Found items
│
└── frontend/
    └── src/
        ├── api/              # Axios API calls
        ├── context/          # AuthContext
        ├── hooks/            # useAuth
        ├── components/       # Navbar, Cards, ProtectedRoute
        └── pages/            # All pages
```

---

## 🔌 API Endpoints

| Module | Method | Endpoint | Auth |
|--------|--------|----------|------|
| Auth | POST | `/api/auth/register/` | Open |
| Auth | POST | `/api/auth/login/` | Open |
| Auth | GET/PATCH | `/api/auth/profile/` | Required |
| Marketplace | GET | `/api/marketplace/products/` | Open |
| Marketplace | POST | `/api/marketplace/products/` | Required |
| Marketplace | GET | `/api/marketplace/products/mine/` | Required |
| Events | GET | `/api/events/` | Open |
| Events | POST | `/api/events/` | Required |
| Events | POST | `/api/events/<id>/rsvp/` | Required |
| Lost & Found | GET | `/api/lost-found/` | Open |
| Lost & Found | POST | `/api/lost-found/` | Required |

---

## ⚙️ Environment Variables

### backend/.env
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=campusor_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### frontend/.env
```
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 🌍 Deployment

**Backend → Render.com**
- Connect GitHub repo
- Build: `pip install -r requirements.txt`
- Start: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
- Add all env vars in Render dashboard

**Frontend → Vercel**
- Connect GitHub repo
- Root directory: `frontend`
- Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS, Axios |
| Backend | Django 4.2, Django REST Framework |
| Auth | JWT (SimpleJWT) with refresh token rotation |
| Database | PostgreSQL |
| Deployment | Render + Vercel + Neon |
