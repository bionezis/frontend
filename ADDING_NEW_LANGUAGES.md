# 🌍 **Adding New Languages to Bionezis Manager**

## Overview

This guide explains how to add new languages to the Bionezis Manager frontend application. The app currently supports 6 languages (English, Polish, Dutch, French, German, Spanish) and can easily be extended to support additional languages.

## Current Language Support

| Language | Code | Status | Lines | Complete |
|----------|------|--------|-------|----------|
| English  | `en` | ✅ Complete | 176 | ✅ Yes |
| Polish   | `pl` | ✅ Complete | 176 | ✅ Yes |
| Dutch    | `nl` | ✅ Complete | 176 | ✅ Yes |
| Spanish  | `es` | ✅ Complete | 183 | ✅ Yes |
| German   | `de` | ✅ Complete | 183 | ✅ Yes |
| French   | `fr` | ✅ Complete | 183 | ✅ Yes |

## Quick Start: Adding a New Language

### Step 1: Update Configuration Files

#### **1.1 Update `lib/i18n.ts`**
```typescript
// lib/i18n.ts
export const locales = [
  'en', 'pl', 'nl', 'fr', 'de', 'es', 
  'it', 'pt', 'ru', 'ja', 'ko', 'zh'  // Add new languages
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pl: 'Polski',
  nl: 'Nederlands',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',        // ✅ Add new language
  pt: 'Português',       // ✅ Add new language
  ru: 'Русский',         // ✅ Add new language
  ja: '日本語',          // ✅ Add new language
  ko: '한국어',          // ✅ Add new language
  zh: '中文',            // ✅ Add new language
};
```

#### **1.2 Update `middleware.ts`**
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n';

const intlMiddleware = createMiddleware({
  locales,  // Will automatically include new languages
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  // ... existing middleware logic
  return intlMiddleware(request);
}
```

### Step 2: Create Translation Files

#### **2.1 Copy Template**
```bash
# Copy English file as template for new language
cp messages/en.json messages/it.json
cp messages/en.json messages/pt.json
cp messages/en.json messages/ru.json
```

#### **2.2 Translate Content**
```json
// messages/it.json (Italian example)
{
  "common": {
    "loading": "Caricamento...",
    "save": "Salva",
    "cancel": "Annulla",
    "delete": "Elimina",
    "edit": "Modifica",
    "create": "Crea",
    "search": "Cerca",
    "filter": "Filtra",
    "actions": "Azioni",
    "back": "Indietro",
    "next": "Avanti",
    "submit": "Invia",
    "close": "Chiudi"
  },
  "nav": {
    "dashboard": "Dashboard",
    "organization": "Organizzazione",
    "programs": "Programmi",
    "locations": "Posizioni",
    "team": "Squadra",
    "profile": "Profilo",
    "logout": "Disconnetti"
  },
  "auth": {
    "login": "Accedi",
    "register": "Registrati",
    "loginTitle": "Bentornato",
    "loginSubtitle": "Accedi al tuo account per continuare",
    "registerTitle": "Crea account",
    "registerSubtitle": "Registrati come proprietario di organizzazione",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Conferma password",
    "firstName": "Nome",
    "lastName": "Cognome",
    "phone": "Telefono",
    "forgotPassword": "Password dimenticata?",
    "noAccount": "Non hai un account?",
    "hasAccount": "Hai già un account?",
    "signIn": "Accedi",
    "signUp": "Registrati",
    "loggingIn": "Accesso in corso...",
    "registering": "Creazione account...",
    "logout": "Disconnetti"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Benvenuto nel portale Bionezis Manager",
    "overview": "Panoramica",
    "recentActivity": "Attività recente",
    "statistics": "Statistiche",
    "programs": "Programmi",
    "locations": "Posizioni",
    "team": "Squadra",
    "teamMembers": "Membri del team",
    "viewDetails": "Visualizza dettagli",
    "quickActions": "Azioni rapide",
    "quickActionsDescription": "Attività comuni e scorciatoie"
  }
  // ... translate all sections
}
```

### Step 3: Test the New Language

#### **3.1 URLs Automatically Work**
```
http://localhost:3002/it/dashboard    # Italian
http://localhost:3002/pt/dashboard    # Portuguese
http://localhost:3002/ru/dashboard    # Russian
http://localhost:3002/ja/dashboard    # Japanese
http://localhost:3002/ko/dashboard    # Korean
http://localhost:3002/zh/dashboard    # Chinese
```

#### **3.2 Language Switcher Updates Automatically**
The `LanguageSwitcher` component automatically includes new languages:
```typescript
// components/LanguageSwitcher.tsx - No changes needed!
// It automatically reads from localeNames in i18n.ts
```

## Complete Translation Structure

### Required Translation Sections

When adding a new language, ensure you translate all these sections:

#### **1. Common Actions (`common`)**
```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "filter": "Filter",
    "actions": "Actions",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "close": "Close"
  }
}
```

#### **2. Navigation (`nav`)**
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "organization": "Organization",
    "programs": "Programs",
    "locations": "Locations",
    "team": "Team",
    "profile": "Profile",
    "logout": "Logout"
  }
}
```

