// route handler with secret and slug
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getProductBySlug } from '../../../utils/getProducts'
import { cookies } from 'next/headers'

export async function GET(request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const model = searchParams.get('model')
  // Check the secret and next parameters
  // This secret should only be known to this route handler and the CMS
  if (secret !== process.env.HYGRAPH_PREVIEW_SECRET || !slug) {
    return new Response('Invalid token', { status: 401 })
  }
 
  // Fetch the headless CMS to check if the provided `slug` exists
  // getPostBySlug would implement the required fetching logic to the headless CMS
  const post = await getProductBySlug(slug)
  
  // If the slug doesn't exist prevent draft mode from being enabled
  if (!post) {
    return new Response('Invalid slug', { status: 401 })
  }
 
  // Enable Draft Mode by setting the cookie
  // Need to replace when Next figures out enableDraft()
 
  draftMode().enable();

  const cookieStore = cookies()
  const cookie = cookieStore.get('__prerender_bypass')
  cookies().set({
    name: '__prerender_bypass',
    value: cookie?.value,
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'none'
  })

  // Redirect to the path from the fetched post
  // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
  redirect(`/${model}/${post.productSlug}`)

  
}
