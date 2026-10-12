import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import DiscoverPage from "../pages/DiscoverPage.jsx";
import ContributePage from "../pages/ContributePage.jsx";
import MyContributionsPage from "../pages/MyContributionsPage.jsx";
import ModerationPage from "../pages/ModerationPage.jsx";
import PlaceDetailPage from "../pages/PlaceDetailPage.jsx";
import AutoFarePage from "../pages/AutoFarePage.jsx";
import AdminPortal from "../pages/admin/AdminPortal.jsx";

export default function AppRoutes() {
  const isHostAdmin =
    typeof window !== "undefined" &&
    (window.location.hostname === "admin.localay" ||
      window.location.hostname.startsWith("admin."));

  // If accessed directly through admin.localay subdomain, render AdminPortal
  if (isHostAdmin) {
    return (
      <Routes>
        <Route path="*" element={<AdminPortal />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Dedicated Admin Portal Routes */}
      <Route path="admin" element={<AdminPortal />} />
      <Route path="admin/*" element={<AdminPortal />} />

      {/* Main Consumer App Routes */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="autofare" element={<AutoFarePage />} />
        <Route path="contribute" element={<ContributePage />} />
        <Route path="my-contributions" element={<MyContributionsPage />} />
        <Route path="moderation" element={<ModerationPage />} />
        <Route path="place/:placeId" element={<PlaceDetailPage />} />
        <Route path="places/:placeId" element={<PlaceDetailPage />} />
      </Route>
    </Routes>
  );
}
