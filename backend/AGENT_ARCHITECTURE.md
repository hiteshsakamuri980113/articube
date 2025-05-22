# ArtiCube Agent Architecture

## Architecture Overview

ArtiCube uses Google's Agent Development Kit (ADK) to create a knowledge retrieval system that can search for, analyze, and present information to users. The architecture follows Google ADK best practices for agent chaining and tool usage.

## Architecture Improvements

The agent system was refactored to address several issues:

1. Google ADK built-in tool limitations (only one per agent)
2. Agent chaining and communication issues
3. Asynchronous execution patterns
4. Error handling and recovery
5. Session state management

## Agent Components

### Information Retrieval Agent

The main sequential agent that orchestrates the information retrieval process:

1. **Search Agent**: Uses Google Search to find relevant information

   - Implements the built-in `google_search` tool
   - Returns search results to the pipeline

2. **Source Processing Agent**: Extracts and formats sources from search results

   - Processes search results into a standardized format for sources
   - Ensures each source has title, link, and snippet

3. **Extraction Agent**: Extracts and synthesizes information from sources

   - Takes sources and extracts relevant content
   - Organizes information into a coherent structure

4. **Formatting Agent**: Creates a well-structured, readable response
   - Takes extracted information and formats it into a user-friendly response
   - Adds appropriate citations and structure

## Technical Implementation

### File Structure

- `info_agent_new.py`: New implementation based on ADK best practices
- `agent_router_new.py`: Updated API router using the new implementation
- `test_agent.py`: Test script to verify the agent functionality
- `switch_implementation.sh`: Script to switch between implementations

### Async Pattern

The implementation uses proper async/await patterns:

```python
async def run(self, query: str, user_id: str = USER_ID, session_id: str = SESSION_ID) -> Dict[str, Any]:
    # Set state values
    await set_state_value("topic", query, user_id=user_id, session_id=session_id)

    # Run the agent asynchronously
    async for event in self.runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        # Process events
```

### Error Handling

Improved error handling with proper logging and graceful degradation:

```python
try:
    # Agent operation
except Exception as e:
    logging.error(f"Error: {str(e)}")
    # Fallback behavior
```

### Session State Management

Better session state management with recovery mechanisms:

```python
async def set_state_value(key: str, value: Any, app_name: str = APP_NAME,
                       user_id: str = USER_ID, session_id: str = SESSION_ID):
    try:
        current_session = session_service.get_session(...)
        current_session.state[key] = value
    except Exception as e:
        # Try to create session if it doesn't exist
        session_service.create_session(...)
```

## Running The Application

1. Install dependencies:

```
pip install -r requirements.txt
```

2. Run the application:

```
uvicorn main:app --reload
```

3. Test the agent directly:

```
python test_agent.py
```

## Switching Implementations

Use the provided script to switch between implementations:

```bash
# Switch to the new implementation
./switch_implementation.sh new

# Switch back to the original implementation
./switch_implementation.sh original
```

## Troubleshooting

If you encounter issues with Google ADK:

1. Check your API key and environment variables
2. Ensure you're properly handling asynchronous operations
3. Verify that built-in tools are only used in one agent per chain
4. Check session state for proper key/value pairs

## Known Limitations

- Google ADK restricts built-in tools like `google_search` to one per agent chain
- Session state must be properly managed between agent transitions
- The agent may have limitations in handling complex multi-step reasoning tasks
