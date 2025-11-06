import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Save, Trash2, Edit2, Plus, X, Search, Filter, Users, File } from 'lucide-react';
import { getAdvisorNotes, createAdvisorNote, updateAdvisorNote, deleteAdvisorNote, getProjectGroupsByAdvisor, uploadNoteMedia, deleteNoteMedia } from '../../services/firebase';
import { processSelectionMode } from '../../utils/selectionUtils';
import MediaUploader from '../shared/MediaUploader';

/**
 * AdvisorNotesSection - A note-taking component for advisors with student/team tagging
 * Advisors can create, edit, delete, and view notes tagged to specific students or teams with media attachments
 */
const AdvisorNotesSection = ({ advisorId, students = [] }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedMedia, setEditedMedia] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectionMode, setSelectionMode] = useState('single'); // 'single', 'multiple', 'team'
  const [teams, setTeams] = useState([]);
  const [filterStudentId, setFilterStudentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!advisorId) return;
    try {
      setLoading(true);
      const advisorNotes = await getAdvisorNotes(advisorId, filterStudentId || null);
      setNotes(advisorNotes);
    } catch (error) {
      console.error('Error fetching advisor notes:', error);
    } finally {
      setLoading(false);
    }
  }, [advisorId, filterStudentId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!advisorId) return;
      try {
        const projectTeams = await getProjectGroupsByAdvisor(advisorId);
        setTeams(projectTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchTeams();
  }, [advisorId]);

  const handleCreateNote = () => {
    setIsCreating(true);
    setEditedTitle('');
    setEditedContent('');
    setEditedMedia([]);
    setSelectedStudentIds([]);
    setSelectedTeamId('');
    setSelectionMode('single');
    setSelectedNote(null);
  };

  const handleSaveNewNote = async () => {
    if (!editedTitle.trim() && !editedContent.trim()) {
      setIsCreating(false);
      return;
    }

    const { studentIds, studentNames, teamId, teamName } = processSelectionMode(
      selectionMode,
      selectedStudentIds,
      selectedTeamId,
      students,
      teams
    );

    if (studentIds.length === 0) {
      alert('Please select at least one student or team to tag this note to.');
      return;
    }

    setSaving(true);
    try {
      // Create the note first to get the note ID
      const noteId = await createAdvisorNote(advisorId, {
        studentId: studentIds[0], // For backward compatibility
        studentName: studentNames[0] || '',
        studentIds,
        studentNames,
        teamId,
        teamName,
        title: editedTitle.trim() || 'Untitled Note',
        content: editedContent,
        media: [] // Will be updated after uploads
      });

      // Upload media files if any
      const uploadedMedia = [];
      for (const mediaItem of editedMedia) {
        if (mediaItem.isNew && mediaItem.file) {
          try {
            const uploadResult = await uploadNoteMedia(mediaItem.file, noteId, advisorId);
            uploadedMedia.push(uploadResult);
          } catch (error) {
            console.error('Error uploading media:', error);
            alert(`Failed to upload ${mediaItem.name}. The note was saved without this file.`);
          }
        } else if (!mediaItem.isNew) {
          uploadedMedia.push(mediaItem);
        }
      }

      // Update note with media references if any were uploaded
      if (uploadedMedia.length > 0) {
        await updateAdvisorNote(noteId, { media: uploadedMedia });
      }

      await fetchNotes();
      setIsCreating(false);
      setEditedTitle('');
      setEditedContent('');
      setEditedMedia([]);
      setSelectedStudentIds([]);
      setSelectedTeamId('');
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
    
    // Determine selection mode based on note data
    if (note.teamId) {
      setSelectionMode('team');
      setSelectedTeamId(note.teamId);
      setSelectedStudentIds([]);
    } else if (note.studentIds && note.studentIds.length > 1) {
      setSelectionMode('multiple');
      setSelectedStudentIds(note.studentIds);
      setSelectedTeamId('');
    } else {
      setSelectionMode('single');
      setSelectedStudentIds(note.studentIds || (note.studentId ? [note.studentId] : []));
      setSelectedTeamId('');
    }
    
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedNote) return;

    const { studentIds, studentNames, teamId, teamName } = processSelectionMode(
      selectionMode,
      selectedStudentIds,
      selectedTeamId,
      students,
      teams
    );

    if (studentIds.length === 0) {
      alert('Please select at least one student or team to tag this note to.');
      return;
    }

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
            const uploadResult = await uploadNoteMedia(mediaItem.file, selectedNote.id, advisorId);
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

      await updateAdvisorNote(selectedNote.id, {
        studentId: studentIds[0], // For backward compatibility
        studentName: studentNames[0] || '',
        studentIds,
        studentNames,
        teamId,
        teamName,
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
      setSelectedStudentIds([]);
      setSelectedTeamId('');
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
      await deleteAdvisorNote(noteId);
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
    setSelectedStudentIds([]);
    setSelectedTeamId('');
    setSelectionMode('single');
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
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

  // Filter notes by search term
  const filteredNotes = notes.filter(note => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      note.title?.toLowerCase().includes(lowerSearch) ||
      note.content?.toLowerCase().includes(lowerSearch) ||
      note.studentName?.toLowerCase().includes(lowerSearch)
    );
  });

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h2 className="card-title">Meeting Notes</h2>
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
            <h2 className="card-title">{isCreating ? 'New Meeting Note' : 'Edit Note'}</h2>
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
          {/* Selection Mode Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Students/Team <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setSelectionMode('single');
                  setSelectedStudentIds([]);
                  setSelectedTeamId('');
                }}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  selectionMode === 'single'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Single Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionMode('multiple');
                  setSelectedStudentIds([]);
                  setSelectedTeamId('');
                }}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  selectionMode === 'multiple'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Multiple Students
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionMode('team');
                  setSelectedStudentIds([]);
                  setSelectedTeamId('');
                }}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  selectionMode === 'team'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Team
              </button>
            </div>

            {/* Single Student Mode */}
            {selectionMode === 'single' && (
              <select
                value={selectedStudentIds[0] || ''}
                onChange={(e) => setSelectedStudentIds(e.target.value ? [e.target.value] : [])}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            )}

            {/* Multiple Students Mode */}
            {selectionMode === 'multiple' && (
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-sm text-gray-500">No students available</p>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{student.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {selectedStudentIds.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Team Mode */}
            {selectionMode === 'team' && (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select a team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.studentIds?.length || 0} students)
                  </option>
                ))}
              </select>
            )}
          </div>

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
              Meeting Notes
            </label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Notes from your meeting with the student..."
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
            />
          </div>

          <MediaUploader
            media={editedMedia}
            onMediaChange={setEditedMedia}
            disabled={saving}
          />

          <button
            onClick={isCreating ? handleSaveNewNote : handleSaveEdit}
            disabled={
              saving || 
              (selectionMode === 'single' && selectedStudentIds.length === 0) ||
              (selectionMode === 'multiple' && selectedStudentIds.length === 0) ||
              (selectionMode === 'team' && !selectedTeamId)
            }
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
          <h2 className="card-title">Meeting Notes</h2>
          {notes.length > 0 && (
            <span className="ml-auto bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
              {filteredNotes.length}
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

      {/* Filters */}
      <div className="space-y-2 pb-4 border-b border-gray-200">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              {notes.length === 0 ? 'No notes yet' : 'No notes match your search'}
            </p>
            {notes.length === 0 && (
              <button
                onClick={handleCreateNote}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4" />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium text-gray-900">
                      {note.title || 'Untitled Note'}
                    </h3>
                    {note.teamName ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {note.teamName}
                      </span>
                    ) : note.studentNames && note.studentNames.length > 1 ? (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap">
                        {note.studentNames.length} students
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap">
                        {note.studentName || note.studentNames?.[0] || 'Unknown Student'}
                      </span>
                    )}
                  </div>
                  {note.studentNames && note.studentNames.length > 1 && !note.teamName && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {note.studentNames.slice(0, 3).map((name, idx) => (
                        <span key={idx} className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {name}
                        </span>
                      ))}
                      {note.studentNames.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{note.studentNames.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {note.content || 'No content'}
                  </p>
                  
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

export default AdvisorNotesSection;
