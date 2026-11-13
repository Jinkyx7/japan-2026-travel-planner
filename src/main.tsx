import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AppProvider, useApp } from "./components/AppContext";
import { Layout, More } from "./components/Layout";
import { Home } from "./pages/Home";
import { Itinerary, DayDetail } from "./pages/Itinerary";
import { Food, MapPage } from "./pages/Places";
import { Shopping } from "./pages/Shopping";
import { Expenses } from "./pages/Expenses";
import { TripInfo } from "./pages/TripInfo";
import { StopDetail } from "./pages/StopDetail";
import { Accommodations, AccommodationDetail, Flights } from "./pages/Bookings";
import { PhotoCredits } from "./pages/PhotoCredits";
import { PwaProvider } from "./components/Pwa";
import { AuthProvider } from "./components/AuthContext";
import { MemberOnly } from "./components/MemberAccess";
import "./styles.css";
(window as unknown as { gm_authFailure: () => void }).gm_authFailure = () =>
  window.dispatchEvent(new Event("japan-maps-auth-failure"));
function NotFound() {
  const { t } = useApp();
  return (
    <div className="empty-state">
      <h1>{t("A little off the path", "暂时迷路了")}</h1>
      <Link to="/" className="button primary">
        {t("Back home", "返回首页")}
      </Link>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <PwaProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="itinerary" element={<Itinerary />} />
                <Route path="itinerary/:dayId" element={<DayDetail />} />
                <Route
                  path="itinerary/:dayId/stops/:itemId"
                  element={<StopDetail />}
                />
                <Route path="map" element={<MapPage />} />
                <Route path="food" element={<Food />} />
                <Route path="shopping" element={<Shopping />} />
                <Route
                  path="expenses"
                  element={
                    <MemberOnly>
                      <Expenses />
                    </MemberOnly>
                  }
                />
                <Route path="accommodation" element={<Accommodations />} />
                <Route
                  path="accommodation/:placeId"
                  element={<AccommodationDetail />}
                />
                <Route path="flights" element={<Flights />} />
                <Route path="photo-credits" element={<PhotoCredits />} />
                <Route path="info" element={<TripInfo />} />
                <Route path="more" element={<More />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </PwaProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
