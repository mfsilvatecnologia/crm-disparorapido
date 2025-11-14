/**
 * Browser-compatible shim for style-to-object
 * Converts CSS style strings to JavaScript objects
 * Example: "color: red; font-size: 14px" -> { color: 'red', fontSize: '14px' }
 */

function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function styleToObject(styleStr: string): Record<string, string> | null {
  if (!styleStr || typeof styleStr !== 'string') {
    return null;
  }

  const styles: Record<string, string> = {};

  // Split by semicolon and process each declaration
  styleStr.split(';').forEach((declaration) => {
    const trimmed = declaration.trim();
    if (!trimmed) return;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) return;

    const property = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    if (property && value) {
      // Convert kebab-case to camelCase (e.g., font-size -> fontSize)
      const camelCasedProperty = camelCase(property);
      styles[camelCasedProperty] = value;
    }
  });

  return Object.keys(styles).length > 0 ? styles : null;
}

export default styleToObject;
