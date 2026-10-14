'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write the letter body…',
  readOnly = false,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  const modules = useMemo(
    () => ({
      toolbar: readOnly
        ? false
        : [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            [{ indent: '-1' }, { indent: '+1' }],
            ['blockquote', 'link'],
            [{ color: [] }, { background: [] }],
            ['clean'],
          ],
    }),
    [readOnly],
  );

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'indent',
    'blockquote', 'link', 'color', 'background',
  ];

  return (
    <div className="letter-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      <style jsx global>{`
        .letter-editor .ql-toolbar.ql-snow {
          background: #080c18;
          border: 1px solid #1a2035;
          border-bottom: none;
          border-radius: 10px 10px 0 0;
          padding: 8px 10px;
        }
        .letter-editor .ql-container.ql-snow {
          background: #080c18;
          border: 1px solid #1a2035;
          border-radius: 0 0 10px 10px;
          color: #e2e8f0;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          min-height: 380px;
        }
        .letter-editor .ql-editor {
          min-height: 380px;
          padding: 18px 22px;
          line-height: 1.75;
        }
        .letter-editor .ql-editor.ql-blank::before {
          color: #475569;
          font-style: normal;
        }
        .letter-editor .ql-snow .ql-stroke { stroke: #94a3b8; }
        .letter-editor .ql-snow .ql-fill { fill: #94a3b8; }
        .letter-editor .ql-snow .ql-picker { color: #94a3b8; }
        .letter-editor .ql-snow .ql-picker-options {
          background: #0d1120;
          border: 1px solid #1a2035;
        }
        .letter-editor .ql-snow .ql-picker-item:hover,
        .letter-editor .ql-snow .ql-picker-label:hover,
        .letter-editor .ql-snow button:hover .ql-stroke,
        .letter-editor .ql-snow button.ql-active .ql-stroke {
          stroke: #facc15 !important;
          color: #facc15 !important;
        }
        .letter-editor .ql-snow .ql-active .ql-fill { fill: #facc15 !important; }
        .letter-editor .ql-snow .ql-tooltip {
          background: #0d1120;
          border: 1px solid #1a2035;
          color: #e2e8f0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.6);
        }
        .letter-editor .ql-snow .ql-tooltip input[type=text] {
          background: #080c18;
          border: 1px solid #1a2035;
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}