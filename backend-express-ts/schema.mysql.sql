CREATE DATABASE IF NOT EXISTS `memory-archive` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `memory-archive`;

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE users (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  username          VARCHAR(30)  NOT NULL,
  email             VARCHAR(254) NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  display_name      VARCHAR(80)  NULL,
  bio               VARCHAR(500) NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'active',
  email_verified_at DATETIME     NULL,
  last_login_at     DATETIME     NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_key (email),
  UNIQUE KEY users_username_key (username),
  CONSTRAINT users_username_len CHECK (CHAR_LENGTH(username) BETWEEN 3 AND 30),
  CONSTRAINT users_status_chk   CHECK (status IN ('active', 'disabled'))
);

CREATE TABLE auth_sessions (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id            CHAR(36)     NOT NULL,
  refresh_token_hash VARCHAR(255) NOT NULL,
  device_name        VARCHAR(120) NULL,
  ip_address         VARCHAR(45)  NULL,
  user_agent         VARCHAR(512) NULL,
  expires_at         DATETIME     NOT NULL,
  revoked_at         DATETIME     NULL,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY auth_sessions_token_key (refresh_token_hash),
  KEY auth_sessions_user_idx (user_id),
  CONSTRAINT auth_sessions_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)     NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME     NOT NULL,
  used_at    DATETIME     NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY password_reset_tokens_hash_key (token_hash),
  KEY password_reset_tokens_user_idx (user_id),
  CONSTRAINT password_reset_tokens_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE friendships (
  id           CHAR(36)    NOT NULL DEFAULT (UUID()),
  requester_id CHAR(36)    NOT NULL,
  addressee_id CHAR(36)    NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY friendships_pair_key (requester_id, addressee_id),
  KEY friendships_requester_idx (requester_id, status),
  KEY friendships_addressee_idx (addressee_id, status),
  CONSTRAINT friendships_requester_fk FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT friendships_addressee_fk FOREIGN KEY (addressee_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT friendships_status_chk CHECK (status IN ('pending', 'accepted'))
);

CREATE TABLE places (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  name              VARCHAR(200) NOT NULL,
  address           VARCHAR(500) NULL,
  latitude          DOUBLE       NOT NULL,
  longitude         DOUBLE       NOT NULL,
  provider          VARCHAR(30)  NULL,
  provider_place_id VARCHAR(255) NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY places_provider_key (provider, provider_place_id),
  KEY places_lat_lng_idx (latitude, longitude),
  CONSTRAINT places_name_len CHECK (CHAR_LENGTH(name) BETWEEN 1 AND 200),
  CONSTRAINT places_lat_chk  CHECK (latitude  BETWEEN -90  AND 90),
  CONSTRAINT places_lng_chk  CHECK (longitude BETWEEN -180 AND 180)
);

CREATE TABLE memories (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id            CHAR(36)     NOT NULL,
  place_id           CHAR(36)     NULL,
  title              VARCHAR(200) NOT NULL,
  description        TEXT         NULL,
  memory_date        DATE         NOT NULL,
  memory_time        TIME         NULL,
  timezone           VARCHAR(64)  NULL,
  spotify_track_uri  VARCHAR(255) NULL,
  spotify_track_name VARCHAR(255) NULL,
  is_favourite       TINYINT(1)   NOT NULL DEFAULT 0,
  visibility         VARCHAR(20)  NOT NULL DEFAULT 'private',
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at         DATETIME     NULL,
  PRIMARY KEY (id),
  KEY memories_owner_date_idx (user_id, memory_date DESC),
  KEY memories_on_this_day_idx (user_id, (MONTH(memory_date)), (DAY(memory_date))),
  KEY memories_place_idx (place_id),
  FULLTEXT KEY memories_search_idx (title, description),
  CONSTRAINT memories_user_fk  FOREIGN KEY (user_id)  REFERENCES users (id)  ON DELETE CASCADE,
  CONSTRAINT memories_place_fk FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE SET NULL,
  CONSTRAINT memories_title_len CHECK (CHAR_LENGTH(title) BETWEEN 1 AND 200),
  CONSTRAINT memories_desc_len  CHECK (CHAR_LENGTH(description) <= 10000),
  CONSTRAINT memories_visibility_chk CHECK (visibility IN ('private', 'friends'))
);

CREATE TABLE media_assets (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  memory_id         CHAR(36)      NOT NULL,
  user_id           CHAR(36)      NOT NULL,
  storage_key       VARCHAR(255)  NOT NULL,
  original_filename VARCHAR(255)  NULL,
  media_type        VARCHAR(20)   NOT NULL,
  mime_type         VARCHAR(100)  NOT NULL,
  file_size_bytes   BIGINT        NOT NULL,
  width_px          INT           NULL,
  height_px         INT           NULL,
  duration_seconds  DECIMAL(8,2)  NULL,
  checksum_sha256   CHAR(64)      NULL,
  processing_status VARCHAR(20)   NOT NULL DEFAULT 'ready',
  caption           VARCHAR(500)  NULL,
  sort_order        INT           NOT NULL DEFAULT 0,
  is_cover          TINYINT(1)    NOT NULL DEFAULT 0,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at        DATETIME      NULL,
  live_cover        TINYINT       GENERATED ALWAYS AS (IF(is_cover = 1 AND deleted_at IS NULL, 1, NULL)) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY media_assets_storage_key (storage_key),
  UNIQUE KEY media_assets_one_cover_key (memory_id, live_cover),
  KEY media_assets_memory_idx (memory_id, sort_order),
  KEY media_assets_user_idx (user_id),
  CONSTRAINT media_assets_memory_fk FOREIGN KEY (memory_id) REFERENCES memories (id) ON DELETE CASCADE,
  CONSTRAINT media_assets_user_fk   FOREIGN KEY (user_id)   REFERENCES users (id)    ON DELETE CASCADE,
  CONSTRAINT media_assets_type_chk     CHECK (media_type IN ('photo', 'audio')),
  CONSTRAINT media_assets_size_chk     CHECK (file_size_bytes > 0),
  CONSTRAINT media_assets_width_chk    CHECK (width_px > 0),
  CONSTRAINT media_assets_height_chk   CHECK (height_px > 0),
  CONSTRAINT media_assets_duration_chk CHECK (duration_seconds >= 0),
  CONSTRAINT media_assets_status_chk   CHECK (processing_status IN ('pending', 'ready', 'failed'))
);

CREATE TABLE tags (
  id         CHAR(36)    NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)    NOT NULL,
  name       VARCHAR(50) NOT NULL,
  color      CHAR(7)     NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY tags_user_name_key (user_id, name),
  CONSTRAINT tags_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT tags_name_len  CHECK (CHAR_LENGTH(name) BETWEEN 1 AND 50),
  CONSTRAINT tags_color_chk CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE memory_tags (
  memory_id CHAR(36) NOT NULL,
  tag_id    CHAR(36) NOT NULL,
  PRIMARY KEY (memory_id, tag_id),
  KEY memory_tags_tag_idx (tag_id),
  CONSTRAINT memory_tags_memory_fk FOREIGN KEY (memory_id) REFERENCES memories (id) ON DELETE CASCADE,
  CONSTRAINT memory_tags_tag_fk    FOREIGN KEY (tag_id)    REFERENCES tags (id)     ON DELETE CASCADE
);

CREATE TABLE collections (
  id             CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id        CHAR(36)      NOT NULL,
  name           VARCHAR(120)  NOT NULL,
  description    VARCHAR(2000) NULL,
  cover_media_id CHAR(36)      NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     DATETIME      NULL,
  PRIMARY KEY (id),
  KEY collections_owner_idx (user_id, deleted_at),
  KEY collections_cover_idx (cover_media_id),
  CONSTRAINT collections_user_fk  FOREIGN KEY (user_id)        REFERENCES users (id)        ON DELETE CASCADE,
  CONSTRAINT collections_cover_fk FOREIGN KEY (cover_media_id) REFERENCES media_assets (id) ON DELETE SET NULL,
  CONSTRAINT collections_name_len CHECK (CHAR_LENGTH(name) BETWEEN 1 AND 120)
);

CREATE TABLE collection_memories (
  collection_id CHAR(36) NOT NULL,
  memory_id     CHAR(36) NOT NULL,
  added_by      CHAR(36) NULL,
  added_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection_id, memory_id),
  KEY collection_memories_memory_idx (memory_id),
  KEY collection_memories_added_by_idx (added_by),
  CONSTRAINT collection_memories_collection_fk FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE,
  CONSTRAINT collection_memories_memory_fk     FOREIGN KEY (memory_id)     REFERENCES memories (id)    ON DELETE CASCADE,
  CONSTRAINT collection_memories_added_by_fk   FOREIGN KEY (added_by)      REFERENCES users (id)       ON DELETE SET NULL
);

