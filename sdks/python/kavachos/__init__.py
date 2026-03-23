"""KavachOS Python SDK.

Auth OS for AI agents and humans. Wraps the KavachOS REST API with a clean,
typed Python interface.

Quickstart (async)::

    import asyncio
    from kavachos import KavachClient
    from kavachos.types import CreateAgentInput
    from kavachos.permissions import read

    async def main():
        async with KavachClient(
            base_url="https://your-app.com/api/kavach",
            token="kv_...",
        ) as client:
            agent = await client.agents.create(
                CreateAgentInput(
                    owner_id="user-123",
                    name="github-reader",
                    type="autonomous",
                    permissions=[read("mcp:github:*")],
                )
            )
            print(agent.id)

    asyncio.run(main())

Quickstart (sync)::

    from kavachos import KavachSyncClient
    from kavachos.types import CreateAgentInput
    from kavachos.permissions import read

    with KavachSyncClient(
        base_url="https://your-app.com/api/kavach",
        token="kv_...",
    ) as client:
        agent = client.agents.create(
            CreateAgentInput(
                owner_id="user-123",
                name="github-reader",
                type="autonomous",
                permissions=[read("mcp:github:*")],
            )
        )
        print(agent.id)
"""

from kavachos.client import KavachClient, KavachSyncClient
from kavachos.errors import (
    AuthenticationError,
    KavachError,
    NetworkError,
    NotFoundError,
    PermissionError,
    RateLimitError,
    ServerError,
)
from kavachos.types import (
    Agent,
    AgentFilters,
    AuditEntry,
    AuditFilters,
    AuthorizeRequest,
    AuthorizeResult,
    AuthResponse,
    CreateAgentInput,
    DelegateInput,
    DelegationChain,
    ExportOptions,
    McpServer,
    Permission,
    PermissionConstraints,
    RegisterMcpServerInput,
    Session,
    UpdateAgentInput,
    User,
)

__all__ = [
    # Clients
    "KavachClient",
    "KavachSyncClient",
    # Errors
    "KavachError",
    "AuthenticationError",
    "PermissionError",
    "NotFoundError",
    "RateLimitError",
    "ServerError",
    "NetworkError",
    # Types
    "Agent",
    "AgentFilters",
    "AuditEntry",
    "AuditFilters",
    "AuthorizeRequest",
    "AuthorizeResult",
    "AuthResponse",
    "CreateAgentInput",
    "DelegateInput",
    "DelegationChain",
    "ExportOptions",
    "McpServer",
    "Permission",
    "PermissionConstraints",
    "RegisterMcpServerInput",
    "Session",
    "UpdateAgentInput",
    "User",
]

__version__ = "0.1.0"
