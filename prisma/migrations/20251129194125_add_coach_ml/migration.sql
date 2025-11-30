-- CreateTable
CREATE TABLE "CoachConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "userMessage" TEXT NOT NULL,
    "assistantResponse" TEXT NOT NULL,
    "nutritionContext" TEXT,
    "helpful" BOOLEAN,
    "rating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "goals" TEXT,
    "preferences" TEXT,
    "restrictions" TEXT,
    "age" INTEGER,
    "weight" REAL,
    "height" REAL,
    "activityLevel" TEXT,
    "targetCalories" INTEGER,
    "targetProteins" INTEGER,
    "targetCarbs" INTEGER,
    "targetFats" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "CoachConversation_userId_createdAt_idx" ON "CoachConversation"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
