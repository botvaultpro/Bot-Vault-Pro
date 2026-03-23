import { Metadata } from "next";
import EmailCoachDemoClient from "./EmailCoachDemoClient";

export const metadata: Metadata = {
  title: "Free AI Email Reply Generator — EmailCoach by Bot Vault Pro",
  description: "Paste any difficult email and get 3 professional AI reply options instantly. Free. No account required. Professional, direct, and diplomatic versions.",
  openGraph: {
    title: "Free AI Email Reply Generator",
    description: "Paste any email. Get 3 ready-to-send replies in seconds. Free, no account needed.",
    type: "website",
  },
};

export default function EmailCoachDemoPage() {
  return <EmailCoachDemoClient />;
}
