const injectUserGuidingScript = (): void => {
  if (!import.meta.env.PROD) return;

  const encoded = import.meta.env.VITE_USER_GUIDING_SCRIPT_BASE64;
  if (!encoded) return;

  const decoded = atob(encoded);
  const container = document.createElement("div");
  container.innerHTML = decoded;

  const script = container.querySelector("script");
  if (script) {
    document.body.appendChild(script);
  }
};

export default injectUserGuidingScript;
