-- DropForeignKey
ALTER TABLE "channels" DROP CONSTRAINT "channels_group_id_fkey";

-- DropForeignKey
ALTER TABLE "debate_analyses" DROP CONSTRAINT "debate_analyses_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "debate_summaries" DROP CONSTRAINT "debate_summaries_debate_analysis_id_fkey";

-- DropForeignKey
ALTER TABLE "group_members" DROP CONSTRAINT "group_members_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_members" DROP CONSTRAINT "group_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_channel_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "minutes" DROP CONSTRAINT "minutes_channel_id_fkey";

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_channel_id_fkey";

-- CreateIndex
CREATE INDEX "channels_group_id_idx" ON "channels"("group_id");

-- CreateIndex
CREATE INDEX "channels_owner_id_idx" ON "channels"("owner_id");

-- CreateIndex
CREATE INDEX "channels_channel_type_idx" ON "channels"("channel_type");

-- CreateIndex
CREATE INDEX "channels_created_at_idx" ON "channels"("created_at");

-- CreateIndex
CREATE INDEX "debate_analyses_topic_id_idx" ON "debate_analyses"("topic_id");

-- CreateIndex
CREATE INDEX "debate_analyses_is_solved_idx" ON "debate_analyses"("is_solved");

-- CreateIndex
CREATE INDEX "debate_analyses_alert_level_idx" ON "debate_analyses"("alert_level");

-- CreateIndex
CREATE INDEX "debate_analyses_created_at_idx" ON "debate_analyses"("created_at");

-- CreateIndex
CREATE INDEX "debate_analyses_topic_id_alert_level_idx" ON "debate_analyses"("topic_id", "alert_level");

-- CreateIndex
CREATE INDEX "debate_summaries_debate_analysis_id_idx" ON "debate_summaries"("debate_analysis_id");

-- CreateIndex
CREATE INDEX "debate_summaries_created_at_idx" ON "debate_summaries"("created_at");

-- CreateIndex
CREATE INDEX "group_members_user_id_idx" ON "group_members"("user_id");

-- CreateIndex
CREATE INDEX "group_members_status_idx" ON "group_members"("status");

-- CreateIndex
CREATE INDEX "group_members_created_at_idx" ON "group_members"("created_at");

-- CreateIndex
CREATE INDEX "groups_created_at_idx" ON "groups"("created_at");

-- CreateIndex
CREATE INDEX "messages_channel_id_idx" ON "messages"("channel_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_parent_id_idx" ON "messages"("parent_id");

-- CreateIndex
CREATE INDEX "messages_type_idx" ON "messages"("type");

-- CreateIndex
CREATE INDEX "messages_status_idx" ON "messages"("status");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "messages_channel_id_created_at_idx" ON "messages"("channel_id", "created_at");

-- CreateIndex
CREATE INDEX "minutes_channel_id_idx" ON "minutes"("channel_id");

-- CreateIndex
CREATE INDEX "minutes_created_at_idx" ON "minutes"("created_at");

-- CreateIndex
CREATE INDEX "topics_channel_id_idx" ON "topics"("channel_id");

-- CreateIndex
CREATE INDEX "topics_status_idx" ON "topics"("status");

-- CreateIndex
CREATE INDEX "topics_created_at_idx" ON "topics"("created_at");

-- CreateIndex
CREATE INDEX "topics_channel_id_status_idx" ON "topics"("channel_id", "status");

-- CreateIndex
CREATE INDEX "users_clerk_id_idx" ON "users"("clerk_id");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "minutes" ADD CONSTRAINT "minutes_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debate_analyses" ADD CONSTRAINT "debate_analyses_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debate_summaries" ADD CONSTRAINT "debate_summaries_debate_analysis_id_fkey" FOREIGN KEY ("debate_analysis_id") REFERENCES "debate_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
