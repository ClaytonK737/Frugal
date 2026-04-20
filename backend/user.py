from dataclasses import dataclass
from typing import Optional
from uuid import UUID

@dataclass
class User:
    id: UUID
    email: str
    username: str
    saved_money_total: float = 0.0
    is_active: bool = True