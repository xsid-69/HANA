CREATE TYPE "public"."BookingStatus" AS ENUM('PENDING_ACCEPTANCE', 'REJECTED', 'AWAITING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."MessageType" AS ENUM('TEXT', 'IMAGE', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."NotificationType" AS ENUM('NEW_MESSAGE', 'BOOKING_REQUEST', 'BOOKING_ACCEPTED', 'BOOKING_CONFIRMED', 'BOOKING_DECLINED', 'BOOKING_CANCELLED', 'BOOKING_COMPLETED', 'PAYMENT_REMINDER', 'PAYMENT_EXPIRED', 'REVIEW_REMINDER', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('CLIENT', 'COMPANION', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."VerificationStatus" AS ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "availabilities" (
	"id" text PRIMARY KEY NOT NULL,
	"companionId" text NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"startTime" text NOT NULL,
	"endTime" text NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_dates" (
	"id" text PRIMARY KEY NOT NULL,
	"companionId" text NOT NULL,
	"date" timestamp NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"clientId" text NOT NULL,
	"companionId" text NOT NULL,
	"date" timestamp NOT NULL,
	"startTime" text NOT NULL,
	"endTime" text NOT NULL,
	"durationHours" integer NOT NULL,
	"activityType" text NOT NULL,
	"notes" text,
	"hourlyRate" integer NOT NULL,
	"subtotal" integer NOT NULL,
	"serviceFee" integer NOT NULL,
	"deposit" integer NOT NULL,
	"totalAmount" integer NOT NULL,
	"status" "BookingStatus" DEFAULT 'PENDING_ACCEPTANCE' NOT NULL,
	"paymentStatus" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"paymentExpiresAt" timestamp,
	"acceptedAt" timestamp,
	"rejectedAt" timestamp,
	"cancelledBy" text,
	"cancelledAt" timestamp,
	"cancelReason" text,
	"isLateCancellation" boolean DEFAULT false NOT NULL,
	"stripePaymentIntentId" text,
	"paidAt" timestamp,
	"refundedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"displayName" text NOT NULL,
	"age" integer NOT NULL,
	"city" text NOT NULL,
	"district" text,
	"bio" text NOT NULL,
	"languages" text[] NOT NULL,
	"photos" text[] NOT NULL,
	"tags" text[] NOT NULL,
	"hourlyRate" integer NOT NULL,
	"minimumHours" integer DEFAULT 2 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isSuspended" boolean DEFAULT false NOT NULL,
	"verificationStatus" "VerificationStatus" DEFAULT 'UNVERIFIED' NOT NULL,
	"verificationImages" text[] DEFAULT '{}' NOT NULL,
	"averageRating" real DEFAULT 0 NOT NULL,
	"totalReviews" integer DEFAULT 0 NOT NULL,
	"totalBookings" integer DEFAULT 0 NOT NULL,
	"trustScore" integer DEFAULT 100 NOT NULL,
	"acceptanceRate" real DEFAULT 100 NOT NULL,
	"cancellationRate" real DEFAULT 0 NOT NULL,
	"cancellationCount" integer DEFAULT 0 NOT NULL,
	"lateCancellations" integer DEFAULT 0 NOT NULL,
	"completedBookings" integer DEFAULT 0 NOT NULL,
	"totalRequests" integer DEFAULT 0 NOT NULL,
	"responseTimeAvg" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companions_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"conversationId" text NOT NULL,
	"userId" text NOT NULL,
	"lastReadAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"bookingId" text,
	"lastMessageAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_bookingId_unique" UNIQUE("bookingId")
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" text PRIMARY KEY NOT NULL,
	"companionId" text NOT NULL,
	"name" text NOT NULL,
	"emoji" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversationId" text NOT NULL,
	"senderId" text NOT NULL,
	"type" "MessageType" DEFAULT 'TEXT' NOT NULL,
	"content" text NOT NULL,
	"reaction" text,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" "NotificationType" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"data" json,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"bookingId" text NOT NULL,
	"authorId" text NOT NULL,
	"companionId" text NOT NULL,
	"rating" integer NOT NULL,
	"content" text NOT NULL,
	"isVisible" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_bookingId_unique" UNIQUE("bookingId")
);
--> statement-breakpoint
CREATE TABLE "saved_companions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"companionId" text NOT NULL,
	"savedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"password" text,
	"role" "Role" DEFAULT 'CLIENT' NOT NULL,
	"city" text,
	"bio" text,
	"onboarded" boolean DEFAULT false NOT NULL,
	"trustScore" integer DEFAULT 100 NOT NULL,
	"cancellationCount" integer DEFAULT 0 NOT NULL,
	"noShowCount" integer DEFAULT 0 NOT NULL,
	"completedBookings" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_companionId_companions_id_fk" FOREIGN KEY ("companionId") REFERENCES "public"."companions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clientId_users_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_companionId_companions_id_fk" FOREIGN KEY ("companionId") REFERENCES "public"."companions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companions" ADD CONSTRAINT "companions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_companionId_companions_id_fk" FOREIGN KEY ("companionId") REFERENCES "public"."companions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_companionId_companions_id_fk" FOREIGN KEY ("companionId") REFERENCES "public"."companions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_companions" ADD CONSTRAINT "saved_companions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_companions" ADD CONSTRAINT "saved_companions_companionId_companions_id_fk" FOREIGN KEY ("companionId") REFERENCES "public"."companions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE UNIQUE INDEX "availabilities_companionId_dayOfWeek_key" ON "availabilities" USING btree ("companionId","dayOfWeek");--> statement-breakpoint
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON "conversation_participants" USING btree ("conversationId","userId");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_companions_userId_companionId_key" ON "saved_companions" USING btree ("userId","companionId");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens" USING btree ("identifier","token");