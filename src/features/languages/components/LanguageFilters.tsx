import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Paper, Stack, TextField } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  LanguageFilterFormValues,
  languageFilterSchema,
} from "@/features/languages/components/languageFilters.schema";
import { LanguageStatusChip } from "@/features/languages/components/LanguageStatusChip";
import { useLanguageStatuses } from "@/features/languages/hooks/useLanguageStatuses";
import {
  DEFAULT_LANGUAGE_FILTERS,
  saveFilters,
} from "@/features/languages/utils/languageFilters";
import { useNations } from "@/features/nations/hooks/useNations";
import { useWritingSystems } from "@/features/writingSystems/hooks/useWritingSystems";
import { ControlledSelect } from "@/shared/components/ControlledSelect";

interface LanguageFiltersProps {
  /** The settled starting filters, restored once by the page that owns them. */
  initialFilters: LanguageFilterFormValues;
  onFiltersChange: (filters: LanguageFilterFormValues) => void;
  /** Holds the actions until the page is hydrated, so a click never submits natively. */
  disabled?: boolean;
}

export function LanguageFilters({
  initialFilters,
  onFiltersChange,
  disabled = false,
}: LanguageFiltersProps) {
  const { register, handleSubmit, reset, control, formState } =
    useForm<LanguageFilterFormValues>({
      resolver: zodResolver(languageFilterSchema),
      defaultValues: initialFilters,
    });

  // Saving is best effort. Filters still apply; this only says they will not be remembered.
  const [saveFailed, setSaveFailed] = useState(false);

  const { nations, nationsIsLoading, nationsIsError } = useNations();
  const { writingSystems, writingSystemsIsLoading, writingSystemsIsError } =
    useWritingSystems();

  const nationsErrorMessage = nationsIsError
    ? "Nations could not be loaded."
    : undefined;
  const writingSystemsErrorMessage = writingSystemsIsError
    ? "Writing systems could not be loaded."
    : undefined;

  const sortedNations = useMemo(
    () =>
      nations ? [...nations].sort((a, b) => a.name.localeCompare(b.name)) : [],
    [nations]
  );

  const sortedWritingSystems = useMemo(
    () =>
      writingSystems
        ? [...writingSystems].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [writingSystems]
  );

  const handleFormSubmit = useCallback(
    (data: LanguageFilterFormValues) => {
      onFiltersChange(data);
      setSaveFailed(!saveFilters(data));
    },
    [onFiltersChange]
  );

  const handleFormReset = useCallback(() => {
    reset(DEFAULT_LANGUAGE_FILTERS);
    onFiltersChange(DEFAULT_LANGUAGE_FILTERS);
    setSaveFailed(!saveFilters(DEFAULT_LANGUAGE_FILTERS));
  }, [onFiltersChange, reset]);

  const publishedStatuses = useLanguageStatuses();
  const selectedStatus = useWatch({ control, name: "status" });

  // A stored selection the current snapshot no longer publishes stays visible and
  // selectable, so the person can see why the catalogue looks empty and reset it.
  const unsupportedStatus =
    selectedStatus && !(publishedStatuses as string[]).includes(selectedStatus)
      ? selectedStatus
      : undefined;

  const statusOptions = useMemo(
    () => [
      ...publishedStatuses.map((status) => ({ value: status })),
      ...(unsupportedStatus ? [{ value: unsupportedStatus }] : []),
    ],
    [publishedStatuses, unsupportedStatus]
  );

  const nationOptions = useMemo(
    () =>
      sortedNations.map((nation) => ({
        value: nation.name,
        label: nation.name,
      })),
    [sortedNations]
  );

  const writingSystemOptions = useMemo(
    () =>
      sortedWritingSystems.map((ws) => ({
        value: ws.name,
        label: ws.name,
      })),
    [sortedWritingSystems]
  );

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Stack
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
        autoComplete="off"
        direction="column"
        spacing={2}
      >
        <Stack spacing={2} direction={{ mobile: "column", tablet: "row" }}>
          <TextField
            label="Language Code"
            size="small"
            error={!!formState.errors.code}
            helperText={formState.errors?.code?.message}
            {...register("code")}
          />

          <TextField
            label="Language Name"
            fullWidth
            size="small"
            {...register("name")}
          />
        </Stack>

        <Stack
          spacing={2}
          direction={{ mobile: "column", tablet: "row" }}
          justifyContent="space-between"
        >
          <ControlledSelect
            name="status"
            label="Status"
            control={control}
            defaultValue={initialFilters.status}
            options={statusOptions}
            errorMessage={
              unsupportedStatus
                ? "This status is not in the current catalogue."
                : undefined
            }
            renderOption={(option) => (
              <LanguageStatusChip status={option.value} />
            )}
          />

          <ControlledSelect
            name="nationOfOrigin"
            label="Nation of Origin"
            control={control}
            defaultValue={initialFilters.nationOfOrigin}
            options={nationOptions}
            isLoading={nationsIsLoading}
            isDisabled={nationsIsError}
            errorMessage={nationsErrorMessage}
          />

          <ControlledSelect
            name="writingSystem"
            label="Writing System"
            control={control}
            defaultValue={initialFilters.writingSystem}
            options={writingSystemOptions}
            isLoading={writingSystemsIsLoading}
            isDisabled={writingSystemsIsError}
            errorMessage={writingSystemsErrorMessage}
          />

          <ControlledSelect
            name="spokenIn"
            label="Spoken In"
            control={control}
            defaultValue={initialFilters.spokenIn}
            options={nationOptions}
            isLoading={nationsIsLoading}
            isDisabled={nationsIsError}
            errorMessage={nationsErrorMessage}
          />
        </Stack>

        {saveFailed && (
          <Alert severity="info">
            Filters are applied. They cannot be remembered on this device.
          </Alert>
        )}

        <Stack spacing={2} direction="row" justifyContent="flex-end" pt={2}>
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={handleFormReset}
            disabled={disabled}
            sx={{
              width: { mobile: "100%", tablet: "auto" },
            }}
          >
            Reset Filters
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={disabled}
            sx={{
              width: { mobile: "100%", tablet: "auto" },
            }}
          >
            Apply Filters
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
