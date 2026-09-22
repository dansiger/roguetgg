// Provider-neutral, local-only events. A future approved adapter can subscribe.
// Never include names, email addresses, URLs with query strings, or raw user input.
export function track(name, detail = {}) {
  window.dispatchEvent(
    new CustomEvent("criticalpath:analytics", { detail: { name, ...detail } }),
  );
}
