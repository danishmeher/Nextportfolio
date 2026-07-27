export type PortfolioProfile = {
  name: string;
  role: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  resumeUrl: string;
  portfolioUrl: string;
  github: string;
  linkedin: string;
  responseTime: string;
};

export const portfolioProfile: PortfolioProfile = {
  name: "Danish",
  role: "Frontend Developer",
  summary:
    "Frontend developer focused on building polished web experiences with React, Next.js, TypeScript, and Tailwind CSS.",
  email: "danish.daniriaz@gmail.com",
  phone: "+92 302 4111148",
  location: "Available Hybrid",
  resumeUrl: "/DanishCV.pdf",
  portfolioUrl: "/",
  github: "https://github.com/danishmeher",
  linkedin: "https://www.linkedin.com/in/danishriazdani/",
  responseTime: "Typically responds within 24 hours.",
};

export function getPortfolioProfileContext(): string {
  return [
    `Name: ${portfolioProfile.name}`,
    `Role: ${portfolioProfile.role}`,
    `Summary: ${portfolioProfile.summary}`,
    `Email: ${portfolioProfile.email}`,
    `Phone: ${portfolioProfile.phone}`,
    `Location: ${portfolioProfile.location}`,
    `Resume: ${portfolioProfile.resumeUrl}`,
    `Portfolio: ${portfolioProfile.portfolioUrl}`,
    `GitHub: ${portfolioProfile.github}`,
    `LinkedIn: ${portfolioProfile.linkedin}`,
    `Response: ${portfolioProfile.responseTime}`,
  ].join("\n");
}
