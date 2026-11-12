import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Language, Traveller } from "../types";
import {
  readStored,
  writeStored,
  travellerRepository,
} from "../services/storage";
import { initialTravellers } from "../data/travellers";
import { preferredLanguage } from "../lib/language";
const Context = createContext<{
  lang: Language;
  t: (en: string, zh: string) => string;
  setLang: (l: Language) => void;
  travellers: Traveller[];
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
  const [travellers, setTravellers] = useState(initialTravellers);
  useEffect(() => {
    travellerRepository
      .getAll()
      .then(setTravellers)
      .catch(() => {});
  }, []);
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
    await travellerRepository.save(ts);
    setTravellers(ts);
  }
  return (
    <Context.Provider
      value={{
        lang,
        t: (en, zh) => (lang === "en" ? en : zh),
        setLang,
        travellers,
        saveTravellers,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
