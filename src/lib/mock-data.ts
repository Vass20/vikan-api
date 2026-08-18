export interface PartnerPreferences {
  ageMin: number;
  ageMax: number;
  heightMin: string;
  heightMax: string;
  religions: string[];
  communities: string[];
  education: string[];
  occupations: string[];
  diet: string[];
  maritalStatus: string[];
}

export interface Profile {
  id: string;
  name: string;
  gender: "female" | "male";
  dob: string;
  age: number;
  height: string;
  religion: string;
  community: string;
  subCommunity: string;
  motherTongue: string;
  education: string;
  occupation: string;
  salary: string;
  incomeNumeric: number; // For advanced filtering
  country: string;
  state: string;
  city: string;
  maritalStatus: string;
  children: string;
  diet: string;
  smoking: "No" | "Yes" | "Occasionally";
  drinking: "No" | "Yes" | "Occasionally";
  familyType: "Nuclear" | "Joint";
  familyStatus: "Middle Class" | "Upper Middle Class" | "Rich/Affluent" | "Elite";
  familyValues: "Traditional" | "Moderate" | "Liberal";
  horoscopeRequired: boolean;
  aboutMe: string;
  familyDetails: string;
  photos: string[];
  isVerified: boolean;
  isPremium: boolean;
  onlineStatus: "online" | "offline" | "away";
  lastActive: string;
  partnerPreferences: PartnerPreferences;
  email?: string;
  mobile?: string;
}

const BRIDE_PHOTOS = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1602442787305-decbd65be507?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
];

const GROOM_PHOTOS = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80"
];

// Helper to generate deterministic-like lists of profiles
const firstNamesBrides = ["Aanya", "Priyanka", "Anjali", "Meera", "Deepika", "Kriti", "Aditi", "Shruti", "Ishita", "Neha", "Riya", "Kavya", "Tanvi", "Sonam", "Shreya", "Simran", "Sneha", "Pritha", "Navya", "Divya", "Vandana", "Avani", "Gauri", "Nisha", "Pallavi"];
const firstNamesGrooms = ["Rohan", "Kabir", "Aditya", "Vikram", "Rahul", "Arjun", "Sid", "Varun", "Abhishek", "Manish", "Gaurav", "Amit", "Karan", "Sanjay", "Rajesh", "Sameer", "Dev", "Nikhil", "Vikas", "Ashish", "Pranav", "Aniket", "Harsh", "Sunny", "Tarun"];
const lastNames = ["Sharma", "Verma", "Gupta", "Iyer", "Patel", "Reddy", "Singh", "Nair", "Mehta", "Chatterjee", "Joshi", "Mishra", "Chawla", "Bose", "Rao", "Kapoor", "Agarwal", "Bansal", "Kulkarni", "Deshmukh", "Choudhury", "Pillai", "Gill", "Sen", "Bhat"];

