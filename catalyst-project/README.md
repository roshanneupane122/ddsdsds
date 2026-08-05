
## 📁 Project Structure

```text
backend/
│
├── alembic/                    # Database migration scripts & history
├── app/                        # Main application package
│   ├── api/                    # API routing and HTTP dependencies
│   │   └── v1/                 # API Version 1
│   │       ├── endpoints/      # Path operation handlers / routers
│   │       ├── api.py          # Central V1 router aggregation
│   │       └── dependencies.py # Common dependencies (DB, Auth, etc.)
│   │
│   ├── core/                   # Application config, security, & global settings
│   ├── crud/                   # Low-level database CRUD operations
│   ├── db/                     # Database connection session & setup
│   ├── models/                 # SQLAlchemy ORM models (Database tables)
│   ├── schemas/                # Pydantic schemas (Data validation & serialization)
│   ├── services/               # Business logic layer
│   ├── __init__.py
│   └── main.py                 # FastAPI application entry point
│
├── .env                        # Environment variables (Database URLs, Keys)
├── .gitignore                  # Git ignore directives
├── alembic.ini                 # Alembic configuration file
├── docker-compose.yml          # Container orchestration configuration
├── README.md                   # Project documentation
└── requirements.txt            # Python dependencies