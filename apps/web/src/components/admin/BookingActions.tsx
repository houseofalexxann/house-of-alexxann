"use client";

import { useState } from "react";

async function postAction(id: string, action: "mark-paid" | "cancel"): Promise<boolean> {
  const res = await fetch("/api/admin/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, action }),
  });
  return res.ok;
}

/** Confirms receipt of a direct (Venmo/Cash App/Zelle/PayPal) payment. */
export function MarkPaidButton({ bookingId }: { bookingId: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn-gold text-xs disabled:opacity-60"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        if (await postAction(bookingId, "mark-paid")) {
          location.reload();
        } else {
          setBusy(false);
          alert("Couldn't mark that booking paid — please try again.");
        }
      }}
    >
      {busy ? "Confirming…" : "Mark paid"}
    </button>
  );
}

export function CancelButton({ bookingId }: { bookingId: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="text-xs text-rose-600 underline-offset-2 hover:underline disabled:opacity-60"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Cancel this booking and release the slot?")) return;
        setBusy(true);
        if (await postAction(bookingId, "cancel")) {
          location.reload();
        } else {
          setBusy(false);
          alert("Couldn't cancel that booking — please try again.");
        }
      }}
    >
      Cancel
    </button>
  );
}
