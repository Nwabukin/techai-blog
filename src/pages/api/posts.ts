import type { APIRoute } from 'astro';
import { loadPosts, generatePostHtml } from '../../utils/postLoader';

export const GET: APIRoute = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const category = url.searchParams.get('category') || undefined;
  const tag = url.searchParams.get('tag') || undefined;

  try {
    const { posts, hasMore } = await loadPosts({
      page,
      limit: 9,
      category,
      tag,
    });

    const html = posts.map((post) => generatePostHtml(post)).join('');

    return new Response(
      JSON.stringify({
        html,
        hasMore,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error loading posts' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
