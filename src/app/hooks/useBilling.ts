import { useEffect, useState } from "react";
import { Billing } from "./types";
import { api } from "./api";

export const useBilling = () => {
  const [data, setData] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api<Billing[]>("/billing");
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (payload: Partial<Billing>) => {
    await api("/billing", "POST", payload);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return { data, loading, fetchBills, addBill };
};