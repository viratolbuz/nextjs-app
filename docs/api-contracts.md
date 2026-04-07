# API Contracts & Documentation

## Overview
This document defines the complete API contract for the AdtoRise PMS system. All endpoints follow REST conventions and return standardized response formats.

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {},
  "error": null,
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Something went wrong",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message"
  }
}
```

### Error Codes
| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | No valid authentication token |
| `FORBIDDEN` | Valid token but insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request payload |
| `INTERNAL_ERROR` | Server-side error |
| `DUPLICATE_ENTRY` | Resource already exists |
| `PERMISSION_DENIED` | User lacks required permission |

---

## Authentication

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@adtorise.com",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id", "name", "email", "role", "avatar", "status" },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### POST /api/auth/logout
**Headers:** `Authorization: Bearer <token>`
**Response:** `{ "success": true, "message": "Logged out" }`

### POST /api/auth/refresh
**Request:** `{ "refreshToken": "string" }`
**Response:** `{ "data": { "accessToken": "new-jwt", "refreshToken": "new-refresh" } }`

---

## Users

### GET /api/users
**Query Params:** `page`, `perPage`, `search`, `sortBy`, `filters[role][]`, `filters[status][]`
**Response:** Paginated list of User objects

### GET /api/users/:id
**Response:** Single User object

### POST /api/users
**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "string",
  "phone": "string",
  "status": "Active|Inactive|Pending"
}
```
**Required Permission:** `Create_users`

### PUT /api/users/:id
**Required Permission:** `Edit_users`

### DELETE /api/users/:id
**Required Permission:** `Delete_users`

---

## Projects

### GET /api/projects
**Query Params:** `page`, `perPage`, `search`, `sortBy`, `filters[status][]`, `filters[type][]`, `filters[manager][]`, `filters[country][]`

### GET /api/projects/:id

### POST /api/projects
**Required Permission:** `Create_projects`
```json
{
  "name": "string",
  "client": "string",
  "type": "string",
  "manager": "string",
  "budget": "string",
  "status": "Active|On Hold|Completed",
  "country": "string"
}
```

### PUT /api/projects/:id
**Required Permission:** `Edit_projects`

### DELETE /api/projects/:id
**Required Permission:** `Delete_projects`

---

## Platforms

### GET /api/platforms
### POST /api/platforms — **Required:** `Edit_platforms`
### PUT /api/platforms/:id — **Required:** `Edit_platforms`
### DELETE /api/platforms/:id — **Required:** `Delete_platforms`

---

## Performance Entries

### GET /api/performance
**Query Params:** `page`, `perPage`, `search`, `filterProject`, `filterPlatform`, `filterMonth`, `filterYear`

### POST /api/performance — **Required:** `Create_performance_entries`
### PUT /api/performance/:id — **Required:** `Edit_performance_entries`
### DELETE /api/performance/:id — **Required:** `Delete_performance_entries`
### GET /api/performance/export?format=csv|json — **Required:** `Export_performance_entries`
### POST /api/performance/import — **Required:** `Import_performance_entries`

---

## Roles

### GET /api/roles
### POST /api/roles — **Required:** `Create_roles`
### PUT /api/roles/:id — **Required:** `Edit_roles`
### DELETE /api/roles/:id — **Required:** `Delete_roles`

---

## Reports

### GET /api/reports/team
**Query Params:** `selectedUsers[]`, `sortBy`, `chartView=monthly|quarterly`
**Required Permission:** `Team_spend_report`

### GET /api/reports/platform
**Required Permission:** `Platform_spend_report`

### GET /api/reports/project
**Required Permission:** `Project_spend_report`

---

## Data Models

### User
| Field | Type | Required |
|-------|------|----------|
| id | string (UUID) | auto |
| name | string | ✓ |
| email | string | ✓ |
| role | string | ✓ |
| avatar | string | auto |
| projects | number | auto |
| status | enum(Active,Inactive,Pending) | ✓ |
| lastLogin | string | auto |
| phone | string | |
| department | string | |

### Project
| Field | Type | Required |
|-------|------|----------|
| id | string (UUID) | auto |
| name | string | ✓ |
| client | string | ✓ |
| type | string | ✓ |
| platforms | string[] | |
| manager | string | |
| budget | string | |
| budgetUsed | number | auto |
| status | enum | ✓ |
| spend | string | auto |
| revenue | string | auto |
| leads | number | auto |
| cpl | string | auto |
| roas | string | auto |
| country | string | |
| createdAt | date | auto |
| updatedAt | date | auto |

### Platform
| Field | Type | Required |
|-------|------|----------|
| id | string | auto |
| name | string | ✓ |
| icon | string | auto |
| channels | string[] | |
| status | enum(Connected,Disconnected,Expiring) | ✓ |
| projects | number | auto |
| spendMTD | string | auto |
| avgROAS | string | auto |

### Role
| Field | Type | Required |
|-------|------|----------|
| id | string | auto |
| name | string | ✓ |
| type | enum(System,Custom) | ✓ |
| userCount | number | auto |
| permissions | Record<string, Full\|View\|None> | ✓ |

---

## Role-Permission Schema

### Available Permissions
| Module | Permissions |
|--------|------------|
| Dashboard | View_dashboard, Manage_dashboard |
| Users | View_users, Create_users, Edit_users, Delete_users |
| Roles | View_roles, Create_roles, Edit_roles, Delete_roles |
| Projects | View_projects, Create_projects, Edit_projects, Delete_projects |
| Platforms | View_platforms, Edit_platforms, Delete_platforms |
| Performance | View_performance_entries, Create_performance_entries, Edit_performance_entries, Delete_performance_entries, Export_performance_entries, Import_performance_entries |
| Reports | Team_spend, Spend_chart, Spend_chart_report, Platform_spend_report, Monthly_spend, Quarterly_spend, Quarterly_spend_report, Project_spend_report, Team_spend_report, View_reports, View_email_histories |

### Default Roles
| Role | Access Level |
|------|-------------|
| **Super Admin** | Full access to everything |
| **Admin** | Full access to everything |
| **Manager** | Full CRUD on Users/Projects, View Dashboard/Platforms |
| **Client** | View only Dashboard and Platforms |
| **User** | View Dashboard, View Performance, View Charts |
