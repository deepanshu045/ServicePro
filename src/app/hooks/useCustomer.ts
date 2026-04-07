import { useEffect, useState } from "react";
import { Customer } from "./types";
import { api } from "./api";

export const useCustomers = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api<Customer[]>("/customers");
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (payload: Partial<Customer>) => {
    await api("/customers", "POST", payload);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { data, loading, fetchCustomers, addCustomer };
};