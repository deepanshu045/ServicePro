import { useEffect, useState } from "react";
import { Warranty } from "./types";
import { api } from "./api";

export const useWarranty = () => {
  const [data, setData] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWarranty = async () => {
    setLoading(true);
    try {
      const res = await api<Warranty[]>("/warranty");
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const addWarranty = async (payload: Partial<Warranty>) => {
    await api("/warranty", "POST", payload);
  };

  useEffect(() => {
    fetchWarranty();
  }, []);

  return { data, loading, fetchWarranty, addWarranty };
};