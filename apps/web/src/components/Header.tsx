'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Info, Settings, Calendar } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearch, searchQuery = '' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(localQuery);
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
              <img src="\logo.jpg" alt="الشعار" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-lg text-neutral-900">
                خريطة المقاومات الشعبية
              </h1>
              <p className="text-xs text-neutral-500">الجزائر 1830-1954</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="search"
                placeholder="ابحث عن ثورة، معركة، قائد..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className={cn(
                  'w-full ps-10 pe-4 py-2 border border-neutral-200 rounded-lg',
                  'bg-neutral-50 text-neutral-900 placeholder:text-neutral-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                  'focus:bg-white transition-colors'
                )}
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-2">
            <Link href="/timeline">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                aria-label="الجدول الزمني"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden lg:inline">الجدول الزمني</span>
              </Button>
            </Link>

            <Link href="/about">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                aria-label="حول المشروع"
              >
                <Info className="h-4 w-4" />
                <span className="hidden lg:inline">حول</span>
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                aria-label="الإعدادات"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="primary"
                size="sm"
                className="hidden sm:flex"
              >
                تسجيل الدخول
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="search"
                  placeholder="ابحث..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className={cn(
                    'w-full ps-10 pe-4 py-2 border border-neutral-200 rounded-lg',
                    'bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500'
                  )}
                />
              </div>
            </form>
            <nav className="flex flex-col gap-2">
              <Link href="/timeline" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="justify-start w-full gap-2">
                  <Calendar className="h-4 w-4" />
                  الجدول الزمني
                </Button>
              </Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="justify-start w-full gap-2">
                  <Info className="h-4 w-4" />
                  حول المشروع
                </Button>
              </Link>
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="justify-start w-full gap-2">
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </Button>
              </Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" className="mt-2 w-full">
                  تسجيل الدخول
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}