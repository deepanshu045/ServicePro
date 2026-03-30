import { Link } from "react-router";
import { 
  Package, 
  Wrench, 
  Users, 
  FileText, 
  Archive, 
  Shield, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function Dashboard() {
  const stats = [
    { label: "Total Products", value: "0", icon: Package, color: "text-blue-600" },
    { label: "Active Services", value: "0", icon: Wrench, color: "text-green-600" },
    { label: "Customers", value: "0", icon: Users, color: "text-purple-600" },
    { label: "Revenue", value: "₹0", icon: DollarSign, color: "text-yellow-600" },
  ];

  const quickActions = [
    { path: "/products", icon: Package, label: "Manage Products", color: "bg-blue-500" },
    // { path: "/services", icon: Wrench, label: "Services", color: "bg-green-500" },
    { path: "/customers", icon: Users, label: "Customers", color: "bg-purple-500" },
    { path: "/billing", icon: FileText, label: "Create Bill", color: "bg-orange-500" },
    { path: "/inventory", icon: Archive, label: "Inventory", color: "bg-teal-500" },
    { path: "/warranty", icon: Shield, label: "Warranties", color: "bg-indigo-500" },
    { path: "/services", icon: Calendar, label: "Schedule Service", color: "bg-pink-500" },
    { path: "/defects", icon: AlertCircle, label: "Defects", color: "bg-red-500" },
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-blue-100">Manage your business efficiently</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95">
                  <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}