import { useState } from "react";
import { Package, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner";
import { Archive } from "lucide-react";

interface InventoryItem {
  id: string;
  productName: string;
  serialNumber: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  lastUpdated: string;
}

export function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");

  const handleStockAdjustment = () => {
    if (!selectedItem || !adjustmentQty) {
      toast.error("Please enter quantity");
      return;
    }

    const qty = Number(adjustmentQty);
    const newStock = adjustmentType === "add" 
      ? selectedItem.currentStock + qty 
      : selectedItem.currentStock - qty;

    if (newStock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    setInventory(inventory.map(item => 
      item.id === selectedItem.id 
        ? { ...item, currentStock: newStock, lastUpdated: new Date().toLocaleDateString() }
        : item
    ));

    toast.success(`Stock ${adjustmentType === "add" ? "added" : "removed"} successfully`);
    setIsDialogOpen(false);
    setAdjustmentQty("");
    setSelectedItem(null);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minStock) {
      return { status: "Low Stock", color: "text-red-600", bgColor: "bg-red-50", icon: AlertTriangle };
    } else if (item.currentStock >= item.maxStock) {
      return { status: "Overstock", color: "text-orange-600", bgColor: "bg-orange-50", icon: TrendingUp };
    }
    return { status: "Normal", color: "text-green-600", bgColor: "bg-green-50", icon: Package };
  };

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h2>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-0 shadow-md bg-red-50 border-red-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">Low Stock Alert</h3>
                <p className="text-sm text-red-700">
                  {lowStockItems.length} item(s) need restocking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Data Button */}
      {inventory.length === 0 && (
        <Button 
          onClick={() => {
            setInventory([
              {
                id: "1",
                productName: "Laptop Dell XPS 15",
                serialNumber: "LAP001",
                currentStock: 5,
                minStock: 3,
                maxStock: 20,
                lastUpdated: new Date().toLocaleDateString(),
              },
              {
                id: "2",
                productName: "iPhone 14 Pro",
                serialNumber: "PHN001",
                currentStock: 2,
                minStock: 5,
                maxStock: 15,
                lastUpdated: new Date().toLocaleDateString(),
              },
              {
                id: "3",
                productName: "Samsung TV 55\"",
                serialNumber: "TV001",
                currentStock: 8,
                minStock: 2,
                maxStock: 10,
                lastUpdated: new Date().toLocaleDateString(),
              },
            ]);
            toast.success("Sample inventory loaded");
          }}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
        >
          Load Sample Inventory
        </Button>
      )}

      {/* Inventory List */}
      {inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Archive className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No inventory items</p>
          <p className="text-sm">Add products to track inventory</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inventory.map((item) => {
            const status = getStockStatus(item);
            const StatusIcon = status.icon;
            const stockPercentage = (item.currentStock / item.maxStock) * 100;

            return (
              <Card key={item.id} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">SN: {item.serialNumber}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full ${status.bgColor} flex items-center gap-1`}>
                      <StatusIcon className={`w-3 h-3 ${status.color}`} />
                      <span className={`text-xs font-medium ${status.color}`}>
                        {status.status}
                      </span>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Current: {item.currentStock}</span>
                      <span>Max: {item.maxStock}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          stockPercentage <= (item.minStock / item.maxStock) * 100 
                            ? "bg-red-500" 
                            : stockPercentage >= 80 
                            ? "bg-orange-500" 
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Min Stock: {item.minStock} | Last Updated: {item.lastUpdated}
                    </p>
                  </div>

                  {/* Adjustment Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-green-600 hover:bg-green-50"
                      onClick={() => {
                        setSelectedItem(item);
                        setAdjustmentType("add");
                        setIsDialogOpen(true);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Add Stock
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setSelectedItem(item);
                        setAdjustmentType("remove");
                        setIsDialogOpen(true);
                      }}
                    >
                      <TrendingDown className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stock Adjustment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === "add" ? "Add Stock" : "Remove Stock"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Product</p>
              <p className="font-medium">{selectedItem?.productName}</p>
              <p className="text-sm text-gray-600">Current Stock: {selectedItem?.currentStock}</p>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentQty}
                onChange={(e) => setAdjustmentQty(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleStockAdjustment}
                className={`flex-1 ${
                  adjustmentType === "add" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {adjustmentType === "add" ? "Add" : "Remove"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setAdjustmentQty("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
