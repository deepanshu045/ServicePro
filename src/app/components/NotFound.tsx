import { Link } from "react-router";
import { Home } from "lucide-react";
import { Button } from "./ui/button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </Link>
    </div>
  );
}
