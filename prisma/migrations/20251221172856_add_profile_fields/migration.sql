-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthDate" DATETIME,
    "gender" TEXT,
    "height" REAL,
    "weight" REAL,
    "targetWeight" REAL,
    "activityLevel" TEXT,
    "goal" TEXT,
    "dailyCaloriesTarget" INTEGER,
    "proteinTarget" INTEGER,
    "carbsTarget" INTEGER,
    "fatTarget" INTEGER,
    "dietType" TEXT,
    "allergies" TEXT,
    "intolerances" TEXT,
    "dislikedFoods" TEXT,
    "likedFoods" TEXT,
    "cookingSkillLevel" TEXT,
    "cookingTimeWeekday" INTEGER,
    "cookingTimeWeekend" INTEGER,
    "weeklyBudget" INTEGER,
    "fastingSchedule" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "subscriptionPlan", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "subscriptionPlan", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
