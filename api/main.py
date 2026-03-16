from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
from datetime import date
from typing import List

# --- SQL Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./habits.db" # Change to postgresql:// for prod
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQL Models ---
class HabitDB(Base):
    __tablename__ = "habits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # Firebase UID
    name = Column(String, index=True)
    target_value = Column(Float)
    unit = Column(String)

class HabitLogDB(Base):
    __tablename__ = "habit_logs"
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    log_date = Column(Date, default=date.today)
    current_value = Column(Float, default=0)

Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas (Data Validation) ---
class HabitCreate(BaseModel):
    user_id: str
    name: str
    target_value: float
    unit: str

class HabitLogUpdate(BaseModel):
    current_value: float

class HabitResponse(HabitCreate):
    id: int
    current_value: float = 0 # Today's progress

    class Config:
        orm_mode = True

# --- FastAPI App ---
app = FastAPI(title="SetLogic Habit API")

# Allow React frontend to communicate with Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- REST Endpoints ---
@app.post("/habits", response_model=HabitResponse)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    db_habit = HabitDB(**habit.dict())
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return {**db_habit.__dict__, "current_value": 0}

@app.get("/habits/{user_id}", response_model=List[HabitResponse])
def get_user_habits(user_id: str, db: Session = Depends(get_db)):
    habits = db.query(HabitDB).filter(HabitDB.user_id == user_id).all()
    result = []
    for h in habits:
        # Get today's log
        log = db.query(HabitLogDB).filter(
            HabitLogDB.habit_id == h.id, 
            HabitLogDB.log_date == date.today()
        ).first()
        current_val = log.current_value if log else 0
        result.append({**h.__dict__, "current_value": current_val})
    return result

@app.post("/habits/{habit_id}/log")
def log_habit(habit_id: int, log_update: HabitLogUpdate, db: Session = Depends(get_db)):
    log = db.query(HabitLogDB).filter(
        HabitLogDB.habit_id == habit_id, 
        HabitLogDB.log_date == date.today()
    ).first()
    
    if log:
        log.current_value = log_update.current_value
    else:
        log = HabitLogDB(habit_id=habit_id, current_value=log_update.current_value, log_date=date.today())
        db.add(log)
    
    db.commit()
    return {"status": "success", "current_value": log.current_value}