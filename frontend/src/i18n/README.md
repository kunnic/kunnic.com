# Internationalization (i18n) Structure

## Directory Structure
```
src/
├── i18n/
│   ├── locales/           # Translation files
│   │   ├── en.json        # English translations
│   │   ├── vi.json        # Vietnamese translations
│   │   └── ...            # Additional languages
│   ├── config.js          # i18n configuration and utilities
│   ├── LanguageContext.jsx # React context for language management
│   └── index.js           # Main exports
├── hooks/
│   └── useTranslations.js # Custom hook for translation helpers
└── components/
    └── LanguageSwitcher.jsx # Language switching component
```

## Usage Examples

### Basic Usage
```jsx
import { useLanguage } from '../i18n';

function MyComponent() {
  const { t } = useLanguage();
  return <h1>{t('pages.blog.title')}</h1>;
}
```

### Using Custom Hook
```jsx
import { useTranslations } from '../hooks/useTranslations';

function BlogPage() {
  const { getPageTranslations } = useTranslations();
  const translations = getPageTranslations('blog');
  
  return <h1>{translations.title}</h1>;
}
```

### Adding New Languages
1. Create new JSON file in `src/i18n/locales/`
2. Add language config in `src/i18n/config.js`
3. Language will automatically appear in switcher

### Translation File Structure
```json
{
  "nav": { ... },           // Navigation items
  "pages": {
    "blog": { ... },        // Page-specific translations
    "music": { ... },
    "gallery": { ... }
  },
  "common": { ... },        // Shared translations
  "time": { ... }           // Formatting preferences
}
```

## Professional Benefits
- **Maintainable**: Clean separation of translations and code
- **Scalable**: Easy to add new languages and translations  
- **Type-safe**: Consistent key structure across languages
- **Performance**: Minimal bundle impact with context-based approach
- **Developer-friendly**: Helper hooks for common patterns
