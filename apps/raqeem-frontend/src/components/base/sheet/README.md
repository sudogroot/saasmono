# Centralized Sheet System

A complete sheet management system with URL synchronization and navigation history for the Raqeem application.

## Features

- **Stack-based navigation**: Navigate between sheets with back button support
- **URL synchronization**: Deep linking with automatic URL parameter updates
- **Dynamic imports**: Lazy loading for better performance
- **Type safety**: Full TypeScript support with type-safe component references
- **Mobile responsive**: Adaptive UI for different screen sizes

## Setup

### 1. Add the GlobalSheetProvider

Wrap your app with the `GlobalSheetProvider`:

```tsx
// app/layout.tsx
import { GlobalSheetProvider } from '@/components/base/sheet';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <GlobalSheetProvider>
          {children}
        </GlobalSheetProvider>
      </body>
    </html>
  );
}
```

### 2. Initialize from URL (Optional)

Add URL initialization to your main pages:

```tsx
// app/dashboard/[slug]/page.tsx
'use client';

import { useEffect } from 'react';
import { globalSheet } from '@/stores/global-sheet-store';

export default function DashboardPage() {
  useEffect(() => {
    globalSheet.initializeFromUrl();
  }, []);

  return (
    <div>
      {/* Your page content */}
    </div>
  );
}
```

## Usage Examples

### Opening Sheets Programmatically

```tsx
import { globalSheet } from '@/stores/global-sheet-store';

// Open case details
globalSheet.openCaseDetails({
  slug: 'law-firm',
  caseId: '123',
  size: 'lg'
});

// Open client form for editing
globalSheet.openClientForm({
  mode: 'edit',
  slug: 'law-firm', 
  clientId: '456',
  size: 'xl'
});

// Open opponent details
globalSheet.openOpponentDetails({
  slug: 'law-firm',
  opponentId: '789',
  size: 'lg'
});
```

### Using Sheet Triggers

```tsx
import { SheetTrigger } from '@/components/base/sheet';

function MyComponent() {
  return (
    <SheetTrigger
      title="عرض المنوب"
      component="ClientDetails"
      props={{ clientId: '123' }}
      size="lg"
      urlParams={{ clientId: '123' }}
    >
      <button>عرض المنوب</button>
    </SheetTrigger>
  );
}
```

### Updated Table Components

The table components have been updated to use the sheet system:

```tsx
// Cases table with sheet integration
<CasesTable 
  organizationId="org-123"
  slug="law-firm" // Optional - will be extracted from URL if not provided
/>

// Clients table with sheet integration  
<ClientsTable
  clients={clients}
  slug="law-firm"
/>

// Opponents table with sheet integration
<OpponentsTable
  opponents={opponents}
  slug="law-firm"
/>
```

## URL Structure

The system supports deep linking with the following URL structure:

```
?view=ComponentName&param=value
?view=ClientDetails&clientId=123
?view=CaseForm&caseId=456&clientId=123
?view=ClientForm,ClientDetails&clientId=123  // Stacked sheets
```

## Supported Components

- **CaseDetails**: View case information
- **CaseForm**: Create/edit cases  
- **ClientDetails**: View client information
- **ClientForm**: Create/edit clients
- **OpponentDetails**: View opponent information
- **OpponentForm**: Create/edit opponents

## Adding New Components

### 1. Register the component

```tsx
// In global-sheet-store.ts
export const SHEET_COMPONENTS = {
  'MyComponent': () => import('../components/my-component').then(m => ({ default: m.MyComponent })),
  // ... other components
};
```

### 2. Add the opener function

```tsx
export const globalSheet = {
  openMyComponent: (props: {
    slug: string;
    myId: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  }) => {
    useGlobalSheet.getState().pushSheet({
      id: \`my-component-\${props.myId}-\${Date.now()}\`,
      title: 'My Component Title',
      component: 'MyComponent',
      props: { myId: props.myId },
      size: props.size || 'lg',
      urlParams: { myId: props.myId },
    });
  },
  // ... other openers
};
```

### 3. Add URL opener (for deep linking)

```tsx
export const SHEET_OPENERS: Record<string, SheetOpener> = {
  'MyComponent': ({ slug, urlParams, pushToStack }) => {
    if (urlParams.myId) {
      globalSheet.openMyComponent({
        slug,
        myId: urlParams.myId,
        size: 'lg'
      });
      return true;
    }
    return false;
  },
  // ... other openers
};
```

## Navigation Methods

```tsx
// Go back to previous sheet
globalSheet.back();

// Close all sheets
globalSheet.closeAll();

// Check if can go back
globalSheet.canGoBack();

// Get navigation info
const info = globalSheet.getNavigationInfo();
```

## Best Practices

1. **Always provide slug**: Either as a prop or ensure it's extractable from the URL
2. **Use appropriate sizes**: 
   - `sm`: Small modals/dialogs
   - `md`: Medium content
   - `lg`: Standard details views (recommended)
   - `xl`: Forms and complex content
   - `full`: Full screen content
3. **URL Parameters**: Include relevant IDs for deep linking support
4. **Error Handling**: Components should handle loading and error states
5. **Mobile Responsive**: Test on mobile devices as sheets become bottom drawers