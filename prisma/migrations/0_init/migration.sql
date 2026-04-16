-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_graphql";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "supabase_vault";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid_ossp";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('MEMBER', 'CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'RESUBMITTED');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('FARMER', 'ARTISAN', 'BOTH');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "VerificationDocumentType" AS ENUM ('PROFILE_PHOTO', 'DOCUMENT_PROOF_1', 'DOCUMENT_PROOF_2', 'DOCUMENT_PROOF_3', 'NIN_PHOTO', 'ID_CARD', 'TRADE_ASSOCIATION_CARD', 'BUSINESS_REGISTRATION', 'UTILITY_BILL', 'OTHER_DOCUMENT');

-- CreateEnum
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUIRED');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED', 'NEGOTIABLE', 'BOTH');

-- CreateEnum
CREATE TYPE "ProductAvailability" AS ENUM ('AVAILABLE', 'OUT_OF_STOCK', 'SEASONAL', 'LIMITED_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ServiceAvailability" AS ENUM ('AVAILABLE', 'FULLY_BOOKED', 'BY_APPOINTMENT', 'TEMPORARILY_UNAVAILABLE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ToolCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'FOR_PARTS');

-- CreateEnum
CREATE TYPE "ToolListingPurpose" AS ENUM ('FOR_SALE', 'FOR_LEASE', 'BOTH');

-- CreateEnum
CREATE TYPE "ToolAvailabilityStatus" AS ENUM ('AVAILABLE', 'CURRENTLY_LEASED', 'SOLD', 'RESERVED', 'UNAVAILABLE', 'UNDER_MAINTENANCE');

-- CreateEnum
CREATE TYPE "LeaseRatePeriod" AS ENUM ('PER_HOUR', 'PER_DAY', 'PER_WEEK', 'PER_MONTH');

