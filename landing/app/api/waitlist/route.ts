import { NextResponse } from "next/server";
import { addTesterToFirestore } from "@/lib/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "Playtester").trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // Save to Firestore DB instantly (no email sending delays)
    const firestoreResult = await addTesterToFirestore(cleanName, cleanEmail);

    if (!firestoreResult.success && firestoreResult.alreadyRegistered) {
      return NextResponse.json(
        {
          success: true,
          alreadyRegistered: true,
          message: "Email already registered for early access.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      success: true,
      firestoreSaved: firestoreResult.success,
      message: "Successfully registered!",
    });
  } catch (error: any) {
    console.error("Waitlist API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error. Please try again.",
      },
      { status: 500 },
    );
  }
}
