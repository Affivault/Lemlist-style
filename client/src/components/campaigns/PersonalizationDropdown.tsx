import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Building2, Briefcase, Mail, Phone, Globe, Linkedin, Hash, Sparkles } from 'lucide-react';

export interface MergeTag {
  label: string;
  value: string;
  icon: React.ElementType;
  category: string;
  description: string;
}

const MERGE_TAGS: MergeTag[] = [
  // Contact Info
  { label: 'First Name', value: '{{first_name}}', icon: User, category: 'Contact', description: 'Contact\'s first name' },
  { label: 'Last Name', value: '{{last_name}}', icon: User, category: 'Contact', description: 'Contact\'s last name' },
  { label: 'Full Name', value: '{{full_name}}', icon: User, category: 'Contact', description: 'First + last name' },
  { label: 'Email', value: '{{email}}', icon: Mail, category: 'Contact', description: 'Contact\'s email address' },
  { label: 'Phone', value: '{{phone}}', icon: Phone, category: 'Contact', description: 'Contact\'s phone number' },

  // Professional
  { label: 'Company', value: '{{company}}', icon: Building2, category: 'Professional', description: 'Company name' },
  { label: 'Job Title', value: '{{job_title}}', icon: Briefcase, category: 'Professional', description: 'Job title or role' },
  { label: 'Website', value: '{{website}}', icon: Globe, category: 'Professional', description: 'Website URL' },
  { label: 'LinkedIn', value: '{{linkedin_url}}', icon: Linkedin, category: 'Professional', description: 'LinkedIn profile URL' },

  // Dynamic
  { label: 'Signature', value: '{{signature}}', icon: Sparkles, category: 'Dynamic', description: 'Your email signature' },
  { label: 'Unsubscribe Link', value: '{{unsubscribe_link}}', icon: Hash, category: 'Dynamic', description: 'Opt-out link' },
  { label: 'Sender Name', value: '{{sender_name}}', icon: User, category: 'Dynamic', description: 'Your name' },
  { label: 'Sender Email', value: '{{sender_email}}', icon: Mail, category: 'Dynamic', description: 'Your email address' },
];

interface PersonalizationDropdownProps {
  onInsert: (tag: string) => void;
  variant?: 'button' | 'icon';
}

export function PersonalizationDropdown({ onInsert, variant = 'button' }: PersonalizationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTags = MERGE_TAGS.filter(
    (tag) =>
      tag.label.toLowerCase().includes(search.toLowerCase()) ||
      tag.value.toLowerCase().includes(search.toLowerCase()) ||
      tag.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filteredTags.map((t) => t.category))];

  const handleInsert = (tag: MergeTag) => {
    onInsert(tag.value);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {variant === 'button' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200"
        >
          <Sparkles className="h-4 w-4" />
          Personalize
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Insert personalization"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 z-50 animate-fade-in overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              autoFocus
            />
          </div>

          {/* Tags list */}
          <div className="max-h-64 overflow-y-auto py-2">
            {categories.map((category) => (
              <div key={category}>
                <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {category}
                </p>
                {filteredTags
                  .filter((t) => t.category === category)
                  .map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => handleInsert(tag)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                        <tag.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{tag.label}</p>
                        <p className="text-xs text-gray-400 truncate">{tag.description}</p>
                      </div>
                      <code className="text-xs text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">
                        {tag.value}
                      </code>
                    </button>
                  ))}
              </div>
            ))}

            {filteredTags.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No variables found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { MERGE_TAGS };
