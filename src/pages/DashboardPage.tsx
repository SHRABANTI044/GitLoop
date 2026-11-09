import { Navigate } from "react-router-dom";

/** Legacy entry — the dashboard now lives under /dashboard/* with a sidebar layout. */
export default function DashboardPage() {
  return <Navigate to="/dashboard" replace />;
}
