import { NextResponse } from "next/server";
import { addFeedbackToFirestore } from "@/lib/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, feedback, name, role } = body;

    if (!rating || !feedback || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields: rating, feedback, name, or role." },
        { status: 400 },
      );
    }

    const result = await addFeedbackToFirestore(
      Number(rating),
      String(feedback),
      String(name),
      String(role),
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to submit feedback." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Feedback submitted successfully!" },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
