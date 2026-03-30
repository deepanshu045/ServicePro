import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Dashboard } from "./components/Dashboard";
import { Products } from "./components/Products";
import { Services } from "./components/Services";
import { Customers } from "./components/Customers";
import { Billing } from "./components/Billing";
import { Inventory } from "./components/Inventory";
import { Warranty } from "./components/Warranty";
import { ServiceSchedule } from "./components/ServiceSchedule";
import { DefectTracking } from "./components/DefectTracking";
import { Search } from "./components/Search";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "products", Component: Products },
      { path: "services", Component: ServiceSchedule },
      { path: "customers", Component: Customers },
      { path: "billing", Component: Billing },
      { path: "inventory", Component: Inventory },
      { path: "warranty", Component: Warranty },
      { path: "defects", Component: DefectTracking },
      { path: "search", Component: Search },
      { path: "*", Component: NotFound },
    ],
  },
]);
