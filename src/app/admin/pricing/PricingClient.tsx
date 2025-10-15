"use client";

import { useState, createContext, useContext } from "react";
import CostEditButton from "./CostEditButton";

const EditModeContext = createContext(false);

export function useEditMode() {
  return useContext(EditModeContext);
}

type Props = {
  children: React.ReactNode;
};

export default function PricingClient({ children }: Props) {
  const [editMode, setEditMode] = useState(false);

  return (
    <EditModeContext.Provider value={editMode}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Pricing</h1>
          <p className="text-sm opacity-80">
            Set active prices per channel. Leaving a field blank disables that unit for that channel.
            Margin preview uses weighted average purchase cost per piece.
          </p>
        </div>
        <CostEditButton onEditModeChange={setEditMode} />
      </div>
      {children}
    </EditModeContext.Provider>
  );
}
