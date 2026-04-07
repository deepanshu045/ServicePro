import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

import { useServices } from "../hooks/useServices";
import { Service } from "../hooks/types";

export function ServiceSchedule() {
  const { data: services, loading, addService, fetchServices } = useServices();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    productName: "",
    serviceType: "" as "Repair" | "Maintenance" | "Other" | "",
    customService: "",
    date: "",
    time: "",
  });

  // Notification permission
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceType) {
      toast.error("Select service type");
      return;
    }

    const payload: Partial<Service> = {
      customerName: formData.customerName,
      mobileNumber: formData.mobileNumber,
      productName: formData.productName,
      serviceType: formData.serviceType,
      date: formData.date,
      time: formData.time,
    };

    try {
      await addService(payload);
      toast.success("Service scheduled");
      fetchServices();

      // Notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Service Scheduled", {
          body: `${formData.serviceType} for ${formData.customerName}`,
        });
      }

      resetForm();
    } catch {
      toast.error("Failed to schedule");
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      mobileNumber: "",
      productName: "",
      serviceType: "",
      customService: "",
      date: "",
      time: "",
    });
    setIsDialogOpen(false);
  };

  const serviceButtons: ("Repair" | "Maintenance" | "Other")[] = [
    "Repair",
    "Maintenance",
    "Other",
  ];

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Service Schedule</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Service</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
              />

              <Input
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={(e) =>
                  setFormData({ ...formData, mobileNumber: e.target.value })
                }
                required
              />

              <Input
                placeholder="Product Name"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                required
              />

              {/* Service Type */}
              <div className="flex gap-2">
                {serviceButtons.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={
                      formData.serviceType === type ? "default" : "outline"
                    }
                    onClick={() =>
                      setFormData({ ...formData, serviceType: type })
                    }
                  >
                    {type}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />

                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-pink-600">
                  Schedule
                </Button>
                <Button type="button" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {services.length === 0 ? (
        <p className="text-center text-gray-500">No services</p>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service._id}>
              <CardContent className="p-4">
                <h3 className="font-bold">{service.serviceType}</h3>
                <p>{service.customerName}</p>
                <p>{service.productName}</p>
                <p>
                  {service.date} - {service.time}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}