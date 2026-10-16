export const RELIGION_OPTIONS = [
  { value: "", label: "Select Religion..." },
  { value: "Hindu", label: "Hindu" },
  { value: "Muslim", label: "Muslim" },
  { value: "Christian", label: "Christian" },
  { value: "Jain", label: "Jain" },
  { value: "Sikh", label: "Sikh" },
  { value: "Buddhist", label: "Buddhist" },
  { value: "Parsi", label: "Parsi" },
  { value: "Jewish", label: "Jewish" },
  { value: "Other", label: "Other" }
];

export interface CommunityOption {
  value: string;
  label: string;
}

export const MAIN_COMMUNITY_OPTIONS: CommunityOption[] = [
  { value: "OC", label: "OC (Forward Community / General)" },
  { value: "BC", label: "BC (Backward Class)" },
  { value: "BCM", label: "BCM (Backward Class Muslim)" },
  { value: "MBC", label: "MBC (Most Backward Class)" },
  { value: "SC", label: "SC (Scheduled Caste)" },
  { value: "ST", label: "ST (Scheduled Tribe)" },
  { value: "DNC", label: "DNC (Denotified Community)" },
  { value: "Caste No Bar", label: "Caste No Bar" },
  { value: "Others", label: "Others" }
];

export const MAIN_COMMUNITIES: string[] = [
  "OC",
  "BC",
  "BCM",
  "MBC",
  "SC",
  "ST",
  "DNC",
  "Caste No Bar",
  "Others"
];

export const DEFAULT_COMMUNITIES: Record<string, string[]> = {
  Hindu: [
    "Adi Dravidar (SC)",
    "Agamudayar",
    "Arunthathiyar",
    "Arya Vysya",
    "Ayira Vysya",
    "Balija Naidu",
    "Brahmin",
    "Brahmin - Iyer",
    "Brahmin - Iyengar",
    "Brahmin - Other",
    "Chettiar",
    "Devendra Kula Vellalar",
    "Gounder",
    "Kallar",
    "Kongu Vellala Gounder",
    "Maravar",
    "Mudaliyar",
    "Nadar",
    "Naicker / Naidu",
    "Pillai",
    "Reddy",
    "Saurashtra",
    "Senai Thalaivar",
    "Thevar",
    "Udaiyar",
    "Vanniyar",
    "Vellalar",
    "Viswakarma",
    "Yadava (Konar)"
  ],
  Muslim: [
    "Sunni",
    "Shia",
    "Labbai",
    "Maraikayar",
    "Rowther",
    "Dudekula",
    "Syed",
    "Sheikh",
    "Pathan",
    "Ansari",
    "Qureshi"
  ],
  Christian: [
    "Roman Catholic",
    "CSI",
    "Pentecostal",
    "Protestant",
    "Latin Catholic",
    "Nadar Christian",
    "Scheduled Caste Christian",
    "Syrian Catholic",
    "Jacobite",
    "Mar Thoma"
  ],
  Jain: [
    "Digambar",
    "Shwetambar",
    "Agarwal",
    "Oswal",
    "Porwal",
    "Khandelwal"
  ],
  Sikh: [
    "Jat",
    "Ramgarhia",
    "Khatri",
    "Arora",
    "Ahluwalia",
    "Saini",
    "Kamboj",
    "Mazhabi"
  ],
  Buddhist: [
    "Navayana",
    "Mahayana",
    "Theravada",
    "Tibetan"
  ],
  Parsi: [
    "Irani",
    "Shahenshahi",
    "Kadmi",
    "Fasli"
  ],
  Jewish: [
    "Bene Israel",
    "Baghdadi",
    "Cochin Jewish"
  ],
  Other: []
};

export interface GenerationConfig {
  key: string;
  label: string;
  minYear: number;
  maxYear: number;
}

export const GENERATION_CONFIGS: GenerationConfig[] = [
  { key: "Gen Z", label: "Gen Z (1997 – 2012)", minYear: 1997, maxYear: 2012 },
  { key: "Millennials", label: "Millennials (1981 – 1996)", minYear: 1981, maxYear: 1996 }
];

export function getBirthYear(dob: string): number | null {
  if (!dob) return null;
  const match = dob.match(/^(\d{4})/);
  if (match) {
    const y = parseInt(match[1], 10);
    if (!isNaN(y) && y >= 1920 && y <= new Date().getFullYear()) {
      return y;
    }
  }
  const d = new Date(dob);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    if (y >= 1920 && y <= new Date().getFullYear()) {
      return y;
    }
  }
  return null;
}

export function getGenerationByYear(year: number): string | null {
  const matched = GENERATION_CONFIGS.find((g) => year >= g.minYear && year <= g.maxYear);
  return matched ? matched.key : null;
}

