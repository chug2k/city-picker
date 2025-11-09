import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { CityData } from "@/types/city";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { cityName } = await request.json();

    if (!cityName) {
      return NextResponse.json(
        { error: "City name is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a city data researcher. Generate comprehensive data for ${cityName} in the following JSON format. Be realistic and accurate based on current 2024/2025 data. Singapore timezone is UTC+8.

Return ONLY valid JSON (no markdown, no code blocks, no explanations) with this exact structure:

{
  "name": "${cityName}",
  "timezoneOffset": <number of hours difference from Singapore, can be negative>,
  "afterTaxIncome": <estimated monthly after-tax income in USD for remote tech worker>,
  "monthlyCost": <average monthly cost in USD for 2 adults + 1 dog>,
  "savings12Month": <calculated: (afterTaxIncome - monthlyCost) * 12>,
  "savings": {
    "score": <number 1-10, based on savings12Month potential>,
    "notes": "<2-3 sentence description of cost of living and savings potential>",
    "sources": []
  },
  "timezoneOverlap": {
    "score": <number 1-10, 10 = same as Singapore, 0 = opposite side of world>,
    "notes": "<1-2 sentence description about timezone and work overlap>",
    "sources": []
  },
  "techVC": {
    "score": <number 1-10, strength of tech/VC scene>,
    "notes": "<2-3 sentence description of tech/VC ecosystem>",
    "sources": []
  },
  "climateAir": {
    "score": <number 1-10, quality of climate and air>,
    "notes": "<2-3 sentence description of climate and air quality with temperature ranges>",
    "sources": []
  },
  "expatFriendliness": {
    "score": <number 1-10, how welcoming to expats>,
    "notes": "<2-3 sentence description of expat community and friendliness>",
    "sources": []
  },
  "visaEase": {
    "score": <number 1-10, how easy to get visa/stay long-term>,
    "notes": "<2-3 sentence description of visa options for remote workers>",
    "sources": []
  },
  "dogImportEase": {
    "score": <number 1-10, how easy to import a dog>,
    "notes": "<2-3 sentence description of pet import requirements and ease>",
    "sources": []
  },
  "veganFriendliness": {
    "score": <number 1-10, availability of vegan options>,
    "notes": "<1-2 sentence description of vegan food availability>",
    "sources": []
  }
}

IMPORTANT: Return ONLY the JSON object, nothing else. No markdown formatting, no explanations before or after. The sources arrays should be empty [] for now.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response - remove markdown code blocks if present
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/, "").replace(/\n?```$/, "");
    }

    // Parse the JSON response
    const cityData: CityData = JSON.parse(jsonText);

    return NextResponse.json({ cityData });
  } catch (error) {
    console.error("Error generating city data:", error);
    return NextResponse.json(
      {
        error: "Failed to generate city data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
