import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { toast } from '../ui/sonner';
import databaseService from '../../services/databaseService';

export default function TrackEditor({ track, onSaved }) {
  const [name, setName] = useState(track?.name || '');
  const [description, setDescription] = useState(track?.description || '');
  const [difficulty, setDifficulty] = useState(track?.difficulty || 'intermediate');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Track name is required');
      return;
    }

    setSaving(true);
    try {
      let response;
      if (track) {
        // Update existing track
        response = await databaseService.updateTrack(track.id, {
          name,
          description,
          difficulty
        });
      } else {
        // Create new track
        response = await databaseService.createTrack({
          name,
          description,
          difficulty,
          exams: []
        });
      }

      if (response.success) {
        toast.success(track ? 'Track updated successfully' : 'Track created successfully');
        onSaved();
      } else {
        toast.error(response.error || 'Failed to save track');
      }
    } catch (error) {
      console.error('Error saving track:', error);
      toast.error('Error saving track');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Track Name */}
        <div className="space-y-2">
          <Label htmlFor="track-name">Track Name *</Label>
          <Input
            id="track-name"
            placeholder="e.g., IELTS Academic Practice"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="track-description">Description</Label>
          <Textarea
            id="track-description"
            placeholder="Describe this track..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            rows={4}
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label htmlFor="track-difficulty">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={setDifficulty} disabled={saving}>
            <SelectTrigger id="track-difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              track ? 'Update Track' : 'Create Track'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

