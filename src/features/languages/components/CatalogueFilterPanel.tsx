"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  ButtonBase,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  LanguageFilterFormValues,
  languageFilterSchema,
} from "@/features/languages/components/languageFilters.schema";
import { LanguageStatusChip } from "@/features/languages/components/LanguageStatusChip";
import { useCatalogue } from "@/features/languages/context/CatalogueContext";
import { LanguageStatusEnum } from "@/features/languages/types/languageStatus.enum";
import {
  DEFAULT_LANGUAGE_FILTERS,
  saveFilters,
} from "@/features/languages/utils/languageFilters";
import { pageHref } from "@/features/languages/utils/languagePagination";
import { useNations } from "@/features/nations/hooks/useNations";
import { useWritingSystems } from "@/features/writingSystems/hooks/useWritingSystems";
import { ControlledSelect } from "@/shared/components/ControlledSelect";

const FILTER_LABELS: Record<keyof LanguageFilterFormValues, string> = {
  name: "Name",
  code: "Code",
  status: "Status",
  nationOfOrigin: "Nation of origin",
  writingSystem: "Writing system",
  spokenIn: "Spoken in",
};

interface CatalogueFilterPanelProps {
  /** Statuses the snapshot publishes, from the build manifest, so no index download is needed. */
  statuses: LanguageStatusEnum[];
}

/**
 * The catalogue's one filter form, led by the name search. The other filters are a secondary
 * layer: a compact row on wider screens, a panel behind "Filters" on a phone. Every field is
 * rendered once. Filters apply on Enter or Apply, never per keystroke, and a new result set
 * always starts from page 1.
 */
