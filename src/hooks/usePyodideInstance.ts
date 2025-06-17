// src/hooks/usePyodide.ts
import { useEffect, useState } from 'react';

export function usePyodideInstance() {
  const [pyodide, setPyodide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Load the Pyodide script from CDN
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      script.onload = async () => {
        const pyodide = await (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
        });
        setPyodide(pyodide);
        setLoading(false);
      };
      document.body.appendChild(script);
    }

    load();
  }, []);

  return { pyodide, loading };
}
