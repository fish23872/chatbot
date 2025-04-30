from fastapi import Depends, HTTPException, Header
from jose import JWTError
from bson import ObjectId
from auth import decode_token
from database import Users

def get_current_user(authorization: str = Header(...)):
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError()
    except ValueError:
        raise HTTPException(401, detail="Invalid Authorization header format")

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        db = Users().users
        user = db.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(401, detail="Invalid token user")
        return {"id": str(user["_id"]), "username": user["username"], "role": user["role"]}
    except JWTError:
        raise HTTPException(401, detail="Token decode failed")