#### **3. Authentication (`auth`)**
```json
{
  "auth": {
    "login": "Login",
    "register": "Register",
    "loginTitle": "Welcome back",
    "loginSubtitle": "Sign in to your account to continue",
    "registerTitle": "Create account",
    "registerSubtitle": "Register as organization owner",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm password",
    "firstName": "First name",
    "lastName": "Last name",
    "phone": "Phone",
    "forgotPassword": "Forgot your password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "signIn": "Sign in",
    "signUp": "Sign up",
    "loggingIn": "Signing in...",
    "registering": "Creating account...",
    "logout": "Logout"
  }
}
```

#### **4. Dashboard (`dashboard`)**
```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome to the Bionezis Manager Portal",
    "overview": "Overview",
    "recentActivity": "Recent Activity",
    "statistics": "Statistics",
    "programs": "Programs",
    "locations": "Locations",
    "team": "Team",
    "teamMembers": "Team Members",
    "viewDetails": "View details",
    "quickActions": "Quick Actions",
    "quickActionsDescription": "Common tasks and shortcuts"
  }
}
```

#### **5. Organization (`organization`)**
```json
{
  "organization": {
    "title": "Organization",
    "create": "Create Organization",
    "edit": "Edit Organization",
    "settings": "Organization Settings",
    "name": "Organization Name",
    "description": "Description",
    "address": "Address",
    "city": "City",
    "country": "Country",
    "postalCode": "Postal Code",
    "phone": "Phone",
    "email": "Email",
    "website": "Website",
    "status": "Status",
    "pending": "Pending Approval",
    "approved": "Approved",
    "pendingMessage": "Your organization is pending admin approval. You will be notified once approved.",
    "createSuccess": "Organization created successfully",
    "updateSuccess": "Organization updated successfully"
  }
}
```

#### **6. Programs (`programs`)**
```json
{
  "programs": {
    "title": "Programs",
    "create": "Create Program",
    "edit": "Edit Program",
    "list": "Program List",
    "name": "Program Name",
    "description": "Description",
    "shortDescription": "Short Description",
    "type": "Program Type",
    "language": "Language",
    "status": "Status",
    "brochure": "Brochure (PDF)",
    "uploadBrochure": "Upload Brochure",
    "draft": "Draft",
    "approved": "Approved",
    "published": "Published",
    "archived": "Archived",
    "offerings": "Offerings",
    "createSuccess": "Program created successfully",
    "updateSuccess": "Program updated successfully",
    "deleteSuccess": "Program deleted successfully"
  }
}
```

