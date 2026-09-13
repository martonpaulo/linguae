import { LanguageStatusEnum } from "@/features/languages/types/languageStatus.enum";

/**
 * What each status means, in plain words. The source labels follow the numbered levels of the
 * Expanded Graded Intergenerational Disruption Scale (EGIDS), so the wording paraphrases that
 * scale's definitions.
 */
export const LANGUAGE_STATUS_DESCRIPTIONS: Record<LanguageStatusEnum, string> = {
  [LanguageStatusEnum.NATIONAL]:
    "Used in education, work, the media and government at the national level.",
  [LanguageStatusEnum.PROVINCIAL]:
    "Used in education, work, the media and government within a major region of a country.",
  [LanguageStatusEnum.WIDER_COMMUNICATION]:
    "Used in work and the media across a region to bridge language differences, without official status.",
  [LanguageStatusEnum.EDUCATIONAL]:
    "In vigorous use, with a standard form and literature sustained by institutional education.",
  [LanguageStatusEnum.DEVELOPING]:
    "In vigorous use, with a standard form and literature used by some, though not yet widespread.",
  [LanguageStatusEnum.VIGOROUS]:
    "Spoken face to face by every generation, and the situation is stable.",
  [LanguageStatusEnum.THREATENED]:
    "Spoken face to face by every generation, but losing speakers.",
  [LanguageStatusEnum.SHIFTING]:
    "Adults of child-bearing age can use it among themselves, but it is not being passed on to children.",
  [LanguageStatusEnum.MORIBUND]:
    "The only remaining active speakers are the grandparent generation and older.",
  [LanguageStatusEnum.NEARLY_EXTINCT]:
    "The only remaining speakers are the grandparent generation or older, with little chance to use it.",
  [LanguageStatusEnum.DORMANT]:
    "A reminder of heritage identity for a community, with no one proficient beyond symbolic use.",
  [LanguageStatusEnum.REAWAKENING]:
    "A community is bringing it back into use after a period without fluent speakers.",
  [LanguageStatusEnum.SECOND_LANGUAGE_ONLY]:
    "Used only as a second language; no one speaks it as a first language.",
  [LanguageStatusEnum.EXTINCT]: "No longer used by anyone.",
  [LanguageStatusEnum.UNATTESTED]:
    "Not documented well enough to establish whether it is in use.",
};
