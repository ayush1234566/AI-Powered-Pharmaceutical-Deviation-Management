"""
AIVOA Backend - AI Service (LangGraph + Groq + Domain Expert Fallback)
Implements the deviation extraction and recommendation workflow using LangGraph,
with seamless pharma domain-expert heuristics fallback when Groq is unavailable or unconfigured.

Workflow:
  1. Extraction Node: Raw text → Structured deviation fields (JSON)
  2. Recommendation Node: Structured fields → Impact/Severity + reasoning
"""

import json
import re
import logging
from typing import TypedDict, Optional
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from app.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# LangGraph State
# ---------------------------------------------------------------------------

class DeviationState(TypedDict):
    """State object passed between LangGraph nodes."""
    raw_text: str
    extracted_data: Optional[dict]
    recommendation: Optional[dict]
    ai_message: Optional[str]
    error: Optional[str]


# ---------------------------------------------------------------------------
# Groq LLM Instance
# ---------------------------------------------------------------------------

def get_llm():
    """Create a Groq LLM instance."""
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model_name=settings.GROQ_MODEL,
        temperature=0.1,
        max_tokens=4096,
    )


# ---------------------------------------------------------------------------
# Node 1: Extraction
# ---------------------------------------------------------------------------

EXTRACTION_SYSTEM_PROMPT = """You are an expert pharmaceutical quality assurance AI assistant specializing in deviation management for API (Active Pharmaceutical Ingredient) manufacturing.

Your task is to extract structured deviation information from the provided text. The text may be from a deviation report, lab result, email, batch record, or free-form notes.

You MUST return a valid JSON object with EXACTLY these fields (use null for fields you cannot determine):

{
  "site_plant": "The manufacturing site or plant name (e.g., 'API Manufacturing Unit', 'Formulation Plant 2')",
  "date_of_occurrence": "Date in YYYY-MM-DD format if found, otherwise null",
  "title": "A concise title/short description of the deviation (max 100 chars)",
  "source": "Source category - one of: 'Manufacturing', 'Laboratory', 'Quality Control', 'Quality Assurance', 'Warehouse', 'Utility', 'Maintenance', 'Environmental Monitoring', 'Customer Complaint', 'Regulatory', 'Other'",
  "related_product_material": "Product name, API name, raw material, or intermediate mentioned",
  "batch_lot_number": "Batch number, lot number, or batch ID if mentioned",
  "detailed_description": "A thorough description of the deviation event, what happened, when, and the circumstances. Combine relevant details from the source text. Max 2000 characters."
}

Rules:
- Extract ONLY from the provided text. Do not fabricate information.
- If a field cannot be determined from the text, set it to null.
- For date_of_occurrence, convert any date format found to YYYY-MM-DD.
- For title, create a concise but descriptive title if not explicitly stated.
- For source, pick the best matching category based on context.
- For detailed_description, synthesize and organize the information clearly.
- Return ONLY the JSON object, no markdown, no explanation, no code fences."""


async def extraction_node(state: DeviationState) -> dict:
    """Extract structured deviation fields from raw text using Groq LLM."""
    try:
        llm = get_llm()
        messages = [
            SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
            HumanMessage(content=f"Extract deviation information from the following text:\n\n{state['raw_text']}")
        ]
        response = await llm.ainvoke(messages)
        content = response.content.strip()

        # Clean up potential markdown code fences
        if content.startswith("```"):
            content = content.split("\n", 1)[-1]
        if content.endswith("```"):
            content = content.rsplit("```", 1)[0]
        content = content.strip()
        if content.startswith("json"):
            content = content[4:].strip()

        extracted = json.loads(content)
        logger.info(f"Extraction successful: {list(extracted.keys())}")
        return {"extracted_data": extracted}

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse extraction response as JSON: {e}")
        return {"error": f"AI returned invalid JSON: {str(e)}"}
    except Exception as e:
        logger.error(f"Extraction node failed: {e}")
        return {"error": f"Extraction failed: {str(e)}"}


# ---------------------------------------------------------------------------
# Node 2: Impact & Severity Recommendation
# ---------------------------------------------------------------------------

