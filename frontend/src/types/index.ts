export interface User {
  _id: string;
  username: string;
  role: 'user' | 'admin';
  token: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  type: string;
  image?: string;
  stock: number;
  status: 'active' | 'inactive';
  estimatedDays?: number;
  modificationFee: number;
  freeModificationCount: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface OrderItem {
  _id?: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface ProgressImage {
  _id?: string;
  url: string;
  description?: string;
  uploadedAt: string;
}

export interface Comment {
  _id?: string;
  userId: string;
  content: string;
  type: 'comment' | 'modification_request';
  status?: 'pending' | 'approved' | 'rejected';
  reply?: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  modificationAmount: number;
  modificationCount: number;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress?: {
    name: string;
    phone: string;
    address: string;
  };
  progressImages: ProgressImage[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}
