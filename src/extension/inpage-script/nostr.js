import NostrProvider from "../ln/nostr";

if (document) {
  window.nostr = new NostrProvider();
  const readyEvent = new Event("nostr:ready");
  window.dispatchEvent(readyEvent);
}
