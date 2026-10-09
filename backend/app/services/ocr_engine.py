import io
import shutil
import subprocess
from pathlib import Path
from typing import Tuple, List, Optional
from PIL import Image, ImageEnhance, ImageFilter
from pypdf import PdfReader
from app.config import settings

def is_tesseract_available() -> bool:
    """Checks if Tesseract executable is installed and reachable in PATH."""
    return shutil.which(settings.TESSERACT_CMD) is not None

def get_installed_ocr_languages() -> List[str]:
    """Returns available OCR language packs or empty list if unavailable."""
    if not is_tesseract_available():
        return []
    try:
        output = subprocess.check_output([settings.TESSERACT_CMD, "--list-langs"], stderr=subprocess.STDOUT, text=True)
        langs = [line.strip() for line in output.splitlines() if line.strip() and not line.startswith("List")]
        return langs
    except Exception:
        return ["eng"]

def preprocess_image(image_path: Path) -> Path:
    """
    Image preprocessing for improved OCR:
    - Grayscale conversion
    - Contrast enhancement
    - Gentle sharpening/denoising
    """
    try:
        with Image.open(image_path) as img:
            # Convert to grayscale
            gray = img.convert("L")
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(gray)
            enhanced = enhancer.enhance(1.8)
            
            # Denoise / sharpen
            sharpened = enhanced.filter(ImageFilter.SHARPEN)
            
            preprocessed_path = image_path.parent / f"prep_{image_path.name}"
            sharpened.save(preprocessed_path, format="PNG")
            return preprocessed_path
    except Exception:
        return image_path

def extract_text_from_pdf(pdf_path: Path) -> List[Tuple[int, str]]:
    """
    Extracts text page-by-page from a PDF document using pypdf.
    Returns list of (page_number, page_text).
    """
    pages_text: List[Tuple[int, str]] = []
    try:
        reader = PdfReader(str(pdf_path))
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages_text.append((page_idx + 1, text.strip()))
    except Exception as e:
        pages_text.append((1, f"[Error reading PDF pages: {str(e)}]"))
    return pages_text

def run_ocr_on_image(image_path: Path, language: str = "eng") -> Tuple[str, float, str]:
    """
    Runs OCR on an image file.
    If Tesseract is installed, invokes it.
    If not installed, returns an informative diagnostic note with actionable guidance.
    """
    if is_tesseract_available():
        installed_langs = get_installed_ocr_languages()
        tess_lang = "eng"
        if language in installed_langs:
            tess_lang = language
        elif language == "te" and "tel" in installed_langs:
            tess_lang = "tel"

        preprocessed = preprocess_image(image_path)
        try:
            cmd = [settings.TESSERACT_CMD, str(preprocessed), "stdout", "-l", tess_lang]
            proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            text = proc.stdout.strip()
            return text, 0.92, "tesseract"
        except subprocess.CalledProcessError as e:
            return f"[OCR Error: {e.stderr.strip()}]", 0.3, "tesseract_failed"
    else:
        # Tesseract not detected on system
        message = (
            "NOTICE: Tesseract OCR binary is not detected on the host system PATH. "
            "For scanned images, install Tesseract OCR with required language packs ('eng', 'tel'). "
            "Direct PDF text extraction remains fully functional."
        )
        return message, 0.5, "tesseract_missing"