#### **7. Offerings (`offerings`)**
```json
{
  "offerings": {
    "title": "Program Offerings",
    "create": "Create Offering",
    "edit": "Edit Offering",
    "location": "Location",
    "contactName": "Contact Name",
    "contactPhone": "Contact Phone",
    "contactEmail": "Contact Email",
    "pricingType": "Pricing Type",
    "price": "Price",
    "currency": "Currency",
    "pricingDetails": "Pricing Details",
    "scheduleInfo": "Schedule Information",
    "capacity": "Capacity",
    "notes": "Notes",
    "free": "Free",
    "paid": "Paid",
    "slidingScale": "Sliding Scale",
    "insurance": "Insurance Covered",
    "contact": "Contact for Pricing",
    "createSuccess": "Offering created successfully",
    "updateSuccess": "Offering updated successfully",
    "deleteSuccess": "Offering deleted successfully"
  }
}
```

#### **8. Locations (`locations`)**
```json
{
  "locations": {
    "title": "Locations",
    "create": "Create Location",
    "edit": "Edit Location",
    "name": "Location Name",
    "address": "Address",
    "city": "City",
    "country": "Country",
    "postalCode": "Postal Code",
    "phone": "Phone",
    "email": "Email",
    "coordinates": "Coordinates",
    "createSuccess": "Location created successfully",
    "updateSuccess": "Location updated successfully",
    "deleteSuccess": "Location deleted successfully"
  }
}
```

#### **9. Team (`team`)**
```json
{
  "team": {
    "title": "Team",
    "members": "Team Members",
    "invite": "Invite Member",
    "role": "Role",
    "owner": "Owner",
    "admin": "Admin",
    "member": "Member",
    "inviteEmail": "Email to invite",
    "inviteSuccess": "Invitation sent successfully",
    "removeSuccess": "Member removed successfully"
  }
}
```

#### **10. Profile (`profile`)**
```json
{
  "profile": {
    "title": "Profile",
    "edit": "Edit Profile",
    "changePassword": "Change Password",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "updateSuccess": "Profile updated successfully",
    "passwordChanged": "Password changed successfully"
  }
}
```

#### **11. Validation (`validation`)**
```json
{
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email address",
    "minLength": "Must be at least {min} characters",
    "maxLength": "Must be at most {max} characters",
    "passwordMatch": "Passwords must match",
    "fileSize": "File size must be less than {size}",
    "fileType": "File type must be {type}"
  }
}
```

#### **12. Errors (`errors`)**
```json
{
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "unauthorized": "You are not authorized to perform this action",
    "notFound": "Resource not found",
    "networkError": "Network error. Please check your connection."
  }
}
```

## Automated Setup Script

Create a script to automate the process:

```bash
#!/bin/bash
# add-language.sh

LANG_CODE=$1
LANG_NAME=$2

if [ -z "$LANG_CODE" ] || [ -z "$LANG_NAME" ]; then
  echo "Usage: ./add-language.sh <code> <name>"
  echo "Example: ./add-language.sh it Italiano"
  echo "Example: ./add-language.sh pt Português"
  echo "Example: ./add-language.sh ru Русский"
  exit 1
fi

echo "🌍 Adding language: ${LANG_CODE} (${LANG_NAME})"

# 1. Copy English template
echo "📋 Copying English template..."
cp messages/en.json messages/${LANG_CODE}.json

# 2. Update i18n.ts (manual step)
echo "⚙️  Manual steps required:"
echo "   1. Add '${LANG_CODE}' to locales array in lib/i18n.ts"
echo "   2. Add '${LANG_CODE}: \"${LANG_NAME}\"' to localeNames in lib/i18n.ts"

# 3. Update middleware.ts (manual step)
echo "   3. Add '${LANG_CODE}' to locales array in middleware.ts"

echo "✅ Language ${LANG_CODE} (${LANG_NAME}) added!"
echo "📝 Now translate messages/${LANG_CODE}.json"
echo "🧪 Test with: http://localhost:3002/${LANG_CODE}/dashboard"
```

## Best Practices

### 1. Professional Translation
- **Don't use Google Translate** for production
- **Hire native speakers** or professional translators
- **Test with native speakers** to ensure accuracy
- **Consider cultural context** and local terminology

