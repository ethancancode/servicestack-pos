import { AuthContext, type User, type Role } from "./context/AuthContext";
import { api } from "./services/api"
import { FloorPlanView } from "./components/FloorPlanView";
import { useState, useEffect, useRef } from "react";
import { OrderView } from "./components/OrderView";
import { LoginView } from "./components/LoginView";
import { ChefDashboard } from "./components/ChefDashboard";
import { useToast } from "./context/ToastContext";

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const token = localStorage.getItem("access_token");
    const savedRole = localStorage.getItem("user_role") as Role | null;
    const savedName = localStorage.getItem("user_name");

    if (token && savedRole && savedName) {
      return { role: savedRole, name: savedName };
    }
    return null;
  });
  const [activeTable, setactiveTable] = useState<number | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [view, setView] = useState<"waiter" | "kitchen">(() => {
    const savedView = localStorage.getItem("current_view") as "waiter" | "kitchen" | null;
    return savedView || "waiter";
  });
  const logoutTimerRef = useRef<number | null>(null);
  const { showToast } = useToast();

  const startSessionTimer = (token: string) => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64));

      const expiryTimeMs = payload.exp * 1000;
      const timeRemainingMs = expiryTimeMs - Date.now();

      if (timeRemainingMs > 0) {
        logoutTimerRef.current = setTimeout(() => {
          handleLogout();
          showToast("Your session has expired. Please log in again.", "error");
        }, timeRemainingMs);
      } else {
        handleLogout();
      }
    } catch (e) {
      console.error("Failed to decode session token", e);
    }
  };

  const fetchLiveOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load live orders:", error);
    }
  };

  // save view each time page changes
  useEffect(() => {
    localStorage.setItem("current_view", view);
  }, [view]);

  // fetch the live database orders when the app starts
  useEffect(() => {
    fetchLiveOrders();
    const token = localStorage.getItem("access_token");
    const savedRole = localStorage.getItem("user_role") as Role | null;
    if (token) {
      startSessionTimer(token);
      if (savedRole === "Chef") setView("kitchen");
      else {
        const savedView = localStorage.getItem("current_view") as "waiter" | "kitchen" | null;
        setView(savedView || "waiter");
      }
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, []);


  const handleLogin = (role: Role, name: string, token: string) => {
    setCurrentUser({ role, name });
    localStorage.setItem("user_role", role);
    localStorage.setItem("user_name", name);
    startSessionTimer(token);
    if (role === "Chef") setView("kitchen");
    else setView("waiter");
  };

  const handleLogout = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    setCurrentUser(null);
    setactiveTable(null);
    setView("waiter");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("current_view")
  };

  const showKitchen = currentUser?.role === "Chef" || (currentUser?.role === "Manager" && view === "kitchen");

  return (
    <AuthContext.Provider value={currentUser}>
      <div className="h-full flex flex-col overflow-hidden">
        {!currentUser ? (
          <LoginView onLogin={handleLogin} />
        ) : showKitchen ? (
          <ChefDashboard
            orders={orders}
            refreshOrders={fetchLiveOrders}
            onLogout={handleLogout}
            view={view}
            onViewChange={setView}
          />
        ) : activeTable === null ? (
          <FloorPlanView
            onTableClick={setactiveTable}
            orders={orders}
            onLogout={handleLogout}
            view={view}
            onViewChange={setView}
          />
        ) : (
          <OrderView
            tableNumber={activeTable}
            onBack={() => setactiveTable(null)}
            order={orders.find(o => o.table === activeTable && o.status === "open") || {
              table: activeTable,
              items: [],
              status: 'open'
            }}
            refreshOrders={fetchLiveOrders}
            onLogout={handleLogout}
            view={view}
            onViewChange={setView}
          />
        )}
      </div>
    </AuthContext.Provider>
  );
}

export default App;
