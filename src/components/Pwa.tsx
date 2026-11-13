import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Download,
  CheckCircle2,
  Smartphone,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useApp } from "./AppContext";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
function standalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
const PwaContext = createContext<{
  online: boolean;
  cached: boolean;
  installed: boolean;
  canInstall: boolean;
  registrationFailed: boolean;
  installFailed: boolean;
  needRefresh: boolean;
  install: () => Promise<void>;
  update: () => Promise<void>;
  dismissUpdate: () => void;
} | null>(null);
function usePwa() {
  const value = useContext(PwaContext);
  if (!value) throw new Error("PwaProvider is required");
  return value;
}
export function PwaProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [cached, setCached] = useState(false);
  const [installed, setInstalled] = useState(standalone);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const [installFailed, setInstallFailed] = useState(false);
  const registration = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const lastCheck = useRef(0);
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_url, worker) {
      registration.current = worker;
    },
    onRegisterError() {
      setRegistrationFailed(true);
    },
  });
  useEffect(() => {
    let disposed = false;
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker.ready.then(() => {
        if (!disposed) setCached(true);
      });
    const checkUpdate = () => {
      if (
        !navigator.onLine ||
        document.visibilityState !== "visible" ||
        Date.now() - lastCheck.current < 60000
      )
        return;
      lastCheck.current = Date.now();
      void registration.current?.update().catch(() => {
        /* Try again on the next visit. */
      });
    };
    const connected = () => {
      setOnline(true);
      checkUpdate();
    };
    const disconnected = () => setOnline(false);
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const appInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    const mode = window.matchMedia("(display-mode: standalone)");
    const modeChanged = () => setInstalled(standalone());
    window.addEventListener("online", connected);
    window.addEventListener("offline", disconnected);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", appInstalled);
    document.addEventListener("visibilitychange", checkUpdate);
    mode.addEventListener("change", modeChanged);
    return () => {
      disposed = true;
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", disconnected);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", appInstalled);
      document.removeEventListener("visibilitychange", checkUpdate);
      mode.removeEventListener("change", modeChanged);
    };
  }, []);
  async function install() {
    if (!prompt) return;
    setInstallFailed(false);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      setInstallFailed(true);
    } finally {
      setPrompt(null);
    }
  }
  return (
    <PwaContext.Provider
      value={{
        online,
        cached: cached || offlineReady,
        installed,
        canInstall: !!prompt,
        registrationFailed,
        installFailed,
        needRefresh,
        install,
        update: () => updateServiceWorker(true),
        dismissUpdate: () => setNeedRefresh(false),
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}
export function PwaNotifications() {
  const { t } = useApp();
  const { online, cached, needRefresh, update, dismissUpdate } = usePwa();
  const [updating, setUpdating] = useState(false);
  const [failed, setFailed] = useState(false);
  async function applyUpdate() {
    setUpdating(true);
    setFailed(false);
    try {
      await update();
    } catch {
      setFailed(true);
    } finally {
      setUpdating(false);
    }
  }
  return (
    <>
      {!online && (
        <div className="offline-banner" role="status">
          <WifiOff size={17} />
          <span>
            {cached
              ? t(
                  "You're offline. Saved plans are available; maps, the shared ledger and external links need internet.",
                  "当前离线。可查看已保存的行程；地图、共享账本和外部链接需要联网。",
                )
              : t(
                  "You're offline. Reconnect to save your plans for offline use.",
                  "当前离线。请联网后保存离线行程。",
                )}
          </span>
        </div>
      )}
      {needRefresh && (
        <aside className="pwa-update" aria-label={t("App update", "应用更新")}>
          <div role="status">
            <strong>{t("A new version is ready", "新版本已准备好")}</strong>
            <p>
              {t(
                "Update when you've finished your current edit.",
                "请先完成当前编辑，再更新应用。",
              )}
            </p>
          </div>
          {failed && (
            <p role="alert">
              {t(
                "Couldn't update. Please try again online.",
                "更新未成功，请联网后重试。",
              )}
            </p>
          )}
          <div className="pwa-actions">
            <button
              className="button primary"
              onClick={applyUpdate}
              disabled={updating || !online}
            >
              <RefreshCw size={16} />
              {updating
                ? t("Updating…", "正在更新…")
                : t("Update now", "立即更新")}
            </button>
            <button className="button" onClick={dismissUpdate}>
              {t("Later", "稍后")}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
export function InstallApp() {
  const { t } = useApp();
  const {
    installed,
    canInstall,
    install,
    cached,
    registrationFailed,
    installFailed,
  } = usePwa();
  return (
    <section
      className="panel pwa-install"
      aria-labelledby="install-app-heading"
    >
      <div className="pwa-install-heading">
        <img src="/icons/icon-192.png" alt="" width="52" height="52" />
        <div>
          <h2 id="install-app-heading">
            {t(
              "Japan 2026, on your home screen",
              "把 Japan 2026 放到手机主屏幕",
            )}
          </h2>
          <p>
            {t("Your plans, one tap away.", "轻点图标，即可打开旅行计划。")}
          </p>
        </div>
      </div>
      {installed ? (
        <p className="pwa-ready">
          <CheckCircle2 size={18} />
          {t("Japan 2026 is installed.", "Japan 2026 已安装。")}
        </p>
      ) : (
        <>
          {canInstall && (
            <button className="button primary" onClick={install}>
              <Download size={17} />
              {t("Install Japan 2026", "安装 Japan 2026")}
            </button>
          )}
          {installFailed && (
            <p role="alert">
              {t(
                "Use your browser menu to add the app instead.",
                "请通过浏览器菜单添加应用。",
              )}
            </p>
          )}
          <details>
            <summary>
              <Smartphone size={17} />
              iPhone / iPad
            </summary>
            <ol>
              <li>
                {t("Open this website in Safari.", "用 Safari 打开此网站。")}
              </li>
              <li>
                {t(
                  "Tap Share → Add to Home Screen.",
                  "轻点「分享」→「添加到主屏幕」。",
                )}
              </li>
              <li>
                {t(
                  "If shown, turn on Open as Web App, then tap Add.",
                  "如有「作为 Web App 打开」，请开启，再轻点「添加」。",
                )}
              </li>
            </ol>
          </details>
          <details>
            <summary>
              <Smartphone size={17} />
              Android
            </summary>
            <ol>
              <li>
                {t("Open this website in Chrome.", "用 Chrome 打开此网站。")}
              </li>
              <li>
                {t(
                  "Open the ⋮ menu → Install and create shortcut → Install. Some versions say Add to Home screen.",
                  "打开 ⋮ 菜单 →「安装并创建快捷方式」→「安装」；部分版本显示「添加到主屏幕」。",
                )}
              </li>
            </ol>
          </details>
        </>
      )}
      <div className="pwa-offline-status" role="status">
        {cached ? (
          <>
            <CheckCircle2 size={18} />
            <span>
              {t(
                "Itinerary, photos and booking details saved for offline use.",
                "行程、照片和住宿航班资料已保存，可离线查看。",
              )}
            </span>
          </>
        ) : (
          <>
            <Download size={18} />
            <span>
              {registrationFailed
                ? t(
                    "Offline saving is unavailable. You can still use the app online.",
                    "暂时无法保存离线副本，联网使用不受影响。",
                  )
                : t(
                    "Open online and keep this page open until your offline copy is ready.",
                    "请联网打开并稍候，等待离线副本保存完成。",
                  )}
            </span>
          </>
        )}
      </div>
      <p className="pwa-footnote">
        {t(
          "Google Maps, the shared ledger and external links need internet. Trip members share expenses; shopping checklists and daily notes stay on this device.",
          "Google Maps、共享账本和外部链接需要联网。账目由旅行成员共享，购物清单和每日笔记仍保存在当前设备。",
        )}
      </p>
    </section>
  );
}
