import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: string;
}

const Blog = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!id) return;
        const postDoc = await getDoc(doc(db, 'posts', id));
        if (postDoc.exists()) {
          setPost({
            id: postDoc.id,
            ...postDoc.data(),
            createdAt: postDoc.data().createdAt.toDate(),
          } as BlogPost);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    const fetchComments = async () => {
      try {
        if (!id) return;
        const commentsQuery = query(
          collection(db, 'posts', id, 'comments'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(commentsQuery);
        const fetchedComments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        })) as Comment[];
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    fetchComments();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to comment.',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const commentRef = await addDoc(collection(db, 'posts', id!, 'comments'), {
        content: newComment,
        author: user.email,
        createdAt: new Date(),
      });

      const newCommentObj = {
        id: commentRef.id,
        content: newComment,
        author: user.email!,
        createdAt: new Date(),
      };

      setComments((prev) => [newCommentObj, ...prev]);
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added successfully.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-lg">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-lg">Post not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <article className="prose prose-invert mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">{post.title}</h1>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{post.author}</span>
          <span>
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="mt-8 whitespace-pre-wrap">{post.content}</div>
      </article>

      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-2xl font-bold">Comments</h2>
        <form onSubmit={handleAddComment} className="mb-8 space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              user ? 'Write a comment...' : 'Sign in to write a comment...'
            }
            disabled={!user}
          />
          <Button type="submit" disabled={!user}>
            Add Comment
          </Button>
        </form>

        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <p className="whitespace-pre-wrap">{comment.content}</p>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>{comment.author}</span>
                <span>
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog; 