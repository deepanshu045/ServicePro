import { useState } from "react";
import { AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";

interface Defect {
  id: string;
  productName: string;
  serialNumber: string;
  customerName: string;
  customerMobile: string;
  defectType: string;
  description: string;
  reportedDate: string;
  status: "reported" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  resolution?: string;
}

export function DefectTracking() {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [formData, setFormData] = useState({
    productName: "",
    serialNumber: "",
    customerName: "",
    customerMobile: "",
    defectType: "",
    description: "",
    priority: "medium" as Defect["priority"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDefect) {
      setDefects(defects.map(d =>
        d.id === editingDefect.id
          ? { ...editingDefect, ...formData }
          : d
      ));
      toast.success("Defect updated successfully");
    } else {
      const newDefect: Defect = {
        id: Date.now().toString(),
        productName: formData.productName,
        serialNumber: formData.serialNumber,
        customerName: formData.customerName,
        customerMobile: formData.customerMobile,
        defectType: formData.defectType,
        description: formData.description,
        reportedDate: new Date().toISOString().split('T')[0],
        status: "reported",
        priority: formData.priority,
      };
      setDefects([...defects, newDefect]);
      toast.success("Defect reported successfully");
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      serialNumber: "",
      customerName: "",
      customerMobile: "",
      defectType: "",
      description: "",
      priority: "medium",
    });
    setEditingDefect(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (defect: Defect) => {
    setEditingDefect(defect);
    setFormData({
      productName: defect.productName,
      serialNumber: defect.serialNumber,
      customerName: defect.customerName,
      customerMobile: defect.customerMobile,
      defectType: defect.defectType,
      description: defect.description,
      priority: defect.priority,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDefects(defects.filter(d => d.id !== id));
    toast.success("Defect deleted successfully");
  };

  const updateStatus = (id: string, status: Defect["status"]) => {
    setDefects(defects.map(d =>
      d.id === id ? { ...d, status } : d
    ));
    toast.success(`Status updated to ${status}`);
  };

  const getStatusBadge = (status: Defect["status"]) => {
    switch (status) {
      case "reported":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Reported</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>;
    }
  };

  const getPriorityBadge = (priority: Defect["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="border-gray-400 text-gray-700">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-blue-400 text-blue-700">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="border-orange-400 text-orange-700">High</Badge>;
      case "critical":
        return <Badge variant="outline" className="border-red-400 text-red-700">Critical</Badge>;
    }
  };

  const openDefects = defects.filter(d => d.status === "reported" || d.status === "in-progress");
  const criticalDefects = defects.filter(d => d.priority === "critical" && d.status !== "closed");

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Defect Tracking</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Report Defect
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDefect ? "Edit Defect" : "Report New Defect"}</DialogTitle>
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
                <Label htmlFor="customerMobile">Mobile Number *</Label>
                <Input
                  id="customerMobile"
                  type="tel"
                  value={formData.customerMobile}
                  onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="defectType">Defect Type *</Label>
                <Input
                  id="defectType"
                  placeholder="e.g., Hardware, Software, Physical Damage"
                  value={formData.defectType}
                  onChange={(e) => setFormData({ ...formData, defectType: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as Defect["priority"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                  {editingDefect ? "Update" : "Report"} Defect
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Critical Defects Alert */}
      {criticalDefects.length > 0 && (
        <Card className="border-0 shadow-md bg-red-50 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">Critical Defects</h3>
                <p className="text-sm text-red-700">
                  {criticalDefects.length} critical defect(s) require immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {defects.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-3">
              <p className="text-2xl font-bold">{openDefects.length}</p>
              <p className="text-xs text-gray-600">Open</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-3">
              <p className="text-2xl font-bold">
                {defects.filter(d => d.status === "resolved").length}
              </p>
              <p className="text-xs text-gray-600">Resolved</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-3">
              <p className="text-2xl font-bold">
                {defects.filter(d => d.status === "closed").length}
              </p>
              <p className="text-xs text-gray-600">Closed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Defects List */}
      {defects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No defects reported</p>
          <p className="text-sm">Track product defects and issues here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {defects
            .sort((a, b) => {
              const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((defect) => (
              <Card key={defect.id} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900">{defect.defectType}</h3>
                        {getStatusBadge(defect.status)}
                        {getPriorityBadge(defect.priority)}
                      </div>
                      <p className="text-sm text-gray-600">{defect.productName} • SN: {defect.serialNumber}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                    <p className="text-sm text-gray-900">{defect.description}</p>
                    <div className="pt-2 border-t text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">Customer:</span> {defect.customerName} • {defect.customerMobile}</p>
                      <p><span className="font-medium">Reported:</span> {defect.reportedDate}</p>
                    </div>
                  </div>

                  {defect.status !== "closed" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {defect.status === "reported" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-blue-600 hover:bg-blue-50"
                            onClick={() => updateStatus(defect.id, "in-progress")}
                          >
                            Start Work
                          </Button>
                        )}
                        {defect.status === "in-progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-green-600 hover:bg-green-50"
                            onClick={() => updateStatus(defect.id, "resolved")}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        {defect.status === "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-gray-600 hover:bg-gray-50"
                            onClick={() => updateStatus(defect.id, "closed")}
                          >
                            Close
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(defect)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(defect.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
