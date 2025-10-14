# Tenant Theme Usage Examples

Este arquivo demonstra como usar as cores e estilos específicos de cada tenant na aplicação.

## CSS Variables Disponíveis

As seguintes CSS variables são definidas dinamicamente pelo TenantContext:

```css
:root {
  --tenant-primary: #2563eb; /* Exemplo para vendas */
  --tenant-primary-foreground: #ffffff;
  --tenant-secondary: #64748b;
  --tenant-secondary-foreground: #ffffff;
  --tenant-accent: #0ea5e9;
  --tenant-accent-foreground: #ffffff;
  --tenant-gradient-from: #1e40af;
  --tenant-gradient-via: #2563eb;
  --tenant-gradient-to: #3b82f6;
}
```

## Classes Tailwind Disponíveis

### Cores do Tenant
```tsx
// Cores primárias
<div className="bg-tenant-primary text-tenant-primary-foreground">
  Botão Principal
</div>

// Cores secundárias
<div className="bg-tenant-secondary text-tenant-secondary-foreground">
  Conteúdo Secundário
</div>

// Cores de destaque
<div className="bg-tenant-accent text-tenant-accent-foreground">
  Elemento de Destaque
</div>
```

### Gradientes do Tenant
```tsx
// Gradiente principal para hero sections
<div className="bg-tenant-hero">
  Hero Section
</div>

// Gradiente para cards
<div className="bg-tenant-card">
  Card com gradiente
</div>

// Gradiente para botões
<button className="bg-tenant-button">
  Botão com Gradiente
</button>
```

## Componentes com Tema Dinâmico

### Exemplo de Botão com Tema
```tsx
function TenantButton({ children, variant = 'primary' }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  
  const variantClasses = {
    primary: "bg-tenant-primary text-tenant-primary-foreground hover:opacity-90",
    secondary: "bg-tenant-secondary text-tenant-secondary-foreground hover:opacity-90",
    gradient: "bg-tenant-button text-white hover:scale-105",
  };

  return (
    <button className={cn(baseClasses, variantClasses[variant])}>
      {children}
    </button>
  );
}
```

### Exemplo de Hero Section
```tsx
function TenantHero() {
  const { tenant } = useTenant();
  
  return (
    <section className="bg-tenant-hero text-white py-20">
      <div className="container mx-auto text-center">
        <TenantLogo variant="light" size="xl" className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">
          {tenant.branding.companyName}
        </h1>
        <p className="text-xl mb-8">
          {tenant.branding.companyTagline}
        </p>
        <button className="bg-white text-tenant-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
          Começar Agora
        </button>
      </div>
    </section>
  );
}
```

## Classes CSS Customizadas (se necessário)

Para casos mais complexos, você pode usar as CSS variables diretamente:

```css
.tenant-button-custom {
  background: linear-gradient(
    45deg, 
    var(--tenant-primary), 
    var(--tenant-accent)
  );
  color: var(--tenant-primary-foreground);
  border: 2px solid var(--tenant-accent);
}

.tenant-shadow {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 
              0 0 0 1px var(--tenant-primary, #2563eb);
}
```

## Detecção de Tenant via Body Class

O TenantProvider adiciona classes CSS ao body para permitir targeting específico:

```css
/* Estilos específicos para Vendas.IA */
body.tenant-vendas .custom-element {
  /* Estilos específicos para vendas */
}

/* Estilos específicos para Publix.IA */
body.tenant-publix .custom-element {
  /* Estilos específicos para publix */
}
```

## Hook useTenant

Use o hook para acessar informações do tenant no JavaScript:

```tsx
function MyComponent() {
  const { tenant, tenantId, isTenant } = useTenant();
  
  return (
    <div>
      <h1>Bem-vindo ao {tenant.branding.companyName}</h1>
      
      {isTenant('vendas') && (
        <p>Funcionalidade específica do Vendas.IA</p>
      )}
      
      {tenant.features.enableCampaigns && (
        <CampaignsSection />
      )}
      
      <ContactInfo 
        email={tenant.branding.supportEmail}
        phone={tenant.branding.supportPhone}
      />
    </div>
  );
}
```