from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.tools import google_search, agent_tool
from google.adk.models.lite_llm import LiteLlm
from google.adk.sessions import InMemorySessionService
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.genai import types
from app.utils.content_processor import process_content
from typing import Dict, Any, List, Optional, Union

load_dotenv()

# Global state for testing and development
APP_NAME = "hitesh-01"
USER_ID = "hitesh-001"
SESSION_ID = "hitesh-0001"

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
        _session = session_service.create_session(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=SESSION_ID,
            state=dict(_global_state)  # Use a copy to avoid mutation issues
        )
        print("Fresh session created successfully")
        return None
    except Exception as e:
        print(f"Error creating fresh session: {e}")
        return None

# Ensure session is created or recreated when needed
async def get_global_session():
    """Get or recreate the global session if needed"""
    session = session_service.sessions[APP_NAME][USER_ID][SESSION_ID]

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
    Process search results into formatted sources
    
    This function accesses the search_results directly from the session state,
    extracts APA citations and formats them as sources.
    
    Returns:
        Dictionary with "result" key containing formatted sources list
    """
    
    # Get search_results from session state
    search_results = await get_state_value("search_results")
    
    print(f"Processing search_results from state: {search_results}")
    
    sourceList = []
    content_text = ""
    
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
            
            # Convert references to source list format
            for ref in result["references"]:
                # Make sure we have valid data
                title = ref.get("title", "") or "Referenced Source"
                link = ref.get("link", "") 
                citation = ref.get("citation", "") or f"{title}"
                author = ref.get("author", "") or "Source"
                
                sourceList.append({
                    "title": title,
                    "link": link,
                    "snippet": f"{author} - {citation[:300]}",
                    "citation": citation
                })
            print(f"sources list after everything: {sourceList}")


                
            # If no references were extracted but we found URLs in the content, create sources from them
            if not sourceList and content_text:
                import re
                # Extract URLs from the content
                urls = re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[/\w\.-]*', content_text)
                
                if urls:
                    for i, url in enumerate(urls[:3], 1):
                        domain = url.split("//")[-1].split("/")[0]
                        sourceList.append({
                            "title": f"Source {i} - {domain}",
                            "link": url,
                            "snippet": f"Reference extracted from content - {domain}",
                            "citation": f"{domain}. (2025). Referenced content. Retrieved from {url}"
                        })
                else:
                    # No references found but we have content, create a generic source
                    sourceList.append({
                        "title": "Information Source",
                        "link": "",
                        "snippet": "Generated content without specific references",
                        "citation": "Generated content"
                    })
                
        elif isinstance(search_results, dict) and "organic_results" in search_results:
            # Case: Direct search results from google_search tool
            content_text = "Information compiled from multiple sources"
            await set_state_value("content", content_text)
            
            for result in search_results["organic_results"][:5]:
                title = result.get("title", "")
                link = result.get("link", "")
                snippet = result.get("snippet", "")
                
                # Generate an APA-style citation
                from datetime import datetime
                year = datetime.now().year
                domain = link.split("//")[-1].split("/")[0] if link else "Unknown Source"
                
                citation = f"{domain}. ({year}). {title}. Retrieved from {link}"
                
                sourceList.append({
                    "title": title,
                    "link": link,
                    "snippet": snippet,
                    "citation": citation
                })
        
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
                    "link": "",
                    "snippet": "Generated content based on available information",
                    "citation": "Generated content"
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
                    "link": "",
                    "snippet": "Generated content based on search results",
                    "citation": "Generated content"
                })
                
                await set_state_value("content", content_text)
                
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error processing sources: {e}\n{error_trace}")
        
        # Return a dummy source in case of errors
        sourceList.append({
            "title": "Error processing sources",
            "link": "",
            "snippet": f"An error occurred while processing the search results: {str(e)}",
            "citation": "Error in processing"
        })
    
    # If we still have no sources, create a default source
    if len(sourceList) == 0:
        # Check if we have simulated content already
        topic = await get_state_value("topic") or "this topic"
        
        # Create a more informative default source
        sourceList.append({
            "title": f"Information about {topic}",
            "link": "",
            "snippet": f"This content was generated based on general knowledge about {topic}.",
            "citation": f"ArtiCube. (2025). Information about {topic}."
        })
    
    print(f"Extracted {len(sourceList)} sources")
    
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
    model="gemini-2.0-flash",
    description="Agent for fetching true, accurate and comprehensive information for a given query.",
    instruction="""
    You are an expert researcher who finds true and accurate information on any topic from the most trusted sources.
    
    1. Always use the google_search tool to search for true, accurate and comprehensive information on the given topic.
    2. Based on the search results, create a well-structured response that includes:
       a) True, accurate and comprehensive information about the topic from the most trusted sources, organized into logical sections with headings.
       b) At the bottom of your response, ALWAYS include a "References" section with only real, valid references from the sources you actually used.

          For each source you use, format the reference in APA format exactly like shown in the below example:
          
          References:
          Smith, J. (2023). Title of the article. Website Name. https://www.example.com
          Johnson, A. (2022). Title of another article. Another Website. https://www.anothersite.com
    
    IMPORTANT FORMATTING REQUIREMENTS:
    - Your response MUST have two clear sections: the main content and the references
    - The references section MUST start with the heading "References:"
    - Each reference MUST follow the above mentioned format. They must be in APA format with author/site name, year, title, and URL.
    - You must include 3 to 5 references in the "References" section. 
    - All the references under "References" section must be from a valid and trusted source actually used in your answer. Do NOT include any dummy, placeholder, or fabricated references.
    
    Output the search results into the state. Your output is used by downstream agents, so proper formatting is critical.
    """,
    tools=[google_search],
    output_key="search_results"  # This will store both content and references in state
)

organizer_agent = LlmAgent(
    name="organizer_agent",
    model="gemini-2.0-flash",
    description="Agent that organizes content into a user friendly readable structure.",
    instruction="""
    Organize and format the provided content in a user friendly, clear, and readable way.

    - All section headings must end with a colon (:)
    - Do not use any special characters such as *, #, _, `, =, or - anywhere in the output (except for the bullet character •).
    - Do not add any new information or commentary
    — Only organize and format what is given.
    - Use your best judgment for structure, spacing, and readability.
    """,
    output_key="organized_content"
)

content_agent = LlmAgent(
    name="sources_agent",
    model="gemini-2.0-flash",
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
                "link": "",
                "snippet": f"Error: {str(e)}",
                "citation": "Error in processing"
            }]
                
        # Process sources to ensure they have all required fields
        for source in formatted_sources:
            if "citation" not in source:
                # Generate a citation if missing
                title = source.get("title", "")
                link = source.get("link", "")
                if link:
                    from datetime import datetime
                    year = datetime.now().year
                    domain = link.split("//")[-1].split("/")[0] if link else "Unknown Source"
                    source["citation"] = f"{domain}. ({year}). {title}. Retrieved from {link}"
                else:
                    source["citation"] = f"{title}"
        
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
