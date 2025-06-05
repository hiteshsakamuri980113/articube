"""
This module contains simplified tools for processing and formatting content from search results.
"""
from typing import Dict, List, Any, Optional
import re
from datetime import datetime

class ContentProcessor:
    """
    A utility class for processing and formatting content from search results.
    """
    
    @staticmethod
    def extract_content_and_references(search_results: str) -> Dict[str, Any]:
        """
        Extract content and references from formatted search results with three-part reference format.
        
        Args:
            search_results: Text containing content and references
            
        Returns:
            Dictionary with 'content' and 'references' keys
        """
        if not search_results:
            return {"content": "", "references": []}
        
        # If input is not a string, handle it appropriately
        if not isinstance(search_results, str):
            return {"content": "", "references": []}
            
        # Split by "References:" heading
        print(f"search results before splitting are: {search_results}")
        parts = search_results.split("References:", 1)
        print(f"parts after splitting: {parts}")
        
        extracted_content = parts[0].strip() if parts else search_results.strip()
        content = extracted_content.replace("*", "").replace("#", "")
        print(f"content after stripping: {content}")
        references = []
        seen_urls = set()  # Track URLs to prevent duplicates
        seen_titles = set()  # Track titles to prevent duplicates
        
        # Extract references if available
        if len(parts) > 1:
            refs_text = parts[1].strip()
            print(f"references part after stripping: {refs_text}")
            # Split by new lines to get individual references
            ref_lines = refs_text.split('\n')
            
            for line in ref_lines:
                line = line.strip()
                if line and not line.startswith('—') and not line.startswith('-'):  # Skip empty lines and separators
                    
                    # Try to extract four-part format first: Title: ... | Source: ... | Link: ... | Year: ...
                    title, source, link, year = ContentProcessor._extract_four_part_reference(line)
                    
                    # If four-part format didn't work, fall back to traditional parsing
                    if not title and not link:
                        title, source, link, year = ContentProcessor._extract_traditional_reference(line)
                    
                    # Validate and clean extracted data
                    if link and not ContentProcessor._is_valid_url(link):
                        print(f"Invalid URL detected, skipping: {link}")
                        continue
                    
                    # Create normalized versions for duplicate checking
                    normalized_title = title.lower().strip() if title else ""
                    normalized_url = link.lower().strip() if link else ""
                    
                    # Skip duplicates based on URL or title
                    if (normalized_url and normalized_url in seen_urls) or \
                       (normalized_title and normalized_title in seen_titles and len(normalized_title) > 5):
                        print(f"Duplicate reference detected, skipping: {title or link}")
                        continue
                    
                    # Add to seen sets
                    if normalized_url:
                        seen_urls.add(normalized_url)
                    if normalized_title and len(normalized_title) > 5:
                        seen_titles.add(normalized_title)
                    
                    # Only add if we have meaningful content
                    if title or link:
                        # Use extracted year or fallback to current year
                        if not year:
                            year = str(datetime.now().year)
                        
                        # Only include the four essential fields
                        references.append({
                            "title": title or "Referenced Source",
                            "source": source or "Source",
                            "link": link,
                            "year": year
                        })
                        print(f"Added reference - Title: {title}, Source: {source}, Link: {link}, Year: {year}")
            
            print(f"final references list after formation and deduplication: {references}")
        
        return {
            "content": content,
            "references": references
        }
    
    @staticmethod
    def _extract_four_part_reference(line: str) -> tuple:
        """
        Extract title, source, link, and year from four-part reference format.
        Format: Title: ... | Source: ... | Link: ... | Year: ...
        
        Returns:
            Tuple of (title, source, link, year)
        """
        title = ""
        source = ""
        link = ""
        year = ""
        
        # Check if line contains the pipe separator format
        if " | " in line:
            parts = line.split(" | ")
            
            for part in parts:
                part = part.strip()
                if part.startswith("Title:"):
                    title = part[6:].strip()  # Remove "Title:" prefix
                elif part.startswith("Source:"):
                    source = part[7:].strip()  # Remove "Source:" prefix
                elif part.startswith("Link:"):
                    link = part[5:].strip()  # Remove "Link:" prefix
                elif part.startswith("Year:"):
                    year = part[5:].strip()  # Remove "Year:" prefix
                    
        print(f"Four-part extraction - Title: '{title}', Source: '{source}', Link: '{link}', Year: '{year}'")
        return title, source, link, year
    
    @staticmethod
    def _extract_traditional_reference(line: str) -> tuple:
        """
        Extract title, source, link, and year from traditional citation format as fallback.
        
        Returns:
            Tuple of (title, source, link, year)
        """
        # Extract URL using regex
        urls = re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[/\w\.-]*/?', line)
        link = urls[0] if urls else ""
        
        # Extract year from text
        year = ContentProcessor._extract_year_from_text(line)
        
        # Extract title - look for patterns like "Title of article."
        title_match = re.search(r'\(\d{4}\)\.\s+(.*?)(?=\.|https?://|$)', line)
        title = ""
        if title_match:
            title = title_match.group(1).strip()
        else:
            # Fallback - use the first part before a period
            title_parts = line.split('.')
            if title_parts and len(title_parts[0].strip()) > 5:
                title = title_parts[0].strip()
        
        # Extract author/source
        author_match = re.search(r'^([^(]+?)(?:\s*\(|\s*\.)', line)
        source = author_match.group(1).strip() if author_match else ""
        
        print(f"Traditional extraction - Title: '{title}', Source: '{source}', Link: '{link}', Year: '{year}'")
        return title, source, link, year
    
    @staticmethod
    def _is_valid_url(url: str) -> bool:
        """Validate URL format and domain."""
        if not url or len(url) < 10:
            return False
        
        # Check for valid URL pattern
        url_pattern = r'^https?://[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*.*$'
        if not re.match(url_pattern, url):
            return False
        
        # Check for suspicious patterns that might indicate invalid URLs
        # Be more specific to avoid false positives like "test.com" which could be valid
        suspicious_patterns = ['example.com', 'placeholder.', 'dummy.', 'fake.', 'test.example', 'test.test']
        return not any(pattern in url.lower() for pattern in suspicious_patterns)
    
    @staticmethod
    def _extract_year_from_text(text: str) -> str:
        """Extract year from text."""
        date_match = re.search(r'\((\d{4})[^)]*\)', text)
        if date_match:
            return date_match.group(1)
        
        # Look for standalone year
        year_match = re.search(r'\b(20[0-2][0-9])\b', text)
        if year_match:
            return year_match.group(1)
        
        return ""
    
    @staticmethod
    def format_response_with_sources(topic: str, content: str, sources: List[Dict]) -> str:
        """
        Format a complete response with information and properly cited sources.
        
        Args:
            topic: The search topic
            content: The main content text
            sources: List of source dictionaries with citation information
            
        Returns:
            Formatted response text
        """
        # Start with the main content
        response = content if content else f"Information about {topic}:\n\n"
        
        # If no content but we have sources, add a note
        if not content and sources:
            response += "Based on several authoritative sources, here's information about this topic:\n\n"
            
            # Extract key information from sources
            for i, source in enumerate(sources[:3], 1):
                title = source.get("title", "")
                if title:
                    response += f"According to {title}:\n"
                    snippet = source.get("snippet", "")
                    if snippet:
                        # Clean up the snippet if it contains the citation
                        if " - " in snippet:
                            snippet = snippet.split(" - ")[0]
                        response += f"{snippet.strip()[:200]}...\n\n"
        
        # Add sources section
        if sources:
            response += "\n\nSources:\n"
            for i, source in enumerate(sources, 1):
                title = source.get("title", "Source")
                link = source.get("link", "")
                citation = source.get("citation", "")
                
                response += f"{i}. {title}\n"
                if link:
                    response += f"   Link: {link}\n"
                if citation:
                    response += f"   Citation: {citation}\n"
                response += "\n"
        
        return response


def process_content(context: dict) -> str:
    """
    Process content from session state and format a comprehensive response.
    
    Args:
        context: The invocation context containing state
        
    Returns:
        Formatted response string
    """
    # Get data from context
    topic = context.get("topic", "")
    content = context.get("content", "")
    extracted_info = context.get("extracted_info", "")
    search_results = context.get("search_results", "")
    sources = context.get("sources", [])
    
    print(f"Processing content - Topic: {topic}")
    print(f"Content available: {bool(content)} ({len(content) if content else 0} chars)")
    print(f"Extracted info available: {bool(extracted_info)} ({len(extracted_info) if extracted_info else 0} chars)")
    print(f"Search results available: {bool(search_results)} ({len(search_results) if search_results else 0} chars)")
    print(f"Sources available: {len(sources) if isinstance(sources, list) else 'not a list'}")
    
    # Process search results if we have them but no content
    if not content and search_results:
        result = ContentProcessor.extract_content_and_references(search_results)
        content = result["content"]
        
        # Update sources if needed
        if not sources and result["references"]:
            sources = result["references"]
    
    # Use extracted info if no content available
    if not content and extracted_info:
        content = extracted_info
    
    # Format the final response
    return ContentProcessor.format_response_with_sources(topic, content, sources)
