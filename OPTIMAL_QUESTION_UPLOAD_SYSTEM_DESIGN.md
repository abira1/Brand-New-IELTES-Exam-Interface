# Optimal Question Upload System Design

**Date**: October 19, 2025  
**Status**: Design Proposal

---

## 🎯 Executive Summary

**Recommendation**: **Unified JSON-based upload system** with section-specific validators and media handlers.

**Why**: 
- ✅ Consistent across all sections
- ✅ Flexible for all question types
- ✅ Scalable for future additions
- ✅ Easy to validate and parse
- ✅ Supports media files

---

## 📊 Analysis of Current Approach

### Current System
- ✅ JSON import for Reading section
- ✅ Works for text-based questions
- ✅ Simple structure
- ❌ Not designed for other sections
- ❌ No media file support
- ❌ No validation framework

### Issues to Address
1. **Listening**: Requires audio files
2. **Writing**: Requires visual files (graphs, charts, diagrams)
3. **Speaking**: Requires audio/video files
4. **Validation**: Need to ensure IELTS compliance
5. **Media Management**: Need to handle file uploads

---

## 🏗️ Proposed Architecture

### 1. Unified JSON Schema

```json
{
  "metadata": {
    "title": "IELTS Full Mock Exam",
    "section": "all|listening|reading|writing|speaking",
    "duration": 170,
    "totalQuestions": 122,
    "version": "1.0",
    "createdDate": "2025-10-19",
    "difficulty": "intermediate"
  },
  "sections": [
    {
      "name": "Listening",
      "duration": 30,
      "parts": [
        {
          "partNumber": 1,
          "title": "Conversation",
          "audioFile": "listening_part1.mp3",
          "transcript": "...",
          "questions": [...]
        }
      ]
    },
    {
      "name": "Reading",
      "duration": 60,
      "passages": [
        {
          "passageNumber": 1,
          "title": "...",
          "text": "...",
          "questions": [...]
        }
      ]
    },
    {
      "name": "Writing",
      "duration": 60,
      "tasks": [
        {
          "taskNumber": 1,
          "type": "visual_description",
          "visualFile": "graph1.png",
          "instructions": "...",
          "sampleAnswer": "..."
        }
      ]
    },
    {
      "name": "Speaking",
      "duration": 14,
      "parts": [
        {
          "partNumber": 1,
          "type": "interview",
          "questions": [...]
        }
      ]
    }
  ]
}
```

### 2. Question Type Schema

```json
{
  "id": "q_1",
  "number": 1,
  "type": "true_false_ng|multiple_choice|sentence_completion|...",
  "section": "Listening|Reading|Writing|Speaking",
  "text": "Question text",
  "points": 1,
  "difficulty": "easy|medium|hard",
  
  // For selection-based questions
  "options": ["A", "B", "C", "D"],
  
  // For text input questions
  "maxWords": 3,
  "acceptableAnswers": ["answer1", "answer2"],
  
  // For matching questions
  "matchingItems": ["item1", "item2"],
  "matchingOptions": ["option1", "option2"],
  
  // For all questions
  "correctAnswer": "A|True|answer",
  "explanation": "Why this is correct",
  
  // For listening/reading
  "passageNumber": 1,
  "passageTitle": "...",
  "passageText": "...",
  
  // For writing
  "visualFile": "graph.png",
  "visualType": "line_graph|bar_chart|table|diagram|process|map",
  
  // For speaking
  "cueCard": "Describe a person...",
  "prepTime": 60
}
```

### 3. Media File Structure

```
uploads/
├── exams/
│   └── {examId}/
│       ├── listening/
│       │   ├── part1.mp3
│       │   ├── part2.mp3
│       │   ├── part3.mp3
│       │   └── part4.mp3
│       ├── reading/
│       │   └── (no media files)
│       ├── writing/
│       │   ├── task1_graph1.png
│       │   ├── task1_chart1.png
│       │   └── task1_diagram1.png
│       └── speaking/
│           └── (no media files)
```

---

