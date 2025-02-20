import "./styles/main.scss";

import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";

const MapPage = lazy(() => import("./pages/MapPage"));

function App() {
  return (
    <HelmetProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <MapPage />
      </Suspense>
    </HelmetProvider>
  );
}
export default App;
