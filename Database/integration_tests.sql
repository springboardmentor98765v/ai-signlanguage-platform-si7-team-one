-- =====================================================
-- Verification Queries
-- =====================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
AND table_name IN
(
    'notifications',
    'badges',
    'user_badges',
    'streaks'
)
ORDER BY table_name;

SELECT indexname
FROM pg_indexes
WHERE schemaname='public'
AND indexname IN
(
    'idx_notifications_user_id',
    'idx_notifications_user_unread',
    'idx_notifications_created_at',
    'idx_badges_is_active',
    'idx_user_badges_user_id',
    'idx_streaks_current_streak',
    'idx_analytics_average_accuracy'
)
ORDER BY indexname;

SELECT trigger_name,event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('badges','streaks')
ORDER BY trigger_name;

-- =====================================================
-- Integration Tests
-- =====================================================

INSERT INTO notifications
(
    user_id,
    notification_type,
    title,
    message
)
VALUES
(
    '2eedb4eb-4824-4b38-8a4b-70aebfb13fdd',
    'badge_earned',
    'Congratulations',
    'You earned your first badge.'
);

INSERT INTO user_badges
(
    user_id,
    badge_id
)
VALUES
(
    '2eedb4eb-4824-4b38-8a4b-70aebfb13fdd',
    1
)
ON CONFLICT DO NOTHING;

INSERT INTO streaks
(
    user_id,
    current_streak,
    longest_streak,
    last_practice_date
)
VALUES
(
    '2eedb4eb-4824-4b38-8a4b-70aebfb13fdd',
    5,
    8,
    CURRENT_DATE
)
ON CONFLICT (user_id)
DO UPDATE
SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    last_practice_date = EXCLUDED.last_practice_date;

-- =====================================================
-- Final Verification
-- =====================================================

SELECT *
FROM notifications
ORDER BY created_at DESC;

SELECT *
FROM user_badges
ORDER BY earned_at DESC;

SELECT *
FROM streaks;