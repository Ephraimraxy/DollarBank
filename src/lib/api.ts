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
    
    // Admin APIs
    admin: {
        getUsers: () => api.request('/admin/users'),
        getUser: (id: number) => api.request(`/admin/users/${id}`),
        updateUser: (id: number, data: any) => api.request(`/admin/users/${id}`, 'PUT', data),
        updateUserPassword: (id: number, newPassword: string) => api.request(`/admin/users/${id}/password`, 'PUT', { newPassword }),
        deleteUser: (id: number) => api.request(`/admin/users/${id}`, 'DELETE'),
        getStats: () => api.request('/admin/stats'),
        getAccounts: () => api.request('/admin/accounts'),
        getAccount: (id: number) => api.request(`/admin/accounts/${id}`),
        updateAccountBalance: (id: number, data: any) => api.request(`/admin/accounts/${id}/balance`, 'PUT', data),
        getTransactions: (filters?: any) => {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.type) params.append('type', filters.type);
            if (filters?.userId) params.append('userId', filters.userId);
            const query = params.toString();
            return api.request(`/admin/transactions${query ? '?' + query : ''}`);
        },
        updateTransactionStatus: (id: number, status: string) => api.request(`/admin/transactions/${id}/status`, 'PUT', { status }),
        refundTransaction: (id: number, reason: string) => api.request(`/admin/transactions/${id}/refund`, 'POST', { reason }),
    },
};
