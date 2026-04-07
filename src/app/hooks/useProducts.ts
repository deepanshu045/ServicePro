import { useEffect, useState } from "react";
import { Product } from "./types";
import { api } from "./api";

export const useProducts = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api<Product[]>("/products");
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (payload: Partial<Product>) => {
    await api<Product>("/products", "POST", payload);
  };

  const deleteProduct = async (id: string) => {
    await api(`/products/${id}`, "DELETE");
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { data, loading, fetchProducts, addProduct, deleteProduct };
};