from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Doctor Stats API",
    description="Medical Data Analysis Platform API",
    version="1.0.0",
)

# CORS middleware configuration
origins = [
    "http://localhost:3000",  # React development server
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception handler for consistent error responses
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": {"code": "SERVER_ERROR", "message": str(exc)},
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "success": True,
        "data": {"status": "healthy", "version": "1.0.0"},
        "error": None,
    }


# Import and include routers
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.visualizations import router as visualizations_router
from app.api.v1.reports import router as reports_router

# Include routers with prefix
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/v1/users", tags=["User Management"])
app.include_router(analysis_router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(datasets_router, prefix="/api/v1/datasets", tags=["Datasets"])
app.include_router(
    visualizations_router, prefix="/api/v1/visualizations", tags=["Visualizations"]
)
app.include_router(reports_router, prefix="/api/v1/reports", tags=["Reports"])
