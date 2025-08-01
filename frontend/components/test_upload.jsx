import React, { useEffect, useState } from 'react';

const S3Uploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
      setFile(selectedFile);
      setStatus('');
      setProgress(0);
    } else {
      setStatus('File must be 2MB or smaller.');
      setFile(null);
      setProgress(0);
    }
  };
  const presignedData={
    url:"https://placient-content-bucket.s3.ap-south-1.amazonaws.com/",
    fields:{
            "Content-Type": "image/jpeg",
            "bucket": "placient-content-bucket",
            "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
            "X-Amz-Credential": "AKIARHRRAJDGMJMLTFPO/20250703/ap-south-1/s3/aws4_request",
            "X-Amz-Date": "20250703T060139Z",
            "key": "uploads/N3OJtKz5j69Gu1i_OMYAN%jHFrLfyXFumAzlSS_l6D9.jpg",
            "Policy": "eyJleHBpcmF0aW9uIjoiMjAyNS0wNy0wM1QwNjoxMTozOVoiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMTAyNCwyMDk3MTUyXSxbImVxIiwiJGtleSIsInVwbG9hZHMvTjNPSnRLejVqNjlHdTFpX09NWUFOJWpIRnJMZnlYRnVtQXpsU1NfbDZEOS5qcGciXSx7IkNvbnRlbnQtVHlwZSI6ImltYWdlL2pwZWcifSx7ImJ1Y2tldCI6InBsYWNpZW50LWNvbnRlbnQtYnVja2V0In0seyJYLUFtei1BbGdvcml0aG0iOiJBV1M0LUhNQUMtU0hBMjU2In0seyJYLUFtei1DcmVkZW50aWFsIjoiQUtJQVJIUlJBSkRHTUpNTFRGUE8vMjAyNTA3MDMvYXAtc291dGgtMS9zMy9hd3M0X3JlcXVlc3QifSx7IlgtQW16LURhdGUiOiIyMDI1MDcwM1QwNjAxMzlaIn0seyJrZXkiOiJ1cGxvYWRzL04zT0p0S3o1ajY5R3UxaV9PTVlBTiVqSEZyTGZ5WEZ1bUF6bFNTX2w2RDkuanBnIn1dfQ==",
            "X-Amz-Signature": "6891616a51d4731fe7480bbbfe6050f240658ac11a14779aa13472c9365fd412"
        }
  }
  const handleUpload = async () => {
    if (!file || !presignedData?.url || !presignedData?.fields) {
      setStatus('Missing file or presigned data');
      return;
    }

    const formData = new FormData();

    Object.entries(presignedData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', presignedData.url, true);

    

    xhr.onload = () => {
      if (xhr.status === 204) {
        setStatus('Upload successful!');
      } else {
        setStatus('Upload failed.');
      }
    };

    xhr.onerror = () => {
      setStatus('Upload error.');
    };

    xhr.send(formData);
    setStatus('Uploading...');
  };

  return (
    <div className="p-4 border rounded max-w-md space-y-4">
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!file}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Upload
      </button>

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded h-4">
          <div
            className="bg-green-500 h-4 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {status && <p className="text-sm text-gray-700">{status}</p>}
    </div>
  );
};

export default S3Uploader;
