import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow specific authorized emails
      const authorizedEmails = process.env.AUTHORIZED_EMAILS?.split(',').map(email => email.trim()) || []
      
      if (user.email && authorizedEmails.includes(user.email)) {
        return true
      }
      
      return false // Deny access for unauthorized emails
    },
    async session({ session }) {
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
})

export { handler as GET, handler as POST }
