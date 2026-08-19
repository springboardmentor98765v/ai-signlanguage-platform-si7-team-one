SELECT email, COUNT(*)
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

SELECT *
FROM notifications n
LEFT JOIN users u
ON n.user_id = u.user_id
WHERE u.user_id IS NULL;

SELECT *
FROM user_badges ub
LEFT JOIN users u
ON ub.user_id = u.user_id
WHERE u.user_id IS NULL;

SELECT *
FROM user_badges ub
LEFT JOIN badges b
ON ub.badge_id = b.badge_id
WHERE b.badge_id IS NULL;


SELECT *
FROM notifications
WHERE title IS NULL;


SELECT badge_code, COUNT(*)
FROM badges
GROUP BY badge_code
HAVING COUNT(*) > 1;

SELECT *
FROM streaks
WHERE current_streak > longest_streak;

SELECT *
FROM streaks
WHERE user_id IS NULL;

SELECT *
FROM notifications
WHERE user_id IS NULL;