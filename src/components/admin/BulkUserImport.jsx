/**
 * BULK USER IMPORT
 * CSV upload for mass invitation (Admin/Owner only)
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkUserImport({ currentUser }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (fileData) => {
      // Upload file to extract data
      const { file_url } = await base44.integrations.Core.UploadFile({ file: fileData });
      
      // Extract user data from CSV
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            users: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  role: { type: "string" },
                  message: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (extracted.status === 'error') {
        throw new Error(extracted.details || 'Failed to parse CSV');
      }

      // Send invitations
      const emails = extracted.output.users.map(u => u.email);
      const role = extracted.output.users[0]?.role || 'participant';
      
      return base44.functions.invoke('inviteUser', { 
        emails, 
        role,
        message: 'Welcome to INTeract!' 
      });
    },
    onSuccess: (response) => {
      toast.success(response.data.summary || 'Bulk invitations sent!');
      queryClient.invalidateQueries(['user-invitations']);
      setFile(null);
      setPreview([]);
    },
    onError: (error) => toast.error(error.message || 'Bulk import failed')
  });

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(uploadedFile);

    // Preview first 5 rows
    const text = await uploadedFile.text();
    const rows = text.split('\n').slice(0, 6); // Header + 5 rows
    setPreview(rows);
  };

  const downloadTemplate = () => {
    const template = 'email,role,message\njohn.doe@intinc.com,participant,Welcome to the team!\njane.smith@intinc.com,facilitator,';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card data-b44-sync="true" data-feature="admin" data-component="bulkuserimport">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-purple-600" />
          Bulk User Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-2">CSV Format Required</p>
          <p className="text-xs text-blue-700 mb-3">
            Upload a CSV file with columns: <code className="bg-blue-100 px-1 rounded">email, role, message</code>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="text-blue-700 border-blue-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-int-orange transition-colors">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 mb-1">
              {file ? file.name : 'Click to upload CSV file'}
            </p>
            <p className="text-xs text-slate-600">
              Or drag and drop your CSV file here
            </p>
          </label>
        </div>

        {preview.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-900 mb-2">Preview:</p>
            <pre className="text-xs text-slate-700 overflow-x-auto">
              {preview.join('\n')}
            </pre>
          </div>
        )}

        <Button
          onClick={() => uploadMutation.mutate(file)}
          disabled={!file || uploadMutation.isPending}
          className="w-full bg-int-orange hover:bg-int-orange/90"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import & Send Invitations
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}