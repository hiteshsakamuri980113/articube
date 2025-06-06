"""
Helper functions for JSON parsing
"""
import json
import re
from typing import List, Dict, Any, Optional, Union

def extract_json_from_text(text: str) -> Optional[Union[Dict, List]]:
    """
    Extract JSON from text, handling various formats including markdown code blocks
    
    Args:
        text: Text that may contain JSON
        
    Returns:
        Parsed JSON object or None if extraction fails
    """
    if not text:
        return None
        
    # First try: Look for JSON in code blocks
    json_block_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    matches = re.findall(json_block_pattern, text, re.DOTALL)
    
    for match in matches:
        try:
            return json.loads(match.strip())
        except json.JSONDecodeError:
            continue
            
    # Second try: Look for array or object directly
    json_pattern = r"\s*(\[[\s\S]*\]|\{[\s\S]*\})\s*"
    matches = re.findall(json_pattern, text, re.DOTALL)
    
    for match in matches:
        try:
            return json.loads(match.strip())
        except json.JSONDecodeError:
            continue
    
    # Third try: Try parsing the entire text after cleaning
    try:
        # Remove markdown formatting and try to parse
        cleaned_text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        return None

def format_sources_list(sources_data: Any) -> List[Dict[str, str]]:
    """
    Format sources data into a standardized list of sources with four essential fields.
    
    Args:
        sources_data: Source data in various possible formats
        
    Returns:
        List of source dictionaries with four essential fields: title, source, link, year
    """
    formatted_sources = []
    
    # Handle direct list of sources
    if isinstance(sources_data, list):
        for item in sources_data:
            if isinstance(item, dict):
                source = {
                    "title": item.get("title", "No title"),
                    "source": item.get("source", item.get("author", "Unknown Source")),
                    "link": item.get("link", ""),
                    "year": item.get("year", "2025")
                }
                formatted_sources.append(source)
    
    # Handle dict with 'result' field
    elif isinstance(sources_data, dict) and "result" in sources_data:
        return format_sources_list(sources_data["result"])
    
    # Handle string that might contain JSON
    elif isinstance(sources_data, str):
        json_data = extract_json_from_text(sources_data)
        if json_data:
            return format_sources_list(json_data)
        else:
            # If no JSON found, create a generic source from the text
            formatted_sources.append({
                "title": "Information Source",
                "source": "Knowledge Base",
                "link": "",
                "year": "2025"
            })
    
    # If we couldn't extract proper sources, return a default source
    if not formatted_sources:
        formatted_sources.append({
            "title": "Information Source",
            "source": "Knowledge Base",
            "link": "",
            "year": "2025"
        })
    
    return formatted_sources
