import axios from 'axios';
import { User, Product, Order } from '../types';

const API_URL = 'http://localhost:5002/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  },
});

axiosInstance.interceptors.request.use((config) => {
  console.log('=== Axios 请求拦截器 ===');
  console.log('请求URL:', config.baseURL + config.url);
  console.log('请求方法:', config.method);
  console.log('请求头:', config.headers);
  console.log('请求数据:', config.data);

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('已添加Token到请求头');
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('=== Axios 响应拦截器 (成功) ===');
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);
    return response;
  },
  (error) => {
    console.error('=== Axios 响应拦截器 (错误) ===');
    console.error('错误状态:', error.response?.status);
    console.error('错误消息:', error.response?.data?.error?.message);
    console.error('完整错误响应:', error.response?.data);
    console.error('完整Error对象:', error);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: { username: string; password: string }) => {
    console.log('authAPI.register 被调用, 数据:', { username: data.username, password: '***' });
    const response = await axiosInstance.post('/users/register', data);
    console.log('authAPI.register 响应:', response.data);
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

  create: async (data: Omit<Product, '_id' | 'createdAt' | 'status'>, image?: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', String(data.price));
    formData.append('category', data.category);
    formData.append('type', data.type);
    formData.append('stock', String(data.stock || 0));
    if (data.estimatedDays) {
      formData.append('estimatedDays', String(data.estimatedDays));
    }
    formData.append('modificationFee', String(data.modificationFee || 0));
    formData.append('freeModificationCount', String(data.freeModificationCount || 0));
    if (image) {
      formData.append('image', image);
    }

    const response = await axiosInstance.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  create: async (data: any) => {
    const response = await axiosInstance.post('/orders', data);
    return response.data.data.order as Order;
  },

  getAll: async () => {
    const response = await axiosInstance.get('/orders');
    return response.data.data.orders as Order[];
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data.data.order as Order;
  },

  cancel: async (id: string) => {
    const response = await axiosInstance.post(`/orders/${id}/cancel`);
    return response.data.data.order as Order;
  },

  pay: async (id: string) => {
    const response = await axiosInstance.post(`/orders/${id}/pay`);
    return response.data.data.order as Order;
  },

  getComments: async (orderId: string) => {
    const response = await axiosInstance.get(`/orders/${orderId}/comments`);
    return response.data.data.comments;
  },

  addComment: async (orderId: string, data: { content: string; type: 'comment' | 'modification_request' }) => {
    const response = await axiosInstance.post(`/orders/${orderId}/comments`, data);
    return response.data.data.comment;
  },

  replyComment: async (orderId: string, commentId: string, reply: string) => {
    const response = await axiosInstance.post(`/orders/${orderId}/comments/${commentId}/reply`, { reply });
    return response.data.data.comment;
  },

  updateCommentStatus: async (orderId: string, commentId: string, status: 'approved' | 'rejected', reply?: string) => {
    const response = await axiosInstance.patch(`/orders/${orderId}/comments/${commentId}/status`, { status, reply });
    return response.data.data.comment;
  },

  getProgressImages: async (orderId: string) => {
    const response = await axiosInstance.get(`/orders/${orderId}/progress`);
    return response.data.data.images as string[];
  },

  addProgressImage: async (orderId: string, image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await axiosInstance.post(`/orders/${orderId}/progress`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.image as string;
  },
};
