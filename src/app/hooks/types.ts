export interface Product {
  _id: string;
  productName: string;
  serialNumber: string;
  category: "Electronics" | "Other";
  price: number;
  stockQuantity: number;
  description?: string;
}

export interface Customer {
  _id: string;
  customerName: string;
  mobileNumber: string;
  email?: string;
  address?: string;
}

export interface Service {
  _id: string;
  customerName: string;
  mobileNumber: string;
  productName: string;
  serviceType: "Repair" | "Maintenance" | "Other";
  date: string;
  time: string;
}

export interface BillingItem {
  productId?: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Billing {
  _id: string;
  customerName: string;
  phoneNumber: string;
  address?: string;
  warrantyActivated: boolean;
  items: BillingItem[];
}

export interface Warranty {
  _id: string;
  billId: string;
  productId: string;
  serialNumber: string;
  customerName: string;
  customerMobile: string;
  purchaseDate: string;
  warrantyPeriod: number;
}