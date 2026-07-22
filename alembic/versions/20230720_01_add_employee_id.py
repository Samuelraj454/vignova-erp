"""add_employee_id

Revision ID: 20230720_01_add_employee_id
Revises: None
Create Date: 2026-07-20 21:20:41.000000
"""

from alembic import op
import sqlalchemy as sa
import datetime

# revision identifiers, used by Alembic.
revision = "20230720_01_add_employee_id"
down_revision = "20230720_00_initial"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Assuming tables already exist; no need to create them here

    # Backfill employee_id for existing users
    conn = op.get_bind()
    year = datetime.datetime.utcnow().year
    # Determine current max sequence for this year
    max_seq_result = conn.execute(
        sa.text(
            "SELECT COALESCE(MAX(CAST(SUBSTRING(employee_id FROM 9 FOR 6) AS INTEGER)), 0) "
            "FROM users WHERE employee_id IS NOT NULL AND SUBSTRING(employee_id FROM 5 FOR 4) = :year"
        ),
        {"year": str(year)}
    )
    max_seq = max_seq_result.scalar() or 0

    # Update rows without employee_id
    rows = conn.execute(sa.text("SELECT id FROM users WHERE employee_id IS NULL"))
    for row in rows:
        max_seq += 1
        emp_id = f"EMP-{year}-{max_seq:06d}"
        conn.execute(
            sa.text("UPDATE users SET employee_id = :emp_id WHERE id = :uid"),
            {"emp_id": emp_id, "uid": row.id},
        )

    # Step 5: add UNIQUE constraint
    op.create_unique_constraint('uq_employee_id', 'users', ['employee_id'])

    # Step 6: set NOT NULL
    op.alter_column('users', 'employee_id', existing_type=sa.String(), nullable=False)

def downgrade() -> None:
    # Reverse Step 6
    op.alter_column('users', 'employee_id', existing_type=sa.String(), nullable=True)
    # Reverse Step 5
    op.drop_constraint('uq_employee_id', 'users', type_='unique')
    # Reverse Step 1
    op.drop_column('users', 'employee_id')
