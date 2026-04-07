import { useEffect, useState } from "react";
import { Service } from "./types";
import { api } from "./api";

export const useServices = () => {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api<Service[]>("/services");
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const addService = async (payload: Partial<Service>) => {
    await api("/services", "POST", payload);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return { data, loading, fetchServices, addService };
};