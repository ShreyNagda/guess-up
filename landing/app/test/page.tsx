import { redirect } from "next/navigation";
import { PLAY_STORE_WEB_URL } from "@/lib/config";

export default function TestRedirectPage() {
  // Directly redirects users typing bujho.vercel.app/test on their phone to Google Play opt-in
  redirect(PLAY_STORE_WEB_URL);
}
