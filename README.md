Gym Review API

The application allows users to browse places publicly and create place/reviews when authenticated.  
Our project focuses on:

- REST API development
- Authentication and authorization
- Unit and integration testing
- CI/CD using GitHub Actions
- Security best practices

---

Setup

How to clone the Repository:

bash
git clone https://github.com/MiniMinaa/gym-review-api.git
cd gym-review-api

---

Install Dependencies

Backend:

bash
cd backend
npm install

Frontend:

bash
cd client
npm install

---

Configure Environment Variables

We created a .env file inside the backend folder.

PORT=4000
AUTH0_AUDIENCE=
AUTH0_ISSUER_BASE_URL=
CLIENT_ORIGIN=http://localhost:5173
Our project also includes a `.env.example` file that shows all required environment variables without exposing any sensitive values.

# PORT=4000
# AUTH0_AUDIENCE=
# AUTH0_ISSUER_BASE_URL=
# CLIENT_ORIGIN=http://localhost:5173

---

Run the Project Locally

Start Backend:

bash
cd backend
npm run dev

Backend runs on:
bash
http://localhost:4000

---

Start Frontend:

bash
cd frontend
npm run dev

Frontend runs on:

bash
http://localhost:5173

---

Testing

Our project includes both unit tests and integration tests using Vitest.

Run all tests:

cd backend
bash
npm test

---

Unit Tests

The unit tests verify frontend and UI logic in isolation without real network calls.

Examples of tested functionality:

- Shows “not logged in” message when no user exists
- Displays the user name when authenticated
- Hides protected forms when logged out
- Displays gyms correctly
- Shows an error message when no gyms exist

---

Integration Tests

Integration tests verify how multiple parts of the application work together.

- `GET /places` returns 200
- `GET /places/:id` returns 404 for an unknown ID
- `POST /places` returns 201 (no auth required)
- `POST /gyms` without a token returns 401
- `POST /gyms/:id:reviews` wihout a token returns 401
- `GET /profile` without a token returns 401

Screenshot of Passing Local Tests:
![image alt](https://github.com/MiniMinaa/gym-review-api/blob/main/bild%20(2).png?raw=true)



Screenshot of Passing GitHub Actions Pipeline:


![image alt](https://github.com/MiniMinaa/gym-review-api/blob/main/bild.png?raw=true)
![image alt](https://github.com/MiniMinaa/gym-review-api/blob/main/bild%20(1).png?raw=true)


---

Authentication

We use Auth0 for authentication with the express-oauth2-jwt-bearer library. This implements stateless JWT validation — the frontend obtains a Bearer token via Auth0's SDK (getAccessTokenSilently) and sends it in the Authorization header. 

The backend verifies the token's RS256 signature against Auth0's public JWKS on every request. No server-side session is maintained. 

Routes protected by the requireAuth middleware are:
- GET /profile
- POST /profile 
- POST /gyms
- POST /gyms/:id/reviews.

Unauthenticated requests are rejected with a 401 Unauthorized response by the middleware. 

---

Frontend Authentication Features

The frontend includes:

- Login button
- Logout button
- Protected forms hidden when logged out
- Conditional rendering based on authentication state

Authenticated users can:

- Create gyms
- Add reviews
- Access profile information

Unauthenticated users can only access public routes.

---

Security Decisions

 No API keys, Auth0 secrets and credentials should be committed to GitHub.

Our sensitive values are stored in:
- `.env`
- GitHub Secrets

Why? Keeping secrets outside the codebase prevents accidental leaks and protects authentication credentials from unauthorized access.

---

Environment Variables

Sensitive Auth0 configuration values are loaded through environment variables.

AUTH0_AUDIENCE=
AUTH0_ISSUER_BASE_URL=
CLIENT_ORIGIN=

Why? Environment variables separate sensitive configuration from source code and make deployment safer across environments.

---

Protected Routes Return 401

Protected routes use a custom requireAuth middleware built with auth() from express-oauth2-jwt-bearer. When a request arrives without a token or with an invalid token, the library rejects it with:
401 Unauthorized

Why? Returning 401 is the correct REST API behavior - APIs should respond with status codes rather than redirecting users to login pages. 

---

Restricted CORS Policy

CORS is configured to only allow the frontend origin, read from the CLIENT_ORIGIN environment variable: 
origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173"


The API does not allow wildcard origins such as "*":

Why? Restricting CORS prevents unauthorized websites from sending requests to the backend and reduces cross-origin attack risks.

---

Tokens are not stored in localStorage.

The frontend uses Auth0’s React SDK (@auth/auth0-react), which stores tokens in memory by default. No token is ever written to localStorage.

Why? localStorage is accessible to any JavaScript on the page, making it vulnerable to XSS attacks. Keeping tokens in memory limits that exposure. 

---

Authenticated frontend requests use "credentials: ‘include’”
All authenticated fetch calls include "credentials: ‘include’”

Why? The backend CORS configuration sets “credentials: true”, which requires the client to explicitly opt in. Without “credentials: ‘include’”, the browser will block the response even when a valid token is present. 

---

Reflections

Implementation, our group chose:

- Express, for the backend because it is lightweight and easy to structure for REST APIs
- Vitest, because it integrates well with Vite and provides fast test execution
- Auth0, because it simplifies secure token-based login systems and easiest to use for us
-GitHub Actions for CI/CD because it automatically verifies code quality on every push

We also chose to use a simple in-memory data structure instead of a database because the focus of the assignment was testing and authentication rather than database design.

---

Challenges

Some of the biggest challenges included:

- Correctly testing protected routes
- Configuring GitHub Actions secrets
- Managing secure frontend/backend communication
- Handling authentication state in the frontend
- Protect vulnerable information in repository

Testing authenticated routes was especially difficult because both the frontend and backend needed to work together correctly.

—

What We Would Improve

If we had more time, we would:

- Add a real database such as PostgreSQL or MongoDB
- Add rate limiting and additional security middleware

---

Group Members:

- Lo Streit
- Mina Rostami
- Rut Wintzell
