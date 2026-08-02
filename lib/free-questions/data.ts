import type { FreeQuestion, FreeQuizExamId } from "./types"

export const FREE_QUIZ_EXAMS: Record<
  FreeQuizExamId,
  { label: string; title: string }
> = {
  cissp: { label: "CISSP", title: "CISSP · Demo quiz" },
  cism: { label: "CISM", title: "CISM · Demo quiz" },
  crisc: { label: "CRISC", title: "CRISC · Demo quiz" },
}

export function isFreeQuizExamId(value: string): value is FreeQuizExamId {
  return value === "cissp" || value === "cism" || value === "crisc"
}

const cisspQuestions: FreeQuestion[] = [
  {
    id: "cissp-1",
    domain: "SECURITY & RISK MANAGEMENT",
    text: "What does ALE stand for in risk management?",
    options: [
      "Annual Loss Expectancy",
      "Assumed Liability Estimate",
      "Asset Loss Evaluation",
      "Annualised Liability Exposure",
    ],
    correctOption: 0,
    explanation:
      "ALE (Annual Loss Expectancy) = SLE × ARO. It quantifies expected annual financial impact and justifies control costs.",
  },
  {
    id: "cissp-2",
    domain: "SECURITY & RISK MANAGEMENT",
    text: "Which principle requires granting users only the access needed to perform their job?",
    options: [
      "Separation of duties",
      "Least privilege",
      "Need to know",
      "Defense in depth",
    ],
    correctOption: 1,
    explanation:
      "Least privilege limits rights to the minimum required for a role, reducing the blast radius of compromise or error.",
  },
  {
    id: "cissp-3",
    domain: "ASSET SECURITY",
    text: "Which classification label typically represents the highest sensitivity in a government model?",
    options: ["Confidential", "Secret", "Top Secret", "Restricted"],
    correctOption: 2,
    explanation:
      "Top Secret is the highest common government classification, reserved for information whose unauthorized disclosure could cause exceptionally grave damage.",
  },
  {
    id: "cissp-4",
    domain: "SECURITY ARCHITECTURE & ENGINEERING",
    text: "What is the primary purpose of a Trusted Computing Base (TCB)?",
    options: [
      "Store all user passwords",
      "Enforce the security policy of a system",
      "Encrypt network traffic end to end",
      "Monitor employee productivity",
    ],
    correctOption: 1,
    explanation:
      "The TCB includes all hardware, software, and firmware that enforce the system security policy and must remain trustworthy.",
  },
  {
    id: "cissp-5",
    domain: "COMMUNICATION & NETWORK SECURITY",
    text: "Which protocol provides confidentiality for web traffic by default on port 443?",
    options: ["FTP", "SMTP", "TLS/HTTPS", "SNMP"],
    correctOption: 2,
    explanation:
      "HTTPS uses TLS to encrypt HTTP traffic, commonly over port 443, protecting confidentiality and integrity in transit.",
  },
  {
    id: "cissp-6",
    domain: "IDENTITY & ACCESS MANAGEMENT",
    text: "Which authentication factor is an example of “something you are”?",
    options: ["Password", "Smart card", "Fingerprint", "One-time PIN"],
    correctOption: 2,
    explanation:
      "Biometrics such as fingerprints represent the “something you are” authentication factor.",
  },
  {
    id: "cissp-7",
    domain: "SECURITY ASSESSMENT & TESTING",
    text: "A penetration test that includes no prior knowledge of the target is called:",
    options: [
      "White-box testing",
      "Gray-box testing",
      "Black-box testing",
      "Regression testing",
    ],
    correctOption: 2,
    explanation:
      "Black-box testing simulates an external attacker with no internal knowledge of systems or source code.",
  },
  {
    id: "cissp-8",
    domain: "SECURITY OPERATIONS",
    text: "What is the main goal of an incident response plan?",
    options: [
      "Prevent all future attacks",
      "Contain, eradicate, and recover from security incidents",
      "Replace antivirus software",
      "Increase marketing conversions",
    ],
    correctOption: 1,
    explanation:
      "Incident response focuses on preparing for, detecting, containing, eradicating, recovering from, and learning from security incidents.",
  },
  {
    id: "cissp-9",
    domain: "SOFTWARE DEVELOPMENT SECURITY",
    text: "Which practice helps reduce injection vulnerabilities during development?",
    options: [
      "Hardcoding credentials",
      "Input validation and parameterized queries",
      "Disabling logging in production",
      "Sharing admin accounts",
    ],
    correctOption: 1,
    explanation:
      "Validating input and using parameterized queries/prepared statements are core defenses against SQL and other injection attacks.",
  },
  {
    id: "cissp-10",
    domain: "SECURITY & RISK MANAGEMENT",
    text: "Which CIA triad component ensures data is not improperly altered?",
    options: [
      "Confidentiality",
      "Integrity",
      "Availability",
      "Accountability",
    ],
    correctOption: 1,
    explanation:
      "Integrity protects against unauthorized or improper modification of data, ensuring accuracy and trustworthiness.",
  },
]

