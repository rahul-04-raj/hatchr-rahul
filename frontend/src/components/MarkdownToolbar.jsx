import React, { useEffect } from 'react';

export default function MarkdownToolbar({ textareaRef, onInsert }) {
  const insertMarkdown = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let newText, newCursorStart, newCursorEnd;
    
    if (selectedText) {
      // If text is selected, wrap it
      newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
      newCursorStart = start + before.length;
      newCursorEnd = newCursorStart + selectedText.length;
    } else {
      // If no text selected, insert placeholder and select it
      newText = text.substring(0, start) + before + placeholder + after + text.substring(end);
      newCursorStart = start + before.length;
      newCursorEnd = newCursorStart + placeholder.length;
    }
    
    onInsert(newText);
    
    // Set cursor position and selection after state updates
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  };

  const tools = [
    {
      icon: 'B',
      title: 'Bold (Ctrl+B)',
      className: 'font-bold',
      action: () => insertMarkdown('**', '**', 'bold text')
    },
    {
      icon: 'I',
      title: 'Italic (Ctrl+I)',
      className: 'italic',
      action: () => insertMarkdown('*', '*', 'italic text')
    },
    {
      icon: 'S',
      title: 'Strikethrough',
      className: 'line-through',
      action: () => insertMarkdown('~~', '~~', 'strikethrough')
    },
    {
      icon: 'H',
      title: 'Heading',
      className: 'font-bold text-base',
      action: () => insertMarkdown('## ', '', 'Heading')
    },
    {
      icon: '</>',
      title: 'Inline Code',
      className: 'font-mono text-xs',
      action: () => insertMarkdown('`', '`', 'code')
    },
    {
      icon: '{ }',
      title: 'Code Block',
      className: 'font-mono text-xs',
      action: () => insertMarkdown('```\n', '\n```', 'code')
    },
    {
      icon: '•',
      title: 'Bulleted List',
      action: () => insertMarkdown('- ', '', 'list item')
    },
    {
      icon: '1.',
      title: 'Numbered List',
      action: () => insertMarkdown('1. ', '', 'list item')
    },
    {
      icon: '""',
      title: 'Quote',
      action: () => insertMarkdown('> ', '', 'quote')
    },
    {
      icon: '🔗',
      title: 'Link (Ctrl+K)',
      action: () => insertMarkdown('[', '](url)', 'link text')
    },
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return;

      // Bold: Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('**', '**', 'bold text');
      }
      // Italic: Ctrl+I or Cmd+I
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('*', '*', 'italic text');
      }
      // Link: Ctrl+K or Cmd+K
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        insertMarkdown('[', '](url)', 'link text');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b rounded-t-lg flex-wrap">
      {tools.map((tool, index) => (
        <button
          key={index}
          type="button"
          onClick={tool.action}
          title={tool.title}
          className={`px-3 py-1.5 text-sm border border-gray-300 bg-white rounded hover:bg-gray-100 active:bg-gray-200 transition-colors ${tool.className || ''}`}
        >
          {tool.icon}
        </button>
      ))}
      <div className="ml-auto text-xs text-gray-500 hidden md:block">
        Tip: Select text first, then click a button to format
      </div>
    </div>
  );
}
