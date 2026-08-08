-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'FRIENDS', 'PUBLIC');

-- CreateEnum
CREATE TYPE "GameStatusType" AS ENUM ('WANT_TO_PLAY', 'PLAYING', 'COMPLETED', 'DROPPED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('REVIEW_POSTED', 'TIER_LIST_UPDATED', 'GAME_COMPLETED', 'GAME_STARTED', 'FRIEND_ADDED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    "currently_playing" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_cache" (
    "igdb_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cover_url" TEXT,
    "summary" TEXT,
    "genres" JSONB DEFAULT '[]',
    "platforms" JSONB DEFAULT '[]',
    "first_release" DATE,
    "igdb_rating" DOUBLE PRECISION,
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_cache_pkey" PRIMARY KEY ("igdb_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "game_igdb_id" INTEGER NOT NULL,
    "content" TEXT,
    "score_overall" INTEGER,
    "score_gameplay" INTEGER,
    "score_story" INTEGER,
    "score_graphics" INTEGER,
    "score_sound" INTEGER,
    "score_replayability" INTEGER,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "contains_spoilers" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_reactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_comments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tier_lists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "tiers_config" JSONB NOT NULL DEFAULT '[{"label":"S","color":"#FFD700"},{"label":"A","color":"#FF4444"},{"label":"B","color":"#FF8C00"},{"label":"C","color":"#FFD700"},{"label":"D","color":"#4CAF50"},{"label":"F","color":"#607D8B"}]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tier_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tier_list_items" (
    "id" UUID NOT NULL,
    "tier_list_id" UUID NOT NULL,
    "game_igdb_id" INTEGER NOT NULL,
    "tier_label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "tier_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_statuses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "game_igdb_id" INTEGER NOT NULL,
    "status" "GameStatusType" NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "addressee_id" UUID NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "ActivityType" NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "game_cache_slug_key" ON "game_cache"("slug");

-- CreateIndex
CREATE INDEX "game_cache_slug_idx" ON "game_cache"("slug");

-- CreateIndex
CREATE INDEX "reviews_game_igdb_id_idx" ON "reviews"("game_igdb_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_reactions_user_id_review_id_type_key" ON "review_reactions"("user_id", "review_id", "type");

-- CreateIndex
CREATE INDEX "tier_list_items_tier_list_id_position_idx" ON "tier_list_items"("tier_list_id", "position");

-- CreateIndex
CREATE INDEX "game_statuses_user_id_status_idx" ON "game_statuses"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "game_statuses_user_id_game_igdb_id_key" ON "game_statuses"("user_id", "game_igdb_id");

-- CreateIndex
CREATE INDEX "friendships_requester_id_addressee_id_status_idx" ON "friendships"("requester_id", "addressee_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_requester_id_addressee_id_key" ON "friendships"("requester_id", "addressee_id");

-- CreateIndex
CREATE INDEX "activities_user_id_created_at_idx" ON "activities"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reactions" ADD CONSTRAINT "review_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reactions" ADD CONSTRAINT "review_reactions_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_lists" ADD CONSTRAINT "tier_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_list_items" ADD CONSTRAINT "tier_list_items_tier_list_id_fkey" FOREIGN KEY ("tier_list_id") REFERENCES "tier_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_statuses" ADD CONSTRAINT "game_statuses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
