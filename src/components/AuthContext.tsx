import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";

type Membership = { traveller_id: string };
const Context = createContext<{
  session: Session | null;
  member: Membership | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}>({} as never);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(!!supabase);
  const [authError, setAuthError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [membership, setMembership] = useState<{
    identity: string;
    member: Membership | null;
    error: boolean;
  } | null>(null);
  const identity = session
    ? `${session.user.id}:${session.user.email ?? ""}`
    : "";

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let receivedEvent = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, next) => {
      receivedEvent = true;
      if (active) {
        setSession(next);
        setInitializing(false);
        setAuthError(false);
      }
    });
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || receivedEvent) return;
        setSession(error ? null : data.session);
        setAuthError(!!error);
        setInitializing(false);
      })
      .catch(() => {
        if (active) {
          setAuthError(true);
          setInitializing(false);
        }
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [revision]);

  useEffect(() => {
    if (!supabase || !identity) {
      setMembership(null);
      return;
    }
    let active = true;
    const client = supabase;
    async function load() {
      try {
        const { data, error } = await client
          .from("trip_members")
          .select("traveller_id")
          .eq("active", true)
          .maybeSingle();
        if (active)
          setMembership({
            identity,
            member: error ? null : data,
            error: !!error,
          });
      } catch {
        if (active) setMembership({ identity, member: null, error: true });
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
  }, [identity, revision]);

  const current = membership?.identity === identity ? membership : null;
  return (
    <Context.Provider
      value={{
        session,
        member: current?.member ?? null,
        loading: initializing || (!!identity && !current),
        error: authError || !!current?.error,
        retry: () => {
          setMembership(null);
          setInitializing(!!supabase);
          setRevision((n) => n + 1);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useAuth = () => useContext(Context);
