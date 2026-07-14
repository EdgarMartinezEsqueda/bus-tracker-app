import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useEffect, useState } from "react";

const FAVORITES_FILE = `${FileSystem.documentDirectory}favorites.json`;

/**
 * Códigos de ruta favoritos, persistidos en disco (sin cuentas: el favorito
 * vive solo en el dispositivo). Se guarda como JSON: ["C01", "T02"].
 */
const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(FAVORITES_FILE);
        if (!info.exists) return;
        const parsed = JSON.parse(
          await FileSystem.readAsStringAsync(FAVORITES_FILE),
        );
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter((x): x is string => typeof x === "string"));
        }
      } catch {
        // archivo corrupto: se ignora y se regenera al próximo toggle
      }
    })();
  }, []);

  const toggleFavorite = useCallback((code: string) => {
    setFavorites((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      FileSystem.writeAsStringAsync(FAVORITES_FILE, JSON.stringify(next)).catch(
        () => {},
      );
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (code: string) => favorites.includes(code),
    [favorites],
  );

  return { favorites, toggleFavorite, isFavorite };
};

export default useFavorites;
