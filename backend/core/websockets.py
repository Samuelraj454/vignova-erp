from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        # Store dict of { websocket: role }
        self.active_connections: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, role: str):
        await websocket.accept()
        self.active_connections[websocket] = role

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]

    async def broadcast(self, message: str):
        # 'message' here is the table name (e.g. "users", "activityLogs")
        restricted_tables = ["users", "activity_logs", "settings"]
        
        for connection, role in list(self.active_connections.items()):
            # Prevent Cashiers from receiving restricted events
            if message in restricted_tables and role == "Cashier":
                continue
                
            try:
                await connection.send_text(message)
            except Exception:
                pass

ws_manager = ConnectionManager()
