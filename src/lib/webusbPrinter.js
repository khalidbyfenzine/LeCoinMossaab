// WebUSB transport for ESC/POS printing (e.g. DURAPOS DPT201-URE-BK over
// USB). No vendor/product ID is hardcoded — the browser's own device
// picker is used so this works with whichever USB printer the user selects,
// and the interface/endpoint to write to are discovered from the device's
// USB descriptors rather than assumed.
//
// WebUSB requires a Chromium-based browser (Chrome/Edge) served over HTTPS
// (or localhost), and navigator.usb.requestDevice() must be called in
// direct response to a user gesture (e.g. a click) or the browser will
// reject it — callers should invoke ensurePrinterConnected() as the first
// step of a click handler, before any other awaited work.

let cachedPrinter = null;

export function isWebUsbSupported() {
  return typeof navigator !== 'undefined' && !!navigator.usb;
}

async function claimPrinter(device) {
  if (!device.opened) {
    await device.open();
  }
  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }

  const iface = device.configuration.interfaces.find((i) =>
    i.alternates.some((alt) => alt.endpoints.some((e) => e.direction === 'out'))
  );
  if (!iface) {
    throw new Error("Aucune interface USB de sortie trouvée sur cette imprimante.");
  }
  if (!iface.claimed) {
    await device.claimInterface(iface.interfaceNumber);
  }

  const alternate = iface.alternates.find((alt) => alt.endpoints.some((e) => e.direction === 'out'));
  const endpoint = alternate.endpoints.find((e) => e.direction === 'out');

  return { device, endpointNumber: endpoint.endpointNumber };
}

export async function ensurePrinterConnected() {
  if (!isWebUsbSupported()) {
    throw new Error("WebUSB n'est pas pris en charge par ce navigateur.");
  }

  if (cachedPrinter) {
    try {
      return await claimPrinter(cachedPrinter.device);
    } catch {
      cachedPrinter = null;
    }
  }

  const known = await navigator.usb.getDevices();
  let device = known[0];
  if (!device) {
    device = await navigator.usb.requestDevice({ filters: [] });
  }

  cachedPrinter = await claimPrinter(device);
  return cachedPrinter;
}

export async function sendBytes(printer, bytes) {
  const CHUNK_SIZE = 4096;
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    await printer.device.transferOut(printer.endpointNumber, bytes.slice(offset, offset + CHUNK_SIZE));
  }
}
