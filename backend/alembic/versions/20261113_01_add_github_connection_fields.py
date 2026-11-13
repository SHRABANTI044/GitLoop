"""Add GitHub connection fields used by OAuth and App installations."""

from alembic import op
import sqlalchemy as sa


revision = "20261113_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "github_connections" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("github_connections")}
    columns = (
        ("github_account_type", sa.Column("github_account_type", sa.String(length=50), nullable=False, server_default="user")),
        ("installation_id", sa.Column("installation_id", sa.String(length=128), nullable=True)),
        ("installation_owner_login", sa.Column("installation_owner_login", sa.String(length=255), nullable=True)),
        ("installation_owner_type", sa.Column("installation_owner_type", sa.String(length=50), nullable=True)),
        ("installation_token_encrypted", sa.Column("installation_token_encrypted", sa.String(length=1024), nullable=True)),
    )
    for name, column in columns:
        if name not in existing_columns:
            op.add_column("github_connections", column)

    indexes = {index["name"] for index in inspector.get_indexes("github_connections")}
    if "ix_github_connections_installation_id" not in indexes:
        op.create_index("ix_github_connections_installation_id", "github_connections", ["installation_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "github_connections" not in inspector.get_table_names():
        return

    indexes = {index["name"] for index in inspector.get_indexes("github_connections")}
    if "ix_github_connections_installation_id" in indexes:
        op.drop_index("ix_github_connections_installation_id", table_name="github_connections")

    existing_columns = {column["name"] for column in inspector.get_columns("github_connections")}
    for name in (
        "installation_token_encrypted",
        "installation_owner_type",
        "installation_owner_login",
        "installation_id",
        "github_account_type",
    ):
        if name in existing_columns:
            op.drop_column("github_connections", name)
