import { Metadata } from "next";
import ClauseCheckDemoClient from "./ClauseCheckDemoClient";

export const metadata: Metadata = {
  title: "Free Contract Risk Checker — ClauseCheck by Bot Vault Pro",
  description: "Upload any contract and get AI-powered risk analysis in 30 seconds. Free. No account required. Flags risky clauses, missing protections, and questions to ask before signing.",
  openGraph: {
    title: "Free Contract Risk Checker — ClauseCheck",
    description: "Upload a contract. Get flagged risks in 30 seconds. Free, no account needed.",
    type: "website",
  },
};

export default function ClauseCheckDemoPage() {
  return <ClauseCheckDemoClient />;
}