const cismQuestions: FreeQuestion[] = [
  {
    id: "cism-1",
    domain: "INFORMATION SECURITY GOVERNANCE",
    text: "What is the primary purpose of an information security strategy?",
    options: [
      "List every technical control in use",
      "Align security objectives with business goals",
      "Replace the IT operations plan",
      "Document only incident tickets",
    ],
    correctOption: 1,
    explanation:
      "A security strategy connects security investments and priorities to organizational objectives and risk appetite.",
  },
  {
    id: "cism-2",
    domain: "INFORMATION SECURITY GOVERNANCE",
    text: "Who is ultimately accountable for information security in an enterprise?",
    options: [
      "The SOC analyst on shift",
      "Senior management / board",
      "External auditors only",
      "Help desk staff",
    ],
    correctOption: 1,
    explanation:
      "Ultimate accountability rests with senior management and the board; security leaders operationalize their direction.",
  },
  {
    id: "cism-3",
    domain: "INFORMATION RISK MANAGEMENT",
    text: "Risk acceptance is most appropriate when:",
    options: [
      "The risk is unknown",
      "Residual risk is within appetite and mitigation cost outweighs benefit",
      "A vulnerability is publicly exploited",
      "Regulators forbid the activity",
    ],
    correctOption: 1,
    explanation:
      "Acceptance is a conscious decision when residual risk is tolerable and further treatment is not justified.",
  },
  {
    id: "cism-4",
    domain: "INFORMATION RISK MANAGEMENT",
    text: "Which metric best expresses how often a threat is expected to occur in a year?",
    options: ["SLE", "ARO", "ALE", "MTTR"],
    correctOption: 1,
    explanation:
      "Annualized Rate of Occurrence (ARO) estimates how many times a threat event is expected annually.",
  },
  {
    id: "cism-5",
    domain: "INFORMATION SECURITY PROGRAM DEVELOPMENT",
    text: "Security awareness training is primarily intended to:",
    options: [
      "Replace technical controls",
      "Reduce human-related security risk",
      "Increase password length only",
      "Eliminate the need for policies",
    ],
    correctOption: 1,
    explanation:
      "Awareness programs target people risk—phishing, handling of data, and policy adherence—complementing technical controls.",
  },
  {
    id: "cism-6",
    domain: "INFORMATION SECURITY PROGRAM DEVELOPMENT",
    text: "A security policy should primarily be:",
    options: [
      "A detailed procedure for every task",
      "A high-level statement of management intent and requirements",
      "A vendor product brochure",
      "An informal team chat guideline",
    ],
    correctOption: 1,
    explanation:
      "Policies set mandatory high-level requirements; standards and procedures provide more detailed implementation guidance.",
  },
  {
    id: "cism-7",
    domain: "INFORMATION SECURITY INCIDENT MANAGEMENT",
    text: "The first priority during an active security incident is usually:",
    options: [
      "Public press release",
      "Containment to limit damage",
      "Full forensic imaging of every endpoint",
      "Immediate termination of all staff",
    ],
    correctOption: 1,
    explanation:
      "After safety considerations, containment limits further harm while preserving enough evidence for investigation.",
  },
  {
    id: "cism-8",
    domain: "INFORMATION SECURITY INCIDENT MANAGEMENT",
    text: "A post-incident review is valuable because it:",
    options: [
      "Assigns blame publicly",
      "Identifies lessons learned and process improvements",
      "Replaces monitoring tools automatically",
      "Guarantees no future incidents",
    ],
    correctOption: 1,
    explanation:
      "Post-incident reviews capture what worked, what failed, and how detection, response, and controls should improve.",
  },
  {
    id: "cism-9",
    domain: "INFORMATION RISK MANAGEMENT",
    text: "Transferring risk commonly involves:",
    options: [
      "Ignoring the risk entirely",
      "Insurance or outsourcing to a capable third party",
      "Deleting all backups",
      "Disabling logging",
    ],
    correctOption: 1,
    explanation:
      "Risk transfer shifts financial or operational impact—e.g., cyber insurance or contracted services—though residual risk often remains.",
  },
  {
    id: "cism-10",
    domain: "INFORMATION SECURITY GOVERNANCE",
    text: "Key risk indicators (KRIs) are most useful for:",
    options: [
      "Measuring early signals that risk thresholds may be breached",
      "Counting only resolved tickets",
      "Replacing business strategy",
      "Encrypting databases",
    ],
    correctOption: 0,
    explanation:
      "KRIs provide forward-looking signals so leadership can act before risk exceeds appetite.",
  },
]

