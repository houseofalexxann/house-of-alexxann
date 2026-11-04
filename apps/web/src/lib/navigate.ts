/**
 * A full-page navigation on purpose. After sign-in, sign-out, a password
 * reset or a payment, the server must re-read cookies and every layout must
 * start fresh, so a soft client transition is the wrong tool. The absolute
 * URL keeps the destination unambiguous for the browser and for lint.
 */
export function hardNavigate(path: string): void {
  window.location.assign(new URL(path, window.location.origin));
}
