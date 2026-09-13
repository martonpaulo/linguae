import { Button, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import Link from "next/link";

import {
  canonicalUrl,
  pageTitle,
  SITE_DESCRIPTION,
  SITE_NAME,
  SOCIAL_IMAGE,
} from "@/shared/config/deployment";

const NOT_FOUND = "Page not found";

// Without its own title the exported 404 inherited the home page's. The Open Graph and Twitter
// blocks repeat the layout's fields because a nested route's blocks replace the layout's whole.
export const metadata: Metadata = {
  title: NOT_FOUND,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: pageTitle(NOT_FOUND),
    description: SITE_DESCRIPTION,
    url: canonicalUrl(),
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle(NOT_FOUND),
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

/** Starts where every page starts: the shared inset, on the logo's left edge. */
export default function NotFoundPage() {
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="h1">Page not found</Typography>
      <Typography variant="body1" sx={{ maxWidth: "65ch" }}>
        The page you are looking for may not exist or may be temporarily unavailable.
      </Typography>
      <Button variant="contained" component={Link} href="/" color="primary">
        Go to the catalogue
      </Button>
    </Stack>
  );
}
