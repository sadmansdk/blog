import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ImageIcon } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        const fetchedPosts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Post data from Firestore:', data);
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as BlogPost;
        });
        console.log('All fetched posts:', fetchedPosts);
        setPosts(fetchedPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch blog posts.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section with Signup */}
      <section className="text-center py-20 bg-card rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Blog</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Join our community and start sharing your thoughts with the world.
        </p>
        <div className="space-x-4">
          <Link to="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Latest Posts</h2>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="relative group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(post)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="relative h-48 overflow-hidden">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Image failed to load in card:', post.imageUrl);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {post.createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link to={`/blog/${post.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Read more
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 