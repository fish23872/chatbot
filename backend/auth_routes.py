from fastapi import APIRouter, HTTPException, Depends, Request, Path
from models import RegisterRequest, LoginRequest, RepairTicketCreateRequest, TicketUpdateData
from auth import hash_password, verify_password, create_token
from database import Users, Tickets
from dependencies import get_current_user
from bson import ObjectId
from datetime import datetime
from fastapi.encoders import jsonable_encoder
from typing import List

router = APIRouter()
users = Users().users
tickets = Tickets().tickets

@router.post("/register")
async def register(data: RegisterRequest, request: Request):
    body = await request.body()
    if users.find_one({"username": data.username}):
        raise HTTPException(400, detail="Username already exists")
    
    hashed = hash_password(data.password)
    users.insert_one({
        "username": data.username,
        "hashed_password": hashed,
        "role": data.role
    })
    return {"msg": "Registration successful"}

@router.post("/login")
async def login(data: LoginRequest, request: Request):
    body = await request.body()
    user = users.find_one({"username": data.username})
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(401, detail="Invalid credentials")

    token = create_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": token}

@router.get("/dashboard")
def operator_dashboard(user = Depends(get_current_user)):
    if user["role"] != "operator":
        raise HTTPException(403, detail="Forbidden")
    return {"msg": "Operator dashboard", "user": user}

@router.get("/tickets/{ticket_id}")
def get_ticket_by_id(ticket_id: str, user=Depends(get_current_user)):
    try:
        ticket = tickets.find_one({"_id": ObjectId(ticket_id)})
        if not ticket:
            raise HTTPException(404, detail="Ticket not found")
        return {
            "id": str(ticket["_id"]),
            "user_id": str(ticket["user_id"]),
            "urgency": ticket["urgency"],
            "category": ticket["category"],
            "needs_additional_info": ticket["needs_additional_info"],
            "customerNotes": ticket["customerNotes"],
            "technicianNotes": ticket["technicianNotes"],
            "status": ticket["status"],
            "createdAt": ticket["created_at"],
            "phone_model": ticket["phone_model"],
            "email": ticket["email"]
        }
    except Exception as e:
        print(e)
        raise HTTPException(500, detail=str(e))
    
@router.patch("/tickets/{ticket_id}")
def add_data_to_ticket(ticket_id: str, update_data: TicketUpdateData, user=Depends(get_current_user)):
    try:
        ticket = tickets.find_one({"_id": ObjectId(ticket_id)})
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        update_fields = {k: v for k, v in update_data.dict().items() if v is not None}

        if not update_fields:
            raise HTTPException(status_code=400, detail="No data provided to update")

        result = tickets.update_one(
            {"_id": ObjectId(ticket_id)},
            {"$set": update_fields}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=304, detail="Ticket was not modified")

        return {"message": "Ticket updated successfully"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.get("/tickets")
async def get_all_tickets():
    try:
        array = []
        for ticket in tickets.find(): 
            array.append({
                "id": str(ticket["_id"]),
                "user_id": str(ticket["user_id"]),
                "urgency": ticket["urgency"],
                "status": ticket["status"],
                "phone_model": ticket["phone_model"]
            })
        return array
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(500, detail=str(e))

@router.post("/tickets", response_model=dict)
def create_ticket(ticket: RepairTicketCreateRequest, user=Depends(get_current_user)):
    status = "open"
    ticket_data = {
        "user_id": ObjectId(user["id"]),
        "urgency": ticket.urgency,
        "category": ticket.category,
        "needs_additional_info": ticket.needs_additional_info,
        "customerNotes": ticket.customerNotes,
        "technicianNotes": ticket.technicianNotes,
        "status": status,
        "created_at": datetime.utcnow(),
        "phone_model": ticket.phone_model,
        "email": ticket.email
    }

    result = tickets.insert_one(ticket_data)
    response_data = {
        "ticket": {
            "_id": str(result.inserted_id),
            "urgency": ticket.urgency,
            "category": ticket.category,
            "needs_additional_info": ticket.needs_additional_info,
            "status": "open",
            "created_at": datetime.utcnow().isoformat(),
            "customerNotes": ticket.customerNotes,
            "technicianNotes": ticket.technicianNotes,
            "phone_model": ticket.phone_model,
            "email": ticket.email
        }
    }
    
    return response_data