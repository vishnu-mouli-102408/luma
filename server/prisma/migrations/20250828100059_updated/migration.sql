-- CreateTable
CREATE TABLE "public"."SessionAnalysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyThemes" TEXT[],
    "emotionalState" TEXT NOT NULL,
    "areasOfConcern" TEXT[],
    "recommendations" TEXT[],
    "progressIndicators" TEXT[],
    "riskLevel" INTEGER NOT NULL DEFAULT 0,
    "analysisData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "expectedBenefits" TEXT[],
    "difficultyLevel" TEXT NOT NULL,
    "estimatedDuration" INTEGER,
    "basedOnMoodScore" INTEGER,
    "contextData" JSONB,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionAnalysis_sessionId_key" ON "public"."SessionAnalysis"("sessionId");

-- CreateIndex
CREATE INDEX "SessionAnalysis_userId_createdAt_idx" ON "public"."SessionAnalysis"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityRecommendation_userId_createdAt_idx" ON "public"."ActivityRecommendation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityRecommendation_userId_isCompleted_idx" ON "public"."ActivityRecommendation"("userId", "isCompleted");

-- AddForeignKey
ALTER TABLE "public"."SessionAnalysis" ADD CONSTRAINT "SessionAnalysis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionAnalysis" ADD CONSTRAINT "SessionAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityRecommendation" ADD CONSTRAINT "ActivityRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
