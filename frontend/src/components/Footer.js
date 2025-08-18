import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Github,
  User
} from 'lucide-react';
import VisitorCounter from './VisitorCounter';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Blogs', href: '/blogs' },
    { name: 'Subscribe', href: '/subscribe' },
    { name: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
  ];

  return (
    <footer className="bg-white dark:bg-dark-card border-t-2 border-black dark:border-dark-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-500 border-2 border-black dark:border-dark-border flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black dark:text-white">
                Blog360
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Your go-to platform for educational content, programming tutorials, 
              and software guidance. Join our community of learners and get access 
              to premium educational resources.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  misbah244176@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  +880 1824032222
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Dhaka, Bangladesh
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4 border-b-2 border-black dark:border-dark-border pb-2">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
              </div>
                <div className="border-t-2 border-gray-200 dark:border-dark-border pt-8 mt-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Follow us:
                  </span>
                  {socialLinks.map((social) => {
                    let Icon = social.icon;
                    let href = social.href;
                    if (social.name === 'Facebook') {
                    href = 'https://www.facebook.com/misbah7172.misbah/';
                    } else if (social.name === 'LinkedIn') {
                    href = 'https://www.linkedin.com/in/md-habibulla-misba';
                    } else if (social.name === 'GitHub') {
                    href = 'https://github.com/misbah7172';
                    } else if (social.name === 'Twitter') {
                    href = 'https://misbah7172.github.io/My_Portfolio/';
                    Icon = User; // Use portfolio-related icon instead of Twitter
                    }
                    return (
                    <a
                      key={social.name}
                      href={href}
                      className="p-2 text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-200"
                      aria-label={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                    );
                  })}
                  </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t-2 border-gray-200 dark:border-dark-border pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {currentYear} Blog360. All rights reserved by  Misbah.
              </p>
              <VisitorCounter />
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
