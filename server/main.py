# server/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Backend Hive", version="1.0")

# 🔹 Configuração CORS para permitir chamadas do frontend
origins = [
    "http://localhost:5173",  # porta padrão do Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Modelos de dados
class Service(BaseModel):
    id: str
    service: str
    date: str
    team: str
    status: str
    rating: int
    duration: str

class CurrentService(BaseModel):
    id: str
    title: str
    status: str
    progress: int
    startDate: str
    expectedEnd: str
    team: str
    leader: str
    phone: str
    location: str

class TimelineItem(BaseModel):
    time: str
    event: str
    status: str

# 🔹 Dados simulados
current_service = CurrentService(
    id="OS-2024-089",
    title="Limpeza Geral - Escritório Corporate",
    status="em-andamento",
    progress=70,
    startDate="23/09/2024",
    expectedEnd="23/09/2024 - 17:00",
    team="Equipe Alpha",
    leader="Carlos Silva",
    phone="(11) 99999-8888",
    location="Av. Paulista, 1000 - 15º andar"
)

service_history: List[Service] = [
    Service(id="OS-2024-078", service="Limpeza Geral", date="20/09/2024", team="Equipe Beta", status="completed", rating=5, duration="6h"),
    Service(id="OS-2024-065", service="Limpeza de Vidros", date="15/09/2024", team="Equipe Alpha", status="completed", rating=4, duration="4h"),
    Service(id="OS-2024-052", service="Limpeza Geral + Enceramento", date="10/09/2024", team="Equipe Gamma", status="completed", rating=5, duration="8h"),
    Service(id="OS-2024-038", service="Limpeza Pós-Obra", date="05/09/2024", team="Equipe Delta", status="completed", rating=4, duration="12h"),
]

timeline: List[TimelineItem] = [
    TimelineItem(time="08:00", event="Equipe chegou ao local", status="completed"),
    TimelineItem(time="08:15", event="Início dos trabalhos de limpeza", status="completed"),
    TimelineItem(time="10:30", event="Limpeza das áreas comuns finalizada", status="completed"),
    TimelineItem(time="12:00", event="Pausa para almoço da equipe", status="completed"),
    TimelineItem(time="13:00", event="Limpeza das salas em andamento", status="current"),
    TimelineItem(time="15:30", event="Limpeza dos banheiros", status="pending"),
    TimelineItem(time="16:30", event="Finalização e vistoria", status="pending"),
    TimelineItem(time="17:00", event="Conclusão do serviço", status="pending"),
]

# 🔹 Endpoints GET
@app.get("/api/clientes/current-service", response_model=CurrentService)
async def get_current_service():
    return current_service

@app.get("/api/clientes/history", response_model=List[Service])
async def get_service_history():
    return service_history

@app.get("/api/clientes/timeline", response_model=List[TimelineItem])
async def get_timeline():
    return timeline

# 🔹 Endpoint POST para adicionar novo serviço
@app.post("/api/clientes/history")
async def add_service(service: Service):
    service_history.append(service)
    return {"success": True, "service": service}
