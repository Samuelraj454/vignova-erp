import AdminPOS from "../admin/AdminPOS";

export default function EmployeePOS() {
  // We reuse the exact same POS interface for both Admin and Employee for now.
  // The layout wrapping it will differentiate the context.
  return <AdminPOS />;
}