export function CatalogueFilterPanel({ statuses }: CatalogueFilterPanelProps) {
  const { filters, setFilters, restored } = useCatalogue();
  const router = useRouter();
  const params = useParams<{ page?: string }>();
  const [panelOpen, setPanelOpen] = useState(false);
  // Saving is best effort. Filters still apply; this only says they will not be remembered.
  const [saveFailed, setSaveFailed] = useState(false);

  const { register, handleSubmit, reset, control, formState } =
    useForm<LanguageFilterFormValues>({
      resolver: zodResolver(languageFilterSchema),
      defaultValues: DEFAULT_LANGUAGE_FILTERS,
    });

  // The form always shows what is applied: the restored filters, or a removed chip.
  useEffect(() => {
    if (restored) reset(filters);
  }, [restored, filters, reset]);

  const apply = useCallback(
    (next: LanguageFilterFormValues) => {
      setFilters(next);
      setSaveFailed(!saveFilters(next));
      setPanelOpen(false);
      if (params.page) router.push(pageHref(1));
    },
    [params.page, router, setFilters]
  );

  const { nations, nationsIsLoading, nationsIsError } = useNations();
  const { writingSystems, writingSystemsIsLoading, writingSystemsIsError } =
    useWritingSystems();

  const nationOptions = useMemo(
    () =>
      [...(nations ?? [])]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((nation) => ({ value: nation.name })),
    [nations]
  );
  const writingSystemOptions = useMemo(
    () =>
      [...(writingSystems ?? [])]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((system) => ({ value: system.name })),
    [writingSystems]
  );

  const selectedStatus = useWatch({ control, name: "status" });
  // A stored selection the current snapshot no longer publishes stays visible and
  // selectable, so the person can see why the catalogue looks empty and reset it.
  const unsupportedStatus =
    selectedStatus && !(statuses as string[]).includes(selectedStatus)
      ? selectedStatus
      : undefined;
  const statusOptions = useMemo(
    () => [
      ...statuses.map((status) => ({ value: status })),
      ...(unsupportedStatus ? [{ value: unsupportedStatus }] : []),
    ],
    [statuses, unsupportedStatus]
  );

  const nationsError = nationsIsError ? "Nations could not be loaded." : undefined;
  const writingSystemsError = writingSystemsIsError
    ? "Writing systems could not be loaded."
    : undefined;

  const active = (Object.keys(FILTER_LABELS) as (keyof LanguageFilterFormValues)[]).filter(
    (field) => filters[field]
  );

  return (
    <Stack spacing={1.5}>
      <Stack
        component="form"
        role="search"
        aria-label="Languages"
        onSubmit={handleSubmit(apply)}
        noValidate
        autoComplete="off"
        spacing={1.5}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            label="Search by language name"
            type="search"
            fullWidth
            {...register("name")}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                    {/* An inline glyph: the icon package's wrapper cost more than the mark. */}
                    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden focusable="false">
                      <circle cx="8.5" cy="8.5" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            aria-expanded={panelOpen}
            aria-controls="catalogue-filters"
            onClick={() => setPanelOpen((open) => !open)}
            disabled={!restored}
            sx={{ display: { mobile: "inline-flex", tablet: "none" }, flex: "none", bgcolor: "background.paper" }}
          >
            {active.length ? `Filters · ${active.length}` : "Filters"}
          </Button>
        </Stack>

        <Box
          id="catalogue-filters"
          role="group"
          aria-label="Filters"
          sx={{
            display: { mobile: panelOpen ? "grid" : "none", tablet: "grid" },
            gap: 1.5,
            alignItems: "start",
            gridTemplateColumns: {
              mobile: "minmax(0, 1fr)",
              tablet: "repeat(3, minmax(0, 1fr))",
              desktop: "150px repeat(4, minmax(0, 1fr)) auto",
            },
            p: { mobile: 2, tablet: 0 },
            bgcolor: { mobile: "background.paper", tablet: "transparent" },
            border: { mobile: 1, tablet: 0 },
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <TextField
            label="Language Code"
            size="small"
            error={Boolean(formState.errors.code)}
            helperText={formState.errors.code?.message}
            {...register("code")}
          />
          <ControlledSelect
            name="status"
            label="Status"
            control={control}
            defaultValue=""
            options={statusOptions}
            errorMessage={
              unsupportedStatus ? "This status is not in the current catalogue." : undefined
            }
            renderOption={(option) => <LanguageStatusChip status={option.value} />}
          />
          <ControlledSelect
            name="nationOfOrigin"
            label="Nation of Origin"
            control={control}
            defaultValue=""
            options={nationOptions}
            isLoading={nationsIsLoading}
            isDisabled={nationsIsError}
            errorMessage={nationsError}
          />
          <ControlledSelect
            name="writingSystem"
            label="Writing System"
            control={control}
            defaultValue=""
            options={writingSystemOptions}
            isLoading={writingSystemsIsLoading}
            isDisabled={writingSystemsIsError}
            errorMessage={writingSystemsError}
          />
          <ControlledSelect
            name="spokenIn"
            label="Spoken In"
            control={control}
            defaultValue=""
            options={nationOptions}
            isLoading={nationsIsLoading}
            isDisabled={nationsIsError}
            errorMessage={nationsError}
          />
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ gridColumn: { mobile: "1 / -1", desktop: "auto" } }}
          >
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              disabled={!restored}
              onClick={() => {
                reset(DEFAULT_LANGUAGE_FILTERS);
                apply(DEFAULT_LANGUAGE_FILTERS);
              }}
              sx={{ flex: { mobile: 1, tablet: "none" }, height: 40, bgcolor: "background.paper" }}
            >
              Reset Filters
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!restored}
              sx={{ flex: { mobile: 1, tablet: "none" }, height: 40, whiteSpace: "nowrap" }}
            >
              Apply Filters
            </Button>
          </Stack>
        </Box>
      </Stack>

      {saveFailed && (
        <Typography role="status" variant="body2" color="textSecondary">
          Filters are applied. They cannot be remembered on this device.
        </Typography>
      )}

      {active.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} role="group" aria-label="Active filters">
          {active.map((field) => (
            <Box
              key={field}
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.25,
                maxWidth: "100%",
                pl: 1.25,
                pr: 0.25,
                py: 0.25,
                borderRadius: 999,
                bgcolor: "brandTint.main",
                color: "primary.dark",
                fontSize: "0.8125rem",
                fontWeight: 500,
              }}
            >
              <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {FILTER_LABELS[field]}: {filters[field]}
              </Box>
              <ButtonBase
                aria-label={`Remove filter ${FILTER_LABELS[field]}: ${filters[field]}`}
                onClick={() => apply({ ...filters, [field]: DEFAULT_LANGUAGE_FILTERS[field] })}
                sx={{
                  width: 24,
                  height: 24,
                  flex: "none",
                  borderRadius: "50%",
                  color: "inherit",
                  "&:hover": { bgcolor: "brandTint.hover" },
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden focusable="false">
                  <path d="M2 2l6 6M8 2 2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </ButtonBase>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
