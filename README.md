# ServiceStack - Restaurant POS App

ServiceStack is a modern, fast, and feature-rich full-stack Point of Sale (POS) system designed for tablets, iPads, and mobile devices in restaurant environments. It features a responsive floor plan layout, intuitive waiter ordering workflows, role-based dashboards (Waiter, Chef, Manager), and secure JWT-based session autologout.

👉 **Live Demo:** [https://servicestack-7b7z.onrender.com/](https://servicestack-7b7z.onrender.com/)

---

## 🚀 Features

*   **Responsive Floor Plan Layout**: Beautiful, responsive layout designed for mobile and tablet screens, featuring active order status indicators (Available, Occupied, Reserved).
*   **Dynamic Reservations**: Toggle table reservation statuses directly from the floor plan using an interactive seats/group icon.
*   **Intuitive Order Taking**: Manage order lists, add/remove items, send items to the kitchen, and perform secure voids or checkouts.
*   **Kitchen Display System (KDS)**: Real-time Chef dashboard showing incoming tickets with a clean color-coded workflow (Ordered ➔ Sent ➔ Cooking ➔ Ready ➔ Served).
*   **Role-Based Access Control**: Strict permissions for Managers, Waiters, and Chefs, backed by secure 4-digit PIN authentication.
*   **Persistent Sessions**: Secure token-based user sessions with exact-second automatic logouts and view-state preservation on page refresh.

---

## 🛠️ Tech Stack

### Frontend
*   **React** (TypeScript)
*   **Vite** (Build Tool)
*   **Tailwind CSS** (Modern Styling)
*   **Axios** (API Client with response interceptors for JWT security)

### Backend
*   **Django** (Python Framework)
*   **Django Rest Framework (DRF)** (REST API Builder)
*   **SimpleJWT** (JSON Web Token authentication)
*   **CORS Headers** (Cross-origin sharing)
*   **WhiteNoise** (Production static files handling)

---

## 📂 Project Structure

```text
rest-pos-app/
├── backend/            # Django API & database configurations
│   ├── config/         # Main project urls & settings
│   ├── pos/            # App containing models, views, and serializers
│   └── requirements.txt# Backend library dependencies
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # UI components (FloorPlan, OrderView, etc.)
│   │   ├── services/   # Axios API client handlers
│   │   └── AuthContext # Global React Auth Provider
│   └── package.json    # Frontend script commands & packages
└── README.md           # Root documentation
```


