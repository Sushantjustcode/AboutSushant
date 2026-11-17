/**
 * ──────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH for all portfolio content.
 * ──────────────────────────────────────────────────────────────
 */

export const PROFILE = {
  name: "Sushant Chauhan",
  roles: ["Full-Stack MERN Developer", "Game & 3D Environment Designer"],
  degree: "BCA — Artificial Intelligence (BCA - AI)",
  university: "Kurukshetra University (KUK)",
  introTag: "Doing BCA - AI from KUK University · Full-Stack & 3D Craftsman",
};

/** Contact + social links. Leave '' until you have the real URL. */
export const CONTACT = {
  email: "sushantjogi026@gmail.com",
  linkedin: "https://www.linkedin.com/in/sushant-chauhan-675291322?utm",
  github: "https://github.com/Sushantjustcode",
  portfolio: "",
  phone: "",
  location: "Karnal / Haryana, India",
};

/**
 * Resume file.
 */
export const RESUME_URL = "";

export type SkillGroup = {
  id: string;
  label: string;
  note: string;
  tone: string;
  items: string[];
};

export const SKILLS: SkillGroup[] = [
  { id: "fe", label: "Frontend", note: "Interactive UIs", tone: "var(--color-lav)", items: ["React.js", "JavaScript (ES6+)", "Tailwind CSS", "HTML5 & Modern CSS", "GSAP Animations", "Lenis Scroll", "Bootstrap"] },
  { id: "be", label: "Backend", note: "Servers & APIs", tone: "var(--color-blue)", items: ["Node.js", "Express.js", "RESTful APIs", "Authentication & JWT", "MERN Stack Architecture", "CRUD Operations"] },
  { id: "db", label: "Databases", note: "Storage & Schemas", tone: "var(--color-butter)", items: ["MongoDB", "Mongoose", "SQL", "Database Design"] },
  { id: "prog", label: "Programming", note: "Core Foundations", tone: "var(--color-peach)", items: ["C", "C++", "C#", "Python", "Data Structures & Algorithms", "Object-Oriented Programming (OOP)"] },
  { id: "game", label: "Game Development", note: "Engines & Mechanics", tone: "var(--color-sage)", items: ["Unity Engine", "Unreal Engine 5", "Level Design", "C# Gameplay Scripting", "Physics & Collisions"] },
  { id: "3d", label: "3D & Environment Design", note: "World Building & Assets", tone: "var(--color-lav)", items: ["Blender 3D", "PBR Texturing", "3D Environment Art", "Atmospheric Lighting", "Game-Ready Props"] },
  { id: "tools", label: "Tools & Workflow", note: "Developer Stack", tone: "var(--color-blue)", items: ["Git & GitHub", "Vite", "VS Code", "Postman", "Matter.js"] },
];

export type ProjectLinks = { github: string; live: string; video: string };
export type Project = {
  id: string;
  index: string;
  kind: "software" | "game";
  title: string;
  tagline: string;
  summary: string;
  stack: string[];
  points: string[];
  tone: string;
  image: string;
  links: ProjectLinks;
};

const noLinks: ProjectLinks = { github: "", live: "", video: "" };

export const PROJECTS: Project[] = [
  {
    id: "findit",
    index: "01",
    kind: "software",
    title: "Findit — Lost & Found Community",
    tagline: "Connecting people with what they misplaced.",
    summary: "A community-driven lost and found web platform built with the MERN stack. Enables individuals and communities to report missing or found items, filter through real-time listings, and safely connect to reunite belongings.",
    stack: ["MongoDB", "Express.js", "React.js", "Node.js", "Tailwind CSS", "REST API"],
    points: [
      "MERN stack architecture with real-time reporting of lost and found items",
      "Dynamic search, category filters (electronics, keys, IDs), and location tags",
      "Claim verification system with direct communication to reunite people with items",
    ],
    tone: "var(--color-lav)",
    image: "",
    links: { ...noLinks },
  },
  {
    id: "portfolio",
    index: "02",
    kind: "software",
    title: "Personal Portfolio Websites",
    tagline: "Skeuomorphic craftsmanship with kinetic motion.",
    summary: "High-craft portfolio applications built with React, Tailwind CSS, Lenis, GSAP, and Matter.js. Focuses on tactile skeuomorphic interfaces, physics interactions, and responsive layouts.",
    stack: ["React.js", "Tailwind CSS", "GSAP", "Lenis", "Matter.js", "Web Audio API"],
    points: [
      "Tactile skeuomorphism: pullable drawers, physical switches, and hanging awards",
      "Smooth Lenis scrollteller motion synchronized with GSAP ScrollTrigger",
      "Interactive mini games, physics simulations, and always-on synthesized audio",
    ],
    tone: "var(--color-butter)",
    image: "",
    links: { ...noLinks },
  },
  {
    id: "horror",
    index: "03",
    kind: "game",
    title: "Horror Game Design & 3D Modeling",
    tagline: "Atmospheric forest environment & game-ready 3D assets.",
    summary: "An atmospheric horror forest environment combined with game-ready 3D prop modeling. Explores sightlines, tension pacing, volumetric lighting, and optimized 3D assets modeled in Blender for Unity and Unreal Engine.",
    stack: ["Unreal Engine", "Unity", "Blender", "3D Modeling", "Level Design"],
    points: [
      "Environmental composition, sightline framing, and psychological pacing",
      "Game-ready 3D asset modeling, UV unwrapping, and PBR texturing in Blender",
      "Atmospheric volumetric fog and moonlight setups in Unity & Unreal Engine",
    ],
    tone: "var(--color-sage)",
    image: "",
    links: { ...noLinks },
  },
];

