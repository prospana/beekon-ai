"use client";

import { Database } from "@/integrations/supabase";
import { createContext, useContext, useState } from "react";

interface WorkspaceContextType {
  workspace: Database["beekon_data"]["Tables"]["workspaces"]["Row"] | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceContextType | null>(null);

  return (
    <WorkspaceContext.Provider value={null}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
