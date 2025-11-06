import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Save, Trash2, Edit2, Plus, X, File } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getUserNotes, createNote, updateNote, deleteNote, uploadNoteMedia, deleteNoteMedia } from '../../services/firebase';
import MediaUploader from '../shared/MediaUploader';

/**
 * NotesSection - A note-taking component for students with support for multiple titled notes
 * Students can create, edit, delete, and view a list of their notes with media attachments
 */
const NotesSection = ({ userId }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedMedia, setEditedMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const userNotes = await getUserNotes(userId);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = () => {
    setIsCreating(true);
    setEditedTitle('');
    setEditedContent('');
    setEditedMedia([]);
    setSelectedNote(null);
  };

  const handleSaveNewNote = async () => {
    if (!editedTitle.trim() && !editedContent.trim()) {
      setIsCreating(false);
      return;
    }

    setSaving(true);
    try {
      // Create the note first to get the note ID
      const noteId = await createNote(userId, {
        title: editedTitle.trim() || 'Untitled Note',
        content: editedContent,
        media: [] // Will be updated after uploads
      });

      // Upload media files if any
      const uploadedMedia = [];
      for (const mediaItem of editedMedia) {
        if (mediaItem.isNew && mediaItem.file) {
          try {
            const uploadResult = await uploadNoteMedia(mediaItem.file, noteId, userId);
            uploadedMedia.push(uploadResult);
          } catch (error) {
            console.error('Error uploading media:', error);
            alert(`Failed to upload ${mediaItem.name}. The note was saved without this file.`);
          }
        } else if (!mediaItem.isNew) {
          // Keep existing media
          uploadedMedia.push(mediaItem);
        }
      }

      // Update note with media references if any were uploaded
      if (uploadedMedia.length > 0) {
        await updateNote(noteId, { media: uploadedMedia });
      }

      await fetchNotes();
      setIsCreating(false);
      setEditedTitle('');
      setEditedContent('');
      setEditedMedia([]);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setEditedMedia(note.media || []);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedNote) return;

    setSaving(true);
    try {
      // Upload new media files
      const uploadedMedia = [];
      const existingMedia = editedMedia.filter(item => !item.isNew);
      const newMedia = editedMedia.filter(item => item.isNew);
      
      // Keep existing media
      uploadedMedia.push(...existingMedia);

      // Upload new media
      for (const mediaItem of newMedia) {
        if (mediaItem.file) {
          try {
            const uploadResult = await uploadNoteMedia(mediaItem.file, selectedNote.id, userId);
            uploadedMedia.push(uploadResult);
          } catch (error) {
            console.error('Error uploading media:', error);
            alert(`Failed to upload ${mediaItem.name}. The note was saved without this file.`);
          }
        }
      }

      // Check if any media was removed and delete from storage
      const originalMedia = selectedNote.media || [];
      const removedMedia = originalMedia.filter(
        original => !uploadedMedia.some(current => current.path === original.path)
      );

      for (const mediaItem of removedMedia) {
        if (mediaItem.path) {
          try {
            await deleteNoteMedia(mediaItem.path);
          } catch (error) {
            console.error('Error deleting media:', error);
          }
        }
      }

      await updateNote(selectedNote.id, {
        title: editedTitle.trim() || 'Untitled Note',
        content: editedContent,
        media: uploadedMedia
      });
      await fetchNotes();
      setIsEditing(false);
      setSelectedNote(null);
      setEditedTitle('');
      setEditedContent('');
      setEditedMedia([]);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteNote(noteId);
      await fetchNotes();
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    // Clean up preview URLs for new media items
    editedMedia.filter(item => item.isNew && item.previewUrl).forEach(item => {
      URL.revokeObjectURL(item.previewUrl);
    });
    
    setIsEditing(false);
    setIsCreating(false);
    setSelectedNote(null);
    setEditedTitle('');
    setEditedContent('');
    setEditedMedia([]);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h2 className="card-title">My Notes</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-6 h-6" />
          <span className="ml-2 text-gray-600">Loading notes...</span>
        </div>
      </div>
    );
  }

  // Edit/Create Mode
  if (isEditing || isCreating) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h2 className="card-title">{isCreating ? 'New Note' : 'Edit Note'}</h2>
          </div>
          <button
            onClick={handleCancelEdit}
            className="btn btn-sm btn-secondary"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <ReactQuill
              value={editedContent}
              onChange={setEditedContent}
              placeholder="Write your notes here..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['blockquote', 'code-block'],
                  ['link'],
                  ['clean']
                ]
              }}
              className="bg-white"
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </div>

          <MediaUploader
            media={editedMedia}
            onMediaChange={setEditedMedia}
            disabled={saving}
          />

          <button
            onClick={isCreating ? handleSaveNewNote : handleSaveEdit}
            disabled={saving}
            className="btn btn-primary w-full"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    );
  }

  // List Mode
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h2 className="card-title">My Notes</h2>
          {notes.length > 0 && (
            <span className="ml-auto bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
              {notes.length}
            </span>
          )}
        </div>
        <button
          onClick={handleCreateNote}
          className="btn btn-sm btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="space-y-2">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No notes yet</p>
            <button
              onClick={handleCreateNote}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
              Create Your First Note
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <div 
                    className="text-sm text-gray-600 line-clamp-2 mt-1 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: note.content || 'No content' }}
                  />
                  
                  {/* Media preview */}
                  {note.media && note.media.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {note.media.slice(0, 3).map((media, idx) => (
                        <div key={idx} className="relative">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={media.name}
                              className="w-16 h-16 object-cover rounded border border-gray-300"
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded border border-gray-300">
                              <File className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                      ))}
                      {note.media.length > 3 && (
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border border-gray-300 text-xs text-gray-600">
                          +{note.media.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Updated {formatTimeAgo(note.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    title="Edit note"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSection;
