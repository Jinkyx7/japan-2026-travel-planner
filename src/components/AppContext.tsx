import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Language, Traveller } from "../types";
import { readStored, writeStored } from "../services/storage";
import { useAuth } from "./AuthContext";
import { requireSupabase } from "../services/supabase";
import { initialTravellers } from "../data/travellers";
import { preferredLanguage } from "../lib/language";
const Context = createContext<{
  lang: Language;
  t: (en: string, zh: string) => string;
  setLang: (l: Language) => void;
  travellers: Traveller[];
  travellersReady: boolean;
  travellersError: boolean;
  reloadTravellers: () => void;
  saveTravellers: (ts: Traveller[]) => Promise<void>;
}>({} as never);
export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, updateLang] = useState<Language>(() => {
    try {
      return preferredLanguage(
        readStored("language", null),
        navigator.language,
      );
    } catch {
      return preferredLanguage(null, navigator.language);
    }
  });
  const { session, member } = useAuth();
  const identity = member && session ? session.user.id : "";
  const [savedTravellers, setSavedTravellers] = useState<{
    identity: string;
    data: Traveller[];
  } | null>(null);
  const [travellersError, setTravellersError] = useState(false);
  const [travellerRevision, setTravellerRevision] = useState(0);
  const travellers =
    identity && savedTravellers?.identity === identity
      ? savedTravellers.data
      : initialTravellers;
  const travellersReady = !!identity && savedTravellers?.identity === identity;
  useEffect(() => {
    if (!identity) {
      setSavedTravellers(null);
      setTravellersError(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        const { data, error } = await requireSupabase()
          .from("trip_travellers")
          .select("id,display_name,color")
          .order("id");
        if (error || !data?.length)
          throw error ?? new Error("No travellers available.");
        if (active) {
          setSavedTravellers({
            identity,
            data: data.map((p) => ({
              id: p.id,
              displayName: p.display_name,
              color: p.color,
            })),
          });
          setTravellersError(false);
        }
      } catch {
        if (active) {
          setSavedTravellers(null);
          setTravellersError(true);
        }
      }
    }
    void load();
    window.addEventListener("focus", load);
    window.addEventListener("online", load);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
      window.removeEventListener("online", load);
    };
  }, [identity, travellerRevision]);
  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }, [lang]);
  function setLang(l: Language) {
    updateLang(l);
    try {
      writeStored("language", l);
    } catch {
      /* Language remains available in memory. */
    }
  }
  async function saveTravellers(ts: Traveller[]) {
    if (!identity) throw new Error("Trip membership required.");
    // Each name is independently editable; members cannot insert/delete travellers.
    for (const p of ts) {
      if (
        travellers.find((current) => current.id === p.id)?.displayName ===
        p.displayName.trim()
      )
        continue;
      const { data, error } = await requireSupabase()
        .from("trip_travellers")
        .update({ display_name: p.displayName.trim() })
        .eq("id", p.id)
        .select("id")
        .single();
      if (error || !data) throw error ?? new Error("Could not save names.");
    }
    setSavedTravellers({ identity, data: ts });
  }
  return (
    <Context.Provider
      value={{
        lang,
        t: (en, zh) => (lang === "en" ? en : zh),
        setLang,
        travellers,
        travellersReady,
        travellersError,
        reloadTravellers: () => setTravellerRevision((n) => n + 1),
        saveTravellers,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
