import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useAuthState } from 'react-firebase-hooks/auth';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            DevBlog
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.email === 'your-admin-email@example.com' && (
                  <Link to="/admin">
                    <Button variant="ghost">Admin</Button>
                  </Link>
                )}
                <Button className='bg-white text-black font-bold hover:bg-gray-200' variant="secondary" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 