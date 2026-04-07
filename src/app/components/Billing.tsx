import { useState, useEffect } from "react";
import { Plus, Download, Share2, History, CheckCircle, XCircle, Clock, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import { PDFDownloadLink} from "@react-pdf/renderer";
import InvoiceDocument  from "./Invoicepdf"

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BillItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  termsAndConditions: string;
  razorpayKeyId?: string;
}

interface Bill {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: BillItem[];
  total: number;
  totalInWords: string;
  date: string;
  businessSettings: BusinessSettings;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paidAmount?: number;
  warrantyActivated?: boolean;
  warrantyPeriodMonths?: number;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  productSerialNumber?: string;
}

// Function to convert number to words (Indian format)
function numberToWords(num: number): string {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  if (num === 0) return 'zero';

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';
  if (crore > 0) result += convertLessThanThousand(crore) + ' crore ';
  if (lakh > 0) result += convertLessThanThousand(lakh) + ' lakh ';
  if (thousand > 0) result += convertLessThanThousand(thousand) + ' thousand ';
  if (remainder > 0) result += convertLessThanThousand(remainder);

  return result.trim() + ' Rupees Only';
}

export function Billing() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [items, setItems] = useState<BillItem[]>([]);
  const [currentItem, setCurrentItem] = useState({ description: "", quantity: "", rate: "" });
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [invoiceCounter, setInvoiceCounter] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [billHistory, setBillHistory] = useState<Bill[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>('unpaid');
  const [paidAmount, setPaidAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [warrantyActivated, setWarrantyActivated] = useState(false);
  const [warrantyPeriodMonths, setWarrantyPeriodMonths] = useState('12');
  const [productSerialNumber, setProductSerialNumber] = useState('');

  // Business Settings
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    termsAndConditions: "1. warranty\n2. repair of electrical parts\n3. 6 month on Compressor / motor",
    razorpayKeyId: ""
  });
  const [showSettings, setShowSettings] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('billing_settings');
    const savedCounter = localStorage.getItem('invoice_counter');
    const savedBills = localStorage.getItem('bill_history');

    if (savedSettings) {
      setBusinessSettings(JSON.parse(savedSettings));
    } else {
      // First time - show settings
      setShowSettings(true);
    }

    if (savedCounter) {
      setInvoiceCounter(parseInt(savedCounter));
    }

    if (savedBills) {
      setBillHistory(JSON.parse(savedBills));
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const saveBusinessSettings = () => {
    if (!businessSettings.businessName || !businessSettings.phone || !businessSettings.email || !businessSettings.upiId) {
      toast.error("Please fill all required fields");
      return;
    }
    
    localStorage.setItem('billing_settings', JSON.stringify(businessSettings));
    toast.success('Business settings saved successfully');
    setShowSettings(false);
  };

  const incrementInvoiceCounter = () => {
    const newCounter = invoiceCounter + 1;
    setInvoiceCounter(newCounter);
    localStorage.setItem('invoice_counter', newCounter.toString());
  };

  const addItem = () => {
    if (!currentItem.description || !currentItem.quantity || !currentItem.rate) {
      toast.error("Please fill all item fields");
      return;
    }

    const quantity = Number(currentItem.quantity);
    const rate = Number(currentItem.rate);
    const newItem: BillItem = {
      id: Date.now().toString(),
      description: currentItem.description,
      quantity,
      rate,
      amount: quantity * rate,
    };

    setItems([...items, newItem]);
    setCurrentItem({ description: "", quantity: "", rate: "" });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const generateBill = () => {
    if (!customerName || !customerPhone) {
      toast.error("Please enter customer details");
      return;
    }

    if (!businessSettings.businessName) {
      toast.error("Please configure business settings first");
      setShowSettings(true);
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    if (warrantyActivated && !productSerialNumber) {
      toast.error("Please enter product serial number for warranty activation");
      return;
    }

    const total = calculateTotal();
    const roundedTotal = Math.round(total);

    // Generate invoice number in format: INV/25-26/1
    const currentYear = new Date().getFullYear();
    const financialYearStart = currentYear % 100;
    const financialYearEnd = (currentYear + 1) % 100;
    const invoiceNumber = `INV/${financialYearStart}-${financialYearEnd}/${invoiceCounter}`;

    const billDate = new Date();
    const warrantyEnd = warrantyActivated ? new Date(billDate) : null;
    if (warrantyEnd) {
      warrantyEnd.setMonth(warrantyEnd.getMonth() + parseInt(warrantyPeriodMonths));
    }

    const bill: Bill = {
      id: Date.now().toString(),
      invoiceNumber,
      customerName,
      customerPhone,
      customerAddress,
      items,
      total: roundedTotal,
      totalInWords: numberToWords(roundedTotal),
      date: billDate.toLocaleDateString('en-GB'),
      businessSettings,
      paymentStatus: 'unpaid',
      paidAmount: 0,
      warrantyActivated,
      warrantyPeriodMonths: warrantyActivated ? parseInt(warrantyPeriodMonths) : undefined,
      warrantyStartDate: warrantyActivated ? billDate.toLocaleDateString('en-GB') : undefined,
      warrantyEndDate: warrantyActivated && warrantyEnd ? warrantyEnd.toLocaleDateString('en-GB') : undefined,
      productSerialNumber: warrantyActivated ? productSerialNumber : undefined,
    };

    setGeneratedBill(bill);
    setShowPayment(true);
    setPaymentStatus('unpaid');
    setPaidAmount('');
    incrementInvoiceCounter();
    toast.success("Bill generated successfully");
  };

  const saveBill = (bill: Bill) => {
    const updatedHistory = [bill, ...billHistory];
    setBillHistory(updatedHistory);
    localStorage.setItem('bill_history', JSON.stringify(updatedHistory));
  };

  const updatePaymentStatus = (billId: string, status: 'paid' | 'unpaid' | 'partial', amount?: number) => {
    const updatedHistory = billHistory.map(bill =>
      bill.id === billId
        ? { ...bill, paymentStatus: status, paidAmount: amount || 0 }
        : bill
    );
    setBillHistory(updatedHistory);
    localStorage.setItem('bill_history', JSON.stringify(updatedHistory));

    if (generatedBill && generatedBill.id === billId) {
      setGeneratedBill({ ...generatedBill, paymentStatus: status, paidAmount: amount || 0 });
    }

    toast.success('Payment status updated');
  };

  const saveAndComplete = () => {
    if (!generatedBill) return;

    const billToSave = {
      ...generatedBill,
      paymentStatus,
      paidAmount: paymentStatus === 'partial' ? parseFloat(paidAmount) || 0 : paymentStatus === 'paid' ? generatedBill.total : 0,
    };

    saveBill(billToSave);

    // Reset form
    setShowPayment(false);
    setGeneratedBill(null);
    setItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setPaymentStatus('unpaid');
    setPaidAmount('');
    setWarrantyActivated(false);
    setWarrantyPeriodMonths('12');
    setProductSerialNumber('');

    toast.success('Bill saved successfully');
  };

  const filteredBills = billHistory.filter(bill => {
    const matchesStatus = filterStatus === 'all' || bill.paymentStatus === filterStatus;
    const matchesSearch = searchQuery === '' ||
      bill.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleRazorpayPayment = () => {
    if (!generatedBill) return;

    if (!businessSettings.razorpayKeyId) {
      toast.error("Please configure Razorpay Key ID in Business Settings");
      setShowSettings(true);
      return;
    }

    setIsProcessingPayment(true);

    const options = {
      key: businessSettings.razorpayKeyId,
      amount: generatedBill.total * 100, // Amount in paise
      currency: 'INR',
      name: businessSettings.businessName,
      description: `Invoice ${generatedBill.invoiceNumber}`,
      image: '', // You can add your logo URL here
      order_id: '', // This should come from your backend in production
      handler: function (response: any) {
        // Payment successful
        toast.success('Payment successful!');
        const billToSave = {
          ...generatedBill,
          paymentStatus: 'paid' as const,
          paidAmount: generatedBill.total,
        };
        saveBill(billToSave);
        setPaymentStatus('paid');
        setIsProcessingPayment(false);
      },
      prefill: {
        name: generatedBill.customerName,
        contact: generatedBill.customerPhone,
        email: '',
      },
      notes: {
        invoice_number: generatedBill.invoiceNumber,
        customer_name: generatedBill.customerName,
      },
      theme: {
        color: '#16a34a',
      },
      modal: {
        ondismiss: function () {
          setIsProcessingPayment(false);
          toast.info('Payment cancelled');
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment failed: ' + response.error.description);
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      toast.error('Failed to initialize payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const downloadPDF = () => {
    if (!generatedBill) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    // Border
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
    
    // Header - Business Name (centered)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(generatedBill.businessSettings.businessName, pageWidth / 2, 25, { align: "center" });
    
    // Address (centered)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(generatedBill.businessSettings.address, pageWidth - 2 * margin - 10);
    let yPos = 30;
    addressLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPos, { align: "center" });
      yPos += 4;
    });
    
    // Contact Details (centered)
    doc.text(`Tel.: ${generatedBill.businessSettings.phone}  Email: ${generatedBill.businessSettings.email}`, 
             pageWidth / 2, yPos + 2, { align: "center" });
    
    // Invoice Number and Date
    yPos += 12;
    doc.setFontSize(10);
    doc.text(`Invoice No. : ${generatedBill.invoiceNumber}`, margin + 5, yPos);
    doc.text(`Customer Details`, pageWidth - margin - 50, yPos);
    doc.text(`Dated`, margin + 5, yPos + 5);
    doc.text(`: ${generatedBill.date}`, margin + 35, yPos + 5);
    
    // Customer Details (right side)
    doc.setFont("helvetica", "bold");
    doc.text(generatedBill.customerName, pageWidth - margin - 50, yPos + 5);
    doc.setFont("helvetica", "normal");
    doc.text(`Phone: ${generatedBill.customerPhone}`, pageWidth - margin - 50, yPos + 10);
    if (generatedBill.customerAddress) {
      doc.text(generatedBill.customerAddress, pageWidth - margin - 50, yPos + 15);
    }

    // Warranty Information (if activated)
    if (generatedBill.warrantyActivated) {
      yPos += 20;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Warranty Information:", margin + 5, yPos);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Serial No: ${generatedBill.productSerialNumber}`, margin + 10, yPos + 5);
      doc.text(`Period: ${generatedBill.warrantyPeriodMonths} Months`, margin + 10, yPos + 10);
      doc.text(`Valid Until: ${generatedBill.warrantyEndDate}`, margin + 10, yPos + 15);
      yPos += 10;
    }

    // Items Table
    yPos += 25;
    const tableTop = yPos;
    
    // Table Header
    doc.setFillColor(220, 220, 220);
    doc.rect(margin + 5, yPos, pageWidth - 2 * margin - 10, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("S.N.", margin + 8, yPos + 5);
    doc.text("Description of Goods", margin + 25, yPos + 5);
    doc.text("Qty", pageWidth - margin - 80, yPos + 5);
    doc.text("Rate", pageWidth - margin - 55, yPos + 5);
    doc.text("Amount (Rs.)", pageWidth - margin - 30, yPos + 5);
    
    // Table Items
    yPos += 8;
    doc.setFont("helvetica", "normal");
    generatedBill.items.forEach((item, index) => {
      doc.text((index + 1).toString(), margin + 8, yPos + 5);
      doc.text(item.description, margin + 25, yPos + 5);
      doc.text(`${item.quantity.toFixed(2)} Unit`, pageWidth - margin - 80, yPos + 5);
      doc.text(item.rate.toFixed(2), pageWidth - margin - 55, yPos + 5);
      doc.text(item.amount.toFixed(2), pageWidth - margin - 30, yPos + 5);
      yPos += 7;
    });
    
    // Calculate rounding
    const subtotal = generatedBill.items.reduce((sum, item) => sum + item.amount, 0);
    const roundingDiff = generatedBill.total - subtotal;
    
    // Rounding line if needed
    if (roundingDiff !== 0) {
      doc.setFontSize(8);
      doc.text(`Less : Rounded Off (${roundingDiff.toFixed(2)})`, pageWidth - margin - 80, yPos + 2);
      yPos += 5;
    }
    
    // Grand Total
    yPos += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Grand Total:", pageWidth - margin - 80, yPos);
    doc.text(generatedBill.total.toFixed(2), pageWidth - margin - 30, yPos);
    
    // Amount in Words
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(generatedBill.totalInWords, pageWidth / 2, yPos, { align: "center" });
    
    // Footer section
    const footerTop = pageHeight - 80;
    
    // Bank Details (left)
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Bank Details:", margin + 5, footerTop);
    doc.setFont("helvetica", "normal");
    doc.text(`A/C NO: ${generatedBill.businessSettings.accountNumber}`, margin + 10, footerTop + 5);
    doc.text(`IFSC CODE: ${generatedBill.businessSettings.ifscCode}`, margin + 10, footerTop + 10);
    
    // UPI ID (middle left)
    doc.setFont("helvetica", "bold");
    doc.text("UPI ID:", margin + 5, footerTop + 20);
    doc.setFont("helvetica", "normal");
    doc.text(`${generatedBill.businessSettings.upiId}`, margin + 20, footerTop + 20);
    
    // Terms & Conditions (left)
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions", margin + 5, footerTop + 30);
    doc.setFont("helvetica", "normal");
    const termsLines = generatedBill.businessSettings.termsAndConditions.split('\n');
    let termsY = footerTop + 35;
    termsLines.forEach(line => {
      doc.text(line, margin + 5, termsY);
      termsY += 4;
    });
    
    // Signature (right)
    doc.setFont("helvetica", "bold");
    doc.text("Receiver's Signature :", pageWidth - margin - 60, footerTop + 20);
    doc.line(pageWidth - margin - 60, footerTop + 35, pageWidth - margin - 5, footerTop + 35);
    
    doc.setFontSize(9);
    doc.text(`For ${generatedBill.businessSettings.businessName}`, pageWidth - margin - 60, footerTop + 50, { align: "center" });
    doc.setFontSize(8);
    doc.text("Authorised Signatory", pageWidth - margin - 60, footerTop + 55, { align: "center" });
    
    doc.save(`invoice-${generatedBill.invoiceNumber}.pdf`);
    toast.success("PDF downloaded successfully");
  };

  const shareViaWhatsApp = () => {
    if (!generatedBill) return;

    const message = `*${generatedBill.businessSettings.businessName}*\n\nInvoice No.: ${generatedBill.invoiceNumber}\nDate: ${generatedBill.date}\n\nCustomer: ${generatedBill.customerName}\nPhone: ${generatedBill.customerPhone}\n\nItems:\n${generatedBill.items.map((item, i) => `${i + 1}. ${item.description}\n   ${item.quantity} Unit x ₹${item.rate.toFixed(2)} = ₹${item.amount.toFixed(2)}`).join('\n\n')}\n\n*Grand Total: ₹${generatedBill.total.toFixed(2)}*\n\n${generatedBill.totalInWords}\n\nPay via UPI: ${generatedBill.businessSettings.upiId}`;

    const whatsappUrl = `https://wa.me/${generatedBill.customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const total = calculateTotal();
  const upiPaymentString = `upi://pay?pa=${businessSettings.upiId}&pn=${businessSettings.businessName}&am=${generatedBill?.total.toFixed(2)}&cu=INR`;

  if (showSettings) {
    return (
      <div className="p-4 pb-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Settings</h2>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessSettings.businessName}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, businessName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <textarea
                  id="address"
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={businessSettings.address}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={businessSettings.phone}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessSettings.email}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Bank Account Number</Label>
                <Input
                  id="accountNumber"
                  value={businessSettings.accountNumber}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, accountNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={businessSettings.ifscCode}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, ifscCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="upiId">UPI ID *</Label>
                <Input
                  id="upiId"
                  value={businessSettings.upiId}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, upiId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="razorpayKeyId">Razorpay Key ID (Optional)</Label>
                <Input
                  id="razorpayKeyId"
                  value={businessSettings.razorpayKeyId}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, razorpayKeyId: e.target.value })}
                  placeholder="rzp_test_xxxxxxxxxxxxx"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your Razorpay Key ID to enable online payments
                </p>
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <textarea
                  id="terms"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={businessSettings.termsAndConditions}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, termsAndConditions: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={saveBusinessSettings} className="flex-1 bg-green-600 hover:bg-green-700">
                  Save Settings
                </Button>
                <Button onClick={() => setShowSettings(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showHistory) {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'paid':
          return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'unpaid':
          return <XCircle className="w-5 h-5 text-red-600" />;
        case 'partial':
          return <Clock className="w-5 h-5 text-yellow-600" />;
        default:
          return null;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'paid':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'unpaid':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'partial':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className="p-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Bills History</h2>
          <Button
            onClick={() => setShowHistory(false)}
            variant="outline"
            size="sm"
          >
            Back
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-4">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <Label>Search</Label>
                <Input
                  placeholder="Invoice no., customer name, or phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bills List */}
        <div className="space-y-3">
          {filteredBills.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="p-8 text-center text-gray-500">
                No bills found
              </CardContent>
            </Card>
          ) : (
            filteredBills.map((bill) => (
              <Card key={bill.id} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{bill.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{bill.date}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(bill.paymentStatus)}`}>
                      {getStatusIcon(bill.paymentStatus)}
                      <span className="text-xs font-medium capitalize">{bill.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm mb-3">
                    <p><span className="text-gray-600">Customer:</span> <span className="font-medium">{bill.customerName}</span></p>
                    <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{bill.customerPhone}</span></p>
                    <p><span className="text-gray-600">Total:</span> <span className="font-bold text-blue-600">₹{bill.total.toFixed(2)}</span></p>
                    {bill.paymentStatus === 'partial' && (
                      <p><span className="text-gray-600">Paid:</span> <span className="font-medium text-green-600">₹{bill.paidAmount?.toFixed(2)}</span></p>
                    )}
                    {bill.warrantyActivated && (
                      <p className="pt-1 border-t">
                        <span className="text-gray-600">Warranty:</span>
                        <span className="font-medium text-green-600"> {bill.warrantyPeriodMonths}M</span>
                        <span className="text-xs text-gray-500"> (Until {bill.warrantyEndDate})</span>
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <p className="text-xs font-medium text-gray-700 mb-1">Items:</p>
                    <div className="space-y-1">
                      {bill.items.map((item, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          {idx + 1}. {item.description} ({item.quantity} x ₹{item.rate.toFixed(2)})
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setGeneratedBill(bill);
                        downloadPDF();
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setGeneratedBill(bill);
                        shareViaWhatsApp();
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Select
                      value={bill.paymentStatus}
                      onValueChange={(value: any) => updatePaymentStatus(bill.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Bill</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowHistory(true)}
            variant="outline"
            size="sm"
          >
            <History className="w-4 h-4 mr-1" />
            History
          </Button>
          <Button
            onClick={() => setShowSettings(true)}
            variant="outline"
            size="sm"
          >
            Settings
          </Button>
        </div>
      </div>

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
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customerAddress">Address (Optional)</Label>
                  <Input
                    id="customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty Activation */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Warranty Activation</h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={warrantyActivated}
                    onChange={(e) => setWarrantyActivated(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {warrantyActivated ? 'Activated' : 'Activate'}
                  </span>
                </label>
              </div>

              {warrantyActivated && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <Label htmlFor="productSerialNumber">Product Serial Number *</Label>
                    <Input
                      id="productSerialNumber"
                      value={productSerialNumber}
                      onChange={(e) => setProductSerialNumber(e.target.value)}
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="warrantyPeriod">Warranty Period (Months)</Label>
                    <Select value={warrantyPeriodMonths} onValueChange={setWarrantyPeriodMonths}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Months</SelectItem>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">12 Months (1 Year)</SelectItem>
                        <SelectItem value="24">24 Months (2 Years)</SelectItem>
                        <SelectItem value="36">36 Months (3 Years)</SelectItem>
                        <SelectItem value="60">60 Months (5 Years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Warranty will be valid from:</span> {new Date().toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      <span className="font-medium">Valid until:</span> {(() => {
                        const endDate = new Date();
                        endDate.setMonth(endDate.getMonth() + parseInt(warrantyPeriodMonths));
                        return endDate.toLocaleDateString('en-GB');
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Items */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Add Items</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="description">Description of Goods</Label>
                  <Input
                    id="description"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quantity">Quantity (Unit)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate">Rate (₹)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={currentItem.rate}
                      onChange={(e) => setCurrentItem({ ...currentItem, rate: e.target.value })}
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
                  {items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{index + 1}. {item.description}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} Unit x ₹{item.rate.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-blue-600">₹{item.amount.toFixed(2)}</p>
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

                {/* Total */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total</span>
                    <span className="text-blue-600">₹{Math.round(total).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {numberToWords(Math.round(total))}
                  </p>
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
                  <span className="text-gray-600">Invoice No.:</span>
                  <span className="font-medium">{generatedBill?.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{generatedBill?.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{generatedBill?.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{generatedBill?.customerPhone}</span>
                </div>
                {generatedBill?.warrantyActivated && (
                  <>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Serial Number:</span>
                      <span className="font-medium">{generatedBill?.productSerialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Warranty:</span>
                      <span className="font-medium text-green-600">{generatedBill?.warrantyPeriodMonths} Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="font-medium">{generatedBill?.warrantyEndDate}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Grand Total:</span>
                  <span className="text-green-600">₹{generatedBill?.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Payment Status</h3>
              <div className="space-y-3">
                <div>
                  <Label>Select Payment Status</Label>
                  <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentStatus === 'partial' && (
                  <div>
                    <Label htmlFor="paidAmount">Amount Paid (₹)</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      step="0.01"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder={`Max: ₹${generatedBill?.total.toFixed(2)}`}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* QR Code for Payment */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-center">UPI QR Code</h3>
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <QRCodeSVG value={upiPaymentString} size={200} />
              </div>
              <p className="text-center text-sm text-gray-600 mt-3">Scan to Pay</p>
              <p className="text-center text-xs text-gray-500 mt-1">UPI ID: {businessSettings.upiId}</p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            {businessSettings.razorpayKeyId && (
              <Button
                onClick={handleRazorpayPayment}
                disabled={isProcessingPayment}
                className="w-full bg-purple-600 hover:bg-purple-700 h-12"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {isProcessingPayment ? 'Processing...' : 'Pay with Razorpay'}
              </Button>
            )}
            <Button
              onClick={saveAndComplete}
              className="w-full bg-green-600 hover:bg-green-700 h-12"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Save & Complete
            </Button>
            <Button
              onClick={shareViaWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 h-12"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share via WhatsApp
            </Button>
           {generatedBill && (
  <PDFDownloadLink
    document={<InvoiceDocument bill={generatedBill} />}
    fileName={`invoice-${generatedBill.invoiceNumber}.pdf`}
  >
    {({ loading }) => (
      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12">
        <Download className="w-5 h-5 mr-2" />
        {loading ? "Generating PDF..." : "Download PDF"}
      </Button>
    )}
  </PDFDownloadLink>
)}
            <Button
              onClick={() => {
                setShowPayment(false);
                setGeneratedBill(null);
                setItems([]);
                setCustomerName("");
                setCustomerPhone("");
                setCustomerAddress("");
                setPaymentStatus('unpaid');
                setPaidAmount('');
                setWarrantyActivated(false);
                setWarrantyPeriodMonths('12');
                setProductSerialNumber('');
              }}
              variant="outline"
              className="w-full h-12"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}