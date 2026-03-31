import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import CreateProfileModal from "./components/CreateProfileModal";
import Footer from "./components/Footer";
import Header from "./components/Header";
import CreateBorrowRequestPage from "./pages/CreateBorrowRequestPage";
import CreateLoanListingPage from "./pages/CreateLoanListingPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Root layout component
function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CreateProfileModal />
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/marketplace",
  component: MarketplacePage,
});

const createLoanListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-loan-listing",
  component: CreateLoanListingPage,
});

const createBorrowRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-borrow-request",
  component: CreateBorrowRequestPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  marketplaceRoute,
  createLoanListingRoute,
  createBorrowRequestRoute,
  dashboardRoute,
  profileRoute,
]);

// Create router
const router = createRouter({ routeTree });

// TypeScript augmentation for router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
