from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.tools import google_search, agent_tool
from google.adk.models.lite_llm import LiteLlm
from google.adk.sessions import InMemorySessionService
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.genai import types
from app.utils.content_processor import process_content
from typing import Dict, Any, List, Optional, Union
from datetime import datetime

load_dotenv()

# Global state for testing and development
APP_NAME = "app-01"
USER_ID = "hitesh-01"
SESSION_ID = "session-01"

# Global state for testing and development

_global_state = {
    "topic": "",
    "content": "",
    "formatted_content": "",
    "organized_content": "",
    "sources": []
}

# Initialize the session service for compatibility with ADK
session_service = InMemorySessionService()

# Initialize _session as None - we'll create it when first needed via get_global_session()
_session = None

# Define a function to create a fresh session with current state
async def create_fresh_session():
    """Create a fresh session with the current global state"""
    global _session
    try:
        # Create a fresh session with current global state
        _session = await session_service.create_session(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=SESSION_ID,
            state=dict(_global_state)  # Use a copy to avoid mutation issues
        )
        print("Fresh session created successfully")
        print(f"freshly created session is: {_session}")
        return None
    except Exception as e:
        print(f"Error creating fresh session: {e}")
        return None

# Ensure session is created or recreated when needed
async def get_global_session():
    """Get or recreate the global session if needed"""
    print("get global session request received successfully!")
    session = session_service.sessions[APP_NAME][USER_ID][SESSION_ID]
    print(f"retrieved session is: {session}")

    if not session:
        print("Using memory-only fallback")
        return _session
    
    return session  # Return the global session reference

async def set_state_value(key: str, value: Any):
    """Set a value in session state"""
    # Declare global _session at the beginning of the function
    global _session
    
    print(f"Setting state value for key '{key}': {value}")
    
    # Always update our global state first for reliability
    _global_state[key] = value
    
    # Then try to update the session state
    try:
        # If no session exists or we can't access it, create a new one
        session = await get_global_session()

        # Update the state value in the session
        if session is not None:
            session.state[key] = value
            _session.state[key] = value
            print(f"Successfully updated state in session for key: {key}")
        else:
            print(f"Warning: Failed to access session, using global state only for key: {key}")
            
    except Exception as e:
        print(f"Error updating session state: {e}")
        print(f"Using global state fallback for key: {key}")

async def get_state_value(key: str):
    """Get a value from session state"""
    # Declare global _session at the beginning of the function
    global _session
    
    # First try to get from session
    try:
        session = await get_global_session()
        
        # Try to get the value from the session
        if session is not None and key in session.state:
            value = session.state.get(key)
            print(f"Retrieved value for key '{key}' from session")
            
            # Always sync with global state for consistency and fallback
            _global_state[key] = value
            return value
    except Exception as e:
        print(f"Error getting value from session state: {e}")
    


