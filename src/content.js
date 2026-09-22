export const STAGES = [
  {
    name: "Mobilize",
    rank: "Senior Director",
    title: "A plan. A fox. A few dependencies.",
    description:
      "Build a shared view of the initiative. Resolve 2 risks, then reach the Decision Gate.",
    practices: "Strategy + Execution",
    quota: 2,
    types: ["scope", "hydra"],
    quote:
      "The kickoff went well. Everyone agreed that someone should own this.",
  },
  {
    name: "Align",
    rank: "Vice President",
    title: "Everyone is aligned. In different directions.",
    description:
      "Turn competing priorities into decisions. Resolve 3 risks and reach the gate.",
    practices: "Strategy + People",
    quota: 3,
    types: ["hydra", "wraith", "scope"],
    quote: "Your reward for resolving ambiguity is greater ambiguity.",
  },
  {
    name: "Design",
    rank: "Senior Vice President",
    title: "It worked beautifully in the diagram.",
    description:
      "Reconnect the information flow. Resolve 3 risks and reach the gate.",
    practices: "Technology + Execution",
    quota: 3,
    types: ["silo", "scope", "imp", "silo"],
    quote: "The requirements were signed off. The assumptions were not.",
  },
  {
    name: "Prepare",
    rank: "Executive Vice President",
    title: "The tracker was very, very green.",
    description: "Expose false readiness. Resolve 4 risks and reach the gate.",
    practices: "People + Technology",
    quota: 4,
    types: ["mimic", "wraith", "silo", "imp"],
    quote: "Attendance is not adoption. Neither is a commemorative mug.",
  },
  {
    name: "Launch",
    rank: "Chief Transformation Officer",
    title: "Go-live has entered the chat.",
    description: "Keep delivery moving. Resolve 4 risks and reach the gate.",
    practices: "Execution + Technology",
    quota: 4,
    types: ["imp", "scope", "hydra", "mimic", "silo"],
    quote: "The escalation path has become a destination.",
  },
  {
    name: "Sustain",
    rank: "CEO",
    title: "Go-live was only the beginning.",
    description:
      "Close the Value Realization Gap, resolve 4 risks, and reach the final gate.",
    practices: "All four practices",
    quota: 4,
    types: ["gap", "wraith", "hydra", "imp", "scope"],
    quote: "The system is live. Now for the part where it helps.",
  },
];
export const THREATS = {
  scope: {
    name: "Scope Creep",
    symbol: "SC",
    practice: "Execution",
    hp: 1,
    artifact: "Controlled Backlog",
    flavor: "“Just one small enhancement.”",
    behavior:
      "Approaches Kit. Creates a new Scope Creep every fourth turn (up to 8 risks).",
  },
  hydra: {
    name: "Decision Hydra",
    symbol: "DH",
    practice: "Strategy",
    hp: 2,
    artifact: "Decision Record",
    flavor: "“We have a few follow-up questions.”",
    behavior:
      "Approaches Kit. Threatens every adjacent hex when Kit is nearby.",
  },
  silo: {
    name: "Data Silo",
    symbol: "DS",
    practice: "Technology",
    hp: 2,
    artifact: "Connected Data",
    flavor: "“Technically, the data exists.”",
    behavior:
      "Stays in place. Targets Kit’s current hex from up to 2 hexes away.",
  },
  wraith: {
    name: "Adoption Wraith",
    symbol: "AW",
    practice: "People",
    hp: 2,
    artifact: "Adoption Plan",
    flavor: "“Everyone attended the training.”",
    behavior:
      "Approaches Kit. Returns once unless resolved with Change leadership.",
  },
  imp: {
    name: "Integration Imp",
    symbol: "II",
    practice: "Technology",
    hp: 1,
    artifact: "Validated Interface",
    flavor: "“It worked in the test environment.”",
    behavior:
      "Approaches Kit. Targets Kit’s current hex from up to 2 hexes away.",
  },
  mimic: {
    name: "Readiness Mimic",
    symbol: "RM",
    practice: "People",
    hp: 2,
    artifact: "Readiness Checklist",
    flavor: "“The tracker was green.”",
    behavior:
      "Stays in place until Kit approaches. Threatens adjacent hexes within range 2.",
  },
  gap: {
    name: "Value Realization Gap",
    symbol: "VG",
    practice: "All practices",
    hp: 5,
    artifact: "Sustained Value",
    flavor: "“The benefits owner has left the meeting.”",
    behavior:
      "Threatens Kit’s current hex and its six neighbors. Move beyond the marked zone.",
  },
};
export const ABILITIES = [
  {
    id: "move",
    name: "Move / resolve",
    key: "1",
    cost: 0,
    icon: "↗",
    description: "Move 1 hex, or resolve 1 point of an adjacent risk.",
  },
  {
    id: "align",
    name: "Facilitate",
    key: "2",
    cost: 2,
    icon: "◎",
    description:
      "Pause every risk within 2 hexes for 2 turns. Your action counts as the first.",
    service: "Facilitation & Experience Design",
  },
  {
    id: "dash",
    name: "Delivery plan",
    key: "3",
    cost: 1,
    icon: "⇢",
    description: "Reposition to an empty hex up to 2 away.",
    service: "Program & Project Delivery",
  },
  {
    id: "insight",
    name: "Data insight",
    key: "4",
    cost: 2,
    icon: "◇",
    description: "Resolve 2 points of a risk up to 3 hexes away.",
    service: "Data, AI, & Automation",
  },
  {
    id: "change",
    name: "Change leadership",
    key: "5",
    cost: 2,
    icon: "✧",
    description:
      "Fully resolve an adjacent risk (2 points on the final threat). Prevents Wraith returns.",
    service: "Organizational Change Management",
  },
  {
    id: "recover",
    name: "Recovery plan",
    key: "6",
    cost: 2,
    icon: "+",
    description: "Restore 3 capacity. Once per stage; risks still act.",
    service: "Initiative Recovery & Stabilization",
  },
];
export const UPGRADES = [
  {
    id: "capacity",
    name: "Executive sponsorship",
    type: "LEADERSHIP",
    description: "+2 maximum capacity. Restore 2 more now.",
  },
  {
    id: "influence",
    name: "Stakeholder coalition",
    type: "PEOPLE",
    description: "+1 maximum influence. Refill influence now.",
  },
  {
    id: "power",
    name: "Delivery playbook",
    type: "EXECUTION",
    description: "Adjacent resolution deals +1 point (maximum 3).",
  },
  {
    id: "range",
    name: "Connected intelligence",
    type: "TECHNOLOGY",
    description: "Data insight reaches 1 hex farther and deals +1 point.",
  },
  {
    id: "economy",
    name: "Clear decision rights",
    type: "STRATEGY",
    description: "Facilitate costs 1 less influence (minimum 1).",
  },
  {
    id: "recovery",
    name: "Sustainable pace",
    type: "PEOPLE",
    description: "Restore 2 extra capacity at each promotion.",
  },
  {
    id: "stride",
    name: "Integrated roadmap",
    type: "EXECUTION",
    description: "Delivery plan reaches 1 hex farther.",
  },
  {
    id: "harvest",
    name: "Knowledge transfer",
    type: "TECHNOLOGY",
    description: "Collecting an artifact also restores 1 capacity.",
  },
];
export const CONFIG = {
  contact: "https://guntergroup.com/lets-talk/",
  explore: "https://guntergroup.com/how-we-help/",
};
