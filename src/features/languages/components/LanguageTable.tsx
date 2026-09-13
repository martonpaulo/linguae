import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { LanguageFilterFormValues } from "@/features/languages/components/languageFilters.schema";
import { LanguageTableRow } from "@/features/languages/components/LanguageTableRow";
import {
  languageTableHeadSx,
  languageTableSx,
} from "@/features/languages/styles/languageStyles";
import { LanguageType } from "@/features/languages/types/language.type";

interface LanguageTableProps {
  languages: LanguageType[];
  filters?: LanguageFilterFormValues;
}

export function LanguageTable({ languages, filters }: LanguageTableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{ overflowX: "auto" }}
      variant="outlined"
    >
      <Table sx={languageTableSx}>
        <TableHead sx={languageTableHeadSx}>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Nation of Origin</TableCell>
            <TableCell>Writing System</TableCell>
            <TableCell>Spoken In</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {languages.map((language) => (
            <LanguageTableRow key={language.id} language={language} filters={filters} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
