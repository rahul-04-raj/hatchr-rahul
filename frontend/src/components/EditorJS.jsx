import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import LinkTool from '@editorjs/link';

const EditorJSComponent = ({ data, onChange, editorRef }) => {
  const holderRef = useRef(null);

  useEffect(() => {
    if (!holderRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      data: data || undefined,
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a heading',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        code: {
          class: Code,
          config: {
            placeholder: 'Enter code'
          }
        },
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+C'
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              coub: true,
              twitter: true
            }
          }
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote author'
          }
        },
        delimiter: Delimiter,
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: '/api/fetchUrl' // Optional: for link preview
          }
        }
      },
      placeholder: 'Start writing your content...',
      minHeight: 300,
      onChange: async () => {
        if (onChange) {
          try {
            const content = await editor.save();
            onChange(content);
          } catch (error) {
            console.error('Saving failed: ', error);
          }
        }
      }
    });

    // Store editor instance in ref for external access
    if (editorRef) {
      editorRef.current = editor;
    }

    return () => {
      if (editor && typeof editor.destroy === 'function') {
        editor.destroy();
      }
    };
  }, []);

  return (
    <div 
      ref={holderRef}
      className="editor-js-container"
    />
  );
};

export default EditorJSComponent;
