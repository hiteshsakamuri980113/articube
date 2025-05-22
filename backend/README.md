# ArtiCube Knowledge Retrieval System

ArtiCube is a knowledge retrieval system that uses advanced AI agents to search for accurate information and provide well-formatted responses with proper citations.

## Environment Setup

1. Create a `.env` file in the backend directory based on the provided `.env.example`
2. Set up your API keys and configuration values in the `.env` file
3. Never commit your actual API keys to the repository

```bash
# Copy the example env file
cp .env.example .env

# Edit with your actual settings
nano .env  # or use your preferred editor
```

## Issue Resolution

The system had several issues that have been fixed:

1. **State Management**: Enhanced global state management to reliably track information across agents
2. **Search Results**: Added direct search functionality to ensure search results are always available
3. **Formatter Agent**: Fixed the formatter_agent to correctly invoke its processing tool
4. **API Router Paths**: Corrected API router paths from `/apicontent` to `/api/content`
5. **Error Handling**: Added comprehensive error handling and fallback options

## Running Tests

There are several test scripts available:

### 1. Test Agent Function Directly

Tests the agent function without using the API:

```bash
python test_api_call.py
```

### 2. Complete End-to-End Test

Tests the entire system including API server, user registration, authentication, and API calls:

```bash
python test_complete.py
```

### 3. Start the API Server

To run the API server manually:

```bash
python main.py
```

## Troubleshooting

If you encounter empty global state values:

1. Make sure you're using `info_agent_fixed.py` implementation
2. Check that the content router path in `main.py` is `/api/content`
3. Try running the `test_complete.py` script to verify all components

## State Dictionary Structure

The global state dictionary contains:

- `topic`: The user's query topic
- `content`: Processed content from search results
- `formatted_response`: The final formatted response
- `extracted_info`: Additional extracted information
- `search_results`: Raw search results
- `sources`: List of source objects with titles, links and citations

## API Endpoints

- **Agent API**: `/api/agent/query` - Get information on a topic
- **Content API**: `/api/content` - Manage saved content
- **User API**: `/api/users` - User management endpoints

## Contributors

- Hitesh Sakamuri
