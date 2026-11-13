"""Add persistent repository analyzer reports."""

from alembic import op
import sqlalchemy as sa


revision = "20261113_03"
down_revision = "20261113_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "analyzer_reports" not in inspector.get_table_names():
        op.create_table(
            "analyzer_reports",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("user_id", sa.String(length=36), nullable=False),
            sa.Column("repository_id", sa.String(length=36), nullable=False),
            sa.Column("repository_full_name", sa.String(length=255), nullable=False),
            sa.Column("status", sa.String(length=20), nullable=False, server_default="queued"),
            sa.Column("stage", sa.String(length=80), nullable=False, server_default="Queued"),
            sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("error_message", sa.Text(), nullable=True),
            sa.Column("repository_metadata", sa.JSON(), nullable=True),
            sa.Column("file_tree", sa.JSON(), nullable=True),
            sa.Column("files_analyzed", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("report_json", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["repository_id"], ["repositories.id"]),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    indexes = {index["name"] for index in sa.inspect(bind).get_indexes("analyzer_reports")}
    for name, column in (
        ("ix_analyzer_reports_user_id", "user_id"),
        ("ix_analyzer_reports_repository_id", "repository_id"),
        ("ix_analyzer_reports_status", "status"),
    ):
        if name not in indexes:
            op.create_index(name, "analyzer_reports", [column])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "analyzer_reports" not in inspector.get_table_names():
        return
    for name in (
        "ix_analyzer_reports_status",
        "ix_analyzer_reports_repository_id",
        "ix_analyzer_reports_user_id",
    ):
        if name in {index["name"] for index in sa.inspect(bind).get_indexes("analyzer_reports")}:
            op.drop_index(name, table_name="analyzer_reports")
    op.drop_table("analyzer_reports")
