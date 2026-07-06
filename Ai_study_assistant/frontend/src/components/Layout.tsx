import Navbar from "./Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({
  children,
}: LayoutProps) {
  return (
    <div className="min-h-screen text-[#F8FAFC] flex overflow-hidden selection:bg-[#2563EB]/30">
      <Navbar />
      <main className="flex-1 p-10 h-screen overflow-y-auto">
        <div className="max-w-[1200px] mx-auto animate-fade-in pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}