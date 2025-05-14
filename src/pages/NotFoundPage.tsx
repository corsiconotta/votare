import React from 'react';
import { Link } from 'react-router-dom';
import { Vote } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Vote className="h-20 w-20 text-neutral-300 mb-6" />
      <h1 className="text-4xl font-bold text-neutral-900 mb-4">Page Not Found</h1>
      <p className="text-xl text-neutral-600 mb-8 max-w-lg">
        Sorry, we couldn't find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;