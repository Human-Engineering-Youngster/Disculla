import React from "react";

import { DiscullaIcon } from "../icons/DiscullaIcon";

export const Header: React.FC = () => {
  return (
    <header className="flex items-center px-4 py-2 border-b border-border bg-background">
      <DiscullaIcon size="small" />
    </header>
  );
};
