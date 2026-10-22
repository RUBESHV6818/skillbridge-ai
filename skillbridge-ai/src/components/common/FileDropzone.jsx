import React, { useState, useRef } from 'react';
import { Box, Typography, Button, LinearProgress, Alert } from '@mui/material';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { colors } from '../../theme/theme';

export const FileDropzone = ({
  onFileUpload,
  accept = '.pdf,.docx,.doc',
  maxSizeMB = 5,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successFile, setSuccessFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled || uploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndProcessFile = (file) => {
    setErrorMessage('');
    setSuccessFile(null);

    if (!file) return;

    // Check size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`The file exceeds the ${maxSizeMB}MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please compress or export a lighter version.`);
      return;
    }

    // Check extension
    const ext = `.${file.name.split('.').pop().toLowerCase()}`;
    const allowed = accept.split(',').map((a) => a.trim().toLowerCase());
    if (!allowed.includes(ext)) {
      setErrorMessage(`Invalid file format "${ext}". Please upload a standard ${accept.toUpperCase()} document.`);
      return;
    }

    // Process file
    setUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    // Call prop handler
    Promise.resolve(onFileUpload(file))
      .then(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setSuccessFile(file.name);
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 1200);
      })
      .catch((err) => {
        clearInterval(interval);
        setUploading(false);
        setUploadProgress(0);
        setErrorMessage(err.message || 'File upload failed. Please try again.');
      });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <Box>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && !disabled && fileInputRef.current?.click()}
        sx={{
          border: `2px dashed ${isDragging ? colors.accent : colors.border}`,
          borderRadius: 2,
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          backgroundColor: isDragging ? colors.accentLight : colors.surfaceSubtle,
          cursor: disabled || uploading ? 'not-allowed' : 'pointer',
          transition: 'all 160ms ease-in-out',
          position: 'relative',
          '&:hover': {
            borderColor: disabled || uploading ? colors.border : colors.inkSecondary,
            backgroundColor: disabled || uploading ? colors.surfaceSubtle : '#EDEBF4',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={disabled || uploading}
        />

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.accent,
            mx: 'auto',
            mb: 1.75,
          }}
        >
          {uploading ? (
            <FileText size={22} className="pulsing-icon" />
          ) : (
            <UploadCloud size={22} strokeWidth={2} />
          )}
        </Box>

        <Typography variant="body1" sx={{ fontWeight: 600, color: colors.ink, mb: 0.5 }}>
          {isDragging ? 'Drop resume file to upload' : 'Click to select or drag and drop your resume'}
        </Typography>

        <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 1 }}>
          Supported formats: PDF, DOCX (Maximum file size: {maxSizeMB}MB)
        </Typography>

        {uploading && (
          <Box sx={{ width: '80%', mx: 'auto', mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, fontSize: '0.71875rem' }}>
                Parsing resume sections & extracting keywords...
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.accent }}>
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.borderLight,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: colors.accent,
                },
              }}
            />
          </Box>
        )}

        {successFile && !uploading && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mt: 1.5, color: colors.success }}>
            <CheckCircle2 size={16} />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              "{successFile}" successfully uploaded and parsed!
            </Typography>
          </Box>
        )}
      </Box>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            mt: 1.5,
            fontSize: '0.8125rem',
            border: `1px solid ${colors.errorBorder}`,
            backgroundColor: colors.errorBg,
            color: colors.error,
          }}
        >
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
};

export default FileDropzone;