## 🔄 Upload Workflow

### Step 1: File Selection
- User selects JSON file
- System validates file format
- System checks file size (max 50MB)

### Step 2: JSON Parsing
- Parse JSON structure
- Validate against schema
- Check for required fields
- Validate question types

### Step 3: Media File Extraction
- Identify media files referenced in JSON
- Check if media files exist
- Validate media file formats
- Calculate total size

### Step 4: IELTS Compliance Check
- Validate question count per section
- Validate question types
- Check difficulty distribution
- Verify timing

### Step 5: Database Storage
- Store metadata in `exams/`
- Store full data in `exams_full/`
- Store media files in Cloud Storage
- Create index for search

### Step 6: Confirmation
- Return exam ID
- Show import summary
- Display any warnings

---

## ✅ Validation Rules

### Listening Section
- ✅ 40 questions total
- ✅ 4 parts (10 questions each)
- ✅ Audio files required
- ✅ Supported question types: 9 types
- ✅ Duration: 30 minutes

### Reading Section
- ✅ 40 questions total
- ✅ 3 passages
- ✅ No audio files
- ✅ Supported question types: 14 types
- ✅ Duration: 60 minutes

### Writing Section
- ✅ 2 tasks
- ✅ Task 1: Visual file required
- ✅ Task 2: No visual file
- ✅ Sample answers recommended
- ✅ Duration: 60 minutes

### Speaking Section
- ✅ 3 parts
- ✅ Part 1: 10-12 questions
- ✅ Part 2: 1 cue card
- ✅ Part 3: 4-5 questions
- ✅ Duration: 11-14 minutes

---

## 🎯 Implementation Approach

### Phase 1: Core System (Current)
- ✅ JSON import for Reading
- ✅ Basic validation
- ✅ Firebase storage

### Phase 2: Listening Support
- Add audio file upload
- Add audio validation
- Add audio streaming
- Add transcript storage

### Phase 3: Writing Support
- Add image file upload
- Add image validation
- Add image storage
- Add sample answer storage

### Phase 4: Speaking Support
- Add cue card management
- Add question bank
- Add scoring rubrics

### Phase 5: Advanced Features
- Batch import
- Template system
- Question bank management
- Analytics & reporting

---

## 📋 Unified Upload Interface

### Single Upload Form
```
┌─────────────────────────────────────┐
│  IELTS Question Import              │
├─────────────────────────────────────┤
│                                     │
│  Select File:  [Choose File]        │
│  File Type:    JSON                 │
│  Max Size:     50 MB                │
│                                     │
│  Exam Title:   [____________]       │
│  Section:      [All / Listening /   │
│                 Reading / Writing /  │
│                 Speaking]            │
│                                     │
│  Media Files:  [Choose Folder]      │
│  (Optional)                         │
│                                     │
│  [Upload]  [Cancel]                 │
│                                     │
└─────────────────────────────────────┘
```

### Upload Progress
```
Uploading: deepseek_exam.json
├─ Parsing JSON... ✅
├─ Validating structure... ✅
├─ Checking media files... ⏳
├─ Uploading audio files... ⏳
│  ├─ listening_part1.mp3 (45%)
│  ├─ listening_part2.mp3 (pending)
│  ├─ listening_part3.mp3 (pending)
│  └─ listening_part4.mp3 (pending)
├─ Uploading image files... (pending)
└─ Saving to database... (pending)
```

---

## 🔐 Security Considerations

- ✅ File type validation
- ✅ File size limits
- ✅ Virus scanning (optional)
- ✅ Authentication required
- ✅ Admin-only access
- ✅ Audit logging

---

## 📊 Benefits

| Aspect | Benefit |
|--------|---------|
| **Consistency** | Same format for all sections |
| **Flexibility** | Supports all question types |
| **Scalability** | Easy to add new types |
| **Validation** | Ensures IELTS compliance |
| **Media Support** | Handles audio/images |
| **User Experience** | Single upload interface |

---

**Next**: Create detailed implementation plan

