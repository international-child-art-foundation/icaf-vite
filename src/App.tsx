import { sharedOpenGraph } from "@/data/shared-metadata";
import NavigationBar from "@/components/shared/NavigationBar";
import Footer from "@/components/shared/Footer";
import "./index.css";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";

export const metadata = {
  title: "Home | ICAF",
  openGraph: {
    ...sharedOpenGraph,
    title: "Home | ICAF",
  },
};

export default function App() {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <div className="flex min-h-screen flex-col">
          <NavigationBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