### 2. Maintain Consistency
- **Use the same terminology** across all translations
- **Keep the same structure** in all language files
- **Test all UI elements** in the new language
- **Verify text fits** in UI components (some languages are longer)

### 3. Test Thoroughly
- **Test all pages** in the new language
- **Check for text overflow** (some languages are longer)
- **Verify all form validations** work
- **Test the language switcher**
- **Check responsive design** with longer text

### 4. Consider RTL Languages
For Arabic, Hebrew, etc., you'll need RTL support:

```css
/* Add RTL support in globals.css */
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}
```

## Special Considerations

### 1. Character Encoding
Ensure proper UTF-8 encoding for all translation files:
```json
{
  "common": {
    "loading": "Загрузка...",  // Russian
    "save": "保存",            // Chinese
    "cancel": "キャンセル"      // Japanese
  }
}
```

### 2. Pluralization
Some languages have complex pluralization rules:
```json
{
  "programs": {
    "count": {
      "zero": "No programs",
      "one": "1 program",
      "other": "{count} programs"
    }
  }
}
```

### 3. Date and Number Formatting
Consider locale-specific formatting:
```typescript
// Use Intl API for formatting
const date = new Intl.DateTimeFormat(locale).format(new Date());
const number = new Intl.NumberFormat(locale).format(1234.56);
```

## Testing Checklist

When adding a new language, test:

- ✅ **All pages load** without missing translation errors
- ✅ **Language switcher** includes the new language
- ✅ **URL routing** works (`/it/dashboard`, `/pt/dashboard`, etc.)
- ✅ **Form validation** messages display correctly
- ✅ **Error messages** are translated
- ✅ **Success notifications** are translated
- ✅ **Navigation menu** is translated
- ✅ **Dashboard statistics** are translated
- ✅ **All CRUD operations** work in the new language
- ✅ **Responsive design** works with longer/shorter text
- ✅ **No text overflow** in UI components

## Deployment Considerations

### 1. Build Process
The build process automatically includes all languages:
```bash
npm run build  # Includes all languages in locales array
```

### 2. Static Generation
Next.js will generate static pages for all languages:
```
/pl/dashboard
/pt/dashboard
/ru/dashboard
```

### 3. CDN Configuration
Ensure your CDN supports all language routes:
```
https://app.bionezis.com/it/dashboard
https://app.bionezis.com/pt/dashboard
```

## Troubleshooting

### Common Issues

#### 1. Missing Translation Keys
```
MISSING_MESSAGE: Could not resolve `dashboard.programs` in messages for locale `it`.
```
**Solution:** Add the missing key to the translation file.

#### 2. Language Not Appearing in Switcher
**Solution:** Ensure the language is added to `localeNames` in `lib/i18n.ts`.

#### 3. 404 Error for New Language
**Solution:** Ensure the language is added to the `locales` array in `middleware.ts`.

#### 4. Text Overflow
**Solution:** Test with longer text and adjust UI components if needed.

## Example: Adding Italian

### Step 1: Update Configuration
```typescript
// lib/i18n.ts
export const locales = ['en', 'pl', 'nl', 'fr', 'de', 'es', 'it'] as const;
export const localeNames: Record<Locale, string> = {
  // ... existing languages
  it: 'Italiano',
};
```

### Step 2: Create Translation File
```bash
cp messages/en.json messages/it.json
# Translate all content to Italian
```

### Step 3: Test
```
http://localhost:3002/it/dashboard
```

## Result

After adding new languages:

- ✅ **Automatic URL routing** - `/it/dashboard`, `/pt/dashboard`, etc.
- ✅ **Language switcher** - New languages appear in dropdown
- ✅ **Complete UI support** - All elements display in new language
- ✅ **Consistent experience** - Same functionality in all languages
- ✅ **Professional quality** - Proper translations for production use

The frontend will automatically support any new languages you add - just update the configuration and add the translation files!
