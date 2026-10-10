import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import DiscoverPage from "../pages/DiscoverPage.jsx";
import PlaceDetailPage from "../pages/PlaceDetailPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="place/:placeId" element={<PlaceDetailPage />} />
      </Route>
    </Routes>
  );
}
