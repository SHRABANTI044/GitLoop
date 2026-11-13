"""Add installation ID to repositories."""

from alembic import op
import sqlalchemy as sa


revision = "20261113_02"
down_revision = "20261113_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "repositories" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("repositories")}
    if "installation_id" not in existing_columns:
        op.add_column("repositories", sa.Column("installation_id", sa.String(length=128), nullable=True))

    indexes = {index["name"] for index in inspector.get_indexes("repositories")}
    if "ix_repositories_installation_id" not in indexes:
        op.create_index("ix_repositories_installation_id", "repositories", ["installation_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "repositories" not in inspector.get_table_names():
        return

    indexes = {index["name"] for index in inspector.get_indexes("repositories")}
    if "ix_repositories_installation_id" in indexes:
        op.drop_index("ix_repositories_installation_id", table_name="repositories")

    existing_columns = {column["name"] for column in inspector.get_columns("repositories")}
    if "installation_id" in existing_columns:
        op.drop_column("repositories", "installation_id")
