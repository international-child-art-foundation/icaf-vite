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
    <div className="flex min-h-screen flex-col max-w-screen-2xl w-full mx-auto px-0 box-border">
      <NavigationBar />
      <main className="flex-1 mt-[98px]">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
