from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import io
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.pdfgen import canvas
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

router = APIRouter()

class ReportData(BaseModel):
    title: str
    municipality_name: str
    content: str
    metrics: Optional[Dict[str, Any]] = None

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#047857'))
        self.drawString(54, 30, "CATALYST GEOSPATIAL DECISION SUPPORT SYSTEM")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#64748b'))
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 30, page_str)
        
        # Bottom rule
        self.setStrokeColor(colors.HexColor('#10b981'))
        self.setLineWidth(1)
        self.line(54, 42, 612 - 54, 42)
        self.restoreState()

@router.post("/generate", summary="Generate Executive PDF Report")
async def generate_report(data: ReportData):
    if not HAS_REPORTLAB:
        return Response(content=b"ReportLab not installed. Please rebuild docker image.", media_type="text/plain")
        
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Executive Typography Styles
    title_style = ParagraphStyle(
        name='ExecTitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.whitesmoke,
        alignment=0,
    )
    
    subtitle_style = ParagraphStyle(
        name='ExecSub',
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#ecfdf5'),
        alignment=0,
    )

    section_banner_style = ParagraphStyle(
        name='ExecSectionHeader',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.whitesmoke,
        spaceBefore=0,
        spaceAfter=0,
    )
    
    body_style = ParagraphStyle(
        name='ExecBody',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
    )

    bullet_style = ParagraphStyle(
        name='ExecBullet',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
    )

    Story = []
    
    # 1. EXECUTIVE HEADER BANNER TABLE
    header_title_p = Paragraph(f"<b>{data.title.upper()}</b>", title_style)
    header_sub_p = Paragraph(f"Municipality Intelligence & Geospatial Evaluation • Date: {datetime.now().strftime('%B %d, %Y')}", subtitle_style)
    
    header_table = Table([[header_title_p], [header_sub_p]], colWidths=[504])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#047857')),
        ('PADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    Story.append(header_table)
    Story.append(Spacer(1, 14))

    # 2. PARSE CONTENT LINES & SECTIONS
    lines = data.content.split('\n')
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
            
        if stripped.isupper() and len(stripped) < 40 and not stripped.startswith('•') and not stripped.startswith('CATALYST'):
            # Section Heading Banner
            sec_p = Paragraph(f"<b>{stripped}</b>", section_banner_style)
            sec_table = Table([[sec_p]], colWidths=[504])
            sec_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#065f46')),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ]))
            Story.append(Spacer(1, 10))
            Story.append(sec_table)
            Story.append(Spacer(1, 8))
        elif stripped.startswith('•') or stripped.startswith('-') or (len(stripped) > 2 and stripped[0].isdigit() and stripped[1] == '.'):
            # Bullet or Numbered item
            Story.append(Paragraph(stripped, bullet_style))
            Story.append(Spacer(1, 3))
        else:
            # Body Paragraph
            Story.append(Paragraph(stripped, body_style))
            Story.append(Spacer(1, 5))
            
    Story.append(Spacer(1, 14))

    # 3. STRUCTURED METRICS TABLE
    if data.metrics:
        sec_p = Paragraph("<b>KEY PERFORMANCE & GEOSPATIAL METRICS</b>", section_banner_style)
        sec_table = Table([[sec_p]], colWidths=[504])
        sec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#047857')),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ]))
        Story.append(sec_table)
        Story.append(Spacer(1, 8))
        
        table_data = [
            [
                Paragraph("<b>INDICATOR METRIC</b>", ParagraphStyle('TH1', fontName='Helvetica-Bold', fontSize=9, textColor=colors.whitesmoke)),
                Paragraph("<b>VALUE / INDEX</b>", ParagraphStyle('TH2', fontName='Helvetica-Bold', fontSize=9, textColor=colors.whitesmoke, alignment=2))
            ]
        ]
        
        for k, v in data.metrics.items():
            metric_label = str(k).replace('_', ' ').title()
            table_data.append([
                Paragraph(f"<b>{metric_label}</b>", ParagraphStyle('TD1', fontName='Helvetica', fontSize=9, textColor=colors.HexColor('#1e293b'))),
                Paragraph(f"<b>{v}</b>", ParagraphStyle('TD2', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#047857'), alignment=2))
            ])
            
        metrics_table = Table(table_data, colWidths=[330, 174])
        t_style = [
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#047857')),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('TOPPADDING', (0, 0), (-1, 0), 6),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#a7f3d0')),
        ]
        
        # Alternating row colors
        for i in range(1, len(table_data)):
            bg = colors.HexColor('#f0fdf4') if i % 2 == 1 else colors.white
            t_style.append(('BACKGROUND', (0, i), (-1, i), bg))
            t_style.append(('PADDING', (0, i), (-1, i), 5))
            
        metrics_table.setStyle(TableStyle(t_style))
        Story.append(metrics_table)
        
    doc.build(Story, canvasmaker=NumberedCanvas)
    
    pdf = buffer.getvalue()
    buffer.close()
    
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{data.municipality_name.replace(' ', '_')}.pdf"}
    )

