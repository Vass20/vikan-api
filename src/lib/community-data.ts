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
  { value: "Other Backward Class (OBC)", label: "Other Backward Class (OBC)" },
  { value: "Backward Class (BC)", label: "Backward Class (BC)" },
  { value: "Backward Class Muslim (BCM)", label: "Backward Class Muslim (BCM)" },
  { value: "Most Backward Class (MBC)", label: "Most Backward Class (MBC)" },
  { value: "Denotified Communities (DNC)", label: "Denotified Communities (DNC)" },
  { value: "Scheduled Caste (SC)", label: "Scheduled Caste (SC)" },
  { value: "Scheduled Caste – Arunthathiyar (SCA)", label: "Scheduled Caste – Arunthathiyar (SCA)" },
  { value: "Scheduled Tribe (ST)", label: "Scheduled Tribe (ST)" },
  { value: "Caste No Bar", label: "Caste No Bar" },
  { value: "Other Community", label: "Other Community" },
  { value: "Prefer Not to Say", label: "Prefer Not to Say" }
];

export const MAIN_COMMUNITIES: string[] = [
  "Other Backward Class (OBC)",
  "Backward Class (BC)",
  "Backward Class Muslim (BCM)",
  "Most Backward Class (MBC)",
  "Denotified Communities (DNC)",
  "Scheduled Caste (SC)",
  "Scheduled Caste – Arunthathiyar (SCA)",
  "Scheduled Tribe (ST)",
  "Caste No Bar",
  "Other Community",
  "Prefer Not to Say"
];

export const CHRISTIAN_DENOMINATION_OPTIONS: CommunityOption[] = [
  { value: "", label: "Select Church / Denomination..." },
  { value: "Roman Catholic (RC)", label: "Roman Catholic (RC)" },
  { value: "Protestant", label: "Protestant" },
  { value: "Pentecostal", label: "Pentecostal" },
  { value: "Church of South India (CSI)", label: "Church of South India (CSI)" },
  { value: "Orthodox", label: "Orthodox" },
  { value: "Mar Thoma", label: "Mar Thoma" },
  { value: "Other", label: "Other" }
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
  Christian: [],
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

