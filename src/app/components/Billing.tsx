import { useState } from "react";
import { Plus, Download, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";

interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Bill {
  id: string;
  customerName: string;
  customerMobile: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  paymentUPI: string;
}

export function Billing() {
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [items, setItems] = useState<BillItem[]>([]);
  const [currentItem, setCurrentItem] = useState({ name: "", quantity: "", price: "" });
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [paymentUPI, setPaymentUPI] = useState("deepanshukarma7@axl");
  const [showPayment, setShowPayment] = useState(false);

  const addItem = () => {
    if (!currentItem.name || !currentItem.quantity || !currentItem.price) {
      toast.error("Please fill all item fields");
      return;
    }

    const newItem: BillItem = {
      id: Date.now().toString(),
      name: currentItem.name,
      quantity: Number(currentItem.quantity),
      price: Number(currentItem.price),
      total: Number(currentItem.quantity) * Number(currentItem.price),
    };

    setItems([...items, newItem]);
    setCurrentItem({ name: "", quantity: "", price: "" });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = 0; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const generateBill = () => {
    if (!customerName || !customerMobile) {
      toast.error("Please enter customer details");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const { subtotal, tax, total } = calculateTotals();

    const bill: Bill = {
      id: Date.now().toString(),
      customerName,
      customerMobile,
      items,
      subtotal,
      tax,
      total,
      date: new Date().toLocaleDateString(),
      paymentUPI,
    };

    setGeneratedBill(bill);
    setShowPayment(true);
    toast.success("Bill generated successfully");
  };

  const downloadPDF = () => {
    if (!generatedBill) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("INVOICE", 105, 20, { align: "center" });
    
    // Customer Details
    doc.setFontSize(12);
    doc.text(`Bill ID: ${generatedBill.id}`, 20, 40);
    doc.text(`Date: ${generatedBill.date}`, 20, 48);
    doc.text(`Customer: ${generatedBill.customerName}`, 20, 56);
    doc.text(`Mobile: ${generatedBill.customerMobile}`, 20, 64);
    
    // Items Table Header
    doc.setFontSize(10);
    doc.text("Item", 20, 80);
    doc.text("Qty", 120, 80);
    doc.text("Price", 145, 80);
    doc.text("Total", 170, 80);
    
    // Items
    let y = 90;
    generatedBill.items.forEach((item) => {
      doc.text(item.name, 20, y);
      doc.text(item.quantity.toString(), 120, y);
      doc.text(`₹${item.price.toFixed(2)}`, 145, y);
      doc.text(`₹${item.total.toFixed(2)}`, 170, y);
      y += 8;
    });
    
    // Totals
    y += 10;
    doc.text(`Subtotal: ₹${generatedBill.subtotal.toFixed(2)}`, 145, y);
    doc.text(`Tax (10%): ₹${generatedBill.tax.toFixed(2)}`, 145, y + 8);
    doc.setFontSize(12);
    doc.text(`Total: ₹${generatedBill.total.toFixed(2)}`, 145, y + 18);
    
    doc.save(`invoice-${generatedBill.id}.pdf`);
    toast.success("PDF downloaded successfully");
  };

  const shareViaWhatsApp = () => {
    if (!generatedBill) return;

    const message = `*INVOICE*\n\nBill ID: ${generatedBill.id}\nDate: ${generatedBill.date}\nCustomer: ${generatedBill.customerName}\n\nItems:\n${generatedBill.items.map(item => `${item.name} x${item.quantity} - ₹${item.total.toFixed(2)}`).join('\n')}\n\nSubtotal: ₹${generatedBill.subtotal.toFixed(2)}\nTax: ₹${generatedBill.tax.toFixed(2)}\n*Total: ₹${generatedBill.total.toFixed(2)}*\n\nPay via UPI: ${generatedBill.paymentUPI}`;

    const whatsappUrl = `https://wa.me/${generatedBill.customerMobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const { subtotal, tax, total } = calculateTotals();
  const upiPaymentString = `upi://pay?pa=${paymentUPI}&pn=DeepanshuStore&am=${generatedBill?.total?.toFixed(2)}&cu=INR`;

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Bill</h2>

      {!showPayment ? (
        <div className="space-y-4">
          {/* Customer Details */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Customer Details</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customerMobile">Mobile Number *</Label>
                  <Input
                    id="customerMobile"
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentUPI">Payment UPI ID</Label>
                  <Input
                    id="paymentUPI"
                    value={paymentUPI}
                    onChange={(e) => setPaymentUPI(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Items */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Add Items</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={currentItem.price}
                      onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addItem} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          {items.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3">Bill Items</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-blue-600">₹{item.total.toFixed(2)}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate Bill Button */}
          <Button 
            onClick={generateBill} 
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
          >
            Generate Bill
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bill Summary */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Bill Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill ID:</span>
                  <span className="font-medium">{generatedBill?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{generatedBill?.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile:</span>
                  <span className="font-medium">{generatedBill?.customerMobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{generatedBill?.date}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Amount:</span>
                  <span className="text-green-600">₹{generatedBill?.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code for Payment */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-center">Scan to Pay</h3>
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <QRCodeSVG value={upiPaymentString} size={200} />
              </div>
              <p className="text-center text-sm text-gray-600 mt-3">UPI: {paymentUPI}</p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={shareViaWhatsApp} 
              className="w-full bg-green-600 hover:bg-green-700 h-12"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share via WhatsApp
            </Button>
            <Button 
              onClick={downloadPDF} 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </Button>
            <Button 
              onClick={() => {
                setShowPayment(false);
                setGeneratedBill(null);
                setItems([]);
                setCustomerName("");
                setCustomerMobile("");
              }} 
              variant="outline"
              className="w-full h-12"
            >
              Create New Bill
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}