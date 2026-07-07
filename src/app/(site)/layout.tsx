import type { ReactNode } from "react";

import { MarketingFooter } from "@/components/shared/marketing-footer";
import { MarketingHeader } from "@/components/shared/marketing-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MarketingHeader />
      <div className="min-h-[calc(100vh-80px)]">{children}</div>
      <MarketingFooter />
    </>
  );
}
