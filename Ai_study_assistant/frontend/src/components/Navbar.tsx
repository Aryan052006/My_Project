import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6">

      <h1 className="text-xl font-bold mb-8">
        AI Study Assistant
      </h1>

      <div className="flex flex-col gap-4">

        <Link
          to="/"
          className="hover:text-blue-400"
        >
          Dashboard
        </Link>

        <Link
          to="/chat"
          className="hover:text-blue-400"
        >
          Chat Assistant
        </Link>

        <Link
          to="/solver"
          className="hover:text-blue-400"
        >
          Question Solver
        </Link>

        <Link
            to="/documents"
            className="hover:text-blue-400"
        >
            Documents
        </Link>
      </div>

    </aside>
  );
}