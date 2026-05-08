import { SystemConfig } from "@/lib/types";

export const DEFAULT_CONFIG: SystemConfig = {
  trungDois: [
    {
      id: "td9",
      name: "Trung đội 9",
    },
    {
      id: "td10",
      name: "Trung đội 10",
    },
    {
      id: "td11",
      name: "Trung đội 11",
    },
    {
      id: "td12",
      name: "Trung đội 12",
    },
  ],

  scoreCategories: [
    { key: "nd1", label: "Nội dung I" },
    { key: "nd2", label: "Nội dung II" },
    { key: "nd3", label: "Nội dung III" },
    { key: "nd4", label: "Nội dung IV" },
  ],

  tdColors: {
    td9: "#FF6B6B",
    td10: "#34d399",
    td11: "#38bdf8",
    td12: "#fbbf24",
  },

  tdIcons: {
    td9: "🔴",
    td10: "🟢",
    td11: "🔵",
    td12: "🟡",
  },
};