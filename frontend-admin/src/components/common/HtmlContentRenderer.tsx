import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentRendererProps {
    content: string;
    className?: string;
}

const HtmlContentRenderer: React.FC<HtmlContentRendererProps> = ({ content, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Configure DOMPurify with comprehensive allowlist
    const ALLOWED_TAGS = [
        // Text & Headings
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'br', 'hr',
        // Text Formatting
        'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'del', 'ins',
        // Lists
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        // Block Elements
        'div', 'section', 'article', 'header', 'footer', 'main', 'aside',
        'blockquote', 'pre', 'code', 'kbd', 'samp', 'var',
        // Links & Media
        'a', 'img', 'video', 'audio', 'source', 'track', 'iframe',
        // Tables
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
        // Forms
        'form', 'input', 'textarea', 'select', 'option', 'optgroup', 'button', 'label', 'fieldset', 'legend',
        // Interactive Elements
        'canvas', 'svg', 'details', 'summary', 'dialog',
        // Semantic Elements
        'nav', 'figure', 'figcaption', 'time', 'address', 'cite', 'q', 'abbr', 'acronym', 'dfn'
    ];

    const ALLOWED_ATTR = [
        // Common attributes
        'id', 'class', 'style', 'title', 'lang', 'dir',
        // Links
        'href', 'target', 'rel', 'download',
        // Images and media
        'src', 'alt', 'width', 'height', 'loading', 'decoding',
        'poster', 'controls', 'autoplay', 'loop', 'muted', 'preload',
        'playsinline', 'webkit-playsinline',
        // Video/Audio specific
        'type', 'media', 'sizes', 'srcset',
        // Tables
        'colspan', 'rowspan', 'scope', 'headers',
        // Forms
        'name', 'value', 'type', 'placeholder', 'required', 'disabled', 'readonly',
        'min', 'max', 'step', 'pattern', 'autocomplete', 'autofocus',
        'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget',
        // Interactive
        'open', 'data-*',
        // Accessibility
        'aria-*', 'role', 'tabindex'
    ];

    const FORBID_TAGS = [
        'script', 'object', 'embed', 'applet', 'base', 'basefont', 'bgsound', 'link',
        'meta', 'title', 'style', 'noscript', 'noframes', 'frameset', 'frame'
    ];

    const FORBID_ATTR = [
        'on*', 'javascript:', 'vbscript:', 'data:', 'mocha:', 'livescript:'
    ];

    useEffect(() => {
        if (containerRef.current && content) {
                         // Sanitize the HTML content
             const sanitizedHtml = DOMPurify.sanitize(content, {
                 ALLOWED_TAGS,
                 ALLOWED_ATTR,
                 FORBID_TAGS,
                 FORBID_ATTR,
                 ALLOW_DATA_ATTR: true,
                 ALLOW_UNKNOWN_PROTOCOLS: false,
                 RETURN_DOM: false,
                 RETURN_DOM_FRAGMENT: false,
                 RETURN_TRUSTED_TYPE: false,
                 SANITIZE_DOM: true,
                 KEEP_CONTENT: true,
                 IN_PLACE: false,
                 WHOLE_DOCUMENT: false,
                 FORCE_BODY: false,
                 SANITIZE_NAMED_PROPS: false,
                 ALLOW_ARIA_ATTR: true,
                 ADD_URI_SAFE_ATTR: ['target'],
                 ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
             });

            // Set the sanitized HTML
            containerRef.current.innerHTML = sanitizedHtml;

            // Apply custom styles to the rendered content
            applyCustomStyles(containerRef.current);
        }
    }, [content]);

    const applyCustomStyles = (container: HTMLElement) => {
        // Add custom CSS for better rendering
        const style = document.createElement('style');
        style.textContent = `
            .html-content-renderer {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 100%;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }
            
            .html-content-renderer h1, .html-content-renderer h2, .html-content-renderer h3,
            .html-content-renderer h4, .html-content-renderer h5, .html-content-renderer h6 {
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                font-weight: 600;
                line-height: 1.25;
                color: #2d3748;
            }
            
            .html-content-renderer h1 { font-size: 2em; }
            .html-content-renderer h2 { font-size: 1.5em; }
            .html-content-renderer h3 { font-size: 1.25em; }
            .html-content-renderer h4 { font-size: 1.125em; }
            .html-content-renderer h5 { font-size: 1em; }
            .html-content-renderer h6 { font-size: 0.875em; }
            
            .html-content-renderer p {
                margin-bottom: 1em;
                line-height: 1.6;
            }
            
            .html-content-renderer ul, .html-content-renderer ol {
                margin-bottom: 1em;
                padding-left: 2em;
            }
            
            .html-content-renderer li {
                margin-bottom: 0.5em;
            }
            
            .html-content-renderer blockquote {
                margin: 1.5em 0;
                padding: 0.5em 1em;
                border-left: 4px solid #e2e8f0;
                background-color: #f7fafc;
                font-style: italic;
            }
            
            .html-content-renderer pre {
                background-color: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 0.375rem;
                padding: 1em;
                overflow-x: auto;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 0.875em;
                line-height: 1.5;
                margin: 1em 0;
            }
            
            .html-content-renderer code {
                background-color: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 0.25rem;
                padding: 0.125em 0.25em;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 0.875em;
            }
            
            .html-content-renderer pre code {
                background-color: transparent;
                border: none;
                padding: 0;
                border-radius: 0;
            }
            
            .html-content-renderer table {
                width: 100%;
                border-collapse: collapse;
                margin: 1em 0;
                font-size: 0.875em;
            }
            
            .html-content-renderer th, .html-content-renderer td {
                border: 1px solid #e2e8f0;
                padding: 0.5em;
                text-align: left;
            }
            
            .html-content-renderer th {
                background-color: #f7fafc;
                font-weight: 600;
            }
            
            .html-content-renderer img {
                max-width: 100%;
                height: auto;
                border-radius: 0.375rem;
                margin: 1em 0;
            }
            
            .html-content-renderer video, .html-content-renderer audio {
                max-width: 100%;
                margin: 1em 0;
            }
            
            .html-content-renderer iframe {
                max-width: 100%;
                border: 1px solid #e2e8f0;
                border-radius: 0.375rem;
                margin: 1em 0;
            }
            
            .html-content-renderer a {
                color: #3182ce;
                text-decoration: underline;
                text-decoration-color: #cbd5e0;
            }
            
            .html-content-renderer a:hover {
                color: #2c5aa0;
                text-decoration-color: #a0aec0;
            }
            
            .html-content-renderer hr {
                border: none;
                border-top: 1px solid #e2e8f0;
                margin: 2em 0;
            }
            
            .html-content-renderer strong, .html-content-renderer b {
                font-weight: 600;
            }
            
            .html-content-renderer em, .html-content-renderer i {
                font-style: italic;
            }
            
            .html-content-renderer u {
                text-decoration: underline;
            }
            
            .html-content-renderer s, .html-content-renderer del {
                text-decoration: line-through;
            }
            
            .html-content-renderer mark {
                background-color: #fef5e7;
                padding: 0.125em 0.25em;
                border-radius: 0.25rem;
            }
            
            .html-content-renderer canvas {
                max-width: 100%;
                border: 1px solid #e2e8f0;
                border-radius: 0.375rem;
                margin: 1em 0;
            }
            
            .html-content-renderer svg {
                max-width: 100%;
                height: auto;
            }
            
            .html-content-renderer form {
                margin: 1em 0;
            }
            
            .html-content-renderer input, .html-content-renderer textarea, .html-content-renderer select {
                border: 1px solid #e2e8f0;
                border-radius: 0.375rem;
                padding: 0.5em;
                font-family: inherit;
                font-size: 0.875em;
                margin: 0.25em 0;
            }
            
            .html-content-renderer button {
                background-color: #3182ce;
                color: white;
                border: none;
                border-radius: 0.375rem;
                padding: 0.5em 1em;
                font-family: inherit;
                font-size: 0.875em;
                cursor: pointer;
                margin: 0.25em 0;
            }
            
            .html-content-renderer button:hover {
                background-color: #2c5aa0;
            }
            
            .html-content-renderer details {
                margin: 1em 0;
                border: 1px solid #e2e8f0;
                border-radius: 0.375rem;
            }
            
            .html-content-renderer summary {
                padding: 0.5em;
                background-color: #f7fafc;
                cursor: pointer;
                font-weight: 600;
            }
            
            .html-content-renderer details[open] summary {
                border-bottom: 1px solid #e2e8f0;
            }
            
            .html-content-renderer details > *:not(summary) {
                padding: 0.5em;
            }
        `;
        
        // Remove existing style if present
        const existingStyle = container.querySelector('style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Add new style
        container.appendChild(style);
        
        // Add the class to the container
        container.classList.add('html-content-renderer');
    };

    return (
        <div 
            ref={containerRef} 
            className={`html-content-renderer ${className}`}
            style={{ minHeight: '100%' }}
        />
    );
};

export default HtmlContentRenderer;
