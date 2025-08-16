import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
        Terms and Conditions
      </h1>
      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Blog360, you accept and agree to be bound by the terms 
          and provision of this agreement.
        </p>
        
        <h2>2. Subscription Services</h2>
        <p>
          Our premium subscription provides access to exclusive content. Subscriptions 
          are billed according to the plan you select.
        </p>
        
        <h2>3. Payment Terms</h2>
        <p>
          All payments are processed securely through bKash. Subscription fees are 
          non-refundable except as required by law.
        </p>
        
        <h2>4. Content Usage</h2>
        <p>
          All content on Blog360 is protected by copyright. You may not reproduce, 
          distribute, or create derivative works without permission.
        </p>
        
        <h2>5. Contact</h2>
        <p>
          If you have any questions about these Terms and Conditions, please contact us 
          at contact@blog360.com.
        </p>
      </div>
    </div>
  );
};

export default Terms;
