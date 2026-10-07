import { redirect } from "next/navigation";
import { PLAY_STORE_WEB_URL } from "@/lib/config";

export default function GetPage() {
  redirect(PLAY_STORE_WEB_URL);
}
