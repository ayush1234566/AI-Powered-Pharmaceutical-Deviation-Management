"""
AIVOA Backend - Document Parser Service
Extracts text content from uploaded files (PDF, DOCX, TXT, XLSX, images).
"""

import os
import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file using pdfplumber (primary) with PyPDF2 fallback."""
    text = ""

    # Try pdfplumber first (better table/layout extraction)
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if text.strip():
            return text.strip()
    except Exception as e:
        logger.warning(f"pdfplumber failed, trying PyPDF2: {e}")

    # Fallback to PyPDF2
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        logger.error(f"PyPDF2 also failed: {e}")

    return text.strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX file."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        logger.error(f"DOCX extraction failed: {e}")
        return ""


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extract text from a plain text file."""
    try:
        # Try UTF-8 first, then fall back to latin-1
        try:
            return file_bytes.decode("utf-8").strip()
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1").strip()
    except Exception as e:
        logger.error(f"TXT extraction failed: {e}")
        return ""


def extract_text_from_xlsx(file_bytes: bytes) -> str:
    """Extract text from an Excel file."""
    try:
        from openpyxl import load_workbook
        wb = load_workbook(io.BytesIO(file_bytes), read_only=True)
        text_parts = []
        for sheet in wb.sheetnames:
            ws = wb[sheet]
            text_parts.append(f"--- Sheet: {sheet} ---")
            for row in ws.iter_rows(values_only=True):
                row_text = " | ".join(
                    str(cell) for cell in row if cell is not None
                )
                if row_text.strip():
                    text_parts.append(row_text)
        return "\n".join(text_parts)
    except Exception as e:
        logger.error(f"XLSX extraction failed: {e}")
        return ""


def extract_text_from_image(file_bytes: bytes) -> str:
    """
    Extract text from an image using OCR (pytesseract).
    Falls back to a description if Tesseract is not installed.
    """
    try:
        import pytesseract
        from PIL import Image
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        logger.warning(f"OCR extraction failed (Tesseract may not be installed): {e}")
        return "[Image uploaded - OCR extraction not available. Please paste the text content manually.]"


def parse_document(file_bytes: bytes, filename: str) -> str:
    """
    Main entry point: determine file type and extract text accordingly.

    Args:
        file_bytes: Raw file content
        filename: Original filename (used for extension detection)

    Returns:
        Extracted text content
    """
    ext = os.path.splitext(filename)[1].lower()
    logger.info(f"Parsing document: {filename} (type: {ext})")

    extractors = {
        ".pdf": extract_text_from_pdf,
        ".docx": extract_text_from_docx,
        ".doc": extract_text_from_docx,  # Best-effort for .doc
        ".txt": extract_text_from_txt,
        ".xlsx": extract_text_from_xlsx,
        ".xls": extract_text_from_xlsx,
        ".jpg": extract_text_from_image,
        ".jpeg": extract_text_from_image,
        ".png": extract_text_from_image,
    }

    extractor = extractors.get(ext)
    if extractor is None:
        return f"[Unsupported file type: {ext}. Please upload PDF, DOCX, TXT, XLSX, or image files.]"

    text = extractor(file_bytes)

    if not text:
        return f"[Could not extract text from {filename}. The file may be empty, scanned, or corrupted.]"

    logger.info(f"Extracted {len(text)} characters from {filename}")
    return text