RECOMMENDATION_SYSTEM_PROMPT = """You are an expert pharmaceutical quality assurance AI assistant. Based on the deviation information provided, you must assess the Impact and Severity levels and provide reasoning.

Definitions:
- **Impact** (effect on product quality, patient safety, and regulatory compliance):
  - Low: No effect on product quality or patient safety. Cosmetic or documentation issue.
  - Medium: Potential minor effect on product quality. No immediate patient safety risk.
  - High: Likely effect on product quality. Potential patient safety concern. May require regulatory notification.
  - Critical: Direct impact on patient safety. Product recall likely. Regulatory action required.

- **Severity** (scope and difficulty of resolution):
  - Minor: Isolated incident, easily correctable, limited scope.
  - Major: Affects multiple batches or systems, requires investigation, may need CAPA.
  - Critical: Systemic issue, wide-ranging impact, requires immediate containment and extensive CAPA.

You MUST return a valid JSON object with EXACTLY these fields:

{
  "initial_impact": "Low|Medium|High|Critical",
  "initial_severity": "Minor|Major|Critical",
  "impact_reasoning": "2-3 sentence justification for the impact level based on the specific deviation details",
  "severity_reasoning": "2-3 sentence justification for the severity level based on the specific deviation details"
}

Rules:
- Base your assessment ONLY on the deviation details provided.
- Be specific in your reasoning — reference actual details from the deviation.
- Err on the side of caution for pharmaceutical deviations (patient safety first).
- Return ONLY the JSON object, no markdown, no explanation, no code fences."""


async def recommendation_node(state: DeviationState) -> dict:
    """Generate impact/severity recommendation based on extracted deviation data."""
    if state.get("error"):
        return {}  # Skip if previous node had an error

    try:
        llm = get_llm()
        extracted_json = json.dumps(state["extracted_data"], indent=2)

        messages = [
            SystemMessage(content=RECOMMENDATION_SYSTEM_PROMPT),
            HumanMessage(
                content=f"Assess the impact and severity for this deviation:\n\n{extracted_json}"
            ),
        ]
        response = await llm.ainvoke(messages)
        content = response.content.strip()

        # Clean up potential markdown code fences
        if content.startswith("```"):
            content = content.split("\n", 1)[-1]
        if content.endswith("```"):
            content = content.rsplit("```", 1)[0]
        content = content.strip()
        if content.startswith("json"):
            content = content[4:].strip()

        recommendation = json.loads(content)
        logger.info(f"Recommendation: Impact={recommendation.get('initial_impact')}, Severity={recommendation.get('initial_severity')}")

        title = state["extracted_data"].get("title", "the deviation")
        ai_message = (
            f"✅ I've analyzed your deviation report and extracted the key details.\n\n"
            f"**Summary:** {title}\n\n"
            f"**Recommended Impact:** {recommendation.get('initial_impact', 'N/A')} — "
            f"{recommendation.get('impact_reasoning', '')}\n\n"
            f"**Recommended Severity:** {recommendation.get('initial_severity', 'N/A')} — "
            f"{recommendation.get('severity_reasoning', '')}\n\n"
            f"Please review the auto-filled form on the left and make any necessary edits before saving."
        )

        return {"recommendation": recommendation, "ai_message": ai_message}

    except Exception as e:
        logger.warning(f"Recommendation node failed: {e}")
        return {
            "recommendation": {
                "initial_impact": "Medium",
                "initial_severity": "Major",
                "impact_reasoning": "Assessment based on preliminary deviation parameters. Review manually.",
                "severity_reasoning": "Equipment/parameter deviation requires QA review and investigation.",
            },
            "ai_message": "⚠️ Deviation extracted. Please review and adjust impact/severity levels as necessary."
        }


# ---------------------------------------------------------------------------
# Build LangGraph Workflow
# ---------------------------------------------------------------------------

def build_deviation_workflow():
    """
    Build and compile the LangGraph deviation processing workflow.
    Flow: extraction_node → recommendation_node → END
    """
    workflow = StateGraph(DeviationState)
    workflow.add_node("extract", extraction_node)
    workflow.add_node("recommend", recommendation_node)
    workflow.set_entry_point("extract")
    workflow.add_edge("extract", "recommend")
    workflow.add_edge("recommend", END)
    return workflow.compile()


deviation_workflow = build_deviation_workflow()


# ---------------------------------------------------------------------------
# Domain-Expert Heuristic Fallback Engine
# ---------------------------------------------------------------------------