async def get_fact_sources() -> Dict[str, List[Dict[str, str]]]:
    """
    Turn the search results into a list of sources (title, source, link, year).
    
    This function accesses the search_results directly from the session state,
    extracts four-part citations (Title, Source, Link, Year) and formats them as sources.
    
    Returns:
        Dictionary with "result" key containing formatted sources list
    """
    
    # Get search_results from session state
    search_results = await get_state_value("search_results")
    
    print(f"Processing search_results from state: {search_results}")
    
    sourceList = []
    content_text = ""
    seen_urls = set()  # Track URLs to prevent duplicates
    seen_titles = set()  # Track titles to prevent duplicates
    
    def is_duplicate_source(new_source, existing_sources):
        """Check if a source is duplicate based on URL or title similarity."""
        new_url = new_source.get("link", "").lower().strip()
        new_title = new_source.get("title", "").lower().strip()
        
        for existing in existing_sources:
            existing_url = existing.get("link", "").lower().strip()
            existing_title = existing.get("title", "").lower().strip()
            
            # Check URL match
            if new_url and existing_url and new_url == existing_url:
                return True
            
            # Check title similarity (allowing for minor differences)
            if new_title and existing_title and len(new_title) > 10:
                # Simple similarity check - if 80% of words match
                new_words = set(new_title.split())
                existing_words = set(existing_title.split())
                if len(new_words & existing_words) / max(len(new_words), len(existing_words)) > 0.8:
                    return True
        
        return False
    
    def validate_source(source):
        """Validate that a source has meaningful content and valid URL."""
        title = source.get("title", "").strip()
        link = source.get("link", "").strip()
        source_name = source.get("source", "").strip()
        
        # Must have title and either a valid URL or source name
        if not title:
            return False
        
        # Check for placeholder/dummy content
        placeholder_terms = ['example', 'placeholder', 'dummy', 'test', 'fake']
        if any(term in title.lower() for term in placeholder_terms):
            return False
        
        # Validate URL if present
        if link:
            from app.utils.content_processor import ContentProcessor
            if not ContentProcessor._is_valid_url(link):
                return False
        
        # Must have either a valid URL or a meaningful source name
        if not link and not source_name:
            return False
        
        return True
    
    try:
        # Use our ContentProcessor to extract content and sources
        from app.utils.content_processor import ContentProcessor
        
        if isinstance(search_results, str):
            # Process the search results
            result = ContentProcessor.extract_content_and_references(search_results)
            print(f"The result from ContentProcessor is: {result}")
            content_text = result["content"]
            
            # Store the content in state for later use
            if content_text:
                await set_state_value("content", content_text)
                stored_content = await get_state_value("content")
                print(f"Stored {len(stored_content)} characters of content in session state")
            
            # Convert references to source list format with validation and deduplication
            for ref in result["references"]:
                # Extract the four essential fields only
                title = ref.get("title", "") or "Referenced Source"
                link = ref.get("link", "") 
                source = ref.get("source", "") or "Source"
                year = ref.get("year", "") or str(datetime.now().year)
                
                # Create snippet for display purposes
                snippet = f"Title: {title} | Source: {source} | Published: {year}"
                
                new_source = {
                    "title": title,
                    "source": source,
                    "link": link,
                    "year": year
                }
                
                # Validate and check for duplicates
                if validate_source(new_source) and not is_duplicate_source(new_source, sourceList):
                    sourceList.append(new_source)
                    print(f"Added valid source: {title} from {source}")
                else:
                    print(f"Skipped invalid or duplicate source: {title}")
            
            print(f"sources list after validation and deduplication: {sourceList}")
                
            # If no references were extracted but we found URLs in the content, create sources from them
            if not sourceList and content_text:
                import re
                # Extract URLs from the content
                urls = re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[/\w\.-]*/?', content_text)
                
                if urls:
                    # Remove duplicates and validate URLs
                    unique_urls = []
                    for url in urls[:5]:  # Limit to 5 URLs
                        if url not in seen_urls and ContentProcessor._is_valid_url(url):
                            unique_urls.append(url)
                            seen_urls.add(url)
                    
                    for i, url in enumerate(unique_urls, 1):
                        domain = url.split("//")[-1].split("/")[0]
                        sourceList.append({
                            "title": f"Source {i} - {domain}",
                            "source": domain,
                            "link": url,
                            "year": "2025"
                        })
                else:
                    # No references found but we have content, create a generic source
                    sourceList.append({
                        "title": "Information Source",
                        "source": "Knowledge Base",
                        "link": "",
                        "year": str(datetime.now().year)
                    })
                
        elif isinstance(search_results, dict) and "organic_results" in search_results:
            # Case: Direct search results from google_search tool
            content_text = "Information compiled from multiple sources"
            await set_state_value("content", content_text)
            
            for result in search_results["organic_results"][:5]:
                title = result.get("title", "")
                link = result.get("link", "")
                snippet = result.get("snippet", "")
                
                # Generate domain name as author
                domain = link.split("//")[-1].split("/")[0] if link else "Unknown Source"
                
                new_source = {
                    "title": title,
                    "source": domain,
                    "link": link,
                    "year": "2025"
                }
                
                # Validate and check for duplicates
                if validate_source(new_source) and not is_duplicate_source(new_source, sourceList):
                    sourceList.append(new_source)
                
        elif isinstance(search_results, dict) and "finder_agent_response" in search_results:
            # Handle case where the response is wrapped
            if "result" in search_results["finder_agent_response"]:
                # Recursively call this function after updating state
                result = search_results["finder_agent_response"]["result"]
                await set_state_value("search_results", result)

                return get_fact_sources()
        
        else:
            # Fallback for unexpected formats
            print(f"Unexpected search_results format: {type(search_results)}")
            
            # If we have any content in the state, use that to generate a source
            existing_content = await get_state_value("content") 
            if existing_content:
                content_text = existing_content
                sourceList.append({
                    "title": "Information Source",
                    "source": "Knowledge Base",
                    "link": "",
                    "year": str(datetime.now().year)
                })
            else:
                # Try to extract any string content to use as content
                if isinstance(search_results, dict):
                    for key, value in search_results.items():
                        if isinstance(value, str) and len(value) > 100:
                            content_text = value
                            break
                elif isinstance(search_results, str):
                    content_text = search_results
                else:
                    content_text = "Information on the requested topic"
                
                # Create a generic source
                sourceList.append({
                    "title": "Information Source",
                    "source": "Knowledge Base",
                    "link": "",
                    "year": str(datetime.now().year)
                })
                
                await set_state_value("content", content_text)
                
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error processing sources: {e}\n{error_trace}")
        
        # Return a dummy source in case of errors
        sourceList.append({
            "title": "Error processing sources",
            "source": "System",
            "link": "",
            "year": str(datetime.now().year)
        })
    
    # If we still have no sources, create a default source
    if len(sourceList) == 0:
        # Check if we have simulated content already
        topic = await get_state_value("topic") or "this topic"
        
        # Create a more informative default source
        sourceList.append({
            "title": f"Information about {topic}",
            "source": "ArtiCube",
            "link": "",
            "year": "2025"
        })
    
    print(f"Extracted {len(sourceList)} unique, validated sources")
    
    # Store the sources in global state
    await set_state_value("sources", sourceList)
    sources_list = await get_state_value("sources")
    print(f"Stored {len(sourceList)} sources in global state")
    print(f"retrieved sources list after state update: {sources_list}")
    
    # Always return a properly formatted result
    return {
        "result": content_text
    }


