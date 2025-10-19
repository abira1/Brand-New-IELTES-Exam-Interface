import React, { useState } from 'react';
import { Copy, CheckCircle, FileJson } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

const PROMPTS = {
  listening: `You are an IELTS exam JSON generator. Convert the provided IELTS Listening section PDF into structured JSON format.

**STRICT JSON SCHEMA:**
{
  "title": "Exam Title",
  "section": "Listening",
  "duration": 30,
  "questions": [
    {
      "type": "mcq_single | mcq_multiple | fill_gaps | fill_gaps_short | matching | form_completion | note_completion | table_completion | flowchart_completion | map_labelling | sentence_completion | summary_completion",
      "number": 1,
      "text": "Question text",
      "options": ["A", "B", "C", "D"],  // Only for MCQ types
      "answer": "Correct answer(s)",
      "points": 1,
      "audioTimestamp": "00:00" // Optional
    }
  ]
}

**SUPPORTED QUESTION TYPES:**
- mcq_single: Multiple choice with one answer
- mcq_multiple: Multiple choice with multiple answers
- fill_gaps: Fill in the blanks
- fill_gaps_short: Short answer fill-in
- matching: Match items
- form_completion: Complete a form
- note_completion: Complete notes
- table_completion: Complete a table
- flowchart_completion: Complete flowchart
- map_labelling: Label a map
- sentence_completion: Complete sentences
- summary_completion: Complete summary

**INSTRUCTIONS:**
1. Parse all questions from the PDF
2. Auto-detect question type based on format
3. For MCQ: include all options in array
4. For fill_gaps: answer should be the correct word/phrase
5. Output ONLY valid JSON, no additional text
6. Number questions sequentially starting from 1

Now process the attached PDF and output the JSON.`,

  reading: `You are an IELTS exam JSON generator. Convert the provided IELTS Reading section PDF into structured JSON format.

**STRICT JSON SCHEMA:**
{
  "title": "Exam Title",
  "section": "Reading",
  "duration": 60,
  "passages": [
    {
      "passageNumber": 1,
      "title": "Passage title",
      "text": "Full passage text...",
      "questions": [
        {
          "type": "mcq_single | mcq_multiple | true_false_ng | matching | matching_headings | matching_features | matching_endings | sentence_completion | summary_completion | fill_gaps | table_completion | flowchart_completion | note_completion",
          "number": 1,
          "text": "Question text",
          "options": ["A", "B", "C", "D"],  // Only for MCQ types
          "answer": "Correct answer(s)",
          "points": 1
        }
      ]
    }
  ]
}

**SUPPORTED QUESTION TYPES:**
- mcq_single: Multiple choice (one answer)
- mcq_multiple: Multiple choice (multiple answers)
- true_false_ng: True/False/Not Given
- matching: Match items
- matching_headings: Match paragraph headings
- matching_features: Match features
- matching_endings: Match sentence endings
- sentence_completion: Complete sentences
- summary_completion: Complete summary
- fill_gaps: Fill in blanks
- table_completion: Complete table
- flowchart_completion: Complete flowchart
- note_completion: Complete notes

**INSTRUCTIONS:**
1. Extract ALL passage texts completely
2. Parse all questions for each passage
3. Auto-detect question type based on format
4. For True/False/NG: answer must be "True", "False", or "Not Given"
5. For MCQ: include all options
6. Output ONLY valid JSON, no additional text
7. Number questions sequentially across all passages

Now process the attached PDF and output the JSON.`,

  writing: `You are an IELTS exam JSON generator. Convert the provided IELTS Writing section PDF into structured JSON format.

**STRICT JSON SCHEMA:**
{
  "title": "Exam Title",
  "section": "Writing",
  "duration": 60,
  "tasks": [
    {
      "taskNumber": 1,
      "type": "writing_task1 | writing_task2",
      "title": "Task title",
      "instructions": "Complete task instructions...",
      "prompt": "Writing prompt/question",
      "wordLimit": 150,  // 150 for Task 1, 250 for Task 2
      "timeAllocation": 20,  // minutes
      "criteria": ["Task Achievement", "Coherence and Cohesion", "Lexical Resource", "Grammatical Range and Accuracy"]
    }
  ]
}

**TASK TYPES:**
- writing_task1: Report/letter writing (150 words, 20 minutes)
  * Academic: Describe visual data (graph, chart, diagram)
  * General: Write a letter (formal, semi-formal, informal)
- writing_task2: Essay writing (250 words, 40 minutes)
  * Opinion, discussion, problem-solution, advantages-disadvantages

**INSTRUCTIONS:**
1. Extract Task 1 and Task 2 separately
2. Include complete instructions and prompts
3. For Task 1: include any charts/graphs descriptions in prompt
4. For Task 2: include the essay question clearly
5. Set correct word limits: Task 1 = 150, Task 2 = 250
6. Set time allocations: Task 1 = 20 min, Task 2 = 40 min
7. Output ONLY valid JSON, no additional text

Now process the attached PDF and output the JSON.`
};

export default function PromptGenerator() {
  const [copiedPrompt, setCopiedPrompt] = useState(null);

  const handleCopy = (promptType) => {
    navigator.clipboard.writeText(PROMPTS[promptType]);
    setCopiedPrompt(promptType);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileJson className="w-6 h-6 text-blue-600" />
          <CardTitle className="text-blue-900">AI Prompt Generator</CardTitle>
        </div>
        <CardDescription className="text-blue-700">
          Copy a prompt below, paste it with your exam PDF to DeepSeek/ChatGPT, then upload the generated JSON
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Listening Prompt */}
          <div className="bg-white rounded-lg border border-blue-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900">🎧 Listening Section</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy('listening')}
                className="gap-2"
              >
                {copiedPrompt === 'listening' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Prompt
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Generates JSON for listening questions with audio timestamps and various question types.
            </p>
            <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
              {PROMPTS.listening.substring(0, 200)}...
            </div>
          </div>

          {/* Reading Prompt */}
          <div className="bg-white rounded-lg border border-blue-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900">📖 Reading Section</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy('reading')}
                className="gap-2"
              >
                {copiedPrompt === 'reading' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Prompt
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Generates JSON for reading passages with comprehension questions and multiple question types.
            </p>
            <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
              {PROMPTS.reading.substring(0, 200)}...
            </div>
          </div>

          {/* Writing Prompt */}
          <div className="bg-white rounded-lg border border-blue-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900">✍️ Writing Section</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy('writing')}
                className="gap-2"
              >
                {copiedPrompt === 'writing' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Prompt
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Generates JSON for writing tasks with instructions, prompts, and word limits.
            </p>
            <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
              {PROMPTS.writing.substring(0, 200)}...
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <Alert className="mt-4 bg-blue-50 border-blue-200">
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-blue-900">📝 How to use:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 ml-2">
                <li>Copy the appropriate prompt above (Listening/Reading/Writing)</li>
                <li>Open DeepSeek, ChatGPT, or any AI with PDF support</li>
                <li>Paste the prompt and attach your exam PDF</li>
                <li>AI will generate structured JSON output</li>
                <li>Copy the JSON and upload it below</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
