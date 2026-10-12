import { useState, useEffect } from "react";
import {
  adminAuthService,
  submissionService,
  moderatorService,
} from "../../services";

import AdminLoginPage from "./AdminLoginPage.jsx";
import AdminLayout from "./AdminLayout.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminModeratorsPage from "./AdminModeratorsPage.jsx";
import AdminAccountsPage from "./AdminAccountsPage.jsx";
import AdminSubmissionsPage from "./AdminSubmissionsPage.jsx";
import AdminPlacesPage from "./AdminPlacesPage.jsx";
import AdminAutoFarePage from "./AdminAutoFarePage.jsx";
import AdminLogsPage from "./AdminLogsPage.jsx";

export default function AdminPortal() {
  const [currentAdmin, setCurrentAdmin] = useState(() =>
    adminAuthService.getCurrentAdmin()
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingSubsCount, setPendingSubsCount] = useState(0);
  const [pendingModsCount, setPendingModsCount] = useState(0);

  async function updateBadgeCounts() {
    try {
      const subs = await submissionService.getAllSubmissions("pending");
      const apps = moderatorService.getApplications("pending");
      setPendingSubsCount(subs?.length || 0);
      setPendingModsCount(apps?.length || 0);
    } catch (err) {
      console.error("Error updating admin badge counts:", err);
    }
  }

  useEffect(() => {
    if (currentAdmin) {
      updateBadgeCounts();
    }
  }, [currentAdmin, activeTab]);

  function handleLoginSuccess(session) {
    setCurrentAdmin(session);
    setActiveTab("dashboard");
  }

  function handleLogout() {
    adminAuthService.logout();
    setCurrentAdmin(null);
  }

  // If not logged in, present dedicated Admin Login screen
  if (!currentAdmin) {
    return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentAdmin={currentAdmin}
      onLogout={handleLogout}
      pendingSubmissionsCount={pendingSubsCount}
      pendingModeratorsCount={pendingModsCount}
    >
      {activeTab === "dashboard" && (
        <AdminDashboard
          onNavigateTab={setActiveTab}
          currentAdmin={currentAdmin}
        />
      )}

      {activeTab === "moderators" && (
        <AdminModeratorsPage
          currentAdmin={currentAdmin}
          onModeratorsUpdated={updateBadgeCounts}
        />
      )}

      {activeTab === "admins" && (
        <AdminAccountsPage currentAdmin={currentAdmin} />
      )}

      {activeTab === "submissions" && (
        <AdminSubmissionsPage
          currentAdmin={currentAdmin}
          onSubmissionsUpdated={updateBadgeCounts}
        />
      )}

      {activeTab === "places" && <AdminPlacesPage />}

      {activeTab === "autofare" && <AdminAutoFarePage />}

      {activeTab === "logs" && (
        <AdminLogsPage currentAdmin={currentAdmin} />
      )}
    </AdminLayout>
  );
}
