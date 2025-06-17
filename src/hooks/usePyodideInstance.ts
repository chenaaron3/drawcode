// src/hooks/usePyodide.ts
import { useEffect, useState } from 'react';

export function usePyodideScript() {
  const [pyodideScriptLoading, setPyodideScriptLoading] = useState(true);
  useEffect(() => {
    async function load() {
      setPyodideScriptLoading(true);
      // Load the Pyodide script from CDN
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      script.onload = async () => {
        setPyodideScriptLoading(false);
      };
      document.body.appendChild(script);
    }

    load();
  }, []);

  return { pyodideScriptLoading };
}
