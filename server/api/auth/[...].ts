import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import db from '~/server/database/schema'
import bcrypt from 'bcrypt'

// TODO: Replace with a strong secret from environment variables in production
const secret = process.env.NUXT_AUTH_SECRET || 'your-very-secure-secret-fallback-for-dev'

export default NuxtAuthHandler({
  secret: secret,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (!credentials || !credentials.username || !credentials.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          const userRow: any = db.prepare('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = ?').get(credentials.username);

          if (userRow && bcrypt.compareSync(credentials.password, userRow.password_hash)) {
            // Return an object that will be stored in the JWT
            return {
              id: userRow.id,
              username: userRow.username,
              role: userRow.role_name,
              // email: userRow.email, // Add if you have an email field
            }
          }
        } catch (error) {
          console.error('Authorize error:', error);
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user's role to the token right after signin
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id; // Persist user id to token
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user information from the token.
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id; // Make user id available in session
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Optional: customize sign-in page
    // error: '/auth/error', // Optional: customize error page
    // signOut: '/auth/signout' // Optional: customize sign-out page
  },
  session: {
    strategy: 'jwt' // Using JSON Web Tokens for session strategy
  }
})
