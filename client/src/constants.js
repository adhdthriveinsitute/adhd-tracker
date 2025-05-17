export const MONTHS_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]


export const IS_PRODUCTION =
  import.meta.env.VITE_ENV === "development" ? false : true



// export const BASE_URL = IS_PRODUCTION ?
//     "https://adhd-app-backend.vercel.app/api/v1" :
//     "http://localhost:5000/api/v1"

// fortesting local host on mobile

export const BASE_URL = IS_PRODUCTION ?
  "https://adhd-app-backend.vercel.app/api/v1" :
  "http://192.168.1.107:5000/api/v1"


export const ADHD_APP_ACCESS = "adhd-app-access"


export const GENDERS = [
  "Prefer not to say",
  "Male",
  "Female",
  "Other"
]

export const ROLES = ["user", "admin"];


export const USER_TYPES = [
  "client",
  "non-client"
]


export const USER_STORAGE_KEYS = {
  user: "USER_APP_ACCESS",
  admin: "ADMIN_APP_ACCESS",
};

export const ACTIVE_USER_ROLE_KEY = "ACTIVE_USER_ROLE";


export const DATE_FORMAT_REGEX = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;
export const DATE_FORMAT_STRING = "MM-dd-yyyy";
export const DATE_FORMAT_OPTIONS = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};
export const WEIGHT_UNIT = "pounds"

export const SYMPTOM_CATEGORIES = [
    { label: "Physical", value: "physical" },
    { label: "Behavioral", value: "behavioral" },
    { label: "Other", value: "other" },
];



/**
 * Constant data for symptoms and their categories
 */
export const SYMPTOMS = [
  {
    id: "hyperactivity",
    name: "Hyperactivity",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "impulsivity",
    name: "Impulsivity / acts without thinking",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "attention",
    name: "Trouble paying attention / staying focused",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "forgetful",
    name: "Forgetful / loses things",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "anxiety",
    name: "Anxiety / worry",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "mood",
    name: "Sad / moody",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "irritable",
    name: "Irritable / angry",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "rude",
    name: "Rude / cruel / hateful",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "tantrums",
    name: "Tantrums",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "aggression",
    name: "Physical aggression",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "disobedient",
    name: "Disobedient / defiance",
    category: "Behavioral",
    defaultValue: 0,
  },
  {
    id: "sleep",
    name: "Sleep problems",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "eating",
    name: "Picky Eating",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "gas",
    name: "Gut Symptoms - Gas or bloating",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "constipation",
    name: "Gut Symptoms - Constipation",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "diarrhea",
    name: "Gut Symptoms - Diarrhea",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "itching",
    name: "Skin - Itching",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "flushing",
    name: "Skin - Blushing / Flushing",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "eczema",
    name: "Skin - Eczema",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "urinating",
    name: "Urinating more at night",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "wheezing",
    name: "Wheezing",
    category: "Physical",
    defaultValue: 0,
  },
  {
    id: "other",
    name: "Other symptom not listed",
    category: "Physical",
    defaultValue: 0,
  },
]