CREATE TABLE collection_members (
  collection_id CHAR(36)    NOT NULL,
  user_id       CHAR(36)    NOT NULL,
  role          VARCHAR(20) NOT NULL,
  joined_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection_id, user_id),
  KEY collection_members_user_idx (user_id),
  CONSTRAINT collection_members_collection_fk FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE,
  CONSTRAINT collection_members_user_fk       FOREIGN KEY (user_id)       REFERENCES users (id)       ON DELETE CASCADE,
  CONSTRAINT collection_members_role_chk CHECK (role IN ('viewer', 'contributor'))
);

CREATE TABLE collection_invitations (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  collection_id      CHAR(36)     NOT NULL,
  invited_by_user_id CHAR(36)     NOT NULL,
  invitee_user_id    CHAR(36)     NULL,
  invitee_email      VARCHAR(254) NULL,
  role               VARCHAR(20)  NOT NULL,
  token_hash         VARCHAR(255) NOT NULL,
  status             VARCHAR(20)  NOT NULL DEFAULT 'pending',
  expires_at         DATETIME     NOT NULL,
  responded_at       DATETIME     NULL,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pending_invitee_email VARCHAR(254) GENERATED ALWAYS AS (IF(status = 'pending', invitee_email, NULL)) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY collection_invitations_token_key (token_hash),
  UNIQUE KEY collection_invitations_pending_key (collection_id, pending_invitee_email),
  KEY collection_invitations_invitee_idx (invitee_user_id),
  KEY collection_invitations_invited_by_idx (invited_by_user_id),
  CONSTRAINT collection_invitations_collection_fk FOREIGN KEY (collection_id)      REFERENCES collections (id) ON DELETE CASCADE,
  CONSTRAINT collection_invitations_inviter_fk    FOREIGN KEY (invited_by_user_id) REFERENCES users (id)       ON DELETE CASCADE,
  CONSTRAINT collection_invitations_invitee_fk    FOREIGN KEY (invitee_user_id)    REFERENCES users (id)       ON DELETE CASCADE,
  CONSTRAINT collection_invitations_role_chk   CHECK (role IN ('viewer', 'contributor')),
  CONSTRAINT collection_invitations_status_chk CHECK (status IN ('pending', 'accepted', 'declined', 'revoked', 'expired'))
);

