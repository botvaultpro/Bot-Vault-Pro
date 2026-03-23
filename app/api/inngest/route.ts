import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { sendWelcomeEmail, weeklyPulseEmail, trialDripSequence, postSubscriptionUpsell, demoDripSequence } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendWelcomeEmail, weeklyPulseEmail, trialDripSequence, postSubscriptionUpsell, demoDripSequence],
});
