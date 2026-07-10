import { redirect } from "next/navigation";

/** The Studio now lives as one tab per system. */
export default function StudioRedirect() {
  redirect("/western");
}
