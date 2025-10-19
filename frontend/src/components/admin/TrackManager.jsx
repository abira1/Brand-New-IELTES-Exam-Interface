import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from '../ui/sonner';
import databaseService from '../../services/databaseService';
import TrackEditor from './TrackEditor';
import ExamInTrack from './ExamInTrack';

export default function TrackManager() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [deletingTrackId, setDeletingTrackId] = useState(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const response = await databaseService.getTracks();
      if (response.success) {
        setTracks(response.tracks || []);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast.error('Failed to fetch tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrack = () => {
    setEditingTrack(null);
    setShowEditor(true);
  };

  const handleEditTrack = (track) => {
    setEditingTrack(track);
    setShowEditor(true);
  };

  const handleDeleteTrack = async (trackId) => {
    if (!window.confirm('Are you sure you want to delete this track?')) {
      return;
    }

    setDeletingTrackId(trackId);
    try {
      const response = await databaseService.deleteTrack(trackId);
      if (response.success) {
        setTracks(tracks.filter(t => t.id !== trackId));
        toast.success('Track deleted successfully');
      } else {
        toast.error('Failed to delete track');
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('Error deleting track');
    } finally {
      setDeletingTrackId(null);
    }
  };

  const handleTrackSaved = () => {
    setShowEditor(false);
    setEditingTrack(null);
    fetchTracks();
  };

  if (showEditor) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingTrack ? 'Edit Track' : 'Create New Track'}
          </h2>
          <Button variant="outline" onClick={() => {
            setShowEditor(false);
            setEditingTrack(null);
          }}>
            Back to Tracks
          </Button>
        </div>
        <TrackEditor track={editingTrack} onSaved={handleTrackSaved} />
      </div>
    );
  }

  if (selectedTrack) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedTrack.name}</h2>
            <p className="text-gray-500">{selectedTrack.description}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedTrack(null)}>
            Back to Tracks
          </Button>
        </div>
        <ExamInTrack track={selectedTrack} onTrackUpdated={fetchTracks} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Track Manager</h2>
          <p className="text-gray-500">Organize and manage exam tracks</p>
        </div>
        <Button onClick={handleCreateTrack} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Track
        </Button>
      </div>

      {tracks.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tracks yet. Create your first track to organize exams.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {tracks.map((track) => (
            <Card key={track.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{track.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{track.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {track.exams?.length || 0} exams
                    </Badge>
                    <Badge variant="secondary">
                      {track.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTrack(track)}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Exams
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditTrack(track)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteTrack(track.id)}
                    disabled={deletingTrackId === track.id}
                  >
                    {deletingTrackId === track.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

