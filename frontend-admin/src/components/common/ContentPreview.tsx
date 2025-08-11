import React from 'react';
import HtmlContentRenderer from './HtmlContentRenderer';

interface ContentPreviewProps {
    content: string;
    contentType: 'markdown' | 'html';
    className?: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ content, contentType, className = '' }) => {
    if (!content || content.trim().length === 0) {
        return (
            <div className={`flex items-center justify-center h-full text-base-content/50 ${className}`}>
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    </svg>
                    <p className="mt-2 text-sm">No content to preview</p>
                </div>
            </div>
        );
    }

    if (contentType === 'html') {
        return (
            <div className={`h-full overflow-auto ${className}`}>
                <HtmlContentRenderer content={content} />
            </div>
        );
    }

    // Markdown content
    return (
        <div className={`h-full overflow-auto ${className}`}>
            <pre className="whitespace-pre-wrap text-sm font-mono p-4 bg-base-100 h-full m-0">
                {content}
            </pre>
        </div>
    );
};

export default ContentPreview;
