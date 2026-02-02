//NOTE: This file is only ever used by custom SSR implementation (ssr-custom). 
// It is not used by the framework-based implementations (ssr-vue, ssr-react).

// XSS-safe JSON serializer
// Escapes characters that could break out of <script> tags or cause XSS
// In a real framework, this would be provided by the framework (e.g., Vue's devalue, Next.js serialization)

export function safeSerialize(obj: unknown): string {
  const json = JSON.stringify(obj);
  
  // Escape characters that could break out of script tags or cause issues
  return json
    .replace(/</g, '\\u003c')     // Prevent </script> injection
    .replace(/>/g, '\\u003e')     // Prevent > in script context
    .replace(/&/g, '\\u0026')     // Prevent HTML entity issues
    .replace(/\u2028/g, '\\u2028') // Line separator - can break JS
    .replace(/\u2029/g, '\\u2029'); // Paragraph separator - can break JS
}
