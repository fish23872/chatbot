from pydantic import BaseModel
from typing import Optional, List

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str

class LoginRequest(BaseModel):
    username: str
    password: str
    
class RepairData(BaseModel):
    urgency: str
    category: List[str]
    needs_additional_info: bool

class RepairTicketCreateRequest(RepairData):
    customerNotes: Optional[str] = None
    technicianNotes: Optional[str] = None