const religions = ["Hindu", "Hindu", "Hindu", "Muslim", "Sikh", "Christian", "Jain", "Hindu", "Sikh", "Hindu"];
const motherTongues = {
  Hindu: ["Hindi", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali", "Kannada", "Malayalam"],
  Muslim: ["Urdu", "Hindi", "Bengali"],
  Sikh: ["Punjabi"],
  Christian: ["English", "Malayalam", "Tamil"],
  Jain: ["Gujarati", "Hindi"]
};
const communities = {
  Hindu: ["Brahmin", "Rajput", "Kayastha", "Vaishnav", "Maratha", "Patel", "Reddy", "Nair", "Garamond"],
  Muslim: ["Sunni", "Shia"],
  Sikh: ["Jat", "Khatri"],
  Christian: ["Roman Catholic", "Protestant"],
  Jain: ["Digambar", "Shwetambar"]
};

const educations = [
  "B.Tech Computer Science (IIT Delhi)",
  "M.B.A (IIM Ahmedabad)",
  "M.D Internal Medicine (AIIMS)",
  "Ph.D Economics (Stanford)",
  "B.Arch Architecture (SPA Delhi)",
  "M.S Software Engineering (CMU)",
  "Chartered Accountant (ICAI)",
  "B.Com + LLB (National Law University)"
];

const occupations = [
  "Software Engineer (Google)",
  "Investment Banker (Goldman Sachs)",
  "Senior Consultant (McKinsey)",
  "Cardiologist (Apollo Hospital)",
  "Co-Founder (Fintech Startup)",
  "IAS Officer",
  "Product Manager (Uber)",
  "Architect & Partner"
];

const salaries = [
  { text: "12 LPA", num: 1200000 },
  { text: "18 LPA", num: 1800000 },
  { text: "25 LPA", num: 2500000 },
  { text: "35 LPA", num: 3500000 },
  { text: "50 LPA", num: 5000000 },
  { text: "75 LPA", num: 7500000 },
  { text: "1.2 Crores", num: 12000000 },
  { text: "2.5 Crores+", num: 25000000 }
];

const statesCities = [
  { state: "Maharashtra", city: "Mumbai" },
  { state: "Delhi NCR", city: "New Delhi" },
  { state: "Karnataka", city: "Bangalore" },
  { state: "Telangana", city: "Hyderabad" },
  { state: "Tamil Nadu", city: "Chennai" },
  { state: "West Bengal", city: "Kolkata" },
  { state: "California", city: "San Francisco" },
  { state: "New York", city: "New York City" }
];

const heights = ["5' 1\"", "5' 2\"", "5' 3\"", "5' 4\"", "5' 5\"", "5' 6\"", "5' 7\"", "5' 8\"", "5' 9\"", "5' 10\"", "5' 11\"", "6' 0\"", "6' 1\"", "6' 2\""];

// Generate 50 profiles
export const generateMockProfiles = (): Profile[] => {
  const list: Profile[] = [];

  for (let i = 1; i <= 50; i++) {
    const isFemale = i <= 25;
    const gender = isFemale ? "female" : "male";
    
    const nameList = isFemale ? firstNamesBrides : firstNamesGrooms;
    const firstName = nameList[(i - 1) % nameList.length];
    const lastName = lastNames[(i * 3) % lastNames.length];
    const name = `${firstName} ${lastName}`;

    const age = 22 + ((i * 7) % 13); // Ages between 22 and 34
    const dobYear = 2026 - age;
    const dobMonth = String(1 + ((i * 5) % 12)).padStart(2, "0");
    const dobDay = String(1 + ((i * 7) % 28)).padStart(2, "0");
    const dob = `${dobYear}-${dobMonth}-${dobDay}`;

    const heightIndex = isFemale 
      ? 1 + ((i * 3) % 6) // Females 5'2" to 5'7"
      : 5 + ((i * 3) % 8); // Males 5'6" to 6'1"
    const height = heights[heightIndex];

    const religionIndex = (i * 2) % religions.length;
    const religion = religions[religionIndex];

    const tongueOptions = motherTongues[religion as keyof typeof motherTongues] || ["Hindi"];
    const motherTongue = tongueOptions[(i * 2) % tongueOptions.length];

    const commOptions = communities[religion as keyof typeof communities] || ["General"];
    const community = commOptions[i % commOptions.length];
    const subCommunity = `${community} - ${i % 3 === 0 ? "First Class" : "Gotra " + (100 + (i % 7))}`;

    const eduIndex = i % educations.length;
    const education = educations[eduIndex];

    const occIndex = (i * 3) % occupations.length;
    const occupation = occupations[occIndex];

    const salIndex = (i * 2) % salaries.length;
    const salaryObj = salaries[salIndex];
    const salary = salaryObj.text;
    const incomeNumeric = salaryObj.num;

    const locIndex = i % statesCities.length;
    const loc = statesCities[locIndex];
    const country = locIndex >= 6 ? "USA" : "India";
    const state = loc.state;
    const city = loc.city;

    const maritalStatus = i % 10 === 0 ? "Divorced" : "Never Married";
    const children = maritalStatus === "Divorced" ? (i % 2 === 0 ? "No" : "1") : "No";

    const diet = i % 3 === 0 ? "Non-vegetarian" : "Vegetarian";
    const smoking = i % 8 === 0 ? "Occasionally" : "No";
    const drinking = i % 5 === 0 ? "Yes" : i % 7 === 0 ? "Occasionally" : "No";

    const familyType = i % 2 === 0 ? "Nuclear" : "Joint";
    const familyStatusList: Profile["familyStatus"][] = ["Middle Class", "Upper Middle Class", "Rich/Affluent", "Elite"];
    const familyStatus = familyStatusList[i % familyStatusList.length];

    const familyValuesList: Profile["familyValues"][] = ["Traditional", "Moderate", "Liberal"];
    const familyValues = familyValuesList[i % familyValuesList.length];

    const photoSet = isFemale ? BRIDE_PHOTOS : GROOM_PHOTOS;
    const photoIndex = (i - 1) % photoSet.length;
    // Let's provide 3 photos per profile
    const photos = [
      photoSet[photoIndex],
      photoSet[(photoIndex + 1) % photoSet.length],
      photoSet[(photoIndex + 2) % photoSet.length]
    ];

    const isVerified = i % 5 !== 0; // 80% verified
    const isPremium = i % 3 === 0;  // 33% premium
    const onlineStatusList: Profile["onlineStatus"][] = ["online", "offline", "away"];
    const onlineStatus = i % 4 === 0 ? "online" : i % 5 === 0 ? "away" : "offline";
    const lastActive = onlineStatus === "online" ? "Active Now" : `${i % 23 + 1} hours ago`;

    // Partner preferences
    const partnerPreferences: PartnerPreferences = {
      ageMin: isFemale ? age + 1 : Math.max(21, age - 5),
      ageMax: isFemale ? age + 7 : age + 2,
      heightMin: isFemale ? "5' 6\"" : "5' 0\"",
      heightMax: isFemale ? "6' 2\"" : "5' 8\"",
      religions: [religion],
      communities: [community],
      education: ["B.Tech", "M.B.A", "M.D", "Ph.D", "M.S"],
      occupations: ["Software Engineer", "Investment Banker", "IAS Officer", "Product Manager", "Doctor"],
      diet: [diet],
      maritalStatus: ["Never Married"]
    };

    const aboutMe = `I am a warm-hearted, goal-oriented ${occupation.split(" (")[0].toLowerCase()} who values simple moments, deep conversations, and continuous learning. Professionally, I am established in my career as a ${occupation}. I believe marriage is an equal partnership built on mutual respect, trust, and shared values. I love traveling, exploring culinary arts, and spending quality time with family.`;

    const familyDetails = `Our family is based in ${city}, ${state}. We belong to a respected, ${familyStatus.toLowerCase()} family with ${familyValues.toLowerCase()} values. My father is a retired senior professional and my mother is a homemaker. We have a close-knit, loving family environment that respects individual choices while upholding traditional roots.`;

    list.push({
      id: `vikan-${10000 + i}`,
      name,
      gender,
      dob,
      age,
      height,
      religion,
      community,
      subCommunity,
      motherTongue,
      education,
      occupation,
      salary,
      incomeNumeric,
      country,
      state,
      city,
      maritalStatus,
      children,
      diet,
      smoking,
      drinking,
      familyType,
      familyStatus,
      familyValues,
      horoscopeRequired: i % 4 === 0,
      aboutMe,
      familyDetails,
      photos,
      isVerified,
      isPremium,
      onlineStatus,
      lastActive,
      partnerPreferences
    });
  }

  return list;
};

export const MOCK_SUCCESS_STORIES = [
  {
    id: "story-1",
    names: "Ananya & Rohan",
    marriageDate: "November 12, 2025",
    image: "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=600&auto=format&fit=crop&q=80",
    story: "Vikan Matrimony helped us connect across cities. Rohan's family-first approach and our shared values instantly brought our families together. We found a lifelong friendship before committing to a beautiful marriage."
  },
  {
    id: "story-2",
    names: "Priyanka & Kabir",
    marriageDate: "February 28, 2026",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80",
    story: "Finding someone who respects your career dreams and shares your passion for travel was rare. Kabir and I matched through Vikan's advanced preference filters. We are forever grateful to this premium platform."
  },
  {
    id: "story-3",
    names: "Meera & Aditya",
    marriageDate: "May 08, 2026",
    image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&auto=format&fit=crop&q=80",
    story: "The trust and safety of verified profiles made our journey stress-free. Our families connected via the Family Dashboard, aligning on horoscope requirements seamlessly. A match truly made in heaven."
  }
];

export const MOCK_BLOG_POSTS = [
  {
    id: "blog-1",
    title: "Navigating Modern Love in a Traditional Indian Family",
    category: "Relationship Advice",
    date: "June 15, 2026",
    readTime: "5 min read",
    summary: "How to balance modern expectations with traditional marriage alignment. Tips on effective family communications during matchmaking.",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "blog-2",
    title: "The Ultimate Guide to Luxury Indian Wedding Planning",
    category: "Wedding Planning",
    date: "June 20, 2026",
    readTime: "8 min read",
    summary: "From curated color palettes to selection of elegant heritage venues. Steps to execute a memorable premium wedding celebrations.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "blog-3",
    title: "Decoding Kundali Matching: Modern Science or Sacred Tradition?",
    category: "Horoscope",
    date: "June 25, 2026",
    readTime: "6 min read",
    summary: "An in-depth look at what modern couples need to understand about Guna matching, Vedic astrology, and behavioral compatibility.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80"
  }
];

export const MOCK_FAQS = [
  {
    question: "How does Vikan ensure profile verification and safety?",
    answer: "Every profile on Vikan undergoes a multi-layer verification check, including Mobile OTP confirmation, Email verification, Government ID verification, and Selfie Verification using automated facial matching. Look for the blue verification badge on profiles."
  },
  {
    question: "What features are included in Vikan Premium memberships?",
    answer: "Premium members enjoy unlimited interests and messaging permissions, access to direct phone/contact info, priority listing in search matching results, advanced compatibility filters, private photo permissions, and profile highlight tags."
  },
  {
    question: "Can parents manage accounts on behalf of their children?",
    answer: "Yes, Vikan is family-friendly and offers Parent Managed mode. You can create a profile for your son, daughter, or sibling, track activities through the Family Dashboard, add shared notes, and approve potential matches jointly."
  },
  {
    question: "What is the Vikan Match Percentage score?",
    answer: "We analyze criteria such as age, height, religion, mother tongue, career level, family values, and location against mutual preferences to calculate a match percentage. This helps you quickly target highly compatible partners."
  }
];
