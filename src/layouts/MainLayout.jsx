import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-monsoon-50 text-monsoon-900">
      <header className="mx-auto w-full max-w-5xl px-6 py-6">
        <span className="font-display text-xl font-bold tracking-tight">
          LOCALAY
        </span>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-monsoon-800">
        Built by and for the community. Launching in Malappuram, Kerala.
      </footer>
    </div>
  );
}
