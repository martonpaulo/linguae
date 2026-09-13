import { Box } from "@mui/material";
import { ReactNode } from "react";

interface CenteredPageLayoutProps {
  children: ReactNode;
}

export function CenteredPageLayout({ children }: CenteredPageLayoutProps) {
  return (
    <Box
      sx={{
        // Fills the main area, which already stops at the footer.
        flex: 1,
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {children}
    </Box>
  );
}
