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
