import { useState } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
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
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

// Keywords for automatic Electronics detection
const electronicsKeywords = ["washing machine", "fridge", "ac", "tv", "microwave", "fan"];

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    category: "Other", // default category
    price: "",
    stock: "",
    description: "",
  });

  // Detect category based on name
  const detectCategory = (name: string) => {
    const lowerName = name.toLowerCase();
    return electronicsKeywords.some((kw) => lowerName.includes(kw)) ? "Electronics" : "Other";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const category = detectCategory(formData.name);

    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...editingProduct,
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                category: formData.category || category, // override if user selects button
              }
            : p
        )
      );
      toast.success("Product updated successfully");
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        serialNumber: formData.serialNumber,
        category: formData.category || category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description,
      };
      setProducts([...products, newProduct]);
      toast.success("Product added successfully");
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      serialNumber: "",
      category: "Other",
      price: "",
      stock: "",
      description: "",
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      serialNumber: product.serialNumber,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Product deleted successfully");
  };

  // Category buttons
  const categoryButtons = ["Electronics", "Other"];

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  required
                />
              </div>

              {/* Category Buttons */}
              <div>
                <Label>Category *</Label>
                <div className="flex gap-2 mt-1">
                  {categoryButtons.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      size="sm"
                      variant={formData.category === cat ? "default" : "outline"}
                      className={formData.category === cat ? "bg-blue-600 text-white" : ""}
                      onClick={() => setFormData({ ...formData, category: cat })}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {editingProduct ? "Update" : "Add"} Product
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Package className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No products yet</p>
          <p className="text-sm">Add your first product to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">SN: {product.serialNumber}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">₹{product.price}</p>
                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                  </div>
                </div>
                {product.description && (
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}