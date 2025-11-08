import Navbar from "@/components/navbar";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      {children}
    </main>
  );
}

export default MainLayout;