CREATE TABLE saved_places (
  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)      NOT NULL,
  place_id    CHAR(36)      NOT NULL,
  notes       VARCHAR(2000) NULL,
  target_date DATE          NULL,
  status      VARCHAR(20)   NOT NULL DEFAULT 'planned',
  is_favourite TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY saved_places_user_place_key (user_id, place_id),
  KEY saved_places_place_idx (place_id),
  CONSTRAINT saved_places_user_fk  FOREIGN KEY (user_id)  REFERENCES users (id)  ON DELETE CASCADE,
  CONSTRAINT saved_places_place_fk FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE RESTRICT,
  CONSTRAINT saved_places_status_chk CHECK (status IN ('planned', 'visited'))
);

CREATE TABLE comments (
  id         CHAR(36)      NOT NULL DEFAULT (UUID()),
  memory_id  CHAR(36)      NOT NULL,
  user_id    CHAR(36)      NOT NULL,
  body       VARCHAR(2000) NOT NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME      NULL,
  PRIMARY KEY (id),
  KEY comments_memory_idx (memory_id, created_at),
  KEY comments_user_idx (user_id),
  CONSTRAINT comments_memory_fk FOREIGN KEY (memory_id) REFERENCES memories (id) ON DELETE CASCADE,
  CONSTRAINT comments_user_fk   FOREIGN KEY (user_id)   REFERENCES users (id)    ON DELETE CASCADE,
  CONSTRAINT comments_body_len CHECK (CHAR_LENGTH(body) BETWEEN 1 AND 2000)
);

