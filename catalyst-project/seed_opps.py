import asyncio
import os
import uuid
import random
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.municipality import Municipality
from app.models.opportunity import BusinessOpportunity
from app.models.recommendation import AIRecommendation

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:jaynepal@db:5432/nepal_opportunity_map")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed():
    async with async_session() as session:
        # Check if opportunities exist
        result = await session.execute(select(BusinessOpportunity))
        existing = result.scalars().all()
        if not existing:
            print("Seeding Business Opportunities...")
        opps = [
            BusinessOpportunity(
                opportunity_id=str(uuid.uuid4()),
                title="Smart Agri-Processing Hub",
                sector="Agriculture",
                description="A high-tech facility for processing local agricultural output into packaged goods.",
                required_infrastructure="Cold storage, 3-phase electricity, Highway access",
                min_investment=2000000,
                max_investment=5000000,
                estimated_investment_scale="Medium"
            ),
            BusinessOpportunity(
                opportunity_id=str(uuid.uuid4()),
                title="Eco-Tourism Resort",
                sector="Tourism",
                description="Sustainable tourism resort leveraging local natural beauty.",
                required_infrastructure="Paved roads, Water supply, Internet connectivity",
                min_investment=5000000,
                max_investment=15000000,
                estimated_investment_scale="Large"
            ),
            BusinessOpportunity(
                opportunity_id=str(uuid.uuid4()),
                title="Digital Service BPO",
                sector="Technology",
                description="Business process outsourcing center employing local youth.",
                required_infrastructure="High-speed Fiber Internet, Uninterrupted Power Supply",
                min_investment=1000000,
                max_investment=3000000,
                estimated_investment_scale="Small"
            )
        ]
        session.add_all(opps)
        await session.commit()
        
        print("Fetching municipalities...")
        muni_result = await session.execute(select(Municipality))
        municipalities = muni_result.scalars().all()

        rec_result = await session.execute(select(AIRecommendation))
        existing_recs = rec_result.scalars().all()
        if existing_recs:
            print("Recommendations already exist. Skipping recommendation seed.")
            return

        if existing:
            opps = existing
        
        print("Seeding AI Recommendations...")
        recs = []
        for m in municipalities:
            for opp in opps:
                score = round(random.uniform(60.0, 98.0), 2)
                recs.append(
                    AIRecommendation(
                        recommendation_id=str(uuid.uuid4()),
                        municipality_id=m.municipality_id,
                        opportunity_id=opp.opportunity_id,
                        suitability_score=score,
                        explanation=f"AI Model v1.0 analyzed {m.name} demographics and infrastructure and found this highly suitable.",
                        model_version="v1.0"
                    )
                )
        session.add_all(recs)
        await session.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
