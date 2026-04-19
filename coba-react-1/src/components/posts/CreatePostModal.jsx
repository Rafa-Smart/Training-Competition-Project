import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { postService } from '../../services/postService';
import toast from 'react-hot-toast';
import ErrorMessage from '../common/ErrorMessage';
import { validateFile } from '../../utils/helpers';

const CreatePostModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [attachmentErrors, setAttachmentErrors] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      caption: '',
    },
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [...attachments];
    const newErrors = [];

    files.forEach((file, index) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        newErrors.push(`File ${file.name}: ${validation.error}`);
      } else {
        newAttachments.push(file);
      }
    });

    setAttachments(newAttachments);
    setAttachmentErrors(newErrors);

    // Reset file input
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const onSubmit = async (data) => {
    if (attachments.length === 0) {
      toast.error('Please select at least one attachment');
      return;
    }

    if (attachmentErrors.length > 0) {
      toast.error('Please fix attachment errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('caption', data.caption);
      
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      await postService.createPost(formData);
      
      toast.success('Post created successfully!');
      reset();
      setAttachments([]);
      setAttachmentErrors([]);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      const errors = error.response?.data?.errors || {};
      const message = error.response?.data?.message || 'Failed to create post';
      
      if (Object.keys(errors).length > 0) {
        Object.values(errors).forEach(errorArray => {
          errorArray.forEach(err => toast.error(err));
        });
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption *
              </label>
              <textarea
                {...register('caption', {
                  required: 'Caption is required',
                })}
                className="input-field"
                rows="4"
                placeholder="What's on your mind?"
              />
              <ErrorMessage error={errors.caption?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="attachments"
                  className="cursor-pointer inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Photos</span>
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Select one or multiple images (JPG, PNG, GIF, WEBP up to 5MB each)
                </p>
              </div>

              {attachmentErrors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachmentErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">{error}</p>
                  ))}
                </div>
              )}

              {attachments.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {attachments.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || attachments.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;