CREATE TABLE reactions (
  memory_id     CHAR(36)    NOT NULL,
  user_id       CHAR(36)    NOT NULL,
  reaction_type VARCHAR(20) NOT NULL,
  created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (memory_id, user_id),
  KEY reactions_user_idx (user_id),
  CONSTRAINT reactions_memory_fk FOREIGN KEY (memory_id) REFERENCES memories (id) ON DELETE CASCADE,
  CONSTRAINT reactions_user_fk   FOREIGN KEY (user_id)   REFERENCES users (id)    ON DELETE CASCADE,
  CONSTRAINT reactions_type_chk CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad'))
);

CREATE TABLE reminders (
  id             CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id        CHAR(36)      NOT NULL,
  memory_id      CHAR(36)      NULL,
  saved_place_id CHAR(36)      NULL,
  title          VARCHAR(200)  NOT NULL,
  message        VARCHAR(1000) NULL,
  remind_at      DATETIME      NOT NULL,
  status         VARCHAR(20)   NOT NULL DEFAULT 'pending',
  sent_at        DATETIME      NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY reminders_user_idx (user_id),
  KEY reminders_due_idx (status, remind_at),
  KEY reminders_memory_idx (memory_id),
  KEY reminders_saved_place_idx (saved_place_id),
  CONSTRAINT reminders_user_fk        FOREIGN KEY (user_id)        REFERENCES users (id)        ON DELETE CASCADE,
  CONSTRAINT reminders_memory_fk      FOREIGN KEY (memory_id)      REFERENCES memories (id)     ON DELETE CASCADE,
  CONSTRAINT reminders_saved_place_fk FOREIGN KEY (saved_place_id) REFERENCES saved_places (id) ON DELETE CASCADE,
  CONSTRAINT reminders_title_len  CHECK (CHAR_LENGTH(title) BETWEEN 1 AND 200),
  CONSTRAINT reminders_status_chk CHECK (status IN ('pending', 'sent', 'cancelled'))
);

CREATE TABLE notifications (
  id                CHAR(36)    NOT NULL DEFAULT (UUID()),
  user_id           CHAR(36)    NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  payload           JSON        NOT NULL,
  read_at           DATETIME    NULL,
  created_at        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY notifications_user_idx (user_id, created_at DESC),
  CONSTRAINT notifications_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE activity_logs (
  id            CHAR(36)    NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36)    NULL,
  action_type   VARCHAR(80) NOT NULL,
  memory_id     CHAR(36)    NULL,
  collection_id CHAR(36)    NULL,
  metadata      JSON        NOT NULL,
  created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY activity_logs_user_idx (user_id, created_at DESC),
  KEY activity_logs_collection_idx (collection_id, created_at DESC),
  KEY activity_logs_memory_idx (memory_id),
  CONSTRAINT activity_logs_user_fk       FOREIGN KEY (user_id)       REFERENCES users (id)       ON DELETE SET NULL,
  CONSTRAINT activity_logs_memory_fk     FOREIGN KEY (memory_id)     REFERENCES memories (id)    ON DELETE SET NULL,
  CONSTRAINT activity_logs_collection_fk FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE SET NULL
);

