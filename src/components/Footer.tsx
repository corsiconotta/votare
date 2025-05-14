import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <Vote className="h-6 w-6 text-romania-yellow" />
              <span className="font-bold text-lg text-white">Vote Tracker</span>
            </Link>
            <p className="mt-4 text-neutral-300 text-sm">
              Tracking how Romanian MPs vote on legislation to increase transparency in politics.
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/votes" className="text-neutral-300 hover:text-white transition-colors">
                  Votes
                </Link>
              </li>
              <li>
                <Link to="/mps" className="text-neutral-300 hover:text-white transition-colors">
                  MPs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-300 hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.cdep.ro/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Camera Deputaților
                </a>
              </li>
              <li>
                <a 
                  href="https://www.senat.ro/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Senatul României
                </a>
              </li>
              <li>
                <a 
                  href="https://www.howtheyvote.eu/"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  HowTheyVote.eu
                </a>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-8 text-sm text-neutral-400">
          <p>© {new Date().getFullYear()} Romanian Parliament Vote Tracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;