# Agents

finder_agent = LlmAgent(
    name="finder_agent",
    model="gemini-2.0-flash-exp",
    description="Agent for fetching true, accurate and comprehensive information for a given query.",
    instruction="""
    You are an expert researcher who finds true and accurate information on any topic from the most trusted and respected sources.
    
    1. Always use the google_search tool to search for true, accurate and comprehensive information on the given topic.
    2. Based on the search results, create a well-structured response that includes:
       a) True, accurate and comprehensive information about the topic from the most trusted sources, organized into logical sections with headings.
       b) At the bottom of your response, ALWAYS include a "References" section with only real, valid references from the sources you actually used for your research.

          For each source you use, format the reference with FOUR clear parts separated by pipes (|) exactly like this:
          
          References:
          Title: Understanding Machine Learning Algorithms | Source: MIT Technology Review | Link: https://www.technologyreview.mit.edu/2023/01/15/machine-learning | Year: 2023
          Title: Introduction to Neural Networks | Source: Stanford University | Link: https://cs.stanford.edu/people/karpathy/convnetjs/ | Year: 2024
          Title: Deep Learning Applications in Healthcare | Source: Nature Medicine Journal | Link: https://www.nature.com/articles/s41591-023-02455-z | Year: 2023
    
    CRITICAL FORMATTING REQUIREMENTS:
    - Your response MUST have two clear sections: the main content and the references
    - The references section MUST start with the heading "References:" on its own line
    - Each reference MUST follow this EXACT format: "Title: [Article Title] | Source: [Website/Author Name] | Link: [Complete URL] | Year: [Publication Year]"
    - Each reference must be on its own line
    - You must include 3 to 5 references in the "References" section
    - All URLs must be real, working URLs from your search results - NEVER use placeholder, example.com, or dummy URLs
    - All references must be from valid and trusted sources actually used in your answer
    - Do NOT include duplicate references (same URL or very similar titles)
    - Ensure each part (Title, Source, Link, Year) is clearly identifiable and separated by " | "
    
    REFERENCE VALIDATION:
    - Title: Must be the actual title of the article/page you found
    - Source: Must be the website name, organization, or author (e.g., "BBC News", "Harvard University", "John Smith")
    - Link: Must be a complete, valid URL starting with http:// or https://
    - Year: Must be the publication year (use current year if not available, format as 4-digit year)
    - Prioritize authoritative sources (academic institutions, government sites, reputable news organizations)
    
    Output the search results into the state. Your output is used by downstream agents, so proper formatting is critical.
    """,
    tools=[google_search],
    output_key="search_results"  # This will store both content and references in state
)

