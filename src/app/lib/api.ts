import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5d0bb8c5`;

const getHeaders = async () => {
  // Try to get access token from session storage
  const accessToken = sessionStorage.getItem('supabase.auth.token');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
  };
};

export const api = {
  // Products
  getProducts: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/products`, { headers });
    return response.json();
  },
  
  createProduct: async (product: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(product),
    });
    return response.json();
  },
  
  updateProduct: async (id: string, product: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(product),
    });
    return response.json();
  },
  
  deleteProduct: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  },

  // Services
  getServices: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/services`, { headers });
    return response.json();
  },
  
  createService: async (service: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify(service),
    });
    return response.json();
  },
  
  deleteService: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  },

  // Customers
  getCustomers: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/customers`, { headers });
    return response.json();
  },
  
  createCustomer: async (customer: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(customer),
    });
    return response.json();
  },
  
  deleteCustomer: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  },

  // Warranties
  getWarranties: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/warranties`, { headers });
    return response.json();
  },
  
  createWarranty: async (warranty: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/warranties`, {
      method: 'POST',
      headers,
      body: JSON.stringify(warranty),
    });
    return response.json();
  },

  // Appointments
  getAppointments: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/appointments`, { headers });
    return response.json();
  },
  
  createAppointment: async (appointment: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointment),
    });
    return response.json();
  },
  
  updateAppointment: async (id: string, appointment: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(appointment),
    });
    return response.json();
  },

  // Defects
  getDefects: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/defects`, { headers });
    return response.json();
  },
  
  createDefect: async (defect: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/defects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(defect),
    });
    return response.json();
  },
  
  updateDefect: async (id: string, defect: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/defects/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(defect),
    });
    return response.json();
  },
  
  deleteDefect: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/defects/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  },

  // Inventory
  getInventory: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/inventory`, { headers });
    return response.json();
  },
  
  updateInventory: async (id: string, item: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/inventory/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(item),
    });
    return response.json();
  },
};