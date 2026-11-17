-- =====================================================================
-- Memories Archive — PostgreSQL schema, version 1
-- Target: PostgreSQL 14+ (gen_random_uuid() is built in, no extensions)
--
-- Conventions
--   * snake_case, plural table names
--   * UUID primary keys (ids are not guessable or enumerable)
--   * timestamptz everywhere; memory_date is a plain DATE (the day it happened)
--   * soft delete with deleted_at on user-owned content
--   * fixed value sets are CHECK constraints (easy to change in a migration)
--
-- Sections
--   1. Accounts and sessions      (this semester)
--   2. Places                     (this semester, used by memories)
--   3. Memories, media, tags      (this semester: memories; media and tags next)
--   4. Collections and sharing    (next)
--   5. Saved destinations         (next)
--   6. Comments and reactions     (P2, later)
--   7. Reminders, notifications, activity log, recommendation feedback,
--      media comparisons          (P3, later)
--   All 20 tables are created now; the phase only says when the code uses them.
-- =====================================================================

BEGIN;

-- Keeps updated_at correct without relying on the application.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 1. Accounts and sessions
-- ---------------------------------------------------------------------

CREATE TABLE users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username          text        NOT NULL CHECK (char_length(username) BETWEEN 3 AND 30),
  email             text        NOT NULL CHECK (char_length(email) <= 254),
  password_hash     text        NOT NULL,              -- argon2id or bcrypt output, never the password
  display_name      text        CHECK (char_length(display_name) <= 80),
  bio               text        CHECK (char_length(bio) <= 500),
  status            text        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'disabled')),
  email_verified_at timestamptz,
  last_login_at     timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);
-- Case-insensitive uniqueness: Sara@x.com and sara@x.com are the same account.
CREATE UNIQUE INDEX users_email_key    ON users (lower(email));
CREATE UNIQUE INDEX users_username_key ON users (lower(username));
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- One row per refresh token. Only the hash is stored, so a database leak
-- does not hand out working tokens. Logout = set revoked_at.
CREATE TABLE auth_sessions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  refresh_token_hash text        NOT NULL UNIQUE,
  device_name        text,
  ip_address         inet,
  user_agent         text,
  expires_at         timestamptz NOT NULL,
  revoked_at         timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_sessions_user_idx ON auth_sessions (user_id);

CREATE TABLE password_reset_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash text        NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,                               -- single use
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX password_reset_tokens_user_idx ON password_reset_tokens (user_id);

-- ---------------------------------------------------------------------
-- 2. Places (shared reference data: no owner, no private content)
-- ---------------------------------------------------------------------

CREATE TABLE places (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text             NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  address           text,
  latitude          double precision NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
  longitude         double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  provider          text,            -- e.g. 'google', 'mapbox', 'osm'; NULL for a hand-dropped pin
  provider_place_id text,
  created_at        timestamptz      NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_place_id)
);
-- Map view: WHERE latitude BETWEEN .. AND longitude BETWEEN .. (bounding box)
CREATE INDEX places_lat_lng_idx ON places (latitude, longitude);

-- ---------------------------------------------------------------------
-- 3. Memories, media, tags
-- ---------------------------------------------------------------------

CREATE TABLE memories (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid        NOT NULL REFERENCES users (id)  ON DELETE CASCADE,   -- owner
  place_id           uuid                 REFERENCES places (id) ON DELETE SET NULL,  -- optional
  title              text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description        text        CHECK (char_length(description) <= 10000),
  memory_date        date        NOT NULL,
  memory_time        time,
  timezone           text,                 -- IANA name, e.g. 'Africa/Cairo'
  spotify_track_uri  text,
  spotify_track_name text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);
-- Timeline: a user's memories, newest first.
CREATE INDEX memories_owner_date_idx ON memories (user_id, memory_date DESC)
  WHERE deleted_at IS NULL;
-- On This Day: same month and day in earlier years.
CREATE INDEX memories_on_this_day_idx ON memories
  (user_id, (EXTRACT(MONTH FROM memory_date)), (EXTRACT(DAY FROM memory_date)))
  WHERE deleted_at IS NULL;
