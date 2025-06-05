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
        Extract content and references from formatted search results.
        
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
        
        # Extract references if available
        if len(parts) > 1:
            refs_text = parts[1].strip()
            print(f"references part after stripping: {refs_text}")
            # Split by new lines to get individual references
            ref_lines = refs_text.split('\n')
            
            for line in ref_lines:
                line = line.strip()
                if line:
                    # Extract URL using regex
                    urls = re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[/\w\.-]*', line)
                    url = urls[0] if urls else ""
                    
                    # Extract title - look for patterns like "Title of article."
                    title_match = re.search(r'\(\d{4}\)\.\s+(.*?)(?=\.|https?://|$)', line)
                    title = ""
                    if title_match:
                        title = title_match.group(1).strip()
                    else:
                        # Fallback - use the first part before a period
                        title_parts = line.split('.')
                        if title_parts:
                            title = title_parts[0].strip()
                    
                    # Extract author and date if available
                    author_match = re.search(r'^([^(]+)', line)
                    author = author_match.group(1).strip() if author_match else ""
                    
                    date_match = re.search(r'\((\d{4})[^)]*\)', line)
                    year = date_match.group(1) if date_match else str(datetime.now().year)
                    
                    references.append({
                        "citation": line,
                        "link": url,
                        "title": title or "Referenced Source",
                        "author": author or "Source",
                        "year": year
                    })
            print(f"final references list after formation: {references}")
        
        return {
            "content": content,
            "references": references
        }
    
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
