const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401 || response.status === 403) {
    // Session expired or unauthorized
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    if (!window.location.pathname.includes('/login')) {
      window.dispatchEvent(new Event('auth-expired'));
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Something went wrong';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses or string messages (like from DELETE endpoints)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    return await response.text();
  }
};

export const api = {
  // Auth API
  auth: {
    register: async (userData) => {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
    login: async (credentials) => {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return handleResponse(res);
    },
    forgotPassword: async (email) => {
      const res = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      return handleResponse(res);
    },
    verifyCode: async (email, code) => {
      const res = await fetch(`${API_BASE_URL}/users/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      return handleResponse(res);
    },
  },

  // Dashboard & Reports API
  dashboard: {
    getData: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getReportSummary: async () => {
      const res = await fetch(`${API_BASE_URL}/reports/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Patients API
  patients: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (patient) => {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(patient),
      });
      return handleResponse(res);
    },
    update: async (id, patient) => {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(patient),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Doctors API
  doctors: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (doctor) => {
      const res = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(doctor),
      });
      return handleResponse(res);
    },
    update: async (id, doctor) => {
      const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(doctor),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Appointments API
  appointments: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (appointment) => {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(appointment),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    update: async (id, appointment) => {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(appointment),
      });
      return handleResponse(res);
    },
  },

  // Bills API
  bills: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/bills`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/bills/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (bill) => {
      const res = await fetch(`${API_BASE_URL}/bills`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bill),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/bills/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Prescriptions API
  prescriptions: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (prescription) => {
      const res = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(prescription),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Medical Records API
  medicalRecords: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/medical-records`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/medical-records/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (record) => {
      const res = await fetch(`${API_BASE_URL}/medical-records`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(record),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/medical-records/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
};
