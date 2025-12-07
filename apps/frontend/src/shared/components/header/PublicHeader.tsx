import React, { memo } from "react";

import { DiscullaIcon } from "../icons/DiscullaIcon";

export const PublicHeader: React.FC = memo(() => {
  return (
    <header className="flex items-center px-4 py-2 border-b border-border bg-background">
      {/* TODO: Add Link wrapper to navigate to home page */}
      <DiscullaIcon size="small" className="cursor-pointer" />
    </header>
  );
});

PublicHeader.displayName = "PublicHeader";
