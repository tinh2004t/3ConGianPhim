import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { title: 'Social', items: [
      { name: 'Facebook', path: '/' },
      { name: 'Youtube', path: '/movies' },
      { name: 'Stripchat', path: '/tv-series' },
      { name: 'MMlive', path: '/account' }
    ]},
    { title: 'Legal', items: [
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Cookie Policy', path: '/cookies' }
    ]}
  ];

  const socialLinks = [
    { href: '#', icon: 'facebook' },
    { href: '#', icon: 'twitter' },
    { href: '#', icon: 'instagram' }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Triple Gián</h3>
            <p className="text-gray-400">The best streaming platform for all your favorite movies and TV shows.</p>
          </div>
          {links.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.path} className="text-gray-400 hover:text-red-500 transition">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((link, idx) => (
                <a key={idx} href={link.href} className="text-gray-400 hover:text-red-500 transition">
                  <i className={`fab fa-${link.icon} w-6 h-6`} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} MovieFlix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
