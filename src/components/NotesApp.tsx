'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  tenant?: {
    id: string;
    slug: string;
    name: string;
    plan: string;
  };
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    email: string;
  };
}

interface NotesAppProps {
  user: User;
  token: string;
  onLogout: () => void;
}

const NotesApp = ({ user, token, onLogout }: NotesAppProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [creating, setCreating] = useState(false);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notes');
      }

      setNotes(data.notes);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;

    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create note');
      }

      setNotes([data.note, ...notes]);
      setNewNote({ title: '', content: '' });
      setShowCreateForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create note');
    } finally {
      setCreating(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete note');
      }

      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete note');
    }
  };

  const upgradeTenant = async () => {
    if (!user.tenant?.slug) {
      setError('Unable to upgrade: tenant information not available');
      return;
    }

    try {
      const response = await fetch(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade');
      }

      // Update user data in localStorage
      const updatedUser = {
        ...user,
        tenant: { ...user.tenant, plan: 'PRO' },
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Refresh the page to show updated state
      window.location.reload();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upgrade');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const canCreateNote = user.tenant?.plan === 'PRO' || notes.length < 3;
  const isAtLimit = user.tenant?.plan === 'FREE' && notes.length >= 3;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {user.tenant?.name || 'Unknown'} Notes
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{user.email}</span>
                <span className="capitalize">{user.role.toLowerCase()}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.tenant?.plan === 'PRO' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.tenant?.plan || 'FREE'} Plan
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Limit Warning */}
        {isAtLimit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Note limit reached
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You've reached the maximum of 3 notes on the Free plan.
                </p>
              </div>
              {user.role === 'ADMIN' && (
                <button
                  onClick={upgradeTenant}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800 text-xs mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Create Note Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Your Notes ({notes.length})
          </h2>
          {canCreateNote && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Create Note
            </button>
          )}
        </div>

        {/* Create Note Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <form onSubmit={createNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Enter note title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Enter note content (optional)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Note'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewNote({ title: '', content: '' });
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No notes yet. Create your first note!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {note.title}
                  </h3>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
                {note.content && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {note.content}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  <p>By: {note.author.email}</p>
                  <p>Created: {new Date(note.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotesApp;
