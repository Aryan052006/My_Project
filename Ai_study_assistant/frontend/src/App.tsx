import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Solver from "./pages/Solver";
import Documents from "./pages/Documents";

function App() {
  return (
    <BrowserRouter>
      <Layout>

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/chat"
            element={<Chat />}
          />

          <Route
            path="/solver"
            element={<Solver />}
          />

          <Route
            path="/documents"
            element={<Documents />}
          />
          
        </Routes>

      </Layout>
    </BrowserRouter>
  );
}

export default App;