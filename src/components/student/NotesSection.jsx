import React, { useState, useEffect, useRef } from 'react';
import { FileText, Save, Bold, Italic, List, Underline, Loader2 } from 'lucide-react';

/**
 * NotesSection - A rich text note-taking component for students
 * Supports basic formatting: bold, italic, underline, and bullet points
 */
const NotesSection = ({ userId, onSave }) => {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    // Load saved notes from localStorage as a simple solution
    const savedNotes = localStorage.getItem(`notes_${userId}`);
    if (savedNotes) {
      setNotes(savedNotes);
      if (editorRef.current) {
        editorRef.current.innerHTML = savedNotes;
      }
    }
    const savedTime = localStorage.getItem(`notes_${userId}_savedAt`);
    if (savedTime) {
      setLastSaved(new Date(savedTime));
    }
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const content = editorRef.current.innerHTML;
      setNotes(content);
      
      // Save to localStorage
      localStorage.setItem(`notes_${userId}`, content);
      const now = new Date();
      localStorage.setItem(`notes_${userId}_savedAt`, now.toISOString());
      setLastSaved(now);
      
      // Call parent save handler if provided
      if (onSave) {
        await onSave(content);
      }
      
      // Show success briefly
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertBulletList = () => {
    applyFormat('insertUnorderedList');
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
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

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h2 className="card-title">My Notes</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-sm btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Notes
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {/* Formatting toolbar */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('underline')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={insertBulletList}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Rich text editor */}
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          style={{
            maxHeight: '500px',
            overflowY: 'auto'
          }}
          onInput={(e) => {
            // Track changes for potential auto-save
          }}
          suppressContentEditableWarning
        >
          {/* Content will be set via ref */}
        </div>

        {/* Last saved indicator */}
        {lastSaved && (
          <p className="text-xs text-gray-500 text-right">
            Last saved: {formatTimeAgo(lastSaved)}
          </p>
        )}
      </div>
    </div>
  );
};

export default NotesSection;
