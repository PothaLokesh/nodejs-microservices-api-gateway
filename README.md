# Node.js Microservices Assignment

This project demonstrates a basic microservices architecture with two distinct services:
1.  **Access Control Service (API Gateway)**
2.  **Business Logic Service**

## Task Overview
The goal is to build a system where the **Business Logic Service** dynamically registers its routes with the **Access Control Service** (Gateway) upon startup. The Gateway acts as the single entry point, handling authentication and proxying requests.

## Architectural Requirements

### 1. Access Control Service (Gateway)
-   **Role**: Single entry point for all client requests.
-   **Dynamic Registration**: Exposes a `/register` endpoint for other services to register their routes.
-   **Proxying**: Proxies incoming requests to the registered downstream service.
-   **Security**: Validates JSON Web Tokens (JWT) for all requests (except login/registration).
    -   Invalid token -> `403 Forbidden` / `401 Unauthorized`
    -   Login endpoint is accessible without JWT.
-   **Handling Unknown Routes**: Returns `404 Not Found` for any route that is not explicitly registered.

### 2. Business Logic Service
-   **Role**: Contains core business logic and data.
-   **Dynamic Registration**: On startup, it sends a POST request to the Gateway to register its routes (Path, Method, Target URL).
-   **Functionality**:
    -   **CRUD APIs**: Managing `items` (Create, Read, Update, Delete).
    -   **Login**: Generates a JWT for testing (`POST /login`).
-   **Database**: Uses `sqlite3` (in-memory) for data persistence.

## Implementation Details

### Services Communication
-   **Access Control Service**: Runs on Port **3000**
-   **Business Logic Service**: Runs on Port **3001**

### Route Registration Flow
1.  Business Service starts up.
2.  It sends a `POST` request to `http://localhost:3000/register`.
3.  Payload example:
    ```json
    [
      { "path": "/items", "method": "GET", "target": "http://localhost:3001" },
      { "path": "/items", "method": "POST", "target": "http://localhost:3001" }
    ]
    ```

### Authentication
-   Library: `jsonwebtoken`
-   Token passing: `Authorization: Bearer <token>`

## Setup and Testing

### Prerequisites
-   Node.js installed.

### Installation
1.  **Install Gateway Dependencies**:
    ```bash
    cd gateway
    npm install
    ```
2.  **Install Business Service Dependencies**:
    ```bash
    cd business
    npm install
    ```

### Running the Project
You need two terminal windows:

**Terminal 1 (Gateway)**:
```bash
cd gateway
npm start
# Output: Access Control Service running on port 3000
```

**Terminal 2 (Business Logic)**:
```bash
cd business
npm start
# Output: Business Logic Service running on port 3001
# Output: Routes registered successfully
```

### Testing with Postman
A Postman collection is included in the `postman` folder.

1.  **Login**:
    -   Method: `POST`
    -   URL: `http://localhost:3000/login`
    -   Body: `{}` (Empty JSON)
    -   **Result**: Returns a JWT token.

2.  **Authenticated Requests**:
    -   Use the returned token in the headers for subsequent requests:
    -   `Authorization: Bearer <YOUR_TOKEN>`
    -   **Create Item**: `POST http://localhost:3000/items`
    -   **Get Items**: `GET http://localhost:3000/items`

3.  **Unauthenticated Test**:
    -   Try accessing `/items` without a header.
    -   **Result**: `401/403` Error.

4.  **Unregistered Route Test**:
    -   Try accessing `/random-route`.
    -   **Result**: `404 Route not registered`.
