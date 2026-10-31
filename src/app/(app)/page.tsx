import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard";

const HomePage = () => (
  <div className="flex flex-col gap-2">
    <h1 className="text-2xl font-semibold tracking-tight">À faire</h1>
    <Suspense fallback={<p className="text-muted-foreground">Chargement des tâches…</p>}>
      <Dashboard />
    </Suspense>
  </div>
);

export default HomePage;
