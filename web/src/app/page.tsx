import { redirect } from "next/navigation";

/** Auth redirect is handled in proxy/middleware for speed; this is a fallback. */
export default function HomePage() {
  redirect("/dashboard");
}
