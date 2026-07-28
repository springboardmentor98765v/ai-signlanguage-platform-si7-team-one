import csv
import io
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Optional

from app.services.practice_service import practice_store
from app.services.assessment_service import assessment_store
from app.services.gamification_service import compute_gamification
from app.schemas.practice import SessionStatus


def _grade_from_score(score: float) -> str:
    if score >= 90: return "A"
    if score >= 75: return "B"
    if score >= 60: return "C"
    if score >= 40: return "D"
    return "F"


def generate_learner_progress_csv(user_id: UUID) -> bytes:
    """
    One row per session: date, duration, accuracy, score, grade, signs practiced.
    """
    sessions = practice_store.get_sessions_by_user(user_id)
    sessions_sorted = sorted(sessions, key=lambda s: s.started_at)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Session Date",
        "Status",
        "Duration (seconds)",
        "Signs Practiced",
        "Correct Predictions",
        "Total Predictions",
        "Accuracy (%)",
        "Score",
        "Grade",
    ])

    for session in sessions_sorted:
        assessment = assessment_store.get(session.session_id)
        if assessment and assessment.total_predictions > 0:
            accuracy = round(assessment.correct_predictions / assessment.total_predictions * 100, 2)
            avg_score = round(assessment.score_sum / assessment.total_predictions, 2)
            grade = _grade_from_score(avg_score)
            signs = len(assessment.sign_stats)
            correct = assessment.correct_predictions
            total = assessment.total_predictions
        else:
            accuracy = avg_score = 0.0
            grade = "N/A"
            signs = correct = total = 0

        duration = 0
        if session.ended_at and session.started_at:
            duration = int((session.ended_at - session.started_at).total_seconds())

        writer.writerow([
            session.started_at.strftime("%Y-%m-%d %H:%M UTC"),
            session.status.value,
            duration,
            signs,
            correct,
            total,
            accuracy,
            avg_score,
            grade,
        ])

    return output.getvalue().encode("utf-8")


def generate_learner_progress_excel(user_id: UUID) -> bytes:
    """Excel version of the learner progress export."""
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment
    except ImportError:
        raise RuntimeError("openpyxl not installed — run: pip install openpyxl")

    sessions = practice_store.get_sessions_by_user(user_id)
    sessions_sorted = sorted(sessions, key=lambda s: s.started_at)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Progress Report"

    headers = [
        "Session Date", "Status", "Duration (s)", "Signs Practiced",
        "Correct", "Total", "Accuracy (%)", "Score", "Grade"
    ]

    # Style headers
    header_fill = PatternFill("solid", fgColor="1565C0")
    header_font = Font(color="FFFFFF", bold=True)
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")
        ws.column_dimensions[cell.column_letter].width = 18

    for row_idx, session in enumerate(sessions_sorted, 2):
        assessment = assessment_store.get(session.session_id)
        if assessment and assessment.total_predictions > 0:
            accuracy = round(assessment.correct_predictions / assessment.total_predictions * 100, 2)
            avg_score = round(assessment.score_sum / assessment.total_predictions, 2)
            grade = _grade_from_score(avg_score)
            signs = len(assessment.sign_stats)
            correct = assessment.correct_predictions
            total = assessment.total_predictions
        else:
            accuracy = avg_score = 0.0
            grade = "N/A"
            signs = correct = total = 0

        duration = 0
        if session.ended_at and session.started_at:
            duration = int((session.ended_at - session.started_at).total_seconds())

        ws.append([
            session.started_at.strftime("%Y-%m-%d %H:%M UTC"),
            session.status.value,
            duration,
            signs,
            correct,
            total,
            accuracy,
            avg_score,
            grade,
        ])

    buffer = io.BytesIO()
    wb.save(buffer)
    return buffer.getvalue()


def generate_class_summary_csv() -> bytes:
    """
    One row per learner: user_id, total sessions, completed, avg accuracy,
    badges earned, weak signs.
    """
    all_sessions = list(practice_store._sessions.values())
    user_ids = list(set(s.user_id for s in all_sessions))

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "User ID",
        "Total Sessions",
        "Completed Sessions",
        "Average Accuracy (%)",
        "Grade",
        "Badges Earned",
        "Weak Signs",
    ])

    for user_id in user_ids:
        user_sessions = [s for s in all_sessions if s.user_id == user_id]
        completed = [s for s in user_sessions if s.status == SessionStatus.completed]

        accuracies = []
        weak_signs = []
        combined_sign_stats = {}

        for session in user_sessions:
            assessment = assessment_store.get(session.session_id)
            if assessment and assessment.total_predictions > 0:
                accuracies.append(
                    assessment.correct_predictions / assessment.total_predictions * 100
                )
                for sign, stats in assessment.sign_stats.items():
                    entry = combined_sign_stats.setdefault(sign, {"correct": 0, "total": 0})
                    entry["correct"] += stats["correct"]
                    entry["total"] += stats["total"]

        avg_accuracy = round(sum(accuracies) / len(accuracies), 2) if accuracies else 0.0
        grade = _grade_from_score(avg_accuracy)

        weak_signs = [
            sign for sign, stats in combined_sign_stats.items()
            if stats["total"] >= 2
            and (stats["correct"] / stats["total"] * 100) < 60.0
        ]

        gamification = compute_gamification(user_id)
        badges_earned = gamification.total_badges_earned

        writer.writerow([
            str(user_id),
            len(user_sessions),
            len(completed),
            avg_accuracy,
            grade,
            badges_earned,
            ", ".join(weak_signs) if weak_signs else "None",
        ])

    return output.getvalue().encode("utf-8")


def generate_class_summary_excel() -> bytes:
    """Excel version of the class summary export."""
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment
    except ImportError:
        raise RuntimeError("openpyxl not installed")

    all_sessions = list(practice_store._sessions.values())
    user_ids = list(set(s.user_id for s in all_sessions))

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Class Summary"

    headers = [
        "User ID", "Total Sessions", "Completed",
        "Avg Accuracy (%)", "Grade", "Badges Earned", "Weak Signs"
    ]

    header_fill = PatternFill("solid", fgColor="1A237E")
    header_font = Font(color="FFFFFF", bold=True)
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")
        ws.column_dimensions[cell.column_letter].width = 22

    for row_idx, user_id in enumerate(user_ids, 2):
        user_sessions = [s for s in all_sessions if s.user_id == user_id]
        completed = [s for s in user_sessions if s.status == SessionStatus.completed]

        accuracies = []
        combined_sign_stats = {}
        for session in user_sessions:
            assessment = assessment_store.get(session.session_id)
            if assessment and assessment.total_predictions > 0:
                accuracies.append(
                    assessment.correct_predictions / assessment.total_predictions * 100
                )
                for sign, stats in assessment.sign_stats.items():
                    entry = combined_sign_stats.setdefault(sign, {"correct": 0, "total": 0})
                    entry["correct"] += stats["correct"]
                    entry["total"] += stats["total"]

        avg_accuracy = round(sum(accuracies) / len(accuracies), 2) if accuracies else 0.0
        grade = _grade_from_score(avg_accuracy)
        weak_signs = [
            sign for sign, stats in combined_sign_stats.items()
            if stats["total"] >= 2
            and (stats["correct"] / stats["total"] * 100) < 60.0
        ]
        gamification = compute_gamification(user_id)

        ws.append([
            str(user_id),
            len(user_sessions),
            len(completed),
            avg_accuracy,
            grade,
            gamification.total_badges_earned,
            ", ".join(weak_signs) if weak_signs else "None",
        ])

    buffer = io.BytesIO()
    wb.save(buffer)
    return buffer.getvalue()