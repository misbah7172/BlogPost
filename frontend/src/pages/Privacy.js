import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
        Privacy Policy
      </h1>
      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create 
          an account, subscribe to our services, or contact us.
        </p>
        
        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, 
          process transactions, and communicate with you.
        </p>
        
        <h2>3. Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to 
          third parties without your consent, except as described in this policy.
        </p>
        
        <h2>4. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information 
          against unauthorized access, alteration, disclosure, or destruction.
        </p>
        
        <h2>5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at 
          privacy@edublog.com.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
