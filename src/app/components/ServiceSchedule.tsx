import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Clock, User, CheckCircle, X } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface Appointment {
  id: string;
  customerName: string;
  customerMobile: string;
  productName: string;
  serviceName: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
}

export function ServiceSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    customerName: "",
    customerMobile: "",
    productName: "",
    serviceName: "",
    customService: "",
    date: "",
    time: "",
    notes: "",
  });

  // ✅ Ask notification permission once
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // ✅ Notification logic (safe)
  useEffect(() => {
    if (!("Notification" in window)) return;

    const interval = setInterval(() => {
      const now = new Date();

      appointments.forEach((apt) => {
        const aptTime = new Date(`${apt.date} ${apt.time}`);

        if (
          apt.status === "scheduled" &&
          Math.abs(aptTime.getTime() - now.getTime()) < 60000 &&
          !notifiedIds.includes(apt.id)
        ) {
          if (Notification.permission === "granted") {
            new Notification("Service Starting Now", {
              body: `${apt.serviceName} for ${apt.customerName}`,
            });
          }

          setNotifiedIds((prev) => [...prev, apt.id]);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [appointments, notifiedIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceName) {
      toast.error("Please select service type");
      return;
    }

    const finalService =
      formData.serviceName === "Other"
        ? formData.customService
        : formData.serviceName;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      customerName: formData.customerName,
      customerMobile: formData.customerMobile,
      productName: formData.productName,
      serviceName: finalService,
      date: formData.date,
      time: formData.time,
      status: "scheduled",
      notes: formData.notes,
    };

    setAppointments([...appointments, newAppointment]);

    toast.success("Service scheduled successfully");

    // 🔔 Instant notification when scheduled
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("New Service Scheduled", {
        body: `${newAppointment.serviceName} for ${newAppointment.customerName} at ${newAppointment.time}`,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerMobile: "",
      productName: "",
      serviceName: "",
      customService: "",
      date: "",
      time: "",
      notes: "",
    });
    setIsDialogOpen(false);
  };

  const updateStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status } : apt
    ));
    toast.success(`Appointment ${status}`);
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    }
  };

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Service Schedule</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Service</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Mobile Number *</Label>
                <Input
                  type="tel"
                  value={formData.customerMobile}
                  onChange={(e) =>
                    setFormData({ ...formData, customerMobile: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Product Name *</Label>
                <Input
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  required
                />
              </div>

              {/* Service Type Buttons */}
              <div>
                <Label>Service Type *</Label>
                <div className="flex gap-2 mt-2">
                  {["Repair", "Maintenance", "Other"].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={formData.serviceName === type ? "default" : "outline"}
                      className={`flex-1 ${
                        formData.serviceName === type
                          ? "bg-pink-600 text-white"
                          : ""
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          serviceName: type,
                          customService: "",
                        })
                      }
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {formData.serviceName === "Other" && (
                <div>
                  <Label>Custom Service *</Label>
                  <Input
                    placeholder="Enter service name"
                    value={formData.customService}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customService: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

            

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-pink-600">
                  Schedule Service
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No appointments
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <h3 className="font-bold">{appointment.serviceName}</h3>
                <p>{appointment.customerName}</p>
                <p>{appointment.date} - {appointment.time}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}