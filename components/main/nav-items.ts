import {
  HomeIcon,
  GroupsIcon,
  ContributionsIcon,
  WalletIcon,
  UserIcon,
  AnalyticsIcon,
  SettingsIcon,
} from "@/components/icons";

export const navItems = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/groups", label: "My Groups", icon: GroupsIcon },
  { href: "/contributions", label: "Contributions", icon: ContributionsIcon },
  { href: "/transactions", label: "Transactions", icon: WalletIcon },
  { href: "/members", label: "Members", icon: UserIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];
