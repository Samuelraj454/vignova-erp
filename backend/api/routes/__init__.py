from fastapi import APIRouter, Query
from .crud import router as crud_router
from backend.api.auth import router as auth_router
from backend.api.routes.sales import router as sales_router
from backend.api.routes.users import router as users_router
from backend.core.websockets import ws_manager
from fastapi import WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from backend.api.auth import SECRET_KEY, ALGORITHM

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(crud_router)
api_router.include_router(sales_router)
api_router.include_router(users_router)

@api_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    if not token:
        await websocket.close(code=1008)
        return
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role", "Unknown")
    except JWTError:
        await websocket.close(code=1008)
        return

    await ws_manager.connect(websocket, role)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
