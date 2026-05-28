import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Route: Explain Term
  app.post("/api/gemini/explain", async (req, res) => {
    try {
      const { term, context, documentTitle } = req.body;
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a historical-theological expert. The user is reading "${documentTitle}".
They want an explanation of the term or phrase: "${term}".
Here is the surrounding context: "${context}"

Provide a historically accurate, contextual summary of what the authors meant by that specific word/phrase at the time this document was written. Keep the explanation concise (2-4 sentences) and easy to understand. Return only the explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      res.json({ explanation: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate explanation" });
    }
  });

  // API Route: Compare Documents
  app.post("/api/gemini/compare", async (req, res) => {
    try {
      const { doc1Title, doc1Content, doc2Title, doc2Content } = req.body;
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a historical-theological expert analyzing two documents: 
Document 1: ${doc1Title}
Content 1: ${doc1Content}

Document 2: ${doc2Title}
Content 2: ${doc2Content}

Please compare these two texts side-by-side. Output a concise JSON response containing exactly one array of strings named "differences". Each string should be a bullet point highlighting a specific theological nuance, difference, omission, or similarity between their views. Focus on substantive variations rather than stylistic ones. Return the raw JSON only, matching this structure: { "differences": ["point 1", "point 2"] }.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              differences: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["differences"]
          }
        }
      });

      // Provide the parsed object or raw text to the front-end
      const responseData = JSON.parse(response.text || "{}");
      res.json(responseData);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze differences" });
    }
  });

  // Simple in-memory cache for document embeddings
  let documentEmbeddings: { id: string, embedding: number[] }[] = [];

  function cosineSimilarity(A: number[], B: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < A.length; i++) {
      dotProduct += A[i] * B[i];
      normA += A[i] * A[i];
      normB += B[i] * B[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // API Route: Semantic Search
  app.post("/api/gemini/semantic-search", async (req, res) => {
    try {
      const { query, documents } = req.body;
      if (!query || !documents) return res.status(400).json({ error: "Missing query or documents" });

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // If cache is missing items, embed the missing ones
      const missingDocs = documents.filter((d: any) => !documentEmbeddings.find(e => e.id === d.id));
      if (missingDocs.length > 0) {
        const texts = missingDocs.map((d: any) => d.content);
        
        // embed content
        let embResults = [];
        try {
          if (texts.length === 1) {
             const resp = await ai.models.embedContent({
               model: 'text-embedding-004',
               contents: texts[0]
             });
             embResults.push(resp.embeddings![0].values!);
          } else {
             // For multiple docs we can embed one by one or as parallel requests
             const promises = texts.map((t: string) => ai.models.embedContent({
               model: 'text-embedding-004',
               contents: t
             }));
             const batchResponses = await Promise.all(promises);
             embResults = batchResponses.map(r => r.embeddings![0].values!);
          }
        } catch (e) {
             console.error("Embedding generation failed", e);
             throw new Error("Vector generation failed.");
        }

        missingDocs.forEach((d: any, index: number) => {
          documentEmbeddings.push({ id: d.id, embedding: embResults[index] });
        });
      }

      // Generate embedding for query
      const queryResp = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: query
      });
      const queryVector = queryResp.embeddings![0].values!;

      // Compare
      const results = documents.map((d: any) => {
        const docVec = documentEmbeddings.find(e => e.id === d.id)!.embedding;
        const score = cosineSimilarity(queryVector, docVec);
        return { id: d.id, score };
      });

      results.sort((a: any, b: any) => b.score - a.score);
      res.json({ results });
    } catch (error: any) {
      console.error("Gemini API Error details:", error.message || error);
      res.status(500).json({ error: error.message || "Failed to perform semantic search" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
