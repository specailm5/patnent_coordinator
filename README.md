# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

---

## Application Features

This application includes a patient coordination system with role-based access control.

### Authentication System

The application uses an email/password-based authentication system provided by `@sidebase/nuxt-auth` (which wraps NextAuth.js).

*   **Logging In:** To log in, navigate to the `/login` page and enter your credentials.
*   **User Roles:** The system defines several user roles with varying permission levels:
    *   **Admin:** Has full control over the application, including user management, all data operations, and system settings (like backups).
    *   **Manager:** Can manage most data (e.g., staff, tracking information) and may have some oversight capabilities. Cannot manage users.
    *   **Coordinator:** The primary operational role, responsible for managing patient tracking, staff assignments, and related data.
    *   **Intern:** Typically has read-only access or limited write access to specific areas, assisting Coordinators or Managers.

### User Management (For Admins)

Administrators have access to a user management interface to control user accounts and roles.

*   **Accessing User Management:**
    1.  Log in with an Admin account.
    2.  A "User Management" link will appear in the navigation (both desktop and mobile). Click this link to go to `/admin/users`.
*   **Functionality:**
    *   **View Users:** A table displays all registered users, showing their username and assigned role.
    *   **Create Users:** Admins can add new users by providing a username, a temporary password, and assigning a role from a dropdown list.
    *   **Edit Users:** Admins can modify an existing user's username and change their assigned role. (Password changes are not part of this interface; users would typically use a "forgot password" flow if implemented, or an admin might reset it via a different mechanism if needed).
    *   **Delete Users:** Admins can delete users. Safeguards are in place to prevent an Admin from deleting their own account or deleting the last remaining Admin account.

### API Endpoints (For Developers)

The following are key API endpoints related to authentication and user management:

*   **Authentication:**
    *   `POST /api/auth/register`: Creates a new user. (Public, but intended for initial setup or specific flows, not general self-registration unless enabled).
    *   `POST /api/auth/callback/credentials`: Handles credential-based login. Used by the `signIn` function.
    *   `GET /api/auth/session`: Retrieves the current user's session data.
    *   `POST /api/auth/signout`: Logs out the current user.
    *   `GET /api/auth/csrf`: Provides a CSRF token, often used by `next-auth` for POST requests.
*   **User & Role Management (Admin Only):**
    *   `GET /api/admin/users`: Lists all users (id, username, role_name). Requires 'Admin' role.
    *   `POST /api/admin/users`: Creates a new user. Requires 'Admin' role.
    *   `PUT /api/admin/users/{id}`: Updates user's username and/or role. Requires 'Admin' role.
    *   `DELETE /api/admin/users/{id}`: Deletes a user. Requires 'Admin' role.
    *   `GET /api/roles`: Lists all available roles (id, name). Requires 'Admin' or 'Manager' role.
*   **Other Protected Endpoints (Examples):**
    *   `/api/staff` (POST, PUT, DELETE): Generally restricted to 'Admin', 'Manager'.
    *   `/api/backups` (All operations): Generally restricted to 'Admin'.

Access control for other data-related API endpoints (patients, coordinators, tracking, etc.) is also in place, typically allowing 'Admin' and 'Manager' full access, with 'Coordinator' having operational access.

### Configuration

*   **`NUXT_AUTH_SECRET`**: For production, ensure this environment variable is set to a strong, unique secret string. This is used by `next-auth` to sign JWTs and other sensitive information. A fallback secret is generated for development if this is not set, but it should **always** be set in production for security. Example: `NUXT_AUTH_SECRET=your_very_strong_random_secret_string_here`

---
