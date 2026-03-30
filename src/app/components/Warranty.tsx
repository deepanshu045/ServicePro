import { useState, useEffect } from "react";
import { Shield, Bell, Plus, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface Warranty {
  id: string;
  productName: string;
  serialNumber: string;
  customerName: string;
  customerMobile: string;
  purchaseDate: string;
  expiryDate: string;
  warrantyPeriod: string;
  status: "active" | "expiring-soon" | "expired";
  daysRemaining: number;
}

export function Warranty() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    serialNumber: "",
    customerName: "",
    customerMobile: "",
    purchaseDate: "",
    warrantyPeriod: "12", // months
  });

  // Calculate warranty status and days remaining
  const calculateWarrantyStatus = (expiryDate: string): { status: Warranty["status"]; daysRemaining: number } => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { status: "expired", daysRemaining: 0 };
    } else if (daysRemaining <= 30) {
      return { status: "expiring-soon", daysRemaining };
    } else {
      return { status: "active", daysRemaining };
    }
  };

  // Check for expiring warranties and send notifications
  useEffect(() => {
    const expiringWarranties = warranties.filter(w => w.status === "expiring-soon");
    if (expiringWarranties.length > 0) {
      // This would typically trigger push notifications or SMS
      console.log("Expiring warranties:", expiringWarranties);
    }
  }, [warranties]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const purchaseDate = new Date(formData.purchaseDate);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + Number(formData.warrantyPeriod));

    const { status, daysRemaining } = calculateWarrantyStatus(expiryDate.toISOString());

    const newWarranty: Warranty = {
      id: Date.now().toString(),
      productName: formData.productName,
      serialNumber: formData.serialNumber,
      customerName: formData.customerName,
      customerMobile: formData.customerMobile,
      purchaseDate: formData.purchaseDate,
      expiryDate: expiryDate.toISOString().split('T')[0],
      warrantyPeriod: `${formData.warrantyPeriod} months`,
      status,
      daysRemaining,
    };

    setWarranties([...warranties, newWarranty]);
    toast.success("Warranty registered successfully");
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      serialNumber: "",
      customerName: "",
      customerMobile: "",
      purchaseDate: "",
      warrantyPeriod: "12",
    });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: Warranty["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "expiring-soon":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Expiring Soon</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
    }
  };

  const sendReminder = (warranty: Warranty) => {
    // In production, this would send SMS/Email/Push notification
    toast.success(`Reminder sent to ${warranty.customerMobile}`);
  };

  const expiringCount = warranties.filter(w => w.status === "expiring-soon").length;
  const activeCount = warranties.filter(w => w.status === "active").length;

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Warranty Tracking</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Warranty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Warranty</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerMobile">Customer Mobile *</Label>
                <Input
                  id="customerMobile"
                  type="tel"
                  value={formData.customerMobile}
                  onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="purchaseDate">Purchase Date *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="warrantyPeriod">Warranty Period (months) *</Label>
                <Input
                  id="warrantyPeriod"
                  type="number"
                  min="1"
                  value={formData.warrantyPeriod}
                  onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  Register Warranty
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {warranties.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{expiringCount}</p>
                  <p className="text-xs text-gray-600">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expiring Soon Alert */}
      {expiringCount > 0 && (
        <Card className="border-0 shadow-md bg-orange-50 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-orange-900 mb-1">Warranty Reminders</h3>
                <p className="text-sm text-orange-700">
                  {expiringCount} warranty(ies) expiring within 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warranties List */}
      {warranties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Shield className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No warranties registered</p>
          <p className="text-sm">Add warranty information to track expiry dates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {warranties
            .sort((a, b) => a.daysRemaining - b.daysRemaining)
            .map((warranty) => (
              <Card key={warranty.id} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{warranty.productName}</h3>
                        {getStatusBadge(warranty.status)}
                      </div>
                      <p className="text-sm text-gray-600">SN: {warranty.serialNumber}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{warranty.customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">{warranty.customerMobile}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-medium">{warranty.purchaseDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="font-medium">{warranty.expiryDate}</span>
                    </div>
                  </div>

                  {warranty.status !== "expired" && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Days Remaining</span>
                        <span className={`text-sm font-bold ${
                          warranty.status === "expiring-soon" ? "text-orange-600" : "text-green-600"
                        }`}>
                          {warranty.daysRemaining} days
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            warranty.status === "expiring-soon" ? "bg-orange-500" : "bg-green-500"
                          }`}
                          style={{ 
                            width: `${Math.max(5, (warranty.daysRemaining / 365) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {warranty.status === "expiring-soon" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-orange-600 hover:bg-orange-50"
                      onClick={() => sendReminder(warranty)}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Send Reminder
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
