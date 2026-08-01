/**
 * next-auth configuration
 *
 * SETUP:
 * 1. Install:  npm install next-auth@beta
 * 2. Fill in .env.local with:
 *    - GOOGLE_CLIENT_ID
 *    - GOOGLE_CLIENT_SECRET
 *    - NEXTAUTH_SECRET  (generate: openssl rand -base64 32)
 *    - NEXTAUTH_URL     (e.g. http://localhost:3000)
 * 3. Add authorized redirect URI in Google Cloud Console:
 *    http://localhost:3000/api/auth/callback/google
 */

// ── Uncomment after running: npm install next-auth@beta ──────────────────────
//
// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
//
// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [
//     Google({
//       clientId:     process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   pages: {
//     signIn:  "/auth/login",
//     signOut: "/auth/login",
//     error:   "/auth/login",
//   },
//   callbacks: {
//     async session({ session, token }) {
//       if (session.user && token.sub) {
//         (session.user as typeof session.user & { id: string }).id = token.sub;
//       }
//       return session;
//     },
//     async jwt({ token, account, profile }) {
//       if (account?.provider === "google" && profile) {
//         token.sub = profile.sub ?? token.sub;
//       }
//       return token;
//     },
//   },
// });

export {}; // placeholder export
