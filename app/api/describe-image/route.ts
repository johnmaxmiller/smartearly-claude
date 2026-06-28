import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const AGE_GROUPS = ["infant", "toddler", "preschooler"] as const;
type AgeGroup = (typeof AGE_GROUPS)[number];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function isSupportedMediaType(
  type: string
): type is "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const ageGroup = formData.get("ageGroup");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (typeof ageGroup !== "string" || !AGE_GROUPS.includes(ageGroup as AgeGroup)) {
      return NextResponse.json(
        { error: "ageGroup must be one of: infant, toddler, preschooler" },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image is too large (max 10MB)" }, { status: 400 });
    }

    if (!isSupportedMediaType(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPEG, PNG, GIF, or WEBP." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: file.type,
                data: base64,
              },
            },
            {
              type: "text",
              text: `This photo is of a ${ageGroup}. Describe exactly what is happening in the picture in clear, vivid detail: who/what is in frame, their pose, expression, and actions, and the setting. Write it as a well-defined, natural paragraph someone could read to picture the scene without seeing it.`,
            },
          ],
        },
      ],
    });

    const description = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Image description error:", error);
    return NextResponse.json(
      { error: "Failed to describe image" },
      { status: 500 }
    );
  }
}
