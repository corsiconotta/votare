import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Search, BarChart2, Shield } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">About Romanian Parliament Vote Tracker</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-neutral-700 mb-6 text-lg leading-relaxed">
          Our mission is to increase transparency in Romanian politics by making parliamentary voting data accessible to all citizens. 
          We believe that an informed citizenry is essential for a healthy democracy, and that transparency is key to holding elected officials accountable.
        </p>
        
        <p className="text-neutral-700 mb-6 text-lg leading-relaxed">
          By tracking how Members of Parliament vote on legislation, we aim to:
        </p>
        
        <ul className="list-disc pl-8 mb-6 space-y-2 text-neutral-700">
          <li>Empower citizens with information about their representatives</li>
          <li>Increase accountability of elected officials</li>
          <li>Enable data-driven analysis of voting patterns</li>
          <li>Provide context around important legislative decisions</li>
          <li>Promote civic engagement and participation</li>
        </ul>
        
        <p className="text-neutral-700 text-lg leading-relaxed">
          This platform is inspired by similar initiatives across Europe, such as <a href="https://www.howtheyvote.eu" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">HowTheyVote.eu</a>, which tracks voting in the European Parliament.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-primary-100 text-primary-600 p-3 rounded-lg inline-block mb-4">
              <Vote className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Vote Tracking</h3>
            <p className="text-neutral-600">
              We manually collect voting data from both chambers of the Romanian Parliament (Camera Deputaților and Senat). Each vote is categorized by topic and includes detailed information about how each MP voted.
            </p>
          </div>
          
          <div>
            <div className="bg-secondary-100 text-secondary-600 p-3 rounded-lg inline-block mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Search & Analysis</h3>
            <p className="text-neutral-600">
              Our platform allows you to search for specific votes or MPs, filter by various criteria, and analyze voting patterns. You can see how MPs from different parties vote on similar issues.
            </p>
          </div>
          
          <div>
            <div className="bg-success-100 text-success-600 p-3 rounded-lg inline-block mb-4">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Data Visualization</h3>
            <p className="text-neutral-600">
              We present voting data through clear visualizations that make it easy to understand voting patterns and outcomes. Charts and graphs help illustrate how different parties vote on legislation.
            </p>
          </div>
          
          <div>
            <div className="bg-neutral-100 text-neutral-600 p-3 rounded-lg inline-block mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Non-Partisan Approach</h3>
            <p className="text-neutral-600">
              We maintain a strictly non-partisan approach, focusing only on presenting accurate voting data without bias or political commentary. Our goal is to provide facts, not opinions.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-4">Get Involved</h2>
        <p className="text-neutral-700 mb-6">
          We welcome contributions and feedback to help improve this platform. If you're interested in contributing, have suggestions, or notice any issues with the data, please contact us.
        </p>
        
        <div className="flex justify-center">
          <Link 
            to="/votes" 
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Start Exploring Votes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;