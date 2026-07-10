import { useCallback, useRef, useState } from "react";
import { slugify } from "@/lib/slug";

export function useSlugField(initialSlug = "") {
  const [slug, setSlug] = useState(initialSlug);
  const touchedRef = useRef(Boolean(initialSlug));

  const onNameChange = useCallback((name: string) => {
    if (!touchedRef.current) {
      setSlug(slugify(name));
    }
  }, []);

  const onSlugChange = useCallback((value: string) => {
    touchedRef.current = true;
    setSlug(slugify(value));
  }, []);

  const reset = useCallback((value = "") => {
    setSlug(value);
    touchedRef.current = Boolean(value);
  }, []);

  return { slug, onNameChange, onSlugChange, reset, setSlug };
}
