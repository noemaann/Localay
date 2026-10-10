import { AuthProvider } from "./context/AuthContext.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <AppRoutes />
      </LocationProvider>
    </AuthProvider>
  );
}
