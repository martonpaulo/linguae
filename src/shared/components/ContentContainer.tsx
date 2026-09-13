import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface ContentContainerProps {
  children?: ReactNode;
}

/**
 * Vertical rhythm between a page's blocks. The outer inset belongs to `SiteMain`. Pass only
 * rendered blocks: a non-rendering child such as a JSON-LD script would still receive the gap.
 */
export function ContentContainer({ children }: ContentContainerProps) {
  return <Stack spacing={{ mobile: 4, desktop: 6 }}>{children}</Stack>;
}
