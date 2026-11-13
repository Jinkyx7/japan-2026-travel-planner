import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LockKeyhole, LogIn, LogOut } from "lucide-react";
import { useApp } from "./AppContext";
import { useAuth } from "./AuthContext";
import {
  supabase,
  requireSupabase,
  createPasswordVerifier,
} from "../services/supabase";
import { PageHeading } from "./UI";

export function SignOut() {
  const { t } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function signOut() {
    setBusy(true);
    setError(false);
    try {
      // Clears this browser's session, including when the network is unavailable.
      const { error } = await requireSupabase().auth.signOut({
        scope: "local",
      });
      if (error) throw error;
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button className="button small" disabled={busy} onClick={signOut}>
        <LogOut size={16} />
        {t("Sign out", "退出登录")}
      </button>
      {error && (
        <p role="alert" className="error">
          {t("Could not sign out. Please try again.", "退出失败，请重试。")}
        </p>
      )}
    </div>
  );
}

export function MemberOnly({ children }: { children: ReactNode }) {
  const { t } = useApp();
  const { session, member, loading, error, retry } = useAuth();
  if (!loading && !error && member) return children;
  return (
    <div className="narrow member-access">
      <PageHeading
        eyebrow="JAPAN 2026"
        title={t("Our shared expenses", "我们的旅行账本")}
        subtitle={t(
          "Trip members only. Keep every shared expense together.",
          "旅行成员专属，一起记录每一笔共同花销。",
        )}
      />
      <section className="panel auth-card">
        <LockKeyhole size={28} aria-hidden="true" />
        {!supabase ? (
          <p>
            {t(
              "The shared ledger is being set up. Please come back soon.",
              "共享账本正在设置中，请稍后再来。",
            )}
          </p>
        ) : loading ? (
          <p role="status">{t("Checking your access…", "正在确认成员权限…")}</p>
        ) : error ? (
          <>
            <p role="alert">
              {t(
                "We couldn't check your access. Connect to the internet and try again.",
                "暂时无法确认权限，请联网后重试。",
              )}
            </p>
            <button className="button primary" onClick={retry}>
              {t("Try again", "重试")}
            </button>
            {session && <SignOut />}
          </>
        ) : session ? (
          <>
            <h2>{t("You're signed in", "你已登录")}</h2>
            <p className="auth-email">{session.user.email}</p>
            <p>
              {t(
                "This account isn't on the trip's member list. Ask the trip organiser to add this email, or sign in with your invited address.",
                "这个邮箱还不在旅行成员名单中。请联系组织者添加，或使用已获准的邮箱登录。",
              )}
            </p>
            <button className="button" onClick={retry}>
              {t("Check again", "重新检查")}
            </button>
            <SignOut />
          </>
        ) : (
          <PasswordLogin />
        )}
      </section>
      <p className="muted small-copy">
        {t(
          "Everyone can browse the itinerary and maps. Expenses are only shared with approved trip members.",
          "所有人都可以浏览行程和地图，账目仅向获准的旅行成员开放。",
        )}
      </p>
      <Link className="text-link" to="/itinerary">
        {t("Explore the itinerary", "查看行程")}
      </Link>
    </div>
  );
}

function PasswordLogin() {
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await requireSupabase().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      setPassword("");
    } catch {
      setError(
        t(
          "Couldn't sign in. Check your email and website password, and make sure you're online.",
          "登录失败，请检查邮箱、网站密码和网络连接。",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h2>{t("Sign in to your trip", "登录旅行账号")}</h2>
      <p>
        {t(
          "Use the email and website password provided by your trip organiser.",
          "请输入旅行组织者提供的邮箱和网站密码。",
        )}
      </p>
      <form className="auth-form" onSubmit={signIn}>
        <label htmlFor="login-email">{t("Email address", "邮箱地址")}</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />
        <label htmlFor="login-password">
          {t("Website password", "网站密码")}
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
        />
        <button className="button primary" disabled={busy} type="submit">
          <LogIn size={17} />
          {busy ? t("Signing in…", "登录中…") : t("Sign in", "登录")}
        </button>
      </form>
      <p className="muted small-copy">
        {t(
          "Need an account or a password reset? Contact your trip organiser.",
          "需要开通账号或重置密码？请联系旅行组织者。",
        )}
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </>
  );
}

export function ChangePassword() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function change(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const currentPassword = String(fields.get("currentPassword"));
    const next = String(fields.get("newPassword"));
    setError("");
    setDone(false);
    if (next !== String(fields.get("confirmPassword"))) {
      setError(t("The new passwords don't match.", "两次输入的新密码不一致。"));
      return;
    }
    if (new TextEncoder().encode(next).length > 72) {
      setError(
        t(
          "Use a password within 72 UTF-8 bytes.",
          "密码的 UTF-8 长度不能超过72字节。",
        ),
      );
      return;
    }
    setBusy(true);
    try {
      // Verify the current password in a non-persistent client, preserving this browser's session.
      const client = requireSupabase();
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();
      if (userError || !user?.email)
        throw userError ?? new Error("Sign in again.");
      const verifier = createPasswordVerifier();
      try {
        const { error: verificationError } =
          await verifier.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
          });
        if (verificationError) throw verificationError;
        const { error } = await client.auth.updateUser({
          password: next,
          current_password: currentPassword,
        });
        if (error) throw error;
      } finally {
        await verifier.auth.signOut({ scope: "local" });
      }
      form.reset();
      setDone(true);
      setOpen(false);
    } catch {
      setError(
        t(
          "Couldn't update your password. Check the current password and connection. You may need to sign out and sign in again before retrying.",
          "密码修改失败，请检查当前密码和网络；必要时退出并重新登录后再试。",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel auth-card password-settings">
      <h2>{t("Website password", "网站密码")}</h2>
      {done && (
        <p role="status">
          {t(
            "Password updated. Use your new password next time you sign in.",
            "密码已修改，下次登录请使用新密码。",
          )}
        </p>
      )}
      {!open ? (
        <button
          className="button"
          onClick={() => {
            setOpen(true);
            setDone(false);
          }}
        >
          {t("Change password", "修改密码")}
        </button>
      ) : (
        <form className="auth-form" onSubmit={change}>
          <label htmlFor="current-password">
            {t("Current password", "当前密码")}
          </label>
          <input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            disabled={busy}
          />
          <label htmlFor="new-password">
            {t(
              "New password (at least 12 characters)",
              "新密码（至少12个字符）",
            )}
          </label>
          <input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={72}
            required
            disabled={busy}
          />
          <label htmlFor="confirm-password">
            {t("Confirm new password", "确认新密码")}
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={72}
            required
            disabled={busy}
          />
          <div className="auth-actions">
            <button className="button primary" type="submit" disabled={busy}>
              {busy ? t("Saving…", "保存中…") : t("Save password", "保存密码")}
            </button>
            <button
              className="button"
              type="button"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                setError("");
              }}
            >
              {t("Cancel", "取消")}
            </button>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
