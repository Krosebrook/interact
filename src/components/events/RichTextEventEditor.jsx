import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Label } from '@/components/ui/label';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ]
};

export default function RichTextEventEditor({ value, onChange, label, placeholder }) {
  return (
    <div className="space-y-2" data-b44-sync="true" data-feature="events" data-component="richtexteventeditor">
      {label && <Label>{label}</Label>}
      <div className="bg-white rounded-lg border">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
}