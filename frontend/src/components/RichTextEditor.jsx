import React, { useMemo } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import { marked } from 'marked';
import 'easymde/dist/easymde.min.css';

export default function RichTextEditor({ value, onChange, disabled }) {
  const options = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Write your content here... Use the toolbar to format text.',
      status: false,
      toolbar: [
        'bold',
        'italic',
        'strikethrough',
        '|',
        'heading-1',
        'heading-2',
        'heading-3',
        '|',
        'code',
        'quote',
        '|',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide'
      ],
      minHeight: '300px',
      maxHeight: '600px',
      sideBySideFullscreen: false,
      shortcuts: {
        toggleBold: 'Cmd-B',
        toggleItalic: 'Cmd-I',
        drawLink: 'Cmd-K',
        toggleHeadingSmaller: 'Cmd-H',
        toggleCodeBlock: 'Cmd-Alt-C',
        togglePreview: 'Cmd-P'
      },
      previewRender: (plainText) => {
        try {
          return marked.parse(plainText);
        } catch (e) {
          return plainText;
        }
      }
    };
  }, []);

  return (
    <div className="rich-text-editor">
      <SimpleMDE
        value={value}
        onChange={onChange}
        options={options}
      />
    </div>
  );
}
