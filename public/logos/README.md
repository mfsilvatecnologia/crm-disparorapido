# Logo Structure for Tenants

This directory contains the logo assets for each tenant.

## Directory Structure

```
logos/
├── vendas/
│   ├── logo.svg          # Main logo (recommended)
│   ├── logo.png          # PNG fallback
│   ├── logo-light.svg    # Light version for dark backgrounds (optional)
│   ├── logo-light.png    # PNG fallback for light version
│   └── favicon.ico       # Favicon
└── publix/
    ├── logo.svg          # Main logo (recommended)
    ├── logo.png          # PNG fallback
    ├── logo-light.svg    # Light version for dark backgrounds (optional)
    ├── logo-light.png    # PNG fallback for light version
    └── favicon.ico       # Favicon
```

## Logo Requirements

### Format
- **SVG** is preferred for scalability and crisp rendering
- **PNG** as fallback (minimum 200x60px, recommended 400x120px)
- **ICO** for favicon (16x16, 32x32, 48x48 sizes)

### Design Guidelines
- Maintain aspect ratio consistent with brand guidelines
- Ensure readability at small sizes (minimum 120px width)
- Use transparent backgrounds when possible
- Optimize file sizes for web usage

## Configuration

Logos are configured in the tenant configuration files:
- `src/config/tenants/vendas.config.ts`
- `src/config/tenants/publix.config.ts`

Update the `branding.logo`, `branding.logoLight`, and `branding.favicon` paths accordingly.

## Placeholders

Currently using placeholder paths. Replace with actual logo files:
- `/logos/{tenant}/logo.svg` - Main logo
- `/logos/{tenant}/logo-light.svg` - Light version (optional)
- `/logos/{tenant}/favicon.ico` - Favicon