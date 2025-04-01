import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ImageIcon } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const { toast } = useToast();

  // Test image URL
  const testImageUrl = 'https://picsum.photos/800/400';

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        console.log('No ID provided');
        return;
      }

      try {
        console.log('Fetching post with ID:', id);
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const rawData = docSnap.data();
          console.log('Raw data from Firestore:', rawData);
          
          const postData = {
            id: docSnap.id,
            ...rawData,
            createdAt: rawData.createdAt?.toDate(),
            // Use test image URL if no image URL is provided
            imageUrl: rawData.imageUrl || testImageUrl,
          } as BlogPost;
          
          console.log('Processed post data:', postData);
          setPost(postData);
        } else {
          console.log('No post found with ID:', id);
          toast({
            title: 'Error',
            description: 'Blog post not found.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load blog post.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <img
            src={post.imageUrl}
            alt={post.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => {
              console.log('Image loaded successfully');
              setImageLoading(false);
            }}
            onError={(e) => {
              console.error('Image failed to load:', e);
              console.error('Failed image URL:', post.imageUrl);
              setImageLoading(false);
              toast({
                title: 'Error',
                description: 'Failed to load image.',
                variant: 'destructive',
              });
            }}
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-muted-foreground">
            {post.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
} 