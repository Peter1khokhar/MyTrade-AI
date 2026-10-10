'use client';

import Link from 'next/link';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Instruments', href: '#instruments' },
    { label: 'Pricing', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="relative bg-[#FAFAF7] dark:bg-[#0F0F12] border-t border-[#E5E5E0] dark:border-[#27272A]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#7C3AED] flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <span className="text-base font-semibold text-[#1A1A1A] dark:text-white tracking-tight">
                MyTrade <span className="text-[#6B7280] dark:text-[#A1A1AA] font-normal">AI</span>
              </span>
            </Link>
            <p className="text-sm text-[#6B7280] dark:text-[#A1A1AA] font-light max-w-xs leading-relaxed">
              AI-powered Forex trading signals with institutional-grade ICT/SMC analysis.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-medium uppercase tracking-widest text-[#1A1A1A] dark:text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#1A1A1A] dark:hover:text-white transition-colors font-light"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#E5E5E0] dark:border-[#27272A] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6B7280] dark:text-[#A1A1AA] font-light">
            © 2026 MyTrade AI. All rights reserved.
          </p>
          <p className="text-xs text-[#6B7280] dark:text-[#A1A1AA] font-light">
            Not financial advice. Do your own research.
          </p>
        </div>
      </div>
    </footer>
  );
}