CREATE INDEX memories_place_idx ON memories (place_id);
-- Text search over title and description (FR-6).
CREATE INDEX memories_search_idx ON memories
  USING gin (to_tsvector('simple', title || ' ' || coalesce(description, '')));
CREATE TRIGGER memories_set_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- A file in object storage. PostgreSQL holds only metadata and the storage key.
-- storage_key is generated by the server, never taken from the client file name.
CREATE TABLE media_assets (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id         uuid        NOT NULL REFERENCES memories (id) ON DELETE CASCADE,
  user_id           uuid        NOT NULL REFERENCES users (id)    ON DELETE CASCADE,  -- uploader
  storage_key       text        NOT NULL UNIQUE,
  original_filename text,
  media_type        text        NOT NULL CHECK (media_type IN ('photo', 'audio')),
  mime_type         text        NOT NULL,
  file_size_bytes   bigint      NOT NULL CHECK (file_size_bytes > 0),
  width_px          integer     CHECK (width_px  > 0),
  height_px         integer     CHECK (height_px > 0),
  duration_seconds  numeric(8,2) CHECK (duration_seconds >= 0),
  checksum_sha256   text,
  processing_status text        NOT NULL DEFAULT 'ready'
                                CHECK (processing_status IN ('pending', 'ready', 'failed')),
  caption           text        CHECK (char_length(caption) <= 500),
  sort_order        integer     NOT NULL DEFAULT 0,
  is_cover          boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);
CREATE INDEX media_assets_memory_idx ON media_assets (memory_id, sort_order);
-- At most one cover photo per memory.
CREATE UNIQUE INDEX media_assets_one_cover_idx ON media_assets (memory_id)
  WHERE is_cover AND deleted_at IS NULL;

CREATE TABLE tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name       text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  color      text        CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX tags_user_name_key ON tags (user_id, lower(name));

CREATE TABLE memory_tags (
  memory_id uuid NOT NULL REFERENCES memories (id) ON DELETE CASCADE,
  tag_id    uuid NOT NULL REFERENCES tags (id)     ON DELETE CASCADE,
  PRIMARY KEY (memory_id, tag_id)
);
CREATE INDEX memory_tags_tag_idx ON memory_tags (tag_id);

-- ---------------------------------------------------------------------
-- 4. Collections and sharing
--    Access rule: a memory is readable by its owner, or by any member of a
--    collection that contains it. There is no "visibility" column: sharing
--    is derived from these tables, so it cannot drift out of sync.
-- ---------------------------------------------------------------------

CREATE TABLE collections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,        -- owner
  name           text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description    text        CHECK (char_length(description) <= 2000),
  cover_media_id uuid                 REFERENCES media_assets (id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz
);
CREATE INDEX collections_owner_idx ON collections (user_id) WHERE deleted_at IS NULL;
CREATE TRIGGER collections_set_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE collection_memories (
  collection_id uuid        NOT NULL REFERENCES collections (id) ON DELETE CASCADE,
  memory_id     uuid        NOT NULL REFERENCES memories (id)    ON DELETE CASCADE,
  added_by      uuid                 REFERENCES users (id)       ON DELETE SET NULL,
  added_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, memory_id)
);
CREATE INDEX collection_memories_memory_idx ON collection_memories (memory_id);

-- The owner is collections.user_id and is not repeated here.
CREATE TABLE collection_members (
  collection_id uuid        NOT NULL REFERENCES collections (id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES users (id)       ON DELETE CASCADE,
  role          text        NOT NULL CHECK (role IN ('viewer', 'contributor')),
  joined_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, user_id)
);
CREATE INDEX collection_members_user_idx ON collection_members (user_id);

CREATE TABLE collection_invitations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id      uuid        NOT NULL REFERENCES collections (id) ON DELETE CASCADE,
  invited_by_user_id uuid        NOT NULL REFERENCES users (id)       ON DELETE CASCADE,
  invitee_user_id    uuid                 REFERENCES users (id)       ON DELETE CASCADE,
  invitee_email      text,
  role               text        NOT NULL CHECK (role IN ('viewer', 'contributor')),
  token_hash         text        NOT NULL UNIQUE,       -- single-use invite link, hashed
  status             text        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'accepted', 'declined', 'revoked', 'expired')),
  expires_at         timestamptz NOT NULL,
  responded_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (invitee_user_id IS NOT NULL OR invitee_email IS NOT NULL)
);
CREATE INDEX collection_invitations_collection_idx ON collection_invitations (collection_id);
CREATE INDEX collection_invitations_invitee_idx    ON collection_invitations (invitee_user_id);
-- Only one open invitation per email per collection.
CREATE UNIQUE INDEX collection_invitations_pending_key
  ON collection_invitations (collection_id, lower(invitee_email))
  WHERE status = 'pending';

