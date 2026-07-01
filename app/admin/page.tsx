import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  // Redirect root /admin to the login page which is the intended entry point
  redirect("/admin/login");
}
