import { LocationProvider } from "./context/LocationContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <LocationProvider>
      <AppRoutes />
    </LocationProvider>
  );
}
