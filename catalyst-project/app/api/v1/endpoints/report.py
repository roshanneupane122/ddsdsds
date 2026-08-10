from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import io

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

router = APIRouter()

class ReportData(BaseModel):
    title: str
    municipality_name: str
    content: str
    metrics: Optional[Dict[str, Any]] = None

@router.post("/generate", summary="Generate PDF Report")
async def generate_report(data: ReportData):
    if not HAS_REPORTLAB:
        # Fallback if reportlab isn't installed in the environment yet
        return Response(content=b"ReportLab not installed. Please rebuild docker image.", media_type="text/plain")
        
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Center', alignment=1))
    
    Story = []
    
    # Title
    Story.append(Paragraph(f"<b>{data.title}</b>", styles['Title']))
    Story.append(Spacer(1, 12))
    
    # Subtitle
    Story.append(Paragraph(f"Municipality: {data.municipality_name}", styles['Heading2']))
    Story.append(Spacer(1, 12))
    
    # Main Content
    # Split content by newlines and add as paragraphs
    for line in data.content.split('\n'):
        if line.strip():
            Story.append(Paragraph(line, styles['Normal']))
            Story.append(Spacer(1, 6))
            
    Story.append(Spacer(1, 12))
            
    # Metrics Table
    if data.metrics:
        Story.append(Paragraph("<b>Key Metrics</b>", styles['Heading3']))
        Story.append(Spacer(1, 6))
        
        table_data = [["Metric", "Value"]]
        for k, v in data.metrics.items():
            table_data.append([str(k).replace('_', ' ').title(), str(v)])
            
        t = Table(table_data, colWidths=[200, 150])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (1,0), colors.HexColor('#059669')),
            ('TEXTCOLOR', (0,0), (1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#ecfdf5')),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#10b981'))
        ]))
        Story.append(t)
        
    doc.build(Story)
    
    pdf = buffer.getvalue()
    buffer.close()
    
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{data.municipality_name.replace(' ', '_')}.pdf"}
    )
