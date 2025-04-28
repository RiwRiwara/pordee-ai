export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Pordee - Personal Finance Management",
  description: "Pordee is a personal finance management platform.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/pordee/pordee",
    twitter: "https://twitter.com/pordee",
    docs: "https://pordee.com",
    discord: "https://discord.gg/pordee",
    sponsor: "https://patreon.com/pordee",
  },
};
