import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  Mountain,
  BedDouble,
  Plane,
  House,
  CalendarDays,
  Map,
  Utensils,
  ShoppingBag,
  Wallet,
  Menu,
  Info,
  ArrowUpRight,
} from "lucide-react";
import { useEffect } from "react";
import { useApp } from "./AppContext";
import { InstallApp, PwaNotifications } from "./Pwa";
import { useAuth } from "./AuthContext";
import { SignOut, ChangePassword } from "./MemberAccess";
const navigation = [
  { to: "/", en: "Home", zh: "首页", icon: House },
  { to: "/itinerary", en: "Itinerary", zh: "行程", icon: CalendarDays },
  { to: "/map", en: "Map", zh: "地图", icon: Map },
  { to: "/food", en: "Food", zh: "美食", icon: Utensils },
  { to: "/shopping", en: "Shopping", zh: "购物", icon: ShoppingBag },
  { to: "/expenses", en: "Expenses", zh: "支出", icon: Wallet },
];
export function Layout() {
  const { lang, setLang, t } = useApp();
  const location = useLocation();
  useEffect(() => {
    const anchor = location.hash
      ? document.getElementById(location.hash.slice(1))
      : null;
    if (anchor) anchor.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Skip to content", "跳转至正文")}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/">
            <Mountain size={27} strokeWidth={1.4} />
            <span>
              Japan <b>2026</b>
            </span>
          </Link>
          <nav
            className="desktop-nav"
            aria-label={t("Main navigation", "主导航")}
          >
            {navigation.map((n) => (
              <NavLink key={n.to} end={n.to === "/"} to={n.to}>
                {t(n.en, n.zh)}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="language-toggle"
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
              aria-label={t("Switch to Chinese", "切换到英语")}
            >
              <span className={lang === "en" ? "selected" : ""}>EN</span>
              <span className="divider">/</span>
              <span className={lang === "zh" ? "selected" : ""}>中文</span>
            </button>
            <Link
              to="/more"
              className="icon-button more-desktop"
              aria-label={t("Trip info and more", "旅行信息与更多")}
            >
              <Menu size={21} />
            </Link>
          </div>
        </div>
      </header>
      <PwaNotifications />
      <main id="main" className="main-container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>
          <Mountain size={16} />{" "}
          {t("A little planning. A lot of memories.", "一点规划，满满回忆。")}
        </span>
        <Link to="/photo-credits">{t("Photo credits", "图片来源")}</Link>
        <Link to="/info">
          {t("Trip information", "旅行信息")}
          <ArrowUpRight size={13} />
        </Link>
      </footer>
      <nav
        className="bottom-nav"
        aria-label={t("Mobile navigation", "手机导航")}
      >
        {[
          ...navigation.slice(0, 4),
          { to: "/more", en: "More", zh: "更多", icon: Menu },
        ].map((n) => (
          <NavLink key={n.to} end={n.to === "/"} to={n.to}>
            <n.icon size={20} />
            <span>{t(n.en, n.zh)}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
export function More() {
  const { t, lang, setLang } = useApp();
  const { session, member } = useAuth();
  return (
    <div className="narrow">
      <div className="page-heading">
        <div className="eyebrow">JAPAN 2026</div>
        <h1>{t("A few more things", "旅行小工具")}</h1>
      </div>
      <InstallApp />
      <section className="panel account-card">
        <div>
          <strong>{t("Travel account", "旅行账号")}</strong>
          <p className="auth-email">
            {session?.user.email ??
              t(
                "Sign in to access shared expenses.",
                "登录后查看家庭共享账本。",
              )}
          </p>
          {session && (
            <p className="muted">
              {member
                ? t("Trip member", "旅行成员")
                : t("Not a trip member", "尚未加入旅行")}
            </p>
          )}
        </div>
        {session ? (
          <SignOut />
        ) : (
          <Link className="button" to="/expenses">
            {t("Sign in", "登录")}
          </Link>
        )}
      </section>
      {session && member && <ChangePassword />}
      <div className="panel menu-list">
        {[
          ...navigation.slice(4),
          {
            to: "/accommodation",
            en: "Accommodation",
            zh: "住宿",
            icon: BedDouble,
          },
          { to: "/flights", en: "Flights", zh: "航班", icon: Plane },
          {
            to: "/photo-credits",
            en: "Photo credits",
            zh: "图片来源",
            icon: Info,
          },
          { to: "/info", en: "Trip information", zh: "旅行信息", icon: Info },
        ].map((n) => (
          <Link key={n.to} to={n.to}>
            <n.icon size={22} />
            <strong>{t(n.en, n.zh)}</strong>
            <ArrowUpRight size={18} />
          </Link>
        ))}
        <button onClick={() => setLang(lang === "en" ? "zh" : "en")}>
          {t("Language", "语言")}
          <span>English / 中文</span>
        </button>
      </div>
    </div>
  );
}
