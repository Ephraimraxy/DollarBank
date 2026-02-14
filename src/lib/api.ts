const API_URL = '/api';

export const api = {
    async request(endpoint: string, method: string = 'GET', body?: any) {
        const token = localStorage.getItem('vault_token');
        const headers: any = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            const error = await res.json();
            const errorObj: any = new Error(error.error || 'API Request Failed');
            // Preserve validation errors array if present
            if (error.errors) {
                errorObj.errors = error.errors;
            }
            throw errorObj;
        }

        return res.json();
    },

    login: (credentials: any) => api.request('/auth/login', 'POST', credentials),
    register: (data: any) => api.request('/auth/register', 'POST', data),
    chat: (messages: any[]) => api.request('/chat/stream', 'POST', { messages }),
    getAccounts: () => api.request('/accounts'),
    getTransactions: () => api.request('/transactions'),
    transfer: (data: { amount: number; recipientEmail: string }) => api.request('/transactions/transfer', 'POST', data),
};
