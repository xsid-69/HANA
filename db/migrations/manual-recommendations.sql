CREATE TABLE IF NOT EXISTS "user_events" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "companionId" text NOT NULL REFERENCES "companions"("id") ON DELETE CASCADE,
  "eventType" text NOT NULL,
  "weight" integer NOT NULL,
  "sessionDuration" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "recommendations" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "companionId" text NOT NULL REFERENCES "companions"("id") ON DELETE CASCADE,
  "score" real NOT NULL,
  "generatedAt" timestamp DEFAULT now() NOT NULL,
  "modelVersion" text DEFAULT 'v1' NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "recommendations_userId_companionId_key"
  ON "recommendations" ("userId", "companionId");
