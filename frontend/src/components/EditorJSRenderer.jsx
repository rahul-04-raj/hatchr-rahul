import React from 'react';

const EditorJSRenderer = ({ data }) => {
  if (!data || !data.blocks) {
    return null;
  }

  const renderBlock = (block) => {
    switch (block.type) {
      case 'header':
        const HeaderTag = `h${block.data.level}`;
        return React.createElement(
          HeaderTag,
          { 
            key: block.id,
            className: `font-bold mb-2 ${
              block.data.level === 1 ? 'text-3xl' :
              block.data.level === 2 ? 'text-2xl' :
              block.data.level === 3 ? 'text-xl' :
              block.data.level === 4 ? 'text-lg' :
              'text-base'
            }`
          },
          block.data.text
        );

      case 'paragraph':
        return (
          <p 
            key={block.id}
            className="mb-3 text-gray-700"
            dangerouslySetInnerHTML={{ __html: block.data.text }}
          />
        );

      case 'list':
        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
        return (
          <ListTag 
            key={block.id}
            className={`mb-3 ml-6 ${
              block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'
            }`}
          >
            {block.data.items.map((item, index) => {
              // Handle both old format (string) and new format (object with content)
              const content = typeof item === 'string' ? item : item.content;
              return (
                <li 
                  key={index}
                  className="mb-1"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              );
            })}
          </ListTag>
        );

      case 'code':
        return (
          <div key={block.id} className="mb-3">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{block.data.code}</code>
            </pre>
          </div>
        );

      case 'quote':
        return (
          <blockquote 
            key={block.id}
            className="border-l-4 border-gray-300 pl-4 italic mb-3 text-gray-600"
          >
            <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
            {block.data.caption && (
              <footer className="text-sm text-gray-500 mt-1">
                — {block.data.caption}
              </footer>
            )}
          </blockquote>
        );

      case 'delimiter':
        return (
          <div key={block.id} className="flex justify-center my-6">
            <div className="flex gap-2">
              <span className="text-2xl text-gray-400">*</span>
              <span className="text-2xl text-gray-400">*</span>
              <span className="text-2xl text-gray-400">*</span>
            </div>
          </div>
        );

      case 'embed':
        return (
          <div key={block.id} className="mb-3">
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
              <iframe
                src={block.data.embed}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {block.data.caption && (
              <p className="text-sm text-gray-500 text-center mt-2">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      case 'linkTool':
        return (
          <div key={block.id} className="mb-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
            <a 
              href={block.data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3"
            >
              {block.data.meta?.image?.url && (
                <img 
                  src={block.data.meta.image.url}
                  alt=""
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="font-medium text-blue-600 hover:underline">
                  {block.data.meta?.title || block.data.link}
                </div>
                {block.data.meta?.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {block.data.meta.description}
                  </p>
                )}
              </div>
            </a>
          </div>
        );

      default:
        console.warn('Unknown block type:', block.type);
        return null;
    }
  };

  return (
    <div className="editor-js-renderer">
      {data.blocks.map(block => renderBlock(block))}
    </div>
  );
};

export default EditorJSRenderer;
