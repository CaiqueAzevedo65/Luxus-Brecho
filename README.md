# Luxus Brechó 🛍️

Fullstack project for an online thrift store, with **Flask backend**, **React (Vite) frontend**, and a **mobile app in Expo/React Native**.

---

## 📌 Overview

* **Frontend (Web)**: React 19 SPA with Vite 6, routing with `react-router-dom`, and fixed Header/Footer layout.
* **Backend (API)**: Flask + MongoDB (PyMongo), modular architecture, CORS configured for frontend communication.
* **Mobile (App)**: Built with **Expo/React Native** with support for iOS, Android, and Web.
* **Database**: MongoDB (local or Atlas).
* **Communication**: Frontend and mobile consume the API at `/api`.

---

## 📂 Repository Structure (Simplified)

```
.
├─ backend/         # Flask API
│  ├─ app/          # app factory, routes, controllers
│  ├─ tests/        # backend tests
│  ├─ requirements.txt
│  ├─ run.py
│  └─ .env.example
│
├─ frontend/        # Web SPA (React + Vite)
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  └─ assets/
│  ├─ package.json
│  └─ vite.config.js
│
├─ mobile/          # Mobile App (Expo/React Native)
│  ├─ app/
│  ├─ components/
│  ├─ services/
│  ├─ package.json
│  └─ app.json
│
└─ .github/workflows/   # CI/CD and tests
```

---

## ⚙️ Tech Stack

### 🔹 Backend

* **Python 3.10+**
* **Flask** (REST API)
* **PyMongo** (MongoDB)
* **Flask-CORS**
* **python-dotenv** (environment variables)
* **pytest** (tests)

### 🔹 Frontend

* **React 19**
* **Vite 6**
* **react-router-dom v7**
* **ESLint**
* **Modular CSS**

### 🔹 Mobile

* **Expo**
* **React Native**
* **TypeScript**
* **NativeWind (Tailwind for RN)**
* **Expo Router** (file-based routing)

### 🔹 Infra/Other

* **MongoDB** (local or Atlas)
* **GitHub Actions** (basic CI/CD)

---

## 🌐 Network Configuration (Mobile Development)

### Quick Setup
```bash
# Sync network settings automatically
npm run dev

# Start backend and mobile separately
npm run backend
npm run mobile
```

### Common Issues & Solutions

**Mobile can't connect to backend?**
1. Run `npm run dev` to sync network IPs
2. Ensure both devices are on the same Wi-Fi network
3. Check firewall settings (allow port 5000)

**IP changed (different network/machine)?**
- The sync script automatically detects and updates IP configurations
- Backend runs on: `http://YOUR_IP:5000`
- Mobile connects to: `http://YOUR_IP:5000/api`

### Available Scripts
- `npm run dev` - Sync network only
- `npm run dev:full` - Sync network + start all services
- `npm run sync-network` - Manual network sync
- `npm run monitor-network` - Monitor IP changes

---

## 🚀 Running the Project

### 🔧 1. Clone the repository

```bash
git clone https://github.com/your-username/luxus-brecho.git
cd luxus-brecho
```

---

### 🖥️ 2. Backend (Flask + MongoDB)

#### Requirements

* Python 3.10+
* MongoDB running locally or Atlas

#### Installation

```bash
cd backend
pip install -r requirements.txt
```

#### Configuration

Create a `.env` file in `backend/` (based on `.env.example`):

```ini
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=luxus_brecho_db
FLASK_DEBUG=True
FRONTEND_ORIGIN=http://localhost:5173
```

#### Run

```bash
python run.py
```

API available at:
👉 `http://localhost:5000/api`

---

### 🌐 3. Frontend (React + Vite)

#### Installation

```bash
cd frontend
npm install
```

#### Run in development

```bash
npm run dev
```

Access at 👉 `http://localhost:5173`

> The proxy is already configured in `vite.config.js` to redirect `/api` to `http://localhost:5000`.

#### Production build

```bash
npm run build
npm run preview
```

---

### 📱 4. Mobile (Expo + React Native)

#### Installation

```bash
cd mobile
npm install
```

#### Network Setup (Important!)

Before running the mobile app, sync network configuration:

```bash
# From project root
npm run dev
```

#### Run

```bash
npx expo start --clear
```

Options:

* Run on **Expo Go** (via QR code) - **Recommended for physical devices**
* Android/iOS emulator
* Web browser

> **Note**: The mobile app automatically detects the correct API URL based on your network. If you experience connection issues, run `npm run dev` to resync network settings.

---

## 📌 Key API Routes

### 🔹 Healthcheck

```bash
curl --request GET \
  --url http://localhost:5000/api/health
```

### 🔹 List products

```bash
curl --request GET \
  --url "http://localhost:5000/api/products?page=1&page_size=10"
```

### 🔹 Filter by category

```bash
curl --request GET \
  --url "http://localhost:5000/api/products?categoria=Casual"
```

### 🔹 Search by text

```bash
curl --request GET \
  --url "http://localhost:5000/api/products?q=floral"
```

### 🔹 Create product

```bash
curl --request POST \
  --url http://localhost:5000/api/products \
  --header 'Content-Type: application/json' \
  --data '{
    "titulo": "Women Floral Shirt",
    "preco": 89.90,
    "descricao": "Lightweight shirt with floral print, size M.",
    "categoria": "Casual",
    "imagem": "https://storage.supabase.co/bucket/products/floral-shirt.jpg"
  }'
```

### 🔹 Get product by ID

```bash
curl --request GET \
  --url http://localhost:5000/api/products/1
```

### 🔹 Update product

```bash
curl --request PUT \
  --url http://localhost:5000/api/products/1 \
  --header 'Content-Type: application/json' \
  --data '{
    "titulo": "Women Floral Shirt - New Edition",
    "preco": 95.90,
    "descricao": "Lightweight shirt with floral print, size M (adjusted).",
    "categoria": "Casual",
    "imagem": "https://storage.supabase.co/bucket/products/floral-shirt-v2.jpg"
  }'
```

### 🔹 Delete product

```bash
curl --request DELETE \
  --url http://localhost:5000/api/products/1
```

---

## 🔧 Troubleshooting

### Mobile Connection Issues

**"Network Error" or "Request timeout":**
1. Run `npm run dev` to sync network configuration
2. Verify backend is running: `curl http://YOUR_IP:5000/api/health`
3. Check if both devices are on the same Wi-Fi network
4. Disable VPN if active
5. Check firewall settings (allow port 5000)

**"CORS policy" errors:**
- Backend CORS is pre-configured for mobile development
- Ensure you're using the correct IP address

**IP keeps changing:**
- Use `npm run monitor-network` to track changes automatically
- Consider setting a static IP on your router

### Backend Issues

**MongoDB connection failed:**
- Ensure MongoDB is running locally or check Atlas connection string
- Verify `.env` file configuration

**Port 5000 already in use:**
```bash
# Kill processes using port 5000
taskkill /f /im python.exe  # Windows
pkill -f python             # Linux/Mac
```

### Development Workflow

**Recommended startup sequence:**
1. `npm run dev` (sync network)
2. `npm run backend` (start API)
3. `npm run mobile` (start Expo)
4. Scan QR code with Expo Go

---

## ✅ Improvements Checklist

* [ ] Create **Products** and **Categories** pages/routes in the frontend
* [ ] Implement frontend service layer (`src/services/api.js`)
* [ ] Improve SEO and accessibility
* [ ] Create shared components (buttons, product cards)
* [ ] Add automated tests to mobile

---

## 🤝 Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📄 License

Project developed for learning purposes. Free to use and modify.

---
