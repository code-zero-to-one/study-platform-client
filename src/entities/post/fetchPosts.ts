interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export async function fetchPosts(): Promise<Post[]> {
  const resposnse = await fetch('https://jsonplaceholder.typicode.com/posts');

  return resposnse.json();
}
