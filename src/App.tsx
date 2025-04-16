import NavigationBar from "@/components/shared/NavigationBar";
import Footer from "@/components/shared/Footer";
import "./index.css";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import { Gallery } from "@/components/mock/Gallery";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <NavigationBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* MOCK: Routes for testing DB */}
            <Route path="/gallery" element={<Gallery />} />
            {/* MOCK: end */}
          </Routes>
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