-- CreateEnum
CREATE TYPE "DepositRequirement" AS ENUM ('REQUIRED', 'NOT_REQUIRED', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('TRAINING_COMPLETION', 'PROFESSIONAL_CERTIFICATION', 'TRADE_LICENSE', 'AWARD_RECOGNITION', 'MEMBERSHIP_CERTIFICATE', 'GOVERNMENT_CERTIFICATION', 'SKILL_CERTIFICATION', 'HEALTH_SAFETY_CERT', 'QUALITY_CERTIFICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CertificateVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'UNVERIFIED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "RatingCategory" AS ENUM ('PRODUCT_RATING', 'SERVICE_RATING', 'TOOL_LEASE_RATING', 'OVERALL_MEMBER');

-- CreateEnum
CREATE TYPE "RatingStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'REPORTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PRODUCT_SALE', 'SERVICE_RENDERED', 'TOOL_LEASE', 'TOOL_SALE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('RECORDED', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('FARMER_SPECIALIZATION', 'ARTISAN_SPECIALIZATION', 'PRODUCT_AGRICULTURAL', 'PRODUCT_ARTISAN', 'SERVICE_FARMING', 'SERVICE_ARTISAN', 'TOOL_FARMING', 'TOOL_ARTISAN');

-- CreateEnum
CREATE TYPE "SponsorPartnerType" AS ENUM ('SPONSOR', 'PARTNER', 'BOTH');

-- CreateEnum
CREATE TYPE "SponsorPartnerCategory" AS ENUM ('GOVERNMENT_AGENCY', 'NON_GOVERNMENTAL_ORGANIZATION', 'CORPORATE_PRIVATE_SECTOR', 'INTERNATIONAL_ORGANIZATION', 'EDUCATIONAL_INSTITUTION', 'TRADITIONAL_INSTITUTION', 'FINANCIAL_INSTITUTION', 'INDIVIDUAL_DONOR', 'RELIGIOUS_ORGANIZATION', 'MEDIA_ORGANIZATION', 'OTHER');

-- CreateEnum
CREATE TYPE "TestimonialCategory" AS ENUM ('MEMBER_SUCCESS_STORY', 'PARTNER_FEEDBACK', 'COMMUNITY_IMPACT', 'CLIENT_TESTIMONIAL', 'OFFICIAL_RECOGNITION', 'YOUTH_EMPOWERMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ANNUAL_GENERAL_MEETING', 'BOARD_OF_TRUSTEES_MEETING', 'EXECUTIVE_MEETING', 'SPECIAL_MEETING', 'TRAINING_WORKSHOP', 'SEMINAR_CONFERENCE', 'COMMUNITY_OUTREACH', 'EXHIBITION_FAIR', 'AWARD_CEREMONY', 'PARTNERSHIP_SIGNING', 'FUNDRAISING_EVENT', 'CULTURAL_EVENT', 'LAUNCH_INAUGURATION', 'STAKEHOLDER_MEETING', 'OTHER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "FoundationDocumentType" AS ENUM ('CAC_CERTIFICATE', 'CONSTITUTION', 'STATUS_REPORT', 'ANNUAL_REPORT', 'FINANCIAL_STATEMENT', 'AWARD_CERTIFICATE', 'PARTNERSHIP_AGREEMENT', 'ACCREDITATION', 'OTHER');

-- CreateEnum
CREATE TYPE "AboutSectionKey" AS ENUM ('MISSION_STATEMENT', 'VISION_STATEMENT', 'OVERVIEW', 'HISTORY', 'CORE_VALUES', 'WHO_WE_ARE', 'WHAT_WE_DO', 'OUR_IMPACT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'VERIFICATION_ADMIN', 'CONTENT_ADMIN', 'REPORT_ADMIN');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('LOGIN', 'LOGOUT', 'PASSWORD_CHANGED', 'MEMBER_VERIFICATION_APPROVED', 'MEMBER_VERIFICATION_REJECTED', 'MEMBER_RESUBMISSION_REQUESTED', 'CLIENT_VERIFICATION_APPROVED', 'CLIENT_VERIFICATION_REJECTED', 'CLIENT_RESUBMISSION_REQUESTED', 'USER_SUSPENDED', 'USER_REACTIVATED', 'USER_PASSWORD_RESET', 'ABOUT_CONTENT_UPDATED', 'LEADERSHIP_PROFILE_CREATED', 'LEADERSHIP_PROFILE_UPDATED', 'LEADERSHIP_PROFILE_DELETED', 'SPONSOR_CREATED', 'SPONSOR_UPDATED', 'SPONSOR_DELETED', 'TESTIMONIAL_CREATED', 'TESTIMONIAL_UPDATED', 'TESTIMONIAL_DELETED', 'TESTIMONIAL_APPROVED', 'EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_DELETED', 'EVENT_PUBLISHED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED', 'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED', 'ADMIN_CREATED', 'ADMIN_UPDATED', 'ADMIN_DEACTIVATED', 'ADMIN_REACTIVATED', 'SETTINGS_CHANGED', 'DATA_EXPORTED', 'DATA_IMPORTED', 'SYSTEM_BACKUP', 'OTHER');

-- CreateEnum
CREATE TYPE "PasswordResetStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'RESUBMISSION_REQUIRED', 'PASSWORD_RESET_READY', 'NEW_RATING_RECEIVED', 'SYSTEM_ANNOUNCEMENT', 'EVENT_REMINDER', 'PROFILE_VIEW_MILESTONE', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "ExternalLinkType" AS ENUM ('VIDEO_LINK', 'DOCUMENT_LINK', 'WEBSITE_LINK', 'SOCIAL_MEDIA_LINK', 'PORTFOLIO_LINK', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "country_code" VARCHAR(5) NOT NULL DEFAULT '+234',
    "password_hash" VARCHAR(255) NOT NULL,
    "user_type" "UserType" NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verification_submitted_at" TIMESTAMP(3),
    "verification_started_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "verified_by_admin_id" UUID,
    "rejection_reason" TEXT,
    "rejection_details" TEXT,
    "resubmission_count" INTEGER NOT NULL DEFAULT 0,
    "last_resubmitted_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "suspended_at" TIMESTAMP(3),
    "suspended_reason" TEXT,
    "suspended_by_admin_id" UUID,
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" VARCHAR(45),
    "login_count" INTEGER NOT NULL DEFAULT 0,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "refresh_token" VARCHAR(500),
    "device_info" VARCHAR(255),
    "device_type" VARCHAR(50),
    "os_info" VARCHAR(100),
    "browser_info" VARCHAR(100),
    "ip_address" VARCHAR(45),
    "location" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminated_at" TIMESTAMP(3),

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_documents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_type" "VerificationDocumentType" NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "original_file_name" VARCHAR(255),
    "stored_file_name" VARCHAR(255),
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "width" INTEGER,
    "height" INTEGER,
    "description" TEXT,
    "verification_status" "DocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_at" TIMESTAMP(3),
    "verified_by_admin_id" UUID,
    "rejection_reason" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "request_reason" TEXT,
    "status" "PasswordResetStatus" NOT NULL DEFAULT 'PENDING',
    "processed_by_admin_id" UUID,
    "processed_at" TIMESTAMP(3),
    "admin_notes" TEXT,
    "temporary_password_hash" VARCHAR(255),
    "password_changed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "related_entity_type" VARCHAR(50),
    "related_entity_id" UUID,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider_type" "ProviderType" NOT NULL,
    "profile_photo_url" VARCHAR(500),
    "profile_photo_thumbnail" VARCHAR(500),
    "bio" TEXT,
    "tagline" VARCHAR(200),
    "date_of_birth" DATE,
    "gender" "Gender",
    "address" TEXT NOT NULL,
    "landmark" VARCHAR(255),
    "local_government_area" VARCHAR(100) NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "country" VARCHAR(50) NOT NULL DEFAULT 'Nigeria',
    "postal_code" VARCHAR(20),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "years_of_experience" INTEGER,
    "started_practicing_year" INTEGER,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "five_star_count" INTEGER NOT NULL DEFAULT 0,
    "four_star_count" INTEGER NOT NULL DEFAULT 0,
    "three_star_count" INTEGER NOT NULL DEFAULT 0,
    "two_star_count" INTEGER NOT NULL DEFAULT 0,
    "one_star_count" INTEGER NOT NULL DEFAULT 0,
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "active_products" INTEGER NOT NULL DEFAULT 0,
    "total_services" INTEGER NOT NULL DEFAULT 0,
    "active_services" INTEGER NOT NULL DEFAULT 0,
    "total_tools" INTEGER NOT NULL DEFAULT 0,
    "active_tools" INTEGER NOT NULL DEFAULT 0,
    "total_certificates" INTEGER NOT NULL DEFAULT 0,
    "profile_view_count" INTEGER NOT NULL DEFAULT 0,
    "total_transactions" INTEGER NOT NULL DEFAULT 0,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "profile_completeness" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_specializations" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "specialization_type" "ProviderType" NOT NULL,
    "category_id" UUID NOT NULL,
    "specific_skills" TEXT[],
    "description" TEXT,
    "experience_years" INTEGER,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_external_links" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "link_type" "ExternalLinkType" NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "title" VARCHAR(200),
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_external_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "address" TEXT,
    "local_government_area" VARCHAR(100),
    "state" VARCHAR(50),
    "country" VARCHAR(50) NOT NULL DEFAULT 'Nigeria',
    "nin_photo_url" VARCHAR(500),
    "nin_photo_uploaded_at" TIMESTAMP(3),
    "total_ratings_given" INTEGER NOT NULL DEFAULT 0,
    "total_reviews_written" INTEGER NOT NULL DEFAULT 0,
    "preferred_categories" TEXT[],
    "preferred_locations" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "category_code" VARCHAR(15) NOT NULL,
    "category_type" "CategoryType" NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" VARCHAR(500),
    "icon_url" VARCHAR(500),
    "icon_name" VARCHAR(50),
    "color_code" VARCHAR(7),
    "examples" TEXT[],
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" VARCHAR(300),
    "tags" TEXT[],
    "unit_of_measure" VARCHAR(50) NOT NULL,
    "minimum_order_quantity" INTEGER,
    "maximum_order_quantity" INTEGER,
    "available_quantity" INTEGER,
    "stock_keeping_unit" VARCHAR(50),
    "pricing_type" "PricingType" NOT NULL,
    "price_amount" DECIMAL(12,2),
    "price_per_unit" VARCHAR(50),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "price_display_text" VARCHAR(100),
    "bulk_price_amount" DECIMAL(12,2),
    "bulk_minimum_quantity" INTEGER,
    "availability" "ProductAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "seasonal_info" VARCHAR(255),
    "season_start_month" INTEGER,
    "season_end_month" INTEGER,
    "lead_time_days" INTEGER,
    "external_video_link" VARCHAR(1000),
    "external_document_link" VARCHAR(1000),
    "external_reference_link" VARCHAR(1000),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "medium_url" VARCHAR(500),
    "alt_text" VARCHAR(200),
    "caption" VARCHAR(255),
    "original_file_name" VARCHAR(255),
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "width" INTEGER,
    "height" INTEGER,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" VARCHAR(300),
    "tags" TEXT[],
    "service_area" TEXT,
    "service_radius" INTEGER,
    "services_locations" TEXT[],
    "estimated_duration" VARCHAR(100),
    "minimum_duration_hours" DECIMAL(5,2),
    "maximum_duration_days" INTEGER,
    "pricing_type" "PricingType" NOT NULL,
    "starting_price" DECIMAL(12,2),
    "maximum_price" DECIMAL(12,2),
    "price_basis" VARCHAR(50),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "price_display_text" VARCHAR(100),
    "call_out_fee" DECIMAL(12,2),
    "materials_cost_included" BOOLEAN NOT NULL DEFAULT false,
    "availability" "ServiceAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "working_days" TEXT[],
    "working_hours_start" VARCHAR(10),
    "working_hours_end" VARCHAR(10),
    "external_video_link" VARCHAR(1000),
    "external_document_link" VARCHAR(1000),
    "portfolio_link" VARCHAR(1000),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "completed_jobs_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_images" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "medium_url" VARCHAR(500),
    "alt_text" VARCHAR(200),
    "caption" VARCHAR(255),
    "project_name" VARCHAR(150),
    "original_file_name" VARCHAR(255),
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "width" INTEGER,
    "height" INTEGER,
    "image_type" VARCHAR(50) NOT NULL DEFAULT 'portfolio',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" VARCHAR(300),
    "tags" TEXT[],
    "condition" "ToolCondition" NOT NULL,
    "brand_name" VARCHAR(100),
    "model_number" VARCHAR(100),
    "year_manufactured" INTEGER,
    "age_years" INTEGER,
    "specifications" JSONB,
    "features" TEXT[],
    "included_accessories" TEXT[],
    "quantity_available" INTEGER NOT NULL DEFAULT 1,
    "listing_purpose" "ToolListingPurpose" NOT NULL,
    "sale_pricing_type" "PricingType",
    "sale_price" DECIMAL(12,2),
    "sale_price_display_text" VARCHAR(100),
    "lease_pricing_type" "PricingType",
    "lease_rate" DECIMAL(12,2),
    "lease_rate_period" "LeaseRatePeriod",
    "lease_price_display_text" VARCHAR(100),
    "minimum_lease_duration" INTEGER,
    "maximum_lease_duration" INTEGER,
    "deposit_required" "DepositRequirement",
    "deposit_amount" DECIMAL(12,2),
    "deposit_notes" VARCHAR(255),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "availability_status" "ToolAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "pickup_location" TEXT,
    "pickup_location_lga" VARCHAR(100),
    "pickup_location_state" VARCHAR(50),
    "delivery_available" BOOLEAN NOT NULL DEFAULT false,
    "delivery_fee" DECIMAL(12,2),
    "delivery_notes" VARCHAR(255),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "inquiry_count" INTEGER NOT NULL DEFAULT 0,
    "lease_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_images" (
    "id" UUID NOT NULL,
    "tool_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "medium_url" VARCHAR(500),
    "alt_text" VARCHAR(200),
    "caption" VARCHAR(255),
    "original_file_name" VARCHAR(255),
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "width" INTEGER,
    "height" INTEGER,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "certificate_photo_url" VARCHAR(500) NOT NULL,
    "certificate_thumbnail_url" VARCHAR(500),
    "certificate_name" VARCHAR(200) NOT NULL,
    "certificate_type" "CertificateType" NOT NULL,
    "issuing_organization" VARCHAR(200) NOT NULL,
    "issuing_organization_logo" VARCHAR(500),
    "date_issued" DATE NOT NULL,
    "expiry_date" DATE,
    "certificate_number" VARCHAR(100),
    "verification_link" VARCHAR(1000),
    "description" TEXT,
    "verification_status" "CertificateVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verified_by_admin_id" UUID,
    "verified_at" TIMESTAMP(3),
    "verification_notes" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "rating_category" "RatingCategory" NOT NULL,
    "product_id" UUID,
    "service_id" UUID,
    "overall_rating" INTEGER NOT NULL,
    "quality_rating" INTEGER,
    "communication_rating" INTEGER,
    "value_rating" INTEGER,
    "timeliness_rating" INTEGER,
    "review_title" VARCHAR(150),
    "review_text" VARCHAR(500),
    "status" "RatingStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "is_reported" BOOLEAN NOT NULL DEFAULT false,
    "report_count" INTEGER NOT NULL DEFAULT 0,
    "report_reasons" TEXT[],
    "moderated_by_admin_id" UUID,
    "moderated_at" TIMESTAMP(3),
    "moderation_notes" TEXT,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "not_helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "product_id" UUID,
    "service_id" UUID,
    "tool_id" UUID,
    "listing_name" VARCHAR(200),
    "client_name" VARCHAR(150),
    "client_phone" VARCHAR(15),
    "client_location" VARCHAR(255),
    "transaction_date" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "quantity" INTEGER,
    "unit_of_measure" VARCHAR(50),
    "lease_duration" INTEGER,
    "lease_period_unit" VARCHAR(20),
    "lease_start_date" DATE,
    "lease_end_date" DATE,
    "deposit_paid" DECIMAL(12,2),
    "deposit_returned" BOOLEAN,
    "status" "TransactionStatus" NOT NULL DEFAULT 'RECORDED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_content" (
    "id" UUID NOT NULL,
    "section_key" "AboutSectionKey" NOT NULL,
    "custom_key" VARCHAR(50),
    "title" VARCHAR(200),
    "subtitle" VARCHAR(300),
    "content" TEXT NOT NULL,
    "content_html" TEXT,
    "image_url" VARCHAR(500),
    "video_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_admin_id" UUID,

    CONSTRAINT "about_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leadership_profiles" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "position" VARCHAR(150) NOT NULL,
    "title" VARCHAR(100),
    "photo_url" VARCHAR(500),
    "photo_thumbnail_url" VARCHAR(500),
    "phone_number" VARCHAR(15),
    "email" VARCHAR(150),
    "bio" TEXT,
    "short_bio" VARCHAR(300),
    "linkedin_url" VARCHAR(500),
    "twitter_url" VARCHAR(500),
    "is_trustee" BOOLEAN NOT NULL DEFAULT false,
    "is_founder" BOOLEAN NOT NULL DEFAULT false,
    "is_chairman" BOOLEAN NOT NULL DEFAULT false,
    "is_secretary" BOOLEAN NOT NULL DEFAULT false,
    "is_treasurer" BOOLEAN NOT NULL DEFAULT false,
    "appointment_date" DATE,
    "term_end_date" DATE,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "show_on_about_page" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leadership_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foundation_objectives" (
    "id" UUID NOT NULL,
    "objective_number" INTEGER NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" VARCHAR(200),
    "icon_name" VARCHAR(50),
    "icon_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_displayed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foundation_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors_partners" (
    "id" UUID NOT NULL,
    "organization_name" VARCHAR(200) NOT NULL,
    "logo_url" VARCHAR(500),
    "logo_thumbnail_url" VARCHAR(500),
    "type" "SponsorPartnerType" NOT NULL,
    "category" "SponsorPartnerCategory" NOT NULL,
    "description" TEXT,
    "short_description" VARCHAR(300),
    "website" VARCHAR(500),
    "contact_person_name" VARCHAR(150),
    "contact_person_title" VARCHAR(100),
    "contact_email" VARCHAR(150),
    "contact_phone" VARCHAR(15),
    "partnership_since" DATE,
    "partnership_end_date" DATE,
    "is_ongoing" BOOLEAN NOT NULL DEFAULT true,
    "sponsorship_level" VARCHAR(50),
    "sponsorship_amount" DECIMAL(12,2),
    "areas_of_support" TEXT[],
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "show_on_about_page" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsors_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL,
    "person_name" VARCHAR(150) NOT NULL,
    "photo_url" VARCHAR(500),
    "photo_thumbnail_url" VARCHAR(500),
    "title_role" VARCHAR(200) NOT NULL,
    "organization" VARCHAR(200),
    "location" VARCHAR(150),
    "testimonial_text" VARCHAR(1000) NOT NULL,
    "short_quote" VARCHAR(200),
    "category" "TestimonialCategory" NOT NULL,
    "rating" INTEGER,
    "video_url" VARCHAR(500),
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_by_admin_id" UUID,
    "approved_at" TIMESTAMP(3),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "show_on_about_page" BOOLEAN NOT NULL DEFAULT true,
    "show_on_home_page" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "testimonial_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "event_type" "EventType" NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" VARCHAR(300),
    "start_date" DATE NOT NULL,
    "start_time" VARCHAR(10),
    "end_date" DATE,
    "end_time" VARCHAR(10),
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Africa/Lagos',
    "venue_name" VARCHAR(250) NOT NULL,
    "venue_address" TEXT,
    "city_lga" VARCHAR(100),
    "state" VARCHAR(50),
    "is_virtual_event" BOOLEAN NOT NULL DEFAULT false,
    "virtual_event_link" VARCHAR(500),
    "virtual_event_platform" VARCHAR(100),
    "featured_image_url" VARCHAR(500),
    "featured_image_thumbnail" VARCHAR(500),
    "banner_image_url" VARCHAR(500),
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "attendance_count" INTEGER,
    "event_summary" TEXT,
    "key_outcomes" TEXT,
    "notable_attendees" TEXT,
    "lessons_learned" TEXT,
    "video_link" VARCHAR(500),
    "news_link" VARCHAR(500),
    "registration_link" VARCHAR(500),
    "report_document_link" VARCHAR(500),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "show_on_home_page" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "created_by_admin_id" UUID,
    "last_updated_by_admin_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_gallery_images" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "medium_url" VARCHAR(500),
    "caption" VARCHAR(300),
    "alt_text" VARCHAR(200),
    "photographer" VARCHAR(150),
    "taken_at" TIMESTAMP(3),
    "original_file_name" VARCHAR(255),
    "file_size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by_admin_id" UUID,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_agenda_items" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "start_time" VARCHAR(50),
    "end_time" VARCHAR(50),
    "duration" VARCHAR(50),
    "title" VARCHAR(250) NOT NULL,
    "description" TEXT,
    "speaker_name" VARCHAR(150),
    "speaker_title" VARCHAR(150),
    "speaker_photo" VARCHAR(500),
    "location" VARCHAR(200),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_break" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foundation_documents" (
    "id" UUID NOT NULL,
    "document_name" VARCHAR(200) NOT NULL,
    "document_type" "FoundationDocumentType" NOT NULL,
    "photo_url" VARCHAR(500),
    "photo_thumbnail_url" VARCHAR(500),
    "external_link" VARCHAR(500),
    "description" TEXT,
    "document_number" VARCHAR(100),
    "issue_date" DATE,
    "expiry_date" DATE,
    "issuing_authority" VARCHAR(200),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "show_on_about_page" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foundation_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "phone_number" VARCHAR(15),
    "email" VARCHAR(150),
    "profile_photo_url" VARCHAR(500),
    "role" "AdminRole" NOT NULL,
    "can_verify_members" BOOLEAN NOT NULL DEFAULT false,
    "can_verify_clients" BOOLEAN NOT NULL DEFAULT false,
    "can_reset_passwords" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_content" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_events" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_admins" BOOLEAN NOT NULL DEFAULT false,
    "can_export_data" BOOLEAN NOT NULL DEFAULT false,
    "can_access_reports" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" VARCHAR(45),
    "login_count" INTEGER NOT NULL DEFAULT 0,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_by_admin_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deactivated_at" TIMESTAMP(3),

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "device_info" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminated_at" TIMESTAMP(3),
    "terminated_reason" VARCHAR(100),

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_activity_logs" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "action_type" "AdminActionType" NOT NULL,
    "action_description" TEXT NOT NULL,
    "target_type" VARCHAR(50),
    "target_id" UUID,
    "target_name" VARCHAR(200),
    "previous_values" JSONB,
    "new_values" JSONB,
    "changed_fields" TEXT[],
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "session_id" UUID,
    "additional_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL,
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_group" VARCHAR(50) NOT NULL,
    "setting_value" TEXT NOT NULL,
    "setting_type" VARCHAR(20) NOT NULL,
    "default_value" TEXT,
    "display_name" VARCHAR(100),
    "description" TEXT,
    "validation_rules" JSONB,
    "is_editable" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_info" (
    "id" UUID NOT NULL,
    "contact_type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100),
    "address" TEXT,
    "landmark" VARCHAR(255),
    "city" VARCHAR(100),
    "local_government_area" VARCHAR(100),
    "state" VARCHAR(50),
    "country" VARCHAR(50) NOT NULL DEFAULT 'Nigeria',
    "postal_code" VARCHAR(20),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "map_link" VARCHAR(500),
    "phone_number_1" VARCHAR(15),
    "phone_number_2" VARCHAR(15),
    "phone_number_3" VARCHAR(15),
    "whatsapp_number" VARCHAR(15),
    "email" VARCHAR(150),
    "alternate_email" VARCHAR(150),
    "website" VARCHAR(500),
    "office_hours" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_links" (
    "id" UUID NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "platform_name" VARCHAR(50) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "username" VARCHAR(100),
    "icon_name" VARCHAR(50),
    "icon_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nigerian_states" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(5) NOT NULL,
    "region" VARCHAR(50) NOT NULL,
    "capital" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "nigerian_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nigerian_lgas" (
    "id" UUID NOT NULL,
    "state_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "nigerian_lgas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_statistics" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_users" INTEGER NOT NULL DEFAULT 0,
    "total_members" INTEGER NOT NULL DEFAULT 0,
    "total_clients" INTEGER NOT NULL DEFAULT 0,
    "new_members" INTEGER NOT NULL DEFAULT 0,
    "new_clients" INTEGER NOT NULL DEFAULT 0,
    "pending_member_verifications" INTEGER NOT NULL DEFAULT 0,
    "pending_client_verifications" INTEGER NOT NULL DEFAULT 0,
    "verifications_approved" INTEGER NOT NULL DEFAULT 0,
    "verifications_rejected" INTEGER NOT NULL DEFAULT 0,
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "total_services" INTEGER NOT NULL DEFAULT 0,
    "total_tools" INTEGER NOT NULL DEFAULT 0,
    "new_products" INTEGER NOT NULL DEFAULT 0,
    "new_services" INTEGER NOT NULL DEFAULT 0,
    "new_tools" INTEGER NOT NULL DEFAULT 0,
    "total_profile_views" INTEGER NOT NULL DEFAULT 0,
    "total_product_views" INTEGER NOT NULL DEFAULT 0,
    "total_service_views" INTEGER NOT NULL DEFAULT 0,
    "total_tool_views" INTEGER NOT NULL DEFAULT 0,
    "new_ratings" INTEGER NOT NULL DEFAULT 0,
    "new_reviews" INTEGER NOT NULL DEFAULT 0,
    "new_transactions" INTEGER NOT NULL DEFAULT 0,
    "total_transaction_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view_logs" (
    "id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "viewer_type" VARCHAR(20) NOT NULL,
    "viewer_id" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "referrer" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "view_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" UUID NOT NULL,
    "search_query" VARCHAR(255) NOT NULL,
    "search_type" VARCHAR(50) NOT NULL,
    "filters" JSONB,
    "result_count" INTEGER NOT NULL,
    "user_id" UUID,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" UUID NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "stored_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "uploaded_by_id" UUID NOT NULL,
    "uploaded_by_type" VARCHAR(20) NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_temporary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "question" VARCHAR(500) NOT NULL,
    "answer" TEXT NOT NULL,
    "category" VARCHAR(100),
    "target_audience" VARCHAR(50),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "not_helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "short_content" VARCHAR(300),
    "type" VARCHAR(50) NOT NULL,
    "background_color" VARCHAR(7),
    "text_color" VARCHAR(7),
    "target_audience" TEXT[],
    "target_states" TEXT[],
    "image_url" VARCHAR(500),
    "action_url" VARCHAR(500),
    "action_label" VARCHAR(100),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "show_on_home_page" BOOLEAN NOT NULL DEFAULT true,
    "show_on_dashboard" BOOLEAN NOT NULL DEFAULT true,
    "is_dismissible" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "dismiss_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_admin_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reports" (
    "id" UUID NOT NULL,
    "reporter_type" VARCHAR(20) NOT NULL,
    "reporter_id" UUID,
    "content_type" VARCHAR(50) NOT NULL,
    "content_id" UUID NOT NULL,
    "content_owner_id" UUID,
    "reason" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "evidence_urls" TEXT[],
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "reviewed_by_admin_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "resolution" VARCHAR(50),
    "resolution_notes" TEXT,
    "action_taken" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_trails" (
    "id" UUID NOT NULL,
    "table_name" VARCHAR(100) NOT NULL,
    "record_id" UUID NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "changed_fields" TEXT[],
    "changed_by_id" UUID,
    "changed_by_type" VARCHAR(20),
    "changed_by_name" VARCHAR(150),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "request_id" VARCHAR(100),
    "reason" TEXT,
    "additional_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_trails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_import_export_logs" (
    "id" UUID NOT NULL,
    "operation_type" VARCHAR(20) NOT NULL,
    "data_type" VARCHAR(50) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500),
    "file_size" INTEGER,
    "file_format" VARCHAR(20),
    "total_records" INTEGER NOT NULL,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "warning_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "error_details" JSONB,
    "error_log_url" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "performed_by_admin_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_import_export_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" UUID NOT NULL,
    "template_key" VARCHAR(100) NOT NULL,
    "template_name" VARCHAR(150) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "body_html" TEXT NOT NULL,
    "body_text" TEXT,
    "available_variables" TEXT[],
    "category" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_jobs" (
    "id" UUID NOT NULL,
    "job_name" VARCHAR(100) NOT NULL,
    "job_type" VARCHAR(50) NOT NULL,
    "cron_expression" VARCHAR(50),
    "interval_minutes" INTEGER,
    "last_run_at" TIMESTAMP(3),
    "last_run_status" VARCHAR(20),
    "last_run_duration" INTEGER,
    "last_run_message" TEXT,
    "next_run_at" TIMESTAMP(3),
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "successful_runs" INTEGER NOT NULL DEFAULT 0,
    "failed_runs" INTEGER NOT NULL DEFAULT 0,
    "configuration" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "key_hash" VARCHAR(255) NOT NULL,
    "key_prefix" VARCHAR(20) NOT NULL,
    "permissions" TEXT[],
    "rate_limit" INTEGER NOT NULL DEFAULT 1000,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "total_requests" INTEGER NOT NULL DEFAULT 0,
    "created_by_admin_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL,
    "flag_key" VARCHAR(100) NOT NULL,
    "flag_name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "target_percentage" INTEGER NOT NULL DEFAULT 100,
    "target_user_types" TEXT[],
    "target_states" TEXT[],
    "configuration" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "enabled_at" TIMESTAMP(3),

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_new_rating" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_verification" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_events" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_announcements" BOOLEAN NOT NULL DEFAULT true,
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "theme" VARCHAR(20) NOT NULL DEFAULT 'light',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "show_phone_number" BOOLEAN NOT NULL DEFAULT true,
    "show_email" BOOLEAN NOT NULL DEFAULT false,
    "show_location" BOOLEAN NOT NULL DEFAULT true,
    "allow_ratings" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_saved_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "item_type" VARCHAR(50) NOT NULL,
    "item_id" UUID NOT NULL,
    "notes" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_saved_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_dismissed_announcements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "announcement_id" UUID NOT NULL,
    "dismissed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_dismissed_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seed_category_references" (
    "id" UUID NOT NULL,
    "category_code" VARCHAR(15) NOT NULL,
    "category_type" "CategoryType" NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "examples" TEXT[],
    "is_seeded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "seed_category_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_embeddings" (
    "id" UUID NOT NULL,
    "related_id" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" vector(384),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_user_type_idx" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "users_verification_status_idx" ON "users"("verification_status");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_verified_by_admin_id_idx" ON "users"("verified_by_admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_token_idx" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_is_active_idx" ON "user_sessions"("is_active");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "verification_documents_user_id_idx" ON "verification_documents"("user_id");

-- CreateIndex
CREATE INDEX "verification_documents_document_type_idx" ON "verification_documents"("document_type");

-- CreateIndex
CREATE INDEX "verification_documents_verification_status_idx" ON "verification_documents"("verification_status");

-- CreateIndex
CREATE INDEX "password_reset_requests_user_id_idx" ON "password_reset_requests"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_requests_phone_number_idx" ON "password_reset_requests"("phone_number");

-- CreateIndex
CREATE INDEX "password_reset_requests_status_idx" ON "password_reset_requests"("status");

-- CreateIndex
CREATE INDEX "password_reset_requests_created_at_idx" ON "password_reset_requests"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_user_id_key" ON "member_profiles"("user_id");

-- CreateIndex
CREATE INDEX "member_profiles_provider_type_idx" ON "member_profiles"("provider_type");

-- CreateIndex
CREATE INDEX "member_profiles_local_government_area_idx" ON "member_profiles"("local_government_area");

-- CreateIndex
CREATE INDEX "member_profiles_state_idx" ON "member_profiles"("state");

-- CreateIndex
CREATE INDEX "member_profiles_average_rating_idx" ON "member_profiles"("average_rating");

-- CreateIndex
CREATE INDEX "member_profiles_profile_view_count_idx" ON "member_profiles"("profile_view_count");

-- CreateIndex
CREATE INDEX "member_profiles_is_profile_complete_idx" ON "member_profiles"("is_profile_complete");

-- CreateIndex
CREATE INDEX "member_profiles_is_featured_idx" ON "member_profiles"("is_featured");

-- CreateIndex
CREATE INDEX "member_profiles_created_at_idx" ON "member_profiles"("created_at");

-- CreateIndex
CREATE INDEX "member_specializations_member_id_idx" ON "member_specializations"("member_id");

-- CreateIndex
CREATE INDEX "member_specializations_specialization_type_idx" ON "member_specializations"("specialization_type");

-- CreateIndex
CREATE INDEX "member_specializations_category_id_idx" ON "member_specializations"("category_id");

-- CreateIndex
CREATE INDEX "member_specializations_is_primary_idx" ON "member_specializations"("is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "member_specializations_member_id_category_id_key" ON "member_specializations"("member_id", "category_id");

-- CreateIndex
CREATE INDEX "member_external_links_member_id_idx" ON "member_external_links"("member_id");

-- CreateIndex
CREATE INDEX "member_external_links_link_type_idx" ON "member_external_links"("link_type");

-- CreateIndex
CREATE INDEX "member_external_links_is_active_idx" ON "member_external_links"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_user_id_key" ON "client_profiles"("user_id");

-- CreateIndex
CREATE INDEX "client_profiles_state_idx" ON "client_profiles"("state");

-- CreateIndex
CREATE INDEX "client_profiles_local_government_area_idx" ON "client_profiles"("local_government_area");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_code_key" ON "categories"("category_code");

-- CreateIndex
CREATE INDEX "categories_category_type_idx" ON "categories"("category_type");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");

-- CreateIndex
CREATE INDEX "categories_display_order_idx" ON "categories"("display_order");

-- CreateIndex
CREATE INDEX "categories_level_idx" ON "categories"("level");

-- CreateIndex
CREATE INDEX "products_member_id_idx" ON "products"("member_id");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_pricing_type_idx" ON "products"("pricing_type");

-- CreateIndex
CREATE INDEX "products_availability_idx" ON "products"("availability");

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE INDEX "products_is_featured_idx" ON "products"("is_featured");

-- CreateIndex
CREATE INDEX "products_average_rating_idx" ON "products"("average_rating");

-- CreateIndex
CREATE INDEX "products_view_count_idx" ON "products"("view_count");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

-- CreateIndex
CREATE INDEX "product_images_is_primary_idx" ON "product_images"("is_primary");

-- CreateIndex
CREATE INDEX "product_images_display_order_idx" ON "product_images"("display_order");

-- CreateIndex
CREATE INDEX "services_member_id_idx" ON "services"("member_id");

-- CreateIndex
CREATE INDEX "services_category_id_idx" ON "services"("category_id");

-- CreateIndex
CREATE INDEX "services_pricing_type_idx" ON "services"("pricing_type");

-- CreateIndex
CREATE INDEX "services_availability_idx" ON "services"("availability");

-- CreateIndex
CREATE INDEX "services_is_active_idx" ON "services"("is_active");

-- CreateIndex
CREATE INDEX "services_is_featured_idx" ON "services"("is_featured");

-- CreateIndex
CREATE INDEX "services_average_rating_idx" ON "services"("average_rating");

-- CreateIndex
CREATE INDEX "services_view_count_idx" ON "services"("view_count");

-- CreateIndex
CREATE INDEX "services_created_at_idx" ON "services"("created_at");

-- CreateIndex
CREATE INDEX "services_name_idx" ON "services"("name");

-- CreateIndex
CREATE INDEX "service_images_service_id_idx" ON "service_images"("service_id");

-- CreateIndex
CREATE INDEX "service_images_is_primary_idx" ON "service_images"("is_primary");

-- CreateIndex
CREATE INDEX "service_images_display_order_idx" ON "service_images"("display_order");

-- CreateIndex
CREATE INDEX "service_images_image_type_idx" ON "service_images"("image_type");

-- CreateIndex
CREATE INDEX "tools_member_id_idx" ON "tools"("member_id");

-- CreateIndex
CREATE INDEX "tools_category_id_idx" ON "tools"("category_id");

-- CreateIndex
CREATE INDEX "tools_listing_purpose_idx" ON "tools"("listing_purpose");

-- CreateIndex
CREATE INDEX "tools_condition_idx" ON "tools"("condition");

-- CreateIndex
CREATE INDEX "tools_availability_status_idx" ON "tools"("availability_status");

-- CreateIndex
CREATE INDEX "tools_is_active_idx" ON "tools"("is_active");

-- CreateIndex
CREATE INDEX "tools_view_count_idx" ON "tools"("view_count");

-- CreateIndex
CREATE INDEX "tools_created_at_idx" ON "tools"("created_at");

-- CreateIndex
CREATE INDEX "tools_name_idx" ON "tools"("name");

-- CreateIndex
CREATE INDEX "tool_images_tool_id_idx" ON "tool_images"("tool_id");

-- CreateIndex
CREATE INDEX "tool_images_is_primary_idx" ON "tool_images"("is_primary");

-- CreateIndex
CREATE INDEX "tool_images_display_order_idx" ON "tool_images"("display_order");

-- CreateIndex
CREATE INDEX "certificates_member_id_idx" ON "certificates"("member_id");

-- CreateIndex
CREATE INDEX "certificates_certificate_type_idx" ON "certificates"("certificate_type");

-- CreateIndex
CREATE INDEX "certificates_verification_status_idx" ON "certificates"("verification_status");

-- CreateIndex
CREATE INDEX "certificates_is_visible_idx" ON "certificates"("is_visible");

-- CreateIndex
CREATE INDEX "certificates_display_order_idx" ON "certificates"("display_order");

-- CreateIndex
CREATE INDEX "certificates_date_issued_idx" ON "certificates"("date_issued");

-- CreateIndex
CREATE INDEX "ratings_client_id_idx" ON "ratings"("client_id");

-- CreateIndex
CREATE INDEX "ratings_member_id_idx" ON "ratings"("member_id");

-- CreateIndex
CREATE INDEX "ratings_rating_category_idx" ON "ratings"("rating_category");

-- CreateIndex
CREATE INDEX "ratings_product_id_idx" ON "ratings"("product_id");

-- CreateIndex
CREATE INDEX "ratings_service_id_idx" ON "ratings"("service_id");

-- CreateIndex
CREATE INDEX "ratings_overall_rating_idx" ON "ratings"("overall_rating");

-- CreateIndex
CREATE INDEX "ratings_status_idx" ON "ratings"("status");

-- CreateIndex
CREATE INDEX "ratings_created_at_idx" ON "ratings"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_client_id_member_id_rating_category_product_id_serv_key" ON "ratings"("client_id", "member_id", "rating_category", "product_id", "service_id");

-- CreateIndex
CREATE INDEX "transactions_member_id_idx" ON "transactions"("member_id");

-- CreateIndex
CREATE INDEX "transactions_transaction_type_idx" ON "transactions"("transaction_type");

-- CreateIndex
CREATE INDEX "transactions_transaction_date_idx" ON "transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "transactions_product_id_idx" ON "transactions"("product_id");

-- CreateIndex
CREATE INDEX "transactions_service_id_idx" ON "transactions"("service_id");

-- CreateIndex
CREATE INDEX "transactions_tool_id_idx" ON "transactions"("tool_id");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "about_content_section_key_idx" ON "about_content"("section_key");

-- CreateIndex
CREATE INDEX "about_content_is_visible_idx" ON "about_content"("is_visible");

-- CreateIndex
CREATE UNIQUE INDEX "about_content_section_key_custom_key_key" ON "about_content"("section_key", "custom_key");

-- CreateIndex
CREATE INDEX "leadership_profiles_is_active_idx" ON "leadership_profiles"("is_active");

-- CreateIndex
CREATE INDEX "leadership_profiles_display_order_idx" ON "leadership_profiles"("display_order");

-- CreateIndex
CREATE INDEX "leadership_profiles_is_trustee_idx" ON "leadership_profiles"("is_trustee");

-- CreateIndex
CREATE INDEX "leadership_profiles_show_on_about_page_idx" ON "leadership_profiles"("show_on_about_page");

-- CreateIndex
CREATE UNIQUE INDEX "foundation_objectives_objective_number_key" ON "foundation_objectives"("objective_number");

-- CreateIndex
CREATE INDEX "foundation_objectives_is_displayed_idx" ON "foundation_objectives"("is_displayed");

-- CreateIndex
CREATE INDEX "foundation_objectives_display_order_idx" ON "foundation_objectives"("display_order");

-- CreateIndex
CREATE INDEX "sponsors_partners_type_idx" ON "sponsors_partners"("type");

-- CreateIndex
CREATE INDEX "sponsors_partners_category_idx" ON "sponsors_partners"("category");

-- CreateIndex
CREATE INDEX "sponsors_partners_is_active_idx" ON "sponsors_partners"("is_active");

-- CreateIndex
CREATE INDEX "sponsors_partners_is_featured_idx" ON "sponsors_partners"("is_featured");

-- CreateIndex
CREATE INDEX "sponsors_partners_display_order_idx" ON "sponsors_partners"("display_order");

-- CreateIndex
CREATE INDEX "sponsors_partners_show_on_about_page_idx" ON "sponsors_partners"("show_on_about_page");

-- CreateIndex
CREATE INDEX "testimonials_category_idx" ON "testimonials"("category");

-- CreateIndex
CREATE INDEX "testimonials_is_featured_idx" ON "testimonials"("is_featured");

-- CreateIndex
CREATE INDEX "testimonials_is_visible_idx" ON "testimonials"("is_visible");

-- CreateIndex
CREATE INDEX "testimonials_is_approved_idx" ON "testimonials"("is_approved");

-- CreateIndex
CREATE INDEX "testimonials_display_order_idx" ON "testimonials"("display_order");

-- CreateIndex
CREATE INDEX "events_event_type_idx" ON "events"("event_type");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE INDEX "events_is_published_idx" ON "events"("is_published");

-- CreateIndex
CREATE INDEX "events_is_featured_idx" ON "events"("is_featured");

-- CreateIndex
CREATE INDEX "event_gallery_images_event_id_idx" ON "event_gallery_images"("event_id");

-- CreateIndex
CREATE INDEX "event_gallery_images_display_order_idx" ON "event_gallery_images"("display_order");

-- CreateIndex
CREATE INDEX "event_gallery_images_is_featured_idx" ON "event_gallery_images"("is_featured");

-- CreateIndex
CREATE INDEX "event_agenda_items_event_id_idx" ON "event_agenda_items"("event_id");

-- CreateIndex
CREATE INDEX "event_agenda_items_display_order_idx" ON "event_agenda_items"("display_order");

-- CreateIndex
CREATE INDEX "foundation_documents_document_type_idx" ON "foundation_documents"("document_type");

-- CreateIndex
CREATE INDEX "foundation_documents_is_visible_idx" ON "foundation_documents"("is_visible");

-- CreateIndex
CREATE INDEX "foundation_documents_display_order_idx" ON "foundation_documents"("display_order");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE INDEX "admin_users_username_idx" ON "admin_users"("username");

-- CreateIndex
CREATE INDEX "admin_users_role_idx" ON "admin_users"("role");

-- CreateIndex
CREATE INDEX "admin_users_is_active_idx" ON "admin_users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_admin_id_idx" ON "admin_sessions"("admin_id");

-- CreateIndex
CREATE INDEX "admin_sessions_token_idx" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_is_active_idx" ON "admin_sessions"("is_active");

-- CreateIndex
CREATE INDEX "admin_sessions_expires_at_idx" ON "admin_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "admin_activity_logs_admin_id_idx" ON "admin_activity_logs"("admin_id");

-- CreateIndex
CREATE INDEX "admin_activity_logs_action_type_idx" ON "admin_activity_logs"("action_type");

-- CreateIndex
CREATE INDEX "admin_activity_logs_target_type_idx" ON "admin_activity_logs"("target_type");

-- CreateIndex
CREATE INDEX "admin_activity_logs_target_id_idx" ON "admin_activity_logs"("target_id");

-- CreateIndex
CREATE INDEX "admin_activity_logs_created_at_idx" ON "admin_activity_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_setting_key_key" ON "system_settings"("setting_key");

-- CreateIndex
CREATE INDEX "system_settings_setting_key_idx" ON "system_settings"("setting_key");

-- CreateIndex
CREATE INDEX "system_settings_setting_group_idx" ON "system_settings"("setting_group");

-- CreateIndex
CREATE INDEX "contact_info_contact_type_idx" ON "contact_info"("contact_type");

-- CreateIndex
CREATE INDEX "contact_info_is_active_idx" ON "contact_info"("is_active");

-- CreateIndex
CREATE INDEX "contact_info_is_primary_idx" ON "contact_info"("is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "social_media_links_platform_key" ON "social_media_links"("platform");

-- CreateIndex
CREATE INDEX "social_media_links_platform_idx" ON "social_media_links"("platform");

-- CreateIndex
CREATE INDEX "social_media_links_is_active_idx" ON "social_media_links"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "nigerian_states_name_key" ON "nigerian_states"("name");

-- CreateIndex
CREATE UNIQUE INDEX "nigerian_states_code_key" ON "nigerian_states"("code");

-- CreateIndex
CREATE INDEX "nigerian_states_region_idx" ON "nigerian_states"("region");

-- CreateIndex
CREATE INDEX "nigerian_states_is_active_idx" ON "nigerian_states"("is_active");

-- CreateIndex
CREATE INDEX "nigerian_lgas_state_id_idx" ON "nigerian_lgas"("state_id");

-- CreateIndex
CREATE INDEX "nigerian_lgas_is_active_idx" ON "nigerian_lgas"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "nigerian_lgas_state_id_name_key" ON "nigerian_lgas"("state_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "daily_statistics_date_key" ON "daily_statistics"("date");

-- CreateIndex
CREATE INDEX "daily_statistics_date_idx" ON "daily_statistics"("date");

-- CreateIndex
CREATE INDEX "view_logs_entity_type_entity_id_idx" ON "view_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "view_logs_viewer_id_idx" ON "view_logs"("viewer_id");

-- CreateIndex
CREATE INDEX "view_logs_created_at_idx" ON "view_logs"("created_at");

-- CreateIndex
CREATE INDEX "search_logs_search_query_idx" ON "search_logs"("search_query");

-- CreateIndex
CREATE INDEX "search_logs_search_type_idx" ON "search_logs"("search_type");

-- CreateIndex
CREATE INDEX "search_logs_created_at_idx" ON "search_logs"("created_at");

-- CreateIndex
CREATE INDEX "file_uploads_uploaded_by_id_idx" ON "file_uploads"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "file_uploads_entity_type_entity_id_idx" ON "file_uploads"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "file_uploads_created_at_idx" ON "file_uploads"("created_at");

-- CreateIndex
CREATE INDEX "faqs_category_idx" ON "faqs"("category");

-- CreateIndex
CREATE INDEX "faqs_is_visible_idx" ON "faqs"("is_visible");

-- CreateIndex
CREATE INDEX "faqs_display_order_idx" ON "faqs"("display_order");

-- CreateIndex
CREATE INDEX "announcements_is_active_idx" ON "announcements"("is_active");

-- CreateIndex
CREATE INDEX "announcements_start_date_idx" ON "announcements"("start_date");

-- CreateIndex
CREATE INDEX "announcements_end_date_idx" ON "announcements"("end_date");

-- CreateIndex
CREATE INDEX "announcements_is_pinned_idx" ON "announcements"("is_pinned");

-- CreateIndex
CREATE INDEX "announcements_type_idx" ON "announcements"("type");

-- CreateIndex
CREATE INDEX "content_reports_content_type_content_id_idx" ON "content_reports"("content_type", "content_id");

-- CreateIndex
CREATE INDEX "content_reports_reporter_id_idx" ON "content_reports"("reporter_id");

-- CreateIndex
CREATE INDEX "content_reports_status_idx" ON "content_reports"("status");

-- CreateIndex
CREATE INDEX "content_reports_priority_idx" ON "content_reports"("priority");

-- CreateIndex
CREATE INDEX "content_reports_created_at_idx" ON "content_reports"("created_at");

-- CreateIndex
CREATE INDEX "audit_trails_table_name_record_id_idx" ON "audit_trails"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "audit_trails_changed_by_id_idx" ON "audit_trails"("changed_by_id");

-- CreateIndex
CREATE INDEX "audit_trails_action_idx" ON "audit_trails"("action");

-- CreateIndex
CREATE INDEX "audit_trails_created_at_idx" ON "audit_trails"("created_at");

-- CreateIndex
CREATE INDEX "data_import_export_logs_operation_type_idx" ON "data_import_export_logs"("operation_type");

-- CreateIndex
CREATE INDEX "data_import_export_logs_data_type_idx" ON "data_import_export_logs"("data_type");

-- CreateIndex
CREATE INDEX "data_import_export_logs_status_idx" ON "data_import_export_logs"("status");

-- CreateIndex
CREATE INDEX "data_import_export_logs_performed_by_admin_id_idx" ON "data_import_export_logs"("performed_by_admin_id");

-- CreateIndex
CREATE INDEX "data_import_export_logs_created_at_idx" ON "data_import_export_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_template_key_key" ON "email_templates"("template_key");

-- CreateIndex
CREATE INDEX "email_templates_template_key_idx" ON "email_templates"("template_key");

-- CreateIndex
CREATE INDEX "email_templates_category_idx" ON "email_templates"("category");

-- CreateIndex
CREATE INDEX "email_templates_is_active_idx" ON "email_templates"("is_active");

-- CreateIndex
CREATE INDEX "scheduled_jobs_job_type_idx" ON "scheduled_jobs"("job_type");

-- CreateIndex
CREATE INDEX "scheduled_jobs_is_enabled_idx" ON "scheduled_jobs"("is_enabled");

-- CreateIndex
CREATE INDEX "scheduled_jobs_next_run_at_idx" ON "scheduled_jobs"("next_run_at");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_jobs_job_name_key" ON "scheduled_jobs"("job_name");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_key_prefix_idx" ON "api_keys"("key_prefix");

-- CreateIndex
CREATE INDEX "api_keys_is_active_idx" ON "api_keys"("is_active");

-- CreateIndex
CREATE INDEX "api_keys_created_by_admin_id_idx" ON "api_keys"("created_by_admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_flag_key_key" ON "feature_flags"("flag_key");

-- CreateIndex
CREATE INDEX "feature_flags_flag_key_idx" ON "feature_flags"("flag_key");

-- CreateIndex
CREATE INDEX "feature_flags_is_enabled_idx" ON "feature_flags"("is_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_saved_items_user_id_idx" ON "user_saved_items"("user_id");

-- CreateIndex
CREATE INDEX "user_saved_items_item_type_idx" ON "user_saved_items"("item_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_saved_items_user_id_item_type_item_id_key" ON "user_saved_items"("user_id", "item_type", "item_id");

-- CreateIndex
CREATE INDEX "user_dismissed_announcements_user_id_idx" ON "user_dismissed_announcements"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_dismissed_announcements_user_id_announcement_id_key" ON "user_dismissed_announcements"("user_id", "announcement_id");

-- CreateIndex
CREATE UNIQUE INDEX "seed_category_references_category_code_key" ON "seed_category_references"("category_code");

-- CreateIndex
CREATE INDEX "search_embeddings_type_idx" ON "search_embeddings"("type");

-- CreateIndex
CREATE UNIQUE INDEX "search_embeddings_type_related_id_key" ON "search_embeddings"("type", "related_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_verified_by_admin_id_fkey" FOREIGN KEY ("verified_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_suspended_by_admin_id_fkey" FOREIGN KEY ("suspended_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_verified_by_admin_id_fkey" FOREIGN KEY ("verified_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_requests" ADD CONSTRAINT "password_reset_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_requests" ADD CONSTRAINT "password_reset_requests_processed_by_admin_id_fkey" FOREIGN KEY ("processed_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_specializations" ADD CONSTRAINT "member_specializations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_specializations" ADD CONSTRAINT "member_specializations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_external_links" ADD CONSTRAINT "member_external_links_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_images" ADD CONSTRAINT "tool_images_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_verified_by_admin_id_fkey" FOREIGN KEY ("verified_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_moderated_by_admin_id_fkey" FOREIGN KEY ("moderated_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_content" ADD CONSTRAINT "about_content_updated_by_admin_id_fkey" FOREIGN KEY ("updated_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_approved_by_admin_id_fkey" FOREIGN KEY ("approved_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_last_updated_by_admin_id_fkey" FOREIGN KEY ("last_updated_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_gallery_images" ADD CONSTRAINT "event_gallery_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_gallery_images" ADD CONSTRAINT "event_gallery_images_uploaded_by_admin_id_fkey" FOREIGN KEY ("uploaded_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_agenda_items" ADD CONSTRAINT "event_agenda_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nigerian_lgas" ADD CONSTRAINT "nigerian_lgas_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "nigerian_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

