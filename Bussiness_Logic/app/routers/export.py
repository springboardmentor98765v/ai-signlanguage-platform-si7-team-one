from fastapi import APIRouter, Query
from fastapi.responses import Response
from uuid import UUID
from enum import Enum
from app.services.export_service import (
    generate_learner_progress_csv,
    generate_learner_progress_excel,
    generate_class_summary_csv,
    generate_class_summary_excel,
)

router = APIRouter(prefix="/export", tags=["export"])


class ExportFormat(str, Enum):
    csv = "csv"
    excel = "excel"


@router.get("/{user_id}/progress")
def export_learner_progress(
    user_id: UUID,
    format: ExportFormat = Query(default=ExportFormat.csv)
):
    if format == ExportFormat.excel:
        data = generate_learner_progress_excel(user_id)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=progress_{user_id}.xlsx"}
        )
    data = generate_learner_progress_csv(user_id)
    return Response(
        content=data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=progress_{user_id}.csv"}
    )


@router.get("/class/summary")
def export_class_summary(
    format: ExportFormat = Query(default=ExportFormat.csv)
):
    if format == ExportFormat.excel:
        data = generate_class_summary_excel()
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=class_summary.xlsx"}
        )
    data = generate_class_summary_csv()
    return Response(
        content=data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=class_summary.csv"}
    )