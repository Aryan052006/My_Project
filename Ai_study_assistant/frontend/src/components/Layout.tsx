import Navbar from "./Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({
  children,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      <Navbar />

      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  );
}