import { Metadata } from "next";
import InvoiceForgeDemoClient from "./InvoiceForgeDemoClient";

export const metadata: Metadata = {
  title: "Free AI Invoice Generator — InvoiceForge by Bot Vault Pro",
  description: "Generate a professional invoice in 60 seconds. Free. No account required. AI-written cover note, payment terms, and follow-up reminder included.",
  openGraph: {
    title: "Free AI Invoice Generator — InvoiceForge",
    description: "Fill in the details. Get a complete professional invoice in seconds. Free, no account needed.",
    type: "website",
  },
};

export default function InvoiceForgeDemoPage() {
  return <InvoiceForgeDemoClient />;
}