organizer_agent = LlmAgent(
    name="organizer_agent",
    model="gemini-2.0-flash-exp",
    description="Agent that organizes content into a user friendly readable structure.",
    instruction="""
    You are an expert content organizer who structures information for maximum readability and comprehension.
    
    CORE OBJECTIVES:
    1. Transform raw research content into a clear, well-structured format
    2. Maintain factual accuracy while improving readability
    3. Create logical information hierarchy for easy scanning
    4. Ensure content flows naturally from general to specific information
    
    FORMATTING REQUIREMENTS:
    - All section headings must end with a colon (:)
    - Use only these approved characters: letters, numbers, spaces, periods, commas, parentheses, quotation marks, apostrophes, and bullet points (•)
    - FORBIDDEN characters: *, #, _, `, =, -, [], {}, <>, |, \, /
    - Use bullet points (•) for lists, never dashes or asterisks
    - Maintain consistent spacing: single line breaks between paragraphs, double line breaks before new sections
    
    CONTENT STRUCTURE GUIDELINES:
    1. Start with a brief overview or introduction (2-3 sentences)
    2. Organize information into logical sections with descriptive headings
    3. Present information in order of importance (most crucial first)
    4. Use subsections only when necessary for complex topics
    5. End with key takeaways or conclusions if applicable
    
    SECTION HEADING BEST PRACTICES:
    - Use clear, descriptive titles that preview the content
    - Keep headings concise (3-8 words ideal)
    - Use parallel structure for related sections
    - Examples: "Definition and Overview:", "Key Benefits:", "Common Applications:", "Important Considerations:"
    
    CONTENT ORGANIZATION RULES:
    - Group related information together
    - Use bullet points for lists of 3+ items
    - Keep paragraphs focused on single concepts
    - Ensure smooth transitions between sections
    - Remove redundant information while preserving all unique facts
    
    QUALITY STANDARDS:
    - Maintain all factual information from the source content
    - Improve clarity without changing meaning
    - Ensure content is scannable with clear visual hierarchy
    - Make complex information accessible to general audiences
    - Preserve technical accuracy while improving readability
    
    PROHIBITED ACTIONS:
    - Do not add new information not present in the source
    - Do not include personal opinions or commentary
    - Do not change facts, statistics, or specific details
    - Do not remove important technical information
    - Do not create misleading simplifications
    
    OUTPUT VALIDATION:
    Before finalizing, ensure your output:
    • Has clear, descriptive section headings ending with colons
    • Uses only approved formatting characters
    • Maintains all factual content from the source
    • Flows logically from section to section
    • Is easily scannable and readable
    """,
    output_key="organized_content"
)

content_agent = LlmAgent(
    name="sources_agent",
    model="gemini-2.0-flash-exp",
    description="Agent for fetching the content for the given query",
    instruction="""You are an expert at organizing the content for a given topic.
    
    1. Call the 'finder_agent' tool to get search results for that topic.
    2. Call the 'get_fact_sources' function WITHOUT ANY ARGUMENTS. 
       It will automatically access the search_results from the session state.
    3. The 'get_fact_sources' function will return a dictionary with a 'result' value.
    4. Take that 'result' value and call the 'organizer_agent' tool with the value. This 'organizer_agent' will organize the content and stores it in state.
    
    DO NOT modify the content or add any commentary.""",
    tools=[agent_tool.AgentTool(agent=finder_agent), get_fact_sources, agent_tool.AgentTool(agent=organizer_agent)]
)

knowledge_agent = SequentialAgent(
    name="knowledge_agent",
    sub_agents=[content_agent],
    description="An agent to extract the true and accurate knowledge for a given topic."
)


