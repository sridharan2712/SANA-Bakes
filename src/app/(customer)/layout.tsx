import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthProvider } from "@/providers/AuthProvider";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <CartDrawer />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
