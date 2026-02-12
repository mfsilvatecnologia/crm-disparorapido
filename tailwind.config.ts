import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
				mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Design System Colors - LeadsRápido B2B
				primary: {
					50: '#EEF2FF',
					100: '#E0E7FF', 
					DEFAULT: '#6366F1',
					500: '#6366F1',
					600: '#4F46E5',
					700: '#4338CA',
					900: '#312E81',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					dark: 'hsl(var(--primary-dark))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					light: 'hsl(var(--accent-light))'
				},
				success: {
					DEFAULT: '#10B981',
					500: '#10B981',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					500: '#F59E0B',
					DEFAULT: '#F59E0B',
					foreground: 'hsl(var(--warning-foreground))'
				},
				danger: {
					500: '#EF4444',
					DEFAULT: '#EF4444',
					foreground: 'white'
				},
				info: {
					500: '#0EA5E9',
					DEFAULT: '#0EA5E9',
					foreground: 'white'
				},
				// Neutral Scale
				gray: {
					50: '#F9FAFB',
					100: '#F3F4F6',
					200: '#E5E7EB',
					400: '#9CA3AF',
					600: '#4B5563',
					900: '#111827',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Tenant-specific colors (dynamically set via CSS variables)
				tenant: {
					primary: 'var(--tenant-primary)',
					'primary-foreground': 'var(--tenant-primary-foreground)',
					secondary: 'var(--tenant-secondary)',
					'secondary-foreground': 'var(--tenant-secondary-foreground)',
					accent: 'var(--tenant-accent)',
					'accent-foreground': 'var(--tenant-accent-foreground)',
					'gradient-from': 'var(--tenant-gradient-from)',
					'gradient-via': 'var(--tenant-gradient-via)',
					'gradient-to': 'var(--tenant-gradient-to)',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			// Spacing Scale (8px base)
			spacing: {
				'1': '0.25rem',  // 4px
				'2': '0.5rem',   // 8px
				'3': '0.75rem',  // 12px
				'4': '1rem',     // 16px
				'6': '1.5rem',   // 24px
				'8': '2rem',     // 32px
				'12': '3rem',    // 48px
				'16': '4rem',    // 64px
			},
			// Container Sizes
			container: {
				screens: {
					'sm': '640px',
					'md': '768px', 
					'lg': '1024px',
					'xl': '1280px',
					'2xl': '1536px',
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				// Tenant-specific gradients
				'tenant-hero': 'linear-gradient(135deg, var(--tenant-gradient-from), var(--tenant-gradient-via), var(--tenant-gradient-to))',
				'tenant-card': 'linear-gradient(45deg, var(--tenant-gradient-from), var(--tenant-gradient-to))',
				'tenant-button': 'linear-gradient(90deg, var(--tenant-primary), var(--tenant-accent))',
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'elegant': '0 10px 30px -10px hsl(var(--primary) / 0.3)',
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'spring': 'var(--transition-spring)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'glow': {
					from: { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
					to: { boxShadow: '0 0 30px hsl(var(--primary) / 0.5)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'slide-up': 'slide-up 0.5s ease-out forwards',
				'glow': 'glow 2s ease-in-out infinite alternate'
			}
		}
	},
	plugins: [tailwindcssAnimate],
	// Safelist for dynamic classes used by design-tokens.ts
	safelist: [
		// Status colors - backgrounds
		'bg-primary-100',
		'bg-green-100',
		'bg-amber-100',
		'bg-emerald-100',
		'bg-red-100',
		'bg-gray-100',
		'bg-blue-100',
		// Status colors - text
		'text-primary-700',
		'text-green-700',
		'text-amber-700',
		'text-emerald-700',
		'text-red-700',
		'text-gray-700',
		'text-gray-600',
		'text-blue-700',
		// Status colors - borders
		'border-primary-500',
		'border-green-500',
		'border-amber-500',
		'border-emerald-500',
		'border-red-500',
		'border-gray-500',
		'border-gray-400',
		'border-blue-500',
		// Score colors
		'text-red-500',
		'text-amber-500',
		'text-blue-500',
		'text-green-500',
		'bg-red-100',
		'bg-amber-100',
		'bg-blue-100',
		'bg-green-100',
	],
} satisfies Config;
