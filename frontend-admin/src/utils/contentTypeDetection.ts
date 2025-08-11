/**
 * Detects whether content is HTML or markdown based on content analysis
 * @param content - The content to analyze
 * @returns 'html' | 'markdown' - The detected content type
 */
export const detectContentType = (content: string): 'html' | 'markdown' => {
  if (!content || content.trim().length === 0) {
    return 'markdown';
  }

  const trimmedContent = content.trim();

  // Check for obvious HTML indicators
  const htmlPatterns = [
    /<[^>]+>/, // Contains HTML tags
    /&[a-zA-Z]+;/, // Contains HTML entities
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i, // Contains script tags
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i, // Contains iframe tags
    /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/i, // Contains SVG tags
    /<canvas\b[^<]*(?:(?!<\/canvas>)<[^<]*)*<\/canvas>/i, // Contains canvas tags
    /<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/i, // Contains video tags
    /<audio\b[^<]*(?:(?!<\/audio>)<[^<]*)*<\/audio>/i, // Contains audio tags
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/i, // Contains form tags
    /<table\b[^<]*(?:(?!<\/table>)<[^<]*)*<\/table>/i, // Contains table tags
  ];

  // Check for HTML patterns
  for (const pattern of htmlPatterns) {
    if (pattern.test(trimmedContent)) {
      return 'html';
    }
  }

  // Check for markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s/, // Headers starting with #
    /^\*\s/, // Unordered lists starting with *
    /^-\s/, // Unordered lists starting with -
    /^\d+\.\s/, // Ordered lists starting with numbers
    /^\>\s/, // Blockquotes starting with >
    /^\|.*\|.*\|/, // Tables with pipe separators
    /^\`{3,}/, // Code blocks starting with ```
    /^\`[^`]+\`/, // Inline code with single backticks
    /^\*\*[^*]+\*\*/, // Bold text with **
    /^\*[^*]+\*/, // Italic text with *
    /^\[.*\]\(.*\)/, // Links with [text](url) format
    /^!\[.*\]\(.*\)/, // Images with ![alt](url) format
  ];

  // Check for markdown patterns
  for (const pattern of markdownPatterns) {
    if (pattern.test(trimmedContent)) {
      return 'markdown';
    }
  }

  // Check for mixed content or ambiguous cases
  const hasHtmlTags = /<[^>]+>/.test(trimmedContent);
  const hasMarkdownHeaders = /^#{1,6}\s/m.test(trimmedContent);
  const hasMarkdownLists = /^[\*\-]\s/m.test(trimmedContent) || /^\d+\.\s/m.test(trimmedContent);

  // If content has both HTML and markdown patterns, prefer HTML
  if (hasHtmlTags && (hasMarkdownHeaders || hasMarkdownLists)) {
    return 'html';
  }

  // If content has HTML tags, it's likely HTML
  if (hasHtmlTags) {
    return 'html';
  }

  // If content has markdown patterns, it's likely markdown
  if (hasMarkdownHeaders || hasMarkdownLists) {
    return 'markdown';
  }

  // Default to markdown for plain text
  return 'markdown';
};

/**
 * Validates if the content matches the specified content type
 * @param content - The content to validate
 * @param contentType - The expected content type
 * @returns boolean - Whether the content is valid for the specified type
 */
export const validateContentType = (content: string, contentType: 'html' | 'markdown'): boolean => {
  const detectedType = detectContentType(content);
  return detectedType === contentType;
};

/**
 * Gets a content type badge color based on the content type
 * @param contentType - The content type
 * @returns string - CSS classes for the badge
 */
export const getContentTypeBadgeClasses = (contentType: 'html' | 'markdown'): string => {
  switch (contentType) {
    case 'html':
      return 'badge badge-primary badge-xs';
    case 'markdown':
      return 'badge badge-info badge-xs';
    default:
      return 'badge badge-neutral badge-xs';
  }
};

/**
 * Gets a human-readable label for the content type
 * @param contentType - The content type
 * @returns string - Human-readable label
 */
export const getContentTypeLabel = (contentType: 'html' | 'markdown'): string => {
  switch (contentType) {
    case 'html':
      return 'HTML';
    case 'markdown':
      return 'Markdown';
    default:
      return 'Unknown';
  }
};
