Method	Endpoint	Auth	Response
GET	/trainer/learners	accessibility_trainer	[{user_id, name, email}]
GET	/trainer/learners/{id}/engagement	accessibility_trainer	{learner_id, sessions_last_7_days, sessions_last_30_days, last_active}
GET	/trainer/learners/{id}/skill-development	accessibility_trainer	{learner_id, accuracy_trend[], improvement_pct}
GET	/trainer/learners/{id}/analytics	accessibility_trainer	{learner_id, average_score, weak_letters[], total_attempts}
GET	/trainer/learners/{id}/certification-status	accessibility_trainer	{learner_id, certified, level, date_issued}