import { redirect } from "next/navigation";

interface Props {
  params: { code: string };
}

// Referral link landing: /ref/[code]
// Sets a cookie via redirect to /auth/signup?ref=[code]
// The signup page reads this and calls /api/referral to record it
export default function ReferralRedirect({ params }: Props) {
  const code = params.code?.toUpperCase();
  if (!code) redirect("/auth/signup");
  redirect(`/auth/signup?ref=${encodeURIComponent(code)}`);
}
