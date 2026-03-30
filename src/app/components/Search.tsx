import { useState } from "react";
import { Search as SearchIcon, Package, Phone, Hash, X } from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";

// Mock data for demonstration
const mockData = {
  products: [
    { id: "1", name: "Laptop Dell XPS 15", serialNumber: "LAP001", category: "Electronics", price: 1299, stock: 5 },
    { id: "2", name: "iPhone 14 Pro", serialNumber: "PHN001", category: "Mobile", price: 999, stock: 2 },
    { id: "3", name: "Samsung TV 55\"", serialNumber: "TV001", category: "Electronics", price: 799, stock: 8 },
  ],
  customers: [
    { id: "1", name: "John Smith", mobile: "+1234567890", email: "john@example.com" },
    { id: "2", name: "Sarah Johnson", mobile: "+1234567891", email: "sarah@example.com" },
    { id: "3", name: "Michael Brown", mobile: "+1234567892", email: "michael@example.com" },
  ],
  warranties: [
    { id: "1", productName: "Laptop Dell XPS 15", serialNumber: "LAP001", customerName: "John Smith", customerMobile: "+1234567890" },
    { id: "2", productName: "iPhone 14 Pro", serialNumber: "PHN001", customerName: "Sarah Johnson", customerMobile: "+1234567891" },
  ],
};

export function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "serial" | "mobile" | "product">("all");

  const filterResults = () => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      return { products: [], customers: [], warranties: [] };
    }

    const results = {
      products: mockData.products.filter(p => {
        if (searchType === "serial") return p.serialNumber.toLowerCase().includes(query);
        if (searchType === "product") return p.name.toLowerCase().includes(query);
        if (searchType === "all") return p.name.toLowerCase().includes(query) || p.serialNumber.toLowerCase().includes(query);
        return false;
      }),
      customers: mockData.customers.filter(c => {
        if (searchType === "mobile") return c.mobile.includes(query);
        if (searchType === "all") return c.name.toLowerCase().includes(query) || c.mobile.includes(query) || (c.email && c.email.toLowerCase().includes(query));
        return false;
      }),
      warranties: mockData.warranties.filter(w => {
        if (searchType === "serial") return w.serialNumber.toLowerCase().includes(query);
        if (searchType === "mobile") return w.customerMobile.includes(query);
        if (searchType === "product") return w.productName.toLowerCase().includes(query);
        if (searchType === "all") return w.productName.toLowerCase().includes(query) || w.serialNumber.toLowerCase().includes(query) || w.customerName.toLowerCase().includes(query) || w.customerMobile.includes(query);
        return false;
      }),
    };

    return results;
  };

  const results = filterResults();
  const totalResults = results.products.length + results.customers.length + results.warranties.length;

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Records</h2>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by serial number, mobile, or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Type Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSearchType("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            searchType === "all" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSearchType("serial")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            searchType === "serial" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Hash className="w-4 h-4" />
          Serial Number
        </button>
        <button
          onClick={() => setSearchType("mobile")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            searchType === "mobile" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Phone className="w-4 h-4" />
          Mobile Number
        </button>
        <button
          onClick={() => setSearchType("product")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            searchType === "product" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Package className="w-4 h-4" />
          Product Name
        </button>
      </div>

      {/* Results */}
      {!searchQuery ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <SearchIcon className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">Start searching</p>
          <p className="text-sm text-center">Enter serial number, mobile number, or product name</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <SearchIcon className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Found <span className="font-bold">{totalResults}</span> result(s)
          </p>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="products">
                Products ({results.products.length})
              </TabsTrigger>
              <TabsTrigger value="customers">
                Customers ({results.customers.length})
              </TabsTrigger>
              <TabsTrigger value="warranties">
                Warranties ({results.warranties.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-3 mt-4">
              {results.products.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No products found</p>
              ) : (
                results.products.map((product) => (
                  <Card key={product.id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-600">SN: {product.serialNumber}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{product.category}</Badge>
                            <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">₹{product.price}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="customers" className="space-y-3 mt-4">
              {results.customers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No customers found</p>
              ) : (
                results.customers.map((customer) => (
                  <Card key={customer.id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2">{customer.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {customer.mobile}
                        </div>
                        {customer.email && (
                          <p className="text-sm text-gray-600 ml-6">{customer.email}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="warranties" className="space-y-3 mt-4">
              {results.warranties.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No warranties found</p>
              ) : (
                results.warranties.map((warranty) => (
                  <Card key={warranty.id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">{warranty.productName}</h3>
                      <p className="text-sm text-gray-600 mb-2">SN: {warranty.serialNumber}</p>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Customer:</span>
                          <span className="font-medium">{warranty.customerName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Mobile:</span>
                          <span className="font-medium">{warranty.customerMobile}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}