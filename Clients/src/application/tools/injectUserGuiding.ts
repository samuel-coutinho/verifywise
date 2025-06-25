const injectUserGuidingScript = (debug = false): void => {
   if (!import.meta.env.PROD && !debug) return;

  const encoded = import.meta.env.VITE_USER_GUIDING_SCRIPT_BASE64;
  if (!encoded) {
    if (debug) console.warn("UserGuiding: No script base64 found.");
    return;
  }

  const decoded = atob(encoded);

  if (!decoded.includes('<script')) {
    if (debug) console.warn("Decoded content does not contain a <script> tag.");
    return;
  }

  // Create a <script> element and set the JS content directly
  const jsContent = decoded
    .replace(/<script>/, '')
    .replace(/<\/script>/, '')
    .trim();

  const script = document.createElement("script");
  script.textContent = jsContent;
  script.async = true;

  document.body.appendChild(script);

  if (debug) {
    console.log("✅ UserGuiding script injected.");
    const banner = document.createElement("div");
    banner.textContent = "UserGuiding script loaded ✅";
    Object.assign(banner.style, {
      position: "fixed",
      top: "10px",
      right: "10px",
      backgroundColor: "#333",
      color: "white",
      padding: "8px 12px",
      borderRadius: "6px",
      zIndex: "9999",
      fontSize: "14px",
      fontFamily: "sans-serif",
    });
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 5000);
  }
};


export default injectUserGuidingScript;
