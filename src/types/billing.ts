export interface BillItem {
    productId: number;
    quantity: number;
    price: number;
    total: number;
  }
  
  export interface CustomerDetails {
    id?: number;
    name: string;
    phone: string;
    email?: string;
    address?: {
      flatNo?: string;
      street?: string;
      district?: string;
      state?: string;
      pincode?: string;
    };
  }
  
  export interface Bill {
    id: number;
    billNo: string;
    date: Date;
    customerId: number;
    items: BillItem[];
    totalAmount: number;
    paymentMethod?: string;
    amountPaid?: number;
    balance?: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    billingMode: 'online' | 'offline';
  }

  

  // types/billing.ts
