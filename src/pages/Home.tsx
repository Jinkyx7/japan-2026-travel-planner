import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Map,
  Utensils,
  ShoppingBag,
  Wallet,
  Info,
  ArrowUpRight,
  Users,
  MapPin,
  Snowflake,
} from "lucide-react";
import { useApp } from "../components/AppContext";
import { trip } from "../data/trip";
import { itinerary } from "../data/itinerary";
import { tripProgress, japanDate, dateLabel } from "../lib/trip";
export function Home() {
  const { t, lang, travellers } = useApp();
  const progress = tripProgress();
  const next = itinerary.find((d) => d.date >= japanDate()) ?? itinerary[0];
  const quick = [
    {
      to: "/itinerary",
      en: "Itinerary",
      zh: "行程",
      sub: "Every day, thoughtfully planned",
      subZh: "每天的旅行安排",
      icon: CalendarDays,
    },
    {
      to: "/map",
      en: "Map",
      zh: "地图",
      sub: "Find your next little adventure",
      subZh: "寻找下一段小冒险",
      icon: Map,
    },
    {
      to: "/food",
      en: "Food",
      zh: "美食",
      sub: "Something delicious awaits",
      subZh: "美味正在等待",
      icon: Utensils,
    },
    {
      to: "/shopping",
      en: "Shopping",
      zh: "购物",
      sub: "A little piece of Japan to take home",
      subZh: "把日本的美好带回家",
      icon: ShoppingBag,
    },
    {
      to: "/expenses",
      en: "Expenses",
      zh: "支出",
      sub: "Keep the little things in balance",
      subZh: "轻松记录共同支出",
      icon: Wallet,
    },
    {
      to: "/info",
      en: "Trip info",
      zh: "旅行信息",
      sub: "The essentials, in one place",
      subZh: "旅行必备信息",
      icon: Info,
    },
  ];
  return (
    <>
      <div className="home-intro">
        <span className="eyebrow">
          {t("OUR WINTER JOURNEY", "我们的冬日旅程")}
        </span>
        <span className="trip-countdown">
          <span className="status-dot" />
          {progress.phase === "before"
            ? t(
                `${progress.days} days until Japan`,
                `${progress.days}天后，出发日本`,
              )
            : progress.phase === "during"
              ? t(`Day ${progress.day} of 11`, `第${progress.day}天 / 共11天`)
              : t("A journey to remember", "值得珍藏的旅程")}
        </span>
      </div>
      <section className="hero">
        <img
          className="hero-image"
          src={trip.hero}
          alt={t(
            "Winter canal scene inspired by Otaru, with snowy warehouses and glowing lamps",
            "小樽风格的冬日运河，白雪仓库与温暖路灯",
          )}
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="hero-kicker">
            <Snowflake size={15} />
            {t("A SEASON FOR MAKING MEMORIES", "在冬日，收藏回忆")}
          </span>
          <h1>
            Japan 2026
            <span>{t("A little winter magic.", "一点冬日的魔法。")}</span>
          </h1>
          <p>
            {t("Hokkaido & Tokyo", "北海道与东京")}
            <span>·</span>
            {t("19–29 December 2026", "2026年12月19–29日")}
          </p>
          <div className="hero-buttons">
            <Link className="button white" to={"/itinerary/" + next.id}>
              {t("Today’s plan", "今日计划")}
              <ArrowUpRight size={17} />
            </Link>
            <Link className="hero-secondary" to="/itinerary">
              {t("Full itinerary", "完整行程")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-location">
          <MapPin size={14} />
          {t("Inspired by Otaru, Hokkaido", "灵感来自北海道小樽")}
        </div>
      </section>
      <div className="trip-stats">
        <span>
          <CalendarDays size={17} />
          <b>11</b>
          {t("days of discovery", "天探索")}
        </span>
        <span>
          <Users size={17} />
          <b>{travellers.length}</b>
          {t("travellers", "位旅行者")}
        </span>
        <span>
          <MapPin size={17} />
          <b>2</b>
          {t("beautiful regions", "个目的地区域")}
        </span>
        <span className="stats-note">
          {t("One unforgettable winter.", "一个难忘的冬天。")}
        </span>
      </div>
      <section className="quick-links">
        {quick.map((q) => (
          <Link to={q.to} className="quick-card" key={q.to}>
            <div className="quick-icon">
              <q.icon size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h3>{t(q.en, q.zh)}</h3>
              <p>{t(q.sub, q.subZh)}</p>
            </div>
            <ArrowUpRight className="quick-arrow" size={17} />
          </Link>
        ))}
      </section>
      <div className="home-bottom">
        <section>
          <div className="section-heading">
            <h2>{t("Next up", "下一站")}</h2>
            <span>{t("THE ADVENTURE BEGINS", "旅程即将开始")}</span>
          </div>
          <Link className="next-card" to={"/itinerary/" + next.id}>
            <div className="date-tile">
              <span>DEC</span>
              <strong>{next.date.slice(-2)}</strong>
            </div>
            <div className="next-copy">
              <span className="eyebrow">
                {t("DAY", "第")}
                {lang === "en" ? " " : ""}
                {itinerary.indexOf(next) + 1}
                {lang === "zh" ? "天" : ""} ·{" "}
                {dateLabel(next.date, lang, { weekday: "long" })}
              </span>
              <h3>
                {next.name[lang]} <span>{next.nameJa}</span>
              </h3>
              <p>{next.summary[lang]}</p>
            </div>
            <ArrowRight size={22} />
          </Link>
        </section>
        <aside className="winter-note">
          <Snowflake size={22} strokeWidth={1.4} />
          <div>
            <h3>{t("Slow down. Look around.", "慢下来，看看四周。")}</h3>
            <p>
              {t(
                "Warm bowls, snowy streets, and time together. That’s the plan.",
                "热汤、雪街，还有相聚的时光。这就是我们的计划。",
              )}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
