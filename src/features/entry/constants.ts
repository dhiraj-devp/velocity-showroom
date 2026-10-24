export const ENTRY_STORAGE_KEY = "velocity-entry-seen";
export const ENTRY_STORAGE_VALUE = "1";

/** Passive intro before the enter action is available. */
export const ENTRY_READY_MS = 2000;

/** Overlay fade after the user chooses to enter. */
export const ENTRY_EXIT_MS = 820;

export const entryCopy = {
  brand: "VELOCITY",
  collection: "PRIVATE COLLECTION",
  edition: "2026",
  action: "ENTER THE COLLECTION",
} as const;

/**
 * Reset the cinematic entry for local development:
 * sessionStorage.removeItem("velocity-entry-seen"); location.reload();
 */
export const ENTRY_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(ENTRY_STORAGE_KEY)};var seen=sessionStorage.getItem(k)===${JSON.stringify(ENTRY_STORAGE_VALUE)};var r=document.documentElement;r.dataset.entrySeen=seen?"1":"0";if(!seen)r.dataset.entryActive="1";}catch(e){}})();`;
