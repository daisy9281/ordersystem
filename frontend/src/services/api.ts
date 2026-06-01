import axios from 'axios';
import { User, Product, Order } from '../types';

const API_URL = 'http://localhost:5002/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (data: { username: string; password: string }) => {
    const response = await axiosInstance.post('/users/register', data);
    return response.data.data as User;
  },

  login: async (data: { password: string }) => {
    const response = await axiosInstance.post('/users/login', data);
    const { user, token } = response.data.data;
    return { ...user, token } as User;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data.data as User;
  },

  updateProfile: async (data: { username: string }) => {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data.data as User;
  },
};

export const productAPI = {
  getAll: async (category?: string, type?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (type) params.append('type', type);
    const response = await axiosInstance.get('/products', { params });
    return response.data.data.items as Product[];
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data.data.product as Product;
  },

  create: async (data: Omit<Product, '_id' | 'createdAt' | 'status'>) => {
    const response = await axiosInstance.post('/products', data);
    return response.data.data.product as Product;
  },

  update: async (id: string, data: Partial<Product>) => {
    const response = await axiosInstance.put(`/products/${id}`, data);
    return response.data.data.product as Product;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },
};

export const orderAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/orders');
    return response.data.data.items as Order[];
  },

  getAllAdmin: async () => {
    const response = await axiosInstance.get('/orders/admin');
    return response.data.data.items as Order[];
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data.data.order as Order;
  },

  create: async (data: { items: { productId: string; quantity: number }[]; shippingAddress?: { name: string; phone: string; address: string } }) => {
    const response = await axiosInstance.post('/orders', data);
    return response.data.data.order as Order;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put(`/orders/${id}/status`, { status });
    return response.data.data.order as Order;
  },

  pay: async (id: string) => {
    const response = await axiosInstance.put(`/orders/${id}/pay`);
    return response.data.data.order as Order;
  },

  cancel: async (id: string) => {
    const response = await axiosInstance.delete(`/orders/${id}`);
    return response.data.data.order as Order;
  },

  deleteAdmin: async (id: string) => {
    const response = await axiosInstance.delete(`/orders/admin/${id}`);
    return response.data;
  },

  uploadImage: async (id: string, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (description) formData.append('description', description);
    const response = await axiosInstance.post(`/orders/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getImages: async (id: string) => {
    const response = await axiosInstance.get(`/orders/${id}/images`);
    return response.data as { url: string; description?: string; uploadedAt: string }[];
  },

  deleteImage: async (id: string, imageId: string) => {
    const response = await axiosInstance.delete(`/orders/${id}/images/${imageId}`);
    return response.data;
  },

  deleteImageAdmin: async (id: string, imageId: string) => {
    const response = await axiosInstance.delete(`/orders/admin/${id}/images/${imageId}`);
    return response.data;
  },

  addComment: async (id: string, content: string, type: 'comment' | 'modification_request') => {
    const response = await axiosInstance.post(`/orders/${id}/comments`, { content, type });
    return response.data;
  },

  getComments: async (id: string) => {
    const response = await axiosInstance.get(`/orders/${id}/comments`);
    return response.data as { userId: string; content: string; type: string; status?: string; reply?: string; createdAt: string }[];
  },

  handleModification: async (id: string, commentId: string, status: 'approved' | 'rejected', reply?: string) => {
    const response = await axiosInstance.put(`/orders/${id}/comments/${commentId}`, { status, reply });
    return response.data;
  },
};