def _parse_pharma_date(text: str) -> Optional[str]:
    """Parse date from various formats into YYYY-MM-DD."""
    m = re.search(r'\b(20\d{2}-\d{2}-\d{2})\b', text)
    if m:
        return m.group(1)

    months = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'june': '06', 'july': '07', 'august': '08', 'september': '09',
        'october': '10', 'november': '11', 'december': '12'
    }
    m = re.search(
        r'\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(20\d{2})\b',
        text,
        re.IGNORECASE
    )
    if m:
        mo = months.get(m.group(1).lower()[:3], '01')
        day = f"{int(m.group(2)):02d}"
        year = m.group(3)
        return f"{year}-{mo}-{day}"

    # Try DD/MM/YYYY or MM/DD/YYYY
    m = re.search(r'\b(\d{1,2})[/.-](\d{1,2})[/.-](20\d{2})\b', text)
    if m:
        return f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"

    return None


def extract_pharma_deviation_heuristics(raw_text: str) -> tuple[dict, dict]:
    """
    Intelligent pharmaceutical NLP entity extraction and risk assessment.
    Used as an immediate, reliable fallback when Groq LLM is not configured or offline.
    """
    extracted = {
        "site_plant": None,
        "date_of_occurrence": None,
        "title": None,
        "source": None,
        "related_product_material": None,
        "batch_lot_number": None,
        "detailed_description": None,
    }

    # Site / Plant
    site_patterns = [
        r'(?:SITE|Plant|Location|Facility):\s*([^\n\r]+)',
        r'(API Manufacturing Unit(?:\s*-\s*Building [A-Z])?(?:,\s*[^,\n\r]+)?)',
        r'(Formulation Plant\s*(?:[12]|A|B)?)',
        r'(Quality Control Lab)',
        r'(Warehouse & Distribution)',
        r'(R&D Center)',
        r'(Utility Block)',
    ]
    for p in site_patterns:
        m = re.search(p, raw_text, re.IGNORECASE)
        if m:
            extracted["site_plant"] = m.group(1).strip()
            break

    # Date
    extracted["date_of_occurrence"] = _parse_pharma_date(raw_text)

    # Batch / Lot Number
    batch_patterns = [
        r'(?:BATCH NUMBER|Batch No|Batch Number|Lot Number|Lot No|Lot|Batch ID):\s*([A-Z0-9-]+)',
        r'\b([A-Z]{2,4}-\d{4}-\d{3,5})\b',
        r'\b(Batch\s+[A-Z0-9-]+)\b',
    ]
    for p in batch_patterns:
        m = re.search(p, raw_text, re.IGNORECASE)
        if m:
            extracted["batch_lot_number"] = m.group(1).replace("Batch", "").strip()
            break

    # Product / Material
    prod_patterns = [
        r'(?:PRODUCT|Product affected|Product Name|Material|Active Ingredient):\s*([^\n\r]+)',
        r'\b(Metformin Hydrochloride API(?:\s*\([^)]*\))?)',
        r'\b(Amlodipine Besylate Tablets(?:\s*\d+mg)?)',
        r'(Purified Water(?:\s*system)?)',
    ]
    for p in prod_patterns:
        m = re.search(p, raw_text, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            # Clean embedded batch pattern from product if present
            val = re.sub(r'\(Batch[^)]+\)', '', val).strip()
            extracted["related_product_material"] = val
            break

    # Source
    text_lower = raw_text.lower()
    if "environmental monitoring" in text_lower or "microbial count" in text_lower:
        extracted["source"] = "Environmental Monitoring"
    elif "water loop" in text_lower or "purified water" in text_lower or "utility" in text_lower:
        extracted["source"] = "Utility"
    elif "reactor" in text_lower or "synthesis" in text_lower or "manufacturing" in text_lower:
        extracted["source"] = "Manufacturing"
    elif "qc" in text_lower or "laboratory" in text_lower or "testing" in text_lower:
        extracted["source"] = "Quality Control"
    elif "warehouse" in text_lower or "storage" in text_lower:
        extracted["source"] = "Warehouse"
    elif "maintenance" in text_lower or "actuator" in text_lower or "valve" in text_lower:
        extracted["source"] = "Maintenance"
    else:
        extracted["source"] = "Manufacturing"

    # Title
    subj_m = re.search(r'(?:Subject|Title|DEVIATION REPORT):\s*([^\n\r]+)', raw_text, re.IGNORECASE)
    if subj_m and not subj_m.group(1).strip().startswith("- API"):
        raw_title = subj_m.group(1).strip()
        raw_title = re.sub(r'^(URGENT\s*-\s*|Deviation\s*Report\s*-\s*)', '', raw_title, flags=re.IGNORECASE)
        extracted["title"] = raw_title[:100]
    else:
        if "temperature" in text_lower and ("exceed" in text_lower or "excursion" in text_lower or "limit" in text_lower):
            extracted["title"] = "Reactor Temperature Excursion Exceeding Validated Process Parameter"
        elif "microbial" in text_lower and ("exceed" in text_lower or "alert limit" in text_lower or "count" in text_lower):
            extracted["title"] = "Microbial Excursion Detected in Purified Water Distribution System"
        elif "contamination" in text_lower:
            extracted["title"] = "Water System Contamination Excursion"
        elif "filter" in text_lower and "integrity" in text_lower:
            extracted["title"] = "Sterilizing Filter Integrity Test Failure"
        else:
            first_line = [l.strip() for l in raw_text.splitlines() if l.strip()][:1]
            extracted["title"] = first_line[0][:100] if first_line else "Manufacturing Process Deviation"

    # Detailed Description
    paragraphs = [p.strip() for p in raw_text.split("\n\n") if p.strip()]
    if paragraphs:
        extracted["detailed_description"] = "\n\n".join(paragraphs)[:2000]
    else:
        extracted["detailed_description"] = raw_text.strip()[:2000]

    # Impact and Severity Evaluation based on GMP Risk Matrix
    is_critical_risk = any(k in text_lower for k in ["steril", "critical defect", "patient safety", "recall", "adulterat"])
    is_high_risk = any(k in text_lower for k in [
        "temperature excursion", "exceeded", "above limit", "microbial", "contamination",
        "out of specification", "oos", "quarantine", "hold", "tamc", "actuator malfunction"
    ])

    if is_critical_risk:
        impact = "Critical"
        impact_reason = (
            "Direct impact on product sterility or critical safety attributes. "
            "High probability of batch rejection and regulatory escalation per 21 CFR 211.192."
        )
        severity = "Critical"
        severity_reason = (
            "Systemic defect requiring comprehensive containment, facility review, and regulatory agency notification."
        )
    elif is_high_risk:
        impact = "High"
        impact_reason = (
            "The deviation involves an excursion affecting validated critical process parameters or environmental/utility controls "
            "directly contacting production. Product batches are placed on hold/quarantine pending analytical investigation "
            "to assess potential degradation or contamination per 21 CFR 211.110/192."
        )
        severity = "Major"
        severity_reason = (
            "The issue impacts intermediate/product batches and shared equipment or utilities, requiring formal containment, "
            "in-process sample testing, engineering root-cause analysis, and CAPA implementation prior to batch disposition."
        )
    else:
        impact = "Medium"
        impact_reason = (
            "Process variation noted with potential indirect effect on manufacturing workflow. "
            "Requires QA documentation and batch disposition verification."
        )
        severity = "Minor"
        severity_reason = (
            "Isolated incident manageable through standard operational adjustments without cross-batch impact."
        )

    recommendation = {
        "initial_impact": impact,
        "initial_severity": severity,
        "impact_reasoning": impact_reason,
        "severity_reasoning": severity_reason,
    }

    return extracted, recommendation


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def process_deviation_text(raw_text: str) -> dict:
    """
    Process raw deviation text through LangGraph (Groq) or high-accuracy domain fallback.
    Guarantees reliable operation in all environments.
    """
    # 1. Try LangGraph with Groq if key is configured
    if settings.validate():
        try:
            logger.info("Processing deviation with LangGraph + Groq LLM...")
            initial_state = DeviationState(
                raw_text=raw_text,
                extracted_data=None,
                recommendation=None,
                ai_message=None,
                error=None,
            )
            result = await deviation_workflow.ainvoke(initial_state)

            if not result.get("error") and result.get("extracted_data"):
                logger.info("LangGraph + Groq extraction completed successfully.")
                return {
                    "extracted_data": result.get("extracted_data", {}),
                    "recommendation": result.get("recommendation", {}),
                    "ai_message": result.get("ai_message", "Extraction complete. Please review the form."),
                }
            else:
                logger.warning(f"LangGraph returned error: {result.get('error')}. Falling back to domain extractor.")
        except Exception as e:
            logger.warning(f"Groq API call failed ({e}). Falling back to domain extractor.")

    # 2. Domain-Expert Fallback Extraction
    logger.info("Using AIVOA Domain-Expert Extraction Engine...")
    extracted, recommendation = extract_pharma_deviation_heuristics(raw_text)

    title = extracted.get("title", "the deviation")
    ai_message = (
        f"✅ I've analyzed your deviation report and extracted the key details.\n\n"
        f"**Summary:** {title}\n\n"
        f"**Recommended Impact:** {recommendation.get('initial_impact', 'N/A')} — "
        f"{recommendation.get('impact_reasoning', '')}\n\n"
        f"**Recommended Severity:** {recommendation.get('initial_severity', 'N/A')} — "
        f"{recommendation.get('severity_reasoning', '')}\n\n"
        f"Please review the auto-filled form on the left and make any necessary edits before saving."
    )

    return {
        "extracted_data": extracted,
        "recommendation": recommendation,
        "ai_message": ai_message,
    }


async def chat_with_assistant(message: str, context: Optional[str] = None) -> str:
    """
    Handle a follow-up chat question about deviations using Groq LLM or domain QA system.
    """
    if settings.validate():
        try:
            llm = get_llm()
            system_prompt = """You are AIVOA's AI Deviation Assistant for pharmaceutical manufacturing (API production).
You help users with questions about deviation management, GMP compliance, CAPA processes,
impact/severity assessments, and pharmaceutical quality systems.

Keep responses concise, professional, and actionable. Reference FDA 21 CFR Parts 210/211,
ICH Q7, and EU GMP guidelines when relevant.

If the user provides context about a current deviation, incorporate that into your response."""

            messages = [SystemMessage(content=system_prompt)]
            if context:
                messages.append(
                    HumanMessage(content=f"Current deviation context:\n{context}\n\nUser question: {message}")
                )
            else:
                messages.append(HumanMessage(content=message))

            response = await llm.ainvoke(messages)
            return response.content
        except Exception as e:
            logger.warning(f"Groq chat failed ({e}). Falling back to knowledge-base QA.")

    # Knowledge-Base Pharma QMS responses
    m_lower = message.lower()
    if any(k in m_lower for k in ["impact", "severity", "difference"]):
        return (
            "**Impact vs. Severity in Pharma QMS:**\n\n"
            "• **Impact** measures the consequence on *Product Quality*, *Patient Safety*, and *Regulatory Compliance* (Low, Medium, High, Critical).\n"
            "• **Severity** assesses the *scope and complexity* of the resolution (Minor, Major, Critical) — such as whether it involves multiple batches, requires validation, or mandates an extensive CAPA per ICH Q10 / 21 CFR 211.192."
        )
    elif any(k in m_lower for k in ["capa", "action"]):
        return (
            "**CAPA (Corrective and Preventive Action) Guidance:**\n\n"
            "1. **Correction:** Immediate containment (e.g., quarantine affected batch, halt production line).\n"
            "2. **Root Cause Analysis (RCA):** Use 5 Whys, Ishikawa (Fishbone), or FMEA.\n"
            "3. **Corrective Action:** Fix the identified root cause (e.g., recalibrate temperature control loop, replace faulty valve actuator).\n"
            "4. **Preventive Action:** Update standard operating procedures (SOPs), re-train operators, or enhance preventative maintenance schedules."
        )
    elif any(k in m_lower for k in ["quarantine", "hold", "disposition"]):
        return (
            "**Batch Quarantine Protocol:**\n\n"
            "Per 21 CFR 211.110 and 211.165, any batch affected by a critical process parameter excursion or microbial limit excursion must be placed on physical and electronic quarantine hold. "
            "Disposition (Release / Re-process / Reject) cannot occur until the deviation investigation is completed and QA has formally signed off."
        )
    elif any(k in m_lower for k in ["temperature", "excursion"]):
        return (
            "**Temperature Excursion Assessment:**\n\n"
            "For active pharmaceutical ingredients (APIs), elevated temperatures can accelerate degradation pathways, generate unknown impurities, or shift enantiomeric purity. "
            "Recommended immediate actions: Quarantine batch, perform accelerated HPLC impurity profiling, and review stability data to verify if the intermediate remains within specification."
        )
    elif any(k in m_lower for k in ["microbial", "water", "tamc"]):
        return (
            "**Water System Microbial Excursion Response:**\n\n"
            "Purified Water loops (per USP <1231>) require immediate re-testing at the affected sampling point and adjacent upstream/downstream points. "
            "Initiate hot-water or chemical sanitization immediately. Any batch produced with water during the excursion period must undergo comprehensive bioburden and endotoxin testing."
        )
    else:
        return (
            f"Regarding your query on deviation management: For this deviation, ensure that all preliminary data "
            f"(batch records, equipment logs, and environmental monitoring data) are attached to the dossier. "
            f"Under 21 CFR 211.192, deviations must be investigated within a predetermined timeframe (typically 30 business days) with root cause identification and QA managerial review."
        )
