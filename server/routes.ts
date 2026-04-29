import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

type NatalConstructor = new (opts: Record<string, unknown>) => Record<string, unknown>;
interface NatalHoroscopeLib {
  Horoscope: NatalConstructor;
  Origin: NatalConstructor;
}
type NatalHoroscopeModule = NatalHoroscopeLib & { default?: Partial<NatalHoroscopeLib> };

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Helper to geocode city using AI (since we don't have a geocoding API)
  async function getCoordinates(city: string): Promise<{ lat: number; lng: number }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: "You are a geocoding assistant. Return only a JSON object with 'lat' and 'lng' numbers for the given city." },
          { role: "user", content: city }
        ],
        response_format: { type: "json_object" },
      });
      const data = JSON.parse(response.choices[0].message.content || "{}");
      return { lat: data.lat || 40.7128, lng: data.lng || -74.0060 }; // Default to NYC
    } catch (e) {
      console.error("Geocoding failed:", e);
      return { lat: 40.7128, lng: -74.0060 }; // Default to NYC
    }
  }

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      
      // 1. Geocode the city
      const coords = await getCoordinates(input.birthCity);

      // 2. Parse date/time
      const dateParts = input.birthDate.split("-").map(Number); // YYYY-MM-DD
      const timeParts = input.birthTime.split(":").map(Number); // HH:MM

      // 3. Calculate Chart
      const horoscopeModule = (await import("circular-natal-horoscope-js")) as unknown as NatalHoroscopeModule;
      const Horoscope = horoscopeModule.Horoscope ?? horoscopeModule.default?.Horoscope;
      const Origin = horoscopeModule.Origin ?? horoscopeModule.default?.Origin;

      if (typeof Horoscope !== "function" || typeof Origin !== "function") {
        throw new Error("Natal horoscope library did not export Horoscope and Origin constructors");
      }

      const origin = new Origin({
        year: dateParts[0],
        month: dateParts[1] - 1, // 0-indexed (JS Date convention)
        date: dateParts[2],
        hour: timeParts[0],
        minute: timeParts[1],
        latitude: coords.lat,
        longitude: coords.lng
      });

      const horoscope = new Horoscope({
        origin,
        houseSystem: "placidus",
        zodiac: "tropical",
        aspectPoints: ['bodies', 'points', 'angles'],
        aspectWithPoints: ['bodies', 'points', 'angles'],
        aspectTypes: ["major", "minor"],
        language: 'en'
      });

      // Extract relevant chart data
      const chartData = {
        planets: horoscope.CelestialBodies,
        houses: horoscope.Houses,
        ascendant: horoscope.Ascendant,
        midheaven: horoscope.Midheaven,
        aspects: horoscope.Aspects
      };

      // 4. Create User
      const user = await storage.createUser({
        ...input,
        chartData
      });

      // 5. Generate Welcome Message
      const welcomePrompt = `
        You are Oracool, a mystical yet modern AI astrologer.
        The user was born in ${input.birthCity} on ${input.birthDate} at ${input.birthTime}.
        Their Sun sign is ${horoscope.CelestialBodies.sun.Sign.label}.
        Their Moon sign is ${horoscope.CelestialBodies.moon.Sign.label}.
        Their Ascendant is ${horoscope.Ascendant.Sign.label}.
        
        Generate a short, mystical, and welcoming first message greeting them and mentioning their "Big Three" (Sun, Moon, Rising).
        Keep it under 2 sentences.
      `;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "system", content: welcomePrompt }],
      });
      
      const welcomeText = aiResponse.choices[0].message.content || "Welcome to Oracool. The stars have much to tell you.";

      // Save welcome message
      await storage.createMessage(user.id, "assistant", welcomeText);

      res.status(201).json(user);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.chat.send.path, async (req, res) => {
    try {
      const { userId, message } = req.body;
      
      // 1. Get User and History
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const history = await storage.getMessages(userId);
      
      // 2. Save User Message
      const userMsg = await storage.createMessage(userId, "user", message);

      // 3. Generate AI Response
      // Compact chart data for prompt to save tokens
      const chartSummary = user.chartData ? JSON.stringify({
        Sun: (user.chartData as any).planets.sun.Sign.label,
        Moon: (user.chartData as any).planets.moon.Sign.label,
        Rising: (user.chartData as any).ascendant.Sign.label,
        Mercury: (user.chartData as any).planets.mercury.Sign.label,
        Venus: (user.chartData as any).planets.venus.Sign.label,
        Mars: (user.chartData as any).planets.mars.Sign.label,
      }) : "Unknown Chart";

      const systemPrompt = `
        You are Oracool, an expert astrologer.
        User's Chart: ${chartSummary}
        
        Answer their questions using their astrological profile. 
        Be insightful, mystical, but clear. 
        Keep responses concise (under 3-4 sentences) unless asked for a deep dive.
      `;

      const messagesForAI = [
        { role: "system", content: systemPrompt },
        ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: message }
      ];

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: messagesForAI as any,
      });
      
      const aiText = aiResponse.choices[0].message.content || "The stars are silent right now.";

      // 4. Save AI Response
      const aiMsg = await storage.createMessage(userId, "assistant", aiText);

      res.json({ message: userMsg, response: aiMsg });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.chat.history.path, async (req, res) => {
    const userId = Number(req.params.userId);
    const messages = await storage.getMessages(userId);
    res.json(messages);
  });

  return httpServer;
}