-- ---------------------------------------------------------------------
-- 5. Saved destinations (places the user wants to visit)
-- ---------------------------------------------------------------------

CREATE TABLE saved_places (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES users (id)  ON DELETE CASCADE,
  place_id    uuid        NOT NULL REFERENCES places (id) ON DELETE RESTRICT,
  notes       text        CHECK (char_length(notes) <= 2000),
  target_date date,
  status      text        NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'visited')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, place_id)
);
CREATE TRIGGER saved_places_set_updated_at BEFORE UPDATE ON saved_places
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- 6. Comments and reactions (P2 — create when the core is stable)
-- ---------------------------------------------------------------------

CREATE TABLE comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id  uuid        NOT NULL REFERENCES memories (id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
  body       text        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX comments_memory_idx ON comments (memory_id, created_at);
CREATE TRIGGER comments_set_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- One reaction per user per memory.
CREATE TABLE reactions (
  memory_id     uuid        NOT NULL REFERENCES memories (id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
  reaction_type text        NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (memory_id, user_id)
);

-- ---------------------------------------------------------------------
-- 7. Reminders, notifications, activity, AI feedback, photo comparisons (P3)
-- ---------------------------------------------------------------------

CREATE TABLE reminders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES users (id)        ON DELETE CASCADE,
  memory_id      uuid                 REFERENCES memories (id)     ON DELETE CASCADE,
  saved_place_id uuid                 REFERENCES saved_places (id) ON DELETE CASCADE,
  title          text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  message        text        CHECK (char_length(message) <= 1000),
  remind_at      timestamptz NOT NULL,
  status         text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'sent', 'cancelled')),
  sent_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reminders_user_idx ON reminders (user_id);
-- The job that sends reminders scans only pending ones, by due time.
CREATE INDEX reminders_due_idx ON reminders (remind_at) WHERE status = 'pending';

CREATE TABLE notifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  notification_type text        NOT NULL,     -- e.g. 'invitation', 'comment', 'reminder'
  payload           jsonb       NOT NULL DEFAULT '{}'::jsonb,
  read_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON notifications (user_id, created_at DESC);

CREATE TABLE activity_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid                 REFERENCES users (id)       ON DELETE SET NULL,  -- actor
  action_type   text        NOT NULL,         -- e.g. 'memory.created', 'member.removed'
  memory_id     uuid                 REFERENCES memories (id)    ON DELETE SET NULL,
  collection_id uuid                 REFERENCES collections (id) ON DELETE SET NULL,
  metadata      jsonb       NOT NULL DEFAULT '{}'::jsonb,   -- never store secrets or memory text here
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_logs_user_idx       ON activity_logs (user_id, created_at DESC);
CREATE INDEX activity_logs_collection_idx ON activity_logs (collection_id, created_at DESC);

CREATE TABLE recommendation_feedback (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  provider_place_id text        NOT NULL,
  rating            smallint    CHECK (rating BETWEEN 1 AND 5),
  feedback_text     text        CHECK (char_length(feedback_text) <= 1000),
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX recommendation_feedback_user_idx ON recommendation_feedback (user_id);

CREATE TABLE media_comparisons (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES users (id)        ON DELETE CASCADE,
  left_media_asset_id  uuid        NOT NULL REFERENCES media_assets (id) ON DELETE CASCADE,
  right_media_asset_id uuid        NOT NULL REFERENCES media_assets (id) ON DELETE CASCADE,
  label                text        CHECK (char_length(label) <= 120),
  created_at           timestamptz NOT NULL DEFAULT now(),
  CHECK (left_media_asset_id <> right_media_asset_id)
);
CREATE INDEX media_comparisons_user_idx ON media_comparisons (user_id);

COMMIT;