export type Experience = {
  id: string;
  role: string;
  org: string;
  period: string;
  detail: string;
  points: string[];
  tone: string;
};

export const EXPERIENCE: Experience[] = [
  {
    id: "jc-software",
    role: "MERN Stack Intern",
    org: "JC Software Solutions, Mohali",
    period: "1 Aug 2026 – 1 Nov 2026",
    detail: "Three-month internship working on MERN stack web development in Mohali. Designed modular React components with Tailwind CSS, built RESTful APIs in Node.js & Express, and managed MongoDB database schemas.",
    points: [
      "Completed a 3-month internship focused on end-to-end MERN stack web application development in Mohali.",
      "Engineered modular React components, integrated responsive UI layouts, and connected frontend state with backend services.",
      "Developed RESTful APIs using Node.js and Express.js with robust error handling and structured middleware.",
      "Designed and managed MongoDB schemas, executing efficient CRUD workflows and database queries.",
    ],
    tone: "var(--color-lav)",
  },
  {
    id: "cq-mern",
    role: "Web Development Intern — Backend & MERN Training",
    org: "CQST College, Panipat",
    period: "Jul 2026 – Aug 2026",
    detail: "Learned and applied the MERN stack with an emphasis on backend development, REST APIs, database operations and structured application architecture. Built a Student Management System using MongoDB, Express.js, React.js and Node.js.",
    points: [
      "Learned and applied the MERN stack with an emphasis on backend development, REST APIs, database operations and structured application architecture.",
      "Built a Student Management System using MongoDB, Express.js, React.js and Node.js as the internship project.",
      "Implemented CRUD workflows, database integration and a responsive management interface for handling student records.",
      "Practiced debugging, modular coding, Git-based workflow and translating requirements into working application features.",
    ],
    tone: "var(--color-blue)",
  },
  {
    id: "cq-trainee",
    role: "Industrial Trainee",
    org: "CodeQuotient School of Technology, Panchkula",
    period: "Jul 2025 – Aug 2025",
    detail: "Completed an intensive, project-driven 6–8 week training program focused on professional software development practices, collaborative workflows, and real-world application architecture.",
    points: [
      "Completed an intensive, project-driven 6–8 week training program focused on professional software development practices and career readiness.",
      "Strengthened real-world application architecture skills by translating abstract problem statements into working, structured code.",
      "Practiced collaborative development workflows, code reviews and iterative debugging in a fast-paced training environment.",
      "Demonstrated rapid learning agility, consistency and strong technical performance throughout the program, earning recognition from mentors.",
    ],
    tone: "var(--color-sage)",
  },
];

export const EDUCATION = [
  {
    id: "bca",
    title: "BCA — Artificial Intelligence",
    place: "Kurukshetra University (KUK)",
    rows: [{ label: "Degree", period: "In Progress" }],
    tone: "var(--color-lav)",
  },
];

export const ACHIEVEMENTS = [
  { id: "hw", kind: "ribbon", title: "HackWars Hackathon", result: "Runner-Up", where: "NIT Karnataka", tone: "var(--color-lav)" },
  { id: "cm", kind: "ribbon", title: "CodeMaster Hackathon", result: "Runner-Up (Semifinalist)", where: "CQST College", tone: "var(--color-blue)" },
  { id: "wh", kind: "badge", title: "WhiteHat Jr Game Developer", result: "Achievement", where: "2020", tone: "var(--color-butter)" },
] as const;

export const STRENGTHS = [
  "Problem Solving",
  "Debugging & Troubleshooting",
  "Systematic Thinking",
  "Creativity & Design Thinking",
  "Adaptability",
  "Communication",
  "Full-Stack Architecture",
  "3D World Building",
];

export const NAV = [
  { id: "about", label: "Notes" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work" },
  { id: "path", label: "Path" },
  { id: "awards", label: "Awards" },
  { id: "play", label: "Play" },
  { id: "contact", label: "Contact" },
];
