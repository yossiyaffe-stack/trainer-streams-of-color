import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Training from "./pages/Training";
import Explore from "./pages/Explore";
import Paintings from "./pages/Paintings";
import Hub from "./pages/Hub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main page is now Faces/Training */}
          <Route path="/" element={<Training />} />
          <Route path="/faces" element={<Navigate to="/" replace />} />
          <Route path="/training" element={<Navigate to="/" replace />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/paintings" element={<Paintings />} />
          <Route path="/hub" element={<Hub />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
