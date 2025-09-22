# API Documentation

This directory contains the generated OpenAPI specification for the Manarah School Management API.

## Quick Start

### Generate OpenAPI Specification

```bash
pnpm docs:generate
```

This will generate the `openapi.json` file containing the complete API specification.

### Serve Documentation with Redoc

```bash
pnpm docs:serve
```

This will start a local server at `http://localhost:8080` displaying the interactive API documentation using Redoc UI.

## Files

- `openapi.json` - Generated OpenAPI 3.0 specification
- `README.md` - This documentation file

## API Features

### Authentication

- JWT Bearer token authentication
- Session-based authentication via cookies
- Organization-scoped access control

### User Management Endpoints

- User CRUD operations
- Parent-student relationship management
- Teacher assignment management
- Type-based user filtering

### OpenAPI Features

- Complete request/response schemas
- Interactive API explorer
- Authentication requirements
- Error response documentation
- Parameter validation specs

## Development

The API documentation is automatically generated from the ORPC router definitions with OpenAPI metadata. To add new endpoints to the documentation:

1. Define the endpoint in the appropriate router
2. Add OpenAPI metadata using the `.meta()` method
3. Regenerate the specification with `pnpm docs:generate`

Example:

```typescript
.meta({
  openapi: {
    method: "GET",
    path: "/management/users/{userId}",
    tags: ["User Management"],
    summary: "Get user by ID",
    description: "Retrieves user details with relationships and assignments",
  },
})
```
