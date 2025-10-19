import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from '../ui/sonner';
import databaseService from '../../services/databaseService';

export default function PublishToTrackModal({ examId, examTitle, onPublished, onClose }) {
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [showCreateTrack, setShowCreateTrack] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDescription, setNewTrackDescription] = useState('');
  const [newTrackDifficulty, setNewTrackDifficulty] = useState('intermediate');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const response = await databaseService.getTracks();
      if (response.success) {
        setTracks(response.tracks || []);
        if (response.tracks && response.tracks.length > 0) {
          setSelectedTrackId(response.tracks[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast.error('Failed to fetch tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndPublish = async () => {
    if (!newTrackName.trim()) {
      toast.error('Track name is required');
      return;
    }

    setPublishing(true);
    try {
      // Create new track
      const trackResponse = await databaseService.createTrack({
        name: newTrackName,
        description: newTrackDescription,
        difficulty: newTrackDifficulty,
        exams: []
      });

      if (!trackResponse.success) {
        toast.error('Failed to create track');
        setPublishing(false);
        return;
      }

      // Publish exam to track
      const publishResponse = await databaseService.publishExamToTrack(
        examId,
        trackResponse.trackId
      );

      if (publishResponse.success) {
        toast.success('✅ Exam published to new track!');
        onPublished();
      } else {
        toast.error('Failed to publish exam');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error publishing exam');
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishToExisting = async () => {
    if (!selectedTrackId) {
      toast.error('Please select a track');
      return;
    }

    setPublishing(true);
    try {
      const response = await databaseService.publishExamToTrack(examId, selectedTrackId);
      if (response.success) {
        toast.success('✅ Exam published to track!');
        onPublished();
      } else {
        toast.error('Failed to publish exam');
      }
    } catch (error) {
      console.error('Error publishing exam:', error);
      toast.error('Error publishing exam');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Publish Exam to Track</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm">
              <strong>Exam:</strong> {examTitle}
            </AlertDescription>
          </Alert>

          {!showCreateTrack ? (
            <>
              {tracks.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="track-select">Select Track</Label>
                    <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                      <SelectTrigger id="track-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tracks.map((track) => (
                          <SelectItem key={track.id} value={track.id}>
                            {track.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handlePublishToExisting}
                      disabled={publishing || !selectedTrackId}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {publishing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        'Publish to Track'
                      )}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription className="text-sm">
                    No tracks exist yet. Create a new track to publish this exam.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                onClick={() => setShowCreateTrack(true)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Track
              </Button>

              <Button variant="ghost" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-track-name">Track Name *</Label>
                <Input
                  id="new-track-name"
                  placeholder="e.g., IELTS Academic Practice"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  disabled={publishing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-track-description">Description</Label>
                <Textarea
                  id="new-track-description"
                  placeholder="Describe this track..."
                  value={newTrackDescription}
                  onChange={(e) => setNewTrackDescription(e.target.value)}
                  disabled={publishing}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-track-difficulty">Difficulty</Label>
                <Select value={newTrackDifficulty} onValueChange={setNewTrackDifficulty}>
                  <SelectTrigger id="new-track-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateAndPublish}
                  disabled={publishing || !newTrackName.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create & Publish'
                  )}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowCreateTrack(false)}
                className="w-full"
              >
                Back
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

