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

import { useProducts } from "../hooks/useProducts";
import { Product } from "../hooks/types";

// Keywords for automatic Electronics detection
const electronicsKeywords = ["washing machine", "fridge", "ac", "tv", "microwave", "fan"];

export function Products() {
  const { data: products, loading, addProduct, deleteProduct, fetchProducts } = useProducts();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    category: "Other" as "Electronics" | "Other",
    price: "",
    stock: "",
    description: "",
  });

  // Detect category
  const detectCategory = (name: string): "Electronics" | "Other" => {
    const lowerName = name.toLowerCase();
    return electronicsKeywords.some((kw) => lowerName.includes(kw))
      ? "Electronics"
      : "Other";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const category = detectCategory(formData.name);

    const payload: Partial<Product> = {
      productName: formData.name,
      serialNumber: formData.serialNumber,
      category: (formData.category || category) as "Electronics" | "Other",
      price: Number(formData.price),
      stockQuantity: Number(formData.stock),
      description: formData.description,
    };

    try {
      await addProduct(payload);
      toast.success("Product added successfully");
      fetchProducts();
      resetForm();
    } catch {
      toast.error("Failed to add product");
    }
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
      name: product.productName,
      serialNumber: product.serialNumber,
      category: product.category,
      price: product.price.toString(),
      stock: product.stockQuantity.toString(),
      description: product.description || "",
    });

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      fetchProducts();
      toast.success("Product deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  const categoryButtons: ("Electronics" | "Other")[] = ["Electronics", "Other"];

  // Loading UI
  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

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
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Serial Number *</Label>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Category *</Label>
                <div className="flex gap-2 mt-1">
                  {categoryButtons.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      size="sm"
                      variant={formData.category === cat ? "default" : "outline"}
                      onClick={() =>
                        setFormData({ ...formData, category: cat })
                      }
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Price *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Stock *</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-blue-600">
                  {editingProduct ? "Update" : "Add"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <p>No products yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product._id}>
              <CardContent className="p-4">
                <h3 className="font-bold">{product.productName}</h3>
                <p>SN: {product.serialNumber}</p>
                <p>{product.category}</p>
                <p>₹{product.price}</p>
                <p>Stock: {product.stockQuantity}</p>

                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleEdit(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleDelete(product._id)}
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