const criscQuestions: FreeQuestion[] = [
  {
    id: "crisc-1",
    domain: "GOVERNANCE",
    text: "CRISC focuses primarily on an IT professional’s ability to:",
    options: [
      "Write assembly code",
      "Identify, assess, and manage IT risk",
      "Design marketing campaigns",
      "Replace the CFO",
    ],
    correctOption: 1,
    explanation:
      "CRISC emphasizes IT risk identification, assessment, response, and monitoring in support of enterprise objectives.",
  },
  {
    id: "crisc-2",
    domain: "IT RISK ASSESSMENT",
    text: "Inherent risk is best described as:",
    options: [
      "Risk remaining after controls are applied",
      "Risk before considering existing controls",
      "Risk that cannot be measured",
      "Risk accepted by regulators only",
    ],
    correctOption: 1,
    explanation:
      "Inherent risk is the exposure present without (or before) accounting for mitigating controls.",
  },
  {
    id: "crisc-3",
    domain: "IT RISK ASSESSMENT",
    text: "Residual risk is:",
    options: [
      "Always zero after any control",
      "The risk remaining after treatment/controls",
      "Identical to inherent risk",
      "Only related to physical theft",
    ],
    correctOption: 1,
    explanation:
      "Residual risk is what remains after risk responses and controls are applied; it should be within appetite.",
  },
  {
    id: "crisc-4",
    domain: "RISK RESPONSE & REPORTING",
    text: "Which is a valid risk response option?",
    options: [
      "Mitigate, accept, transfer, or avoid",
      "Ignore and delete logs",
      "Only encrypt everything",
      "Delay indefinitely with no owner",
    ],
    correctOption: 0,
    explanation:
      "Standard responses include mitigation, acceptance, transfer/sharing, and avoidance, each with clear ownership.",
  },
  {
    id: "crisc-5",
    domain: "IT RISK IDENTIFICATION",
    text: "A risk scenario typically describes:",
    options: [
      "A marketing slogan",
      "A plausible event path from threat to business impact",
      "Only a software version number",
      "An employee vacation schedule",
    ],
    correctOption: 1,
    explanation:
      "Risk scenarios narrate how a threat could exploit vulnerabilities and produce business consequences.",
  },
  {
    id: "crisc-6",
    domain: "RISK RESPONSE & REPORTING",
    text: "Risk owners are responsible for:",
    options: [
      "Approving every firewall rule personally",
      "Ensuring assigned risks are monitored and treated appropriately",
      "Writing all application code",
      "Printing daily vulnerability scans",
    ],
    correctOption: 1,
    explanation:
      "Risk owners are accountable for decisions and ongoing management of specific risks within their domain.",
  },
  {
    id: "crisc-7",
    domain: "IT RISK MONITORING",
    text: "Control effectiveness should be evaluated to determine:",
    options: [
      "Brand color consistency",
      "Whether controls reduce risk as intended",
      "Employee satisfaction scores only",
      "Office lease costs",
    ],
    correctOption: 1,
    explanation:
      "Monitoring control design and operating effectiveness shows whether risk reduction goals are being met.",
  },
  {
    id: "crisc-8",
    domain: "GOVERNANCE",
    text: "Enterprise risk appetite describes:",
    options: [
      "The amount and type of risk the organization is willing to take",
      "The maximum number of servers allowed",
      "Only cyber insurance premiums",
      "A developer coding standard",
    ],
    correctOption: 0,
    explanation:
      "Risk appetite is leadership’s stated willingness to accept risk in pursuit of objectives.",
  },
  {
    id: "crisc-9",
    domain: "IT RISK IDENTIFICATION",
    text: "Which source is commonly used to identify emerging IT risks?",
    options: [
      "Threat intelligence and change/project pipelines",
      "Cafeteria menus",
      "Parking lot capacity",
      "Font libraries",
    ],
    correctOption: 0,
    explanation:
      "Emerging risks are often spotted via threat intel, architecture changes, new projects, audit findings, and incidents.",
  },
  {
    id: "crisc-10",
    domain: "RISK RESPONSE & REPORTING",
    text: "Effective risk reporting to executives should be:",
    options: [
      "Highly technical packet captures only",
      "Clear, decision-oriented, and tied to business impact",
      "Updated once every five years",
      "Hidden from business owners",
    ],
    correctOption: 1,
    explanation:
      "Executives need concise, business-relevant risk information that supports prioritization and funding decisions.",
  },
]

const QUESTIONS_BY_EXAM: Record<FreeQuizExamId, FreeQuestion[]> = {
  cissp: cisspQuestions,
  cism: cismQuestions,
  crisc: criscQuestions,
}

export function getFreeQuestions(examId: FreeQuizExamId): FreeQuestion[] {
  return QUESTIONS_BY_EXAM[examId]
}
