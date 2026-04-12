/* ────────────────────────── Project Data ────────────────────────── */

export const activeProjects = [
  {
    id: 1,
    title: "Eco-Solar Farm Alpha",
    category: "Renewable Energy",
    image: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=800",
    roi: "12.5% Monthly",
    duration: "18 Months",
    collected: 750000,
    target: 1000000,
    investors: 142,
    description: "Sustainable power generation for over 500 households, utilizing high-efficiency monocrystalline panels. This project is part of our commitment to regional energy independence and long-term stable yields.",
    gallery: [
      { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-solar-panels-in-a-field-under-a-sunny-sky-24423-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=200' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800', thumbnail: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=200' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=800', thumbnail: 'https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=200' }
    ],
    allocation: [
      { label: "Hardware", value: 45, color: "#ccff00" },
      { label: "Installation", value: 25, color: "#a3ff00" },
      { label: "Permits", value: 15, color: "#77ff00" },
      { label: "Operational", value: 15, color: "#ffffff" }
    ]
  },
  {
    id: 2,
    title: "Vertical Agri-Hub Beta",
    category: "Smart Agriculture",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    roi: "15.0% Monthly",
    duration: "24 Months",
    collected: 400000,
    target: 1000000,
    investors: 85,
    description: "Next-gen vertical hydroponics center centered on organic produce with 90% reduced water footprint. Located in a high-demand urban corridor, this project scales high-efficiency agriculture for local premium markets.",
    gallery: [
      { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-green-plants-in-a-greenhouse-41610-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800', thumbnail: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=200' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800', thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=200' }
    ],
    allocation: [
      { label: "Hydroponics Tech", value: 40, color: "#ccff00" },
      { label: "Logistics", value: 30, color: "#a3ff00" },
      { label: "Facilities", value: 20, color: "#77ff00" },
      { label: "R&D", value: 10, color: "#ffffff" }
    ]
  },
  {
    id: 3,
    title: "Tech-Logistics Gamma",
    category: "Supply Chain",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    roi: "10.0% Monthly",
    duration: "12 Months",
    collected: 900000,
    target: 1000000,
    investors: 256,
    description: "Automated distribution hub designed for last-mile delivery efficiency in high-density urban corridors. Using state-of-the-art sorting tech to reduce delivery times by 40%.",
    gallery: [
      { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-shipping-containers-in-a-large-port-41613-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=200' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?auto=format&fit=crop&q=80&w=800', thumbnail: 'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?auto=format&fit=crop&q=80&w=200' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=800', thumbnail: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=200' }
    ],
    allocation: [
      { label: "Automation", value: 50, color: "#ccff00" },
      { label: "Warehouse", value: 30, color: "#a3ff00" },
      { label: "Fleet", value: 15, color: "#77ff00" },
      { label: "Admin", value: 5, color: "#ffffff" }
    ]
  }
];

export const ongoingProjects = [
  {
    id: 1,
    title: "Project Helios - Solar Grid",
    category: "Infrastructure",
    yield: "14.2% p.a.",
    maturityDate: "Oct 2026",
    daysRemaining: 142,
    completionPercent: 65,
    description: "Phase 1 construction completed. Currently generating grid-connected revenue across 14 commercial nodes."
  },
  {
    id: 2,
    title: "Urban Aqua-Cult Beta",
    category: "Sustainable Food",
    yield: "15.8% p.a.",
    maturityDate: "Mar 2027",
    daysRemaining: 310,
    completionPercent: 42,
    description: "Operational hydroponic facility distributing organic produce to local premium markets in the NCR region."
  },
  {
    id: 3,
    title: "Cyber-Hub Warehouse 09",
    category: "Industrial Real Estate",
    yield: "11.5% p.a.",
    maturityDate: "Jun 2026",
    daysRemaining: 85,
    completionPercent: 88,
    description: "Triple-net lease in place with a Grade-A logistics provider. Predictable monthly rental yields."
  }
];

export const completedProjects = [
  {
    id: 1,
    title: "Alpha Warehouse Portfolio",
    category: "Logistics Real Estate",
    irr: "16.8% p.a.",
    startDate: "Jan 2022",
    targetDate: "Mar 2023",
    maturityDate: "Dec 2025",
    totalReturns: "142% Total",
    description: "Successful exit of a three-asset logistics portfolio. Capital returned in full with consistent quarterly dividends."
  },
  {
    id: 2,
    title: "Project Terra Alpha",
    category: "Agri-Tech",
    irr: "18.2% p.a.",
    startDate: "Mar 2023",
    targetDate: "Feb 2024",
    maturityDate: "Aug 2025",
    totalReturns: "155% Total",
    description: "High-yield vertical farming project that transitioned to a strategic buyout from a leading agri-conglomerate."
  },
  {
    id: 3,
    title: "Solar-Impact Phase 01",
    category: "Infrastructure",
    irr: "12.5% p.a.",
    startDate: "May 2022",
    targetDate: "Jul 2023",
    maturityDate: "May 2025",
    totalReturns: "128% Total",
    description: "Utility-scale solar project spanning 50 acres. Delivered monthly payouts for 36 months before a successful PPA exit."
  }
];
