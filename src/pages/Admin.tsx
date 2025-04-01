import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ADMIN_EMAIL = 'sadmansdk@gmail.com';
const ADMIN_PASSWORD = 'sadmansdk';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

export default function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as BlogPost[];
      setPosts(fetchedPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts.',
        variant: 'destructive',
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: 'Success',
        description: 'Welcome to the admin dashboard.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Invalid admin credentials.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (editingPost) {
        const postData = {
          title,
          content,
          imageUrl: imageUrl.trim() || null,
        };
        console.log('Updating post with data:', postData);
        await updateDoc(doc(db, 'posts', editingPost.id), postData);
        toast({
          title: 'Success',
          description: 'Blog post updated successfully.',
        });
      } else {
        const postData = {
          title,
          content,
          imageUrl: imageUrl.trim() || null,
          createdAt: new Date(),
        };
        console.log('Creating new post with data:', postData);
        await addDoc(collection(db, 'posts'), postData);
        toast({
          title: 'Success',
          description: 'Blog post created successfully.',
        });
      }

      setTitle('');
      setContent('');
      setImageUrl('');
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: 'Failed to save blog post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully.',
      });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.imageUrl || '');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="relative block w-full"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="relative block w-full"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>
        <Button
          variant="outline"
          onClick={() => {
            setIsAuthenticated(false);
            setEmail('');
            setPassword('');
            navigate('/');
          }}
        >
          Logout
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog post title"
            required
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
            Image URL (Optional)
          </label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            You can use any image hosting service like ImgBB, Imgur, or Cloudinary
          </p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog post content here..."
            className="min-h-[300px]"
            required
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {editingPost ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingPost ? 'Update Post' : 'Create Post'
            )}
          </Button>
          {editingPost && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingPost(null);
                setTitle('');
                setContent('');
                setImageUrl('');
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">All Blog Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              {post.imageUrl && (
                <div className="h-32 overflow-hidden rounded-t-lg">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="text-xs">
                  {post.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 