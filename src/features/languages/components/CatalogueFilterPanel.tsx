"use client";

import TuneIcon from "@mui/icons-material/Tune";
import {
  Box,
  Button,
  Chip,
  Drawer,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useCallback, useState } from "react";

import { LanguageFilters } from "@/features/languages/components/LanguageFilters";
import { LanguageFilterFormValues } from "@/features/languages/components/languageFilters.schema";
import { useCatalogue } from "@/features/languages/context/CatalogueContext";
import {
  DEFAULT_LANGUAGE_FILTERS,
  saveFilters,
} from "@/features/languages/utils/languageFilters";
import { pageHref } from "@/features/languages/utils/languagePagination";

const FILTER_LABELS: Record<keyof LanguageFilterFormValues, string> = {
  code: "Code",
  name: "Name",
  status: "Status",
  nationOfOrigin: "Nation of Origin",
  writingSystem: "Writing System",
  spokenIn: "Spoken In",
};

/**
 * The filters above every catalogue page. From the tablet breakpoint the full form shows
 * inline; below it, where the form stacks into a full screen of fields, a name search and a
 * "Filters" button that opens the form in a sheet keep the list on the first screen. A new or
 * reset filter always starts from page 1, since a page number meant another list.
 */
export function CatalogueFilterPanel() {
  const { filters, setFilters, restored } = useCatalogue();
  const router = useRouter();
  const params = useParams<{ page?: string }>();
  const [sheetOpen, setSheetOpen] = useState(false);
  // Counts changes made outside the forms (a removed chip, the phone search), which the forms
  // must pick up. A form's own Apply is not counted, so it keeps its state, such as the notice
  // that the filters could not be saved.
  const [outsideChanges, setOutsideChanges] = useState(0);

  const applyFilters = useCallback(
    (newFilters: LanguageFilterFormValues) => {
      setFilters(newFilters);
      setSheetOpen(false);
      if (params.page) router.push(pageHref(1));
    },
    [params.page, router, setFilters]
  );

  const applyAndSave = (newFilters: LanguageFilterFormValues) => {
    saveFilters(newFilters);
    setOutsideChanges((count) => count + 1);
    applyFilters(newFilters);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("name");
    applyAndSave({ ...filters, name: typeof name === "string" ? name : "" });
  };

  const active = (Object.keys(FILTER_LABELS) as (keyof LanguageFilterFormValues)[])
    .filter((field) => filters[field]);

  // Remounted once the stored filters arrive and after each outside change.
  const formKey = restored ? `restored-${outsideChanges}` : "initial";

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: { mobile: "none", tablet: "block" } }}>
        <LanguageFilters
          key={formKey}
          initialFilters={filters}
          onFiltersChange={applyFilters}
          disabled={!restored}
        />
      </Box>

      <Stack
        component="form"
        role="search"
        onSubmit={handleSearch}
        direction="row"
        spacing={1}
        sx={{ display: { mobile: "flex", tablet: "none" } }}
      >
        <TextField
          key={formKey}
          name="name"
          label="Search by name"
          type="search"
          size="small"
          fullWidth
          defaultValue={filters.name}
          disabled={!restored}
        />
        <Button
          type="button"
          variant="outlined"
          color="secondary"
          startIcon={<TuneIcon />}
          onClick={() => setSheetOpen(true)}
          disabled={!restored}
          sx={{ flex: "none", bgcolor: "background.paper" }}
        >
          {active.length ? `Filters · ${active.length}` : "Filters"}
        </Button>
      </Stack>

      {active.length > 0 && (
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          aria-label="Active filters"
          role="group"
        >
          {active.map((field) => (
            <Chip
              key={field}
              label={`${FILTER_LABELS[field]}: ${filters[field]}`}
              onDelete={() =>
                applyAndSave({ ...filters, [field]: DEFAULT_LANGUAGE_FILTERS[field] })
              }
              variant="outlined"
              sx={{ bgcolor: "background.paper", maxWidth: "100%" }}
            />
          ))}
        </Stack>
      )}

      <Drawer
        anchor="bottom"
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        slotProps={{
          paper: {
            // MUI gives the sheet no role; it is a modal dialog named by its heading.
            role: "dialog",
            "aria-modal": true,
            "aria-labelledby": "filters-sheet-title",
            sx: { maxHeight: "90svh", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
          },
        }}
      >
        <Stack spacing={1} sx={{ p: 2 }}>
          <Typography id="filters-sheet-title" variant="h2" component="h2">
            Filters
          </Typography>
          <LanguageFilters
            key={formKey}
            initialFilters={filters}
            onFiltersChange={applyFilters}
            disabled={!restored}
          />
        </Stack>
      </Drawer>
    </Stack>
  );
}
