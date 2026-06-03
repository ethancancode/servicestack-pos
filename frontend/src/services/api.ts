import axios from 'axios';

const apiInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`
});


apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_name");
            window.dispatchEvent(new Event("unauthorized"));
        }
        return Promise.reject(error);
    }
);

export const api = {
    login: async (username: string, password: string) => {
        const response = await apiInstance.post('/token/', {
            username, password
        })
        return response.data;
    },

    // --- MENU ---
    getMenu: async () => {
        const response = await apiInstance.get('/menu/');
        return response.data; // Axios automatically puts the JSON in .data!
    },

    getTables: async () => {
        const response = await apiInstance.get('/tables/');
        return response.data;
    },

    // --- ORDERS ---
    getOrders: async () => {
        const response = await apiInstance.get('/orders/');
        return response.data;
    },

    createOrder: async (tableNumber: number) => {
        // Notice we just pass the object { table: tableNumber } directly! No JSON.stringify needed.
        const response = await apiInstance.post('/orders/', { table: tableNumber });
        return response.data;
    },

    // --- ORDER ACTIONS ---
    addItem: async (orderId: number, itemId: number) => {
        const response = await apiInstance.post(`/orders/${orderId}/add_item/`, { item_id: itemId });
        return response.data;
    },

    decrementItem: async (orderId: number, itemId: number) => {
        const response = await apiInstance.post(`/orders/${orderId}/decrement_item/`, { item_id: itemId });
        return response.data;
    },

    updateItemStatus: async (orderId: number, itemId: number, status: string) => {
        const response = await apiInstance.post(`/orders/${orderId}/update_item_status/`, {
            item_id: itemId,
            status: status
        });
        return response.data;
    },

    removeItem: async (orderId: number, itemId: number) => {
        const response = await apiInstance.post(`/orders/${orderId}/remove_item/`, { item_id: itemId });
        return response.data;
    },

    updateOrderStatus: async (orderId: number, status: "open" | "paid" | "voided") => {
        const response = await apiInstance.patch(`/orders/${orderId}/`, { status: status });
        return response.data;
    },

    updateTableStatus: async (tableId: number, status: "available" | "reserved") => {
        const response = await apiInstance.patch(`/tables/${tableId}/`, { status });
        return response.data;
    },


};