async def get_information(query: str):
    """
    Run the information agent to get a response for a given query
    
    Args:
        query: The user's query string
        
    Returns:
        Dict containing response and sources
    """
    
    try:
        await create_fresh_session()
        # Reset state for this query to ensure clean execution
        print(f"Processing new query: {query}")
        
        # Set the topic in the session state
        await set_state_value("topic", query)
        set_topic = await get_state_value("topic")
        print(f"Successfully set topic in state: {set_topic}")
        
        # Make sure we have a valid session before creating the runner
        print("Ensuring valid session exists before creating runner")
        
        # Create the runner with our sequential agent, using the same session service
        runner = Runner(
            agent=knowledge_agent, 
            app_name=APP_NAME,
            session_service=session_service
        )

        # Create the content object for the runner
        content = types.Content(role='user', parts=[types.Part(text=query)])

        # Process events from the runner
        final_response = None
        sources_list = None
        # extracted_info = None
        content_text = None

        # Run the agent and synchronize state at each step
        try:
            async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=content):
                
                # After each event, refresh our state values
                if event.is_final_response():
                    print("Final response event received")
                    break
                
        except ValueError as ve:
            if "Session not found" in str(ve):
                print("Session error during run_async, falling back to direct tool calls")
                # Skip the agent execution and move to direct tool calls below
            else:
                raise  # Re-raise if it's a different ValueError
            
            # Explicitly fetch state values after each event
            organized_content = await get_state_value('organized_content')
            print(f"seeing organized content: {organized_content}")
            
            # Clean up any remaining special characters that might have been added
            if organized_content:
                final_response = organized_content.replace("#", "").replace("*", "").replace("_", "").replace("`", "")
            else:
                final_response = None
                
            print(f"seeing final response: {final_response}")
            sources_list = await get_state_value('sources')
            content_text = await get_state_value('content')
        
        # Fetch final state values after agent execution complete
        organized_content = await get_state_value('organized_content')
        
        # Clean up any remaining special characters that might have been added
        if organized_content:
            final_response = organized_content.replace("#", "").replace("*", "").replace("_", "").replace("`", "")
        else:
            final_response = None
            
        sources_list = await get_state_value('sources')
        content_text = await get_state_value('content')
        
        # Comprehensive debug output to verify state
        print("\n=== DEBUG: State values after agent execution ===")
        print(f"sources_list: {type(sources_list)} with {len(sources_list) if sources_list else 0} items")
        print(f"content_text: {content_text[:50] if content_text else None}")
        # print(f"extracted_info: {extracted_info[:50] if extracted_info else None}")
        print(f"final_response: {final_response[:50] if final_response else None}")
            
        # If still no response, use fallback options
        print(f"Checking final_response: {final_response}, type: {type(final_response)}")
        if final_response is None or not final_response:
            print("Building fallback response")

            if content_text:
                final_response = f"{content_text}"
                print("Using content as fallback response")
                
            # Last resort: generate a simple response with the query and sources
            else:
                final_response = f"Information about {query}:\n\nI've gathered several sources on this topic, but couldn't generate a complete response. Please check the sources below for detailed information."
                print("Using generic fallback response with sources only")
            
        # Process the sources before returning using our helper functions
        from app.utils.json_helpers import format_sources_list
        
        try:
            formatted_sources = format_sources_list(sources_list)
            print(f"Processed sources: {len(formatted_sources)} sources formatted")
        except Exception as e:
            import traceback
            print(f"Error formatting sources: {e}")
            print(traceback.format_exc())
            formatted_sources = [{
                "title": "Error processing sources",
                "source": "System",
                "link": "",
                "year": "2025"
            }]
        
        # Perform one final state refresh to ensure we have the latest values
        final_response = await get_state_value('organized_content') or final_response
        print(f"final response from the state after agent execution: {final_response}")
        sources_list = await get_state_value('sources') or sources_list
        print(f"final source list from the state after agent execution: {sources_list}")

        
        # Return a clean response with validated data
        return {
            "response": final_response if final_response else f"I searched for information about '{query}' but couldn't generate a complete response. Please try again or rephrase your query.",
            "sources": formatted_sources
        }
                
    except Exception as e:
        import logging
        import traceback
        error_trace = traceback.format_exc()
        logging.error(f"Error running information agent: {str(e)}\n{error_trace}")
        print(f"error while running the app: {e}\n{error_trace}")
        return {
            "response": f"Error: {str(e)}",
            "sources": []
        }
