import { redirect } from "next/navigation";

/** Booking always begins from a reading, so /book on its own goes to the Chamber. */
export default function BookIndex() {
  redirect("/services");
}