CREATE TABLE recommendation_feedback (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id           CHAR(36)      NOT NULL,
  provider_place_id VARCHAR(255)  NOT NULL,
  rating            SMALLINT      NULL,
  feedback_text     VARCHAR(1000) NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY recommendation_feedback_user_idx (user_id),
  CONSTRAINT recommendation_feedback_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT recommendation_feedback_rating_chk CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE media_comparisons (
  id                   CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id              CHAR(36)     NOT NULL,
  left_media_asset_id  CHAR(36)     NOT NULL,
  right_media_asset_id CHAR(36)     NOT NULL,
  label                VARCHAR(120) NULL,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY media_comparisons_user_idx (user_id),
  KEY media_comparisons_left_idx (left_media_asset_id),
  KEY media_comparisons_right_idx (right_media_asset_id),
  CONSTRAINT media_comparisons_user_fk  FOREIGN KEY (user_id)              REFERENCES users (id)        ON DELETE CASCADE,
  CONSTRAINT media_comparisons_left_fk  FOREIGN KEY (left_media_asset_id)  REFERENCES media_assets (id) ON DELETE CASCADE,
  CONSTRAINT media_comparisons_right_fk FOREIGN KEY (right_media_asset_id) REFERENCES media_assets (id) ON DELETE CASCADE
);

DELIMITER $$

CREATE TRIGGER friendships_not_self_ins BEFORE INSERT ON friendships
FOR EACH ROW
BEGIN
  IF NEW.requester_id = NEW.addressee_id THEN
    SIGNAL SQLSTATE 'HY000' SET MYSQL_ERRNO = 3819,
      MESSAGE_TEXT = 'Check constraint friendships_not_self_chk is violated.';
  END IF;
  IF EXISTS (SELECT 1 FROM friendships
             WHERE requester_id = NEW.addressee_id AND addressee_id = NEW.requester_id) THEN
    SIGNAL SQLSTATE '23000' SET MYSQL_ERRNO = 1062,
      MESSAGE_TEXT = 'Duplicate entry for key friendships_pair_key';
  END IF;
END$$

CREATE TRIGGER friendships_not_self_upd BEFORE UPDATE ON friendships
FOR EACH ROW
BEGIN
  IF NEW.requester_id = NEW.addressee_id THEN
    SIGNAL SQLSTATE 'HY000' SET MYSQL_ERRNO = 3819,
      MESSAGE_TEXT = 'Check constraint friendships_not_self_chk is violated.';
  END IF;
END$$

CREATE TRIGGER notifications_payload_default BEFORE INSERT ON notifications
FOR EACH ROW
BEGIN
  IF NEW.payload IS NULL THEN SET NEW.payload = JSON_OBJECT(); END IF;
END$$

CREATE TRIGGER activity_logs_metadata_default BEFORE INSERT ON activity_logs
FOR EACH ROW
BEGIN
  IF NEW.metadata IS NULL THEN SET NEW.metadata = JSON_OBJECT(); END IF;
END$$

CREATE TRIGGER collection_invitations_invitee_ins BEFORE INSERT ON collection_invitations
FOR EACH ROW
BEGIN
  IF NEW.invitee_user_id IS NULL AND NEW.invitee_email IS NULL THEN
    SIGNAL SQLSTATE 'HY000' SET MYSQL_ERRNO = 3819,
      MESSAGE_TEXT = 'Check constraint collection_invitations_invitee_chk is violated.';
  END IF;
END$$

CREATE TRIGGER collection_invitations_invitee_upd BEFORE UPDATE ON collection_invitations
FOR EACH ROW
BEGIN
  IF NEW.invitee_user_id IS NULL AND NEW.invitee_email IS NULL THEN
    SIGNAL SQLSTATE 'HY000' SET MYSQL_ERRNO = 3819,
      MESSAGE_TEXT = 'Check constraint collection_invitations_invitee_chk is violated.';
  END IF;
END$$

CREATE TRIGGER media_comparisons_distinct_ins BEFORE INSERT ON media_comparisons
FOR EACH ROW
BEGIN
  IF NEW.left_media_asset_id = NEW.right_media_asset_id THEN
    SIGNAL SQLSTATE 'HY000' SET MYSQL_ERRNO = 3819,
      MESSAGE_TEXT = 'Check constraint media_comparisons_distinct_chk is violated.';
  END IF;
END$$

CREATE TRIGGER media_comparisons_distinct_upd BEFORE UPDATE ON media_comparisons
FOR EACH ROW
BEGIN
  IF NEW.left_media_asset_id = NEW.right_media_asset_id THEN
    SIGNAL SQLSTATE 'HY000' SET MYSQL_ERRNO = 3819,
      MESSAGE_TEXT = 'Check constraint media_comparisons_distinct_chk is violated.';
  END IF;
END$$

DELIMITER ;
