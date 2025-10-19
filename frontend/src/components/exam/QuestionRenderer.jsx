// Question Renderer Component - Handles all IELTS question types
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { 
  Volume2, 
  BookOpen, 
  PenTool, 
  Headphones,
  FileText,
  CheckSquare
} from 'lucide-react';

export const QuestionRenderer = ({ 
  question, 
  answer, 
  onAnswerChange, 
  examType, 
  sectionName 
}) => {
  if (!question) return null;

  const getSectionIcon = () => {
    switch (sectionName?.toLowerCase()) {
      case 'listening': return <Headphones className="h-5 w-5 text-blue-600" />;
      case 'reading': return <BookOpen className="h-5 w-5 text-green-600" />;
      case 'writing': return <PenTool className="h-5 w-5 text-purple-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleAnswerUpdate = (value) => {
    onAnswerChange(question.id, value);
  };

  const renderQuestionByType = () => {
    switch (question.type) {
      case 'mcq_single':
        return renderMultipleChoiceSingle();
      
      case 'mcq_multiple':
        return renderMultipleChoiceMultiple();
      
      case 'true_false_ng':
        return renderTrueFalseNotGiven();
      
      case 'fill_gaps':
      case 'fill_gaps_short':
        return renderFillInGaps();
      
      case 'matching':
        return renderMatching();
      
      case 'sentence_completion':
      case 'note_completion':
      case 'summary_completion':
      case 'table_completion':
      case 'form_completion':
        return renderCompletion();
      
      case 'matching_headings':
        return renderMatchingHeadings();
      
      case 'matching_features':
      case 'matching_endings':
        return renderMatchingFeatures();
      
      case 'flowchart_completion':
        return renderFlowchartCompletion();
      
      case 'map_labelling':
        return renderMapLabelling();
      
      case 'writing_task1':
        return renderWritingTask1();
      
      case 'writing_task2':
        return renderWritingTask2();
      
      default:
        return renderDefaultQuestion();
    }
  };

  const renderMultipleChoiceSingle = () => (
    <div className="space-y-4">
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="prose prose-sm max-w-none">
            {question.passage}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <RadioGroup 
          value={answer || ''} 
          onValueChange={handleAnswerUpdate}
          className="space-y-3"
        >
          {question.options?.map((option, index) => (
            <div key={option.id || index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem 
                value={option.id || option.text} 
                id={`option-${question.id}-${index}`}
                className="mt-1"
              />
              <Label 
                htmlFor={`option-${question.id}-${index}`}
                className="flex-1 cursor-pointer leading-relaxed"
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderMultipleChoiceMultiple = () => {
    const selectedAnswers = Array.isArray(answer) ? answer : [];
    
    const handleMultipleChange = (optionId, checked) => {
      let newAnswers;
      if (checked) {
        newAnswers = [...selectedAnswers, optionId];
      } else {
        newAnswers = selectedAnswers.filter(id => id !== optionId);
      }
      handleAnswerUpdate(newAnswers);
    };

    return (
      <div className="space-y-4">
        {question.passage && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="prose prose-sm max-w-none">
              {question.passage}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <div key={option.id || index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
              <Checkbox
                id={`option-${question.id}-${index}`}
                checked={selectedAnswers.includes(option.id || option.text)}
                onCheckedChange={(checked) => handleMultipleChange(option.id || option.text, checked)}
                className="mt-1"
              />
              <Label 
                htmlFor={`option-${question.id}-${index}`}
                className="flex-1 cursor-pointer leading-relaxed"
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option.text}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTrueFalseNotGiven = () => (
    <div className="space-y-4">
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="prose prose-sm max-w-none">
            {question.passage}
          </div>
        </div>
      )}
      
      <RadioGroup 
        value={answer || ''} 
        onValueChange={handleAnswerUpdate}
        className="space-y-3"
      >
        {['True', 'False', 'Not Given'].map((option, index) => (
          <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
            <RadioGroupItem 
              value={option} 
              id={`tfng-${question.id}-${index}`}
            />
            <Label 
              htmlFor={`tfng-${question.id}-${index}`}
              className="cursor-pointer font-medium"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const renderFillInGaps = () => {
    const questionText = question.text || '';
    const blanks = questionText.match(/_+/g) || [];
    const parts = questionText.split(/_+/);
    
    const answers = Array.isArray(answer) ? answer : [];
    
    const handleBlankChange = (index, value) => {
      const newAnswers = [...answers];
      newAnswers[index] = value;
      handleAnswerUpdate(newAnswers);
    };

    return (
      <div className="space-y-4">
        {question.passage && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="prose prose-sm max-w-none">
              {question.passage}
            </div>
          </div>
        )}
        
        <div className="text-lg leading-relaxed">
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < blanks.length && (
                <Input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => handleBlankChange(index, e.target.value)}
                  className="inline-block w-32 h-8 mx-2 text-center border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent focus:bg-blue-50"
                  placeholder={`(${index + 1})`}
                />
              )}
            </span>
          ))}
        </div>

        {question.wordLimit && (
          <div className="text-sm text-gray-600 mt-2">
            <strong>Word Limit:</strong> {question.wordLimit} words maximum
          </div>
        )}
      </div>
    );
  };

  const renderMatching = () => (
    <div className="space-y-4">
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="prose prose-sm max-w-none">
            {question.passage}
          </div>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Items</h4>
          <div className="space-y-2">
            {question.items?.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <span className="font-medium">{index + 1}.</span> {item.text}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Options</h4>
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={option.id || index} className="p-3 border rounded hover:bg-gray-50">
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option.text}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Input
          type="text"
          value={answer || ''}
          onChange={(e) => handleAnswerUpdate(e.target.value)}
          placeholder="Enter your answers (e.g., A, C, B, D)"
          className="w-full"
        />
        <div className="text-sm text-gray-600 mt-1">
          Enter the letter corresponding to each item, separated by commas
        </div>
      </div>
    </div>
  );

  const renderCompletion = () => (
    <div className="space-y-4">
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="prose prose-sm max-w-none">
            {question.passage}
          </div>
        </div>
      )}
      
      {question.diagram && (
        <div className="border rounded-lg p-4 mb-4">
          <div dangerouslySetInnerHTML={{ __html: question.diagram }} />
        </div>
      )}
      
      <div className="space-y-3">
        {question.blanks?.map((blank, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Label className="w-20 text-right font-medium">
              {blank.number || (index + 1)}.
            </Label>
            <Input
              type="text"
              value={(Array.isArray(answer) ? answer[index] : '') || ''}
              onChange={(e) => {
                const newAnswers = Array.isArray(answer) ? [...answer] : [];
                newAnswers[index] = e.target.value;
                handleAnswerUpdate(newAnswers);
              }}
              placeholder={blank.hint || 'Enter answer'}
              className="flex-1"
            />
          </div>
        ))}
      </div>
      
      {question.wordLimit && (
        <div className="text-sm text-gray-600">
          <strong>Word Limit:</strong> {question.wordLimit} words maximum per blank
        </div>
      )}
    </div>
  );

  const renderMatchingHeadings = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Paragraphs</h4>
          <div className="space-y-4">
            {question.paragraphs?.map((para, index) => (
              <div key={index} className="p-4 border rounded">
                <div className="font-medium mb-2">Paragraph {para.letter || String.fromCharCode(65 + index)}</div>
                <div className="text-sm">{para.text}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Headings</h4>
          <div className="space-y-2">
            {question.headings?.map((heading, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <span className="font-medium">i.</span> {heading.text}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Input
        type="text"
        value={answer || ''}
        onChange={(e) => handleAnswerUpdate(e.target.value)}
        placeholder="Enter heading numbers for each paragraph (e.g., i, v, iii)"
        className="w-full"
      />
    </div>
  );

  const renderMatchingFeatures = () => (
    <div className="space-y-4">
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="prose prose-sm max-w-none">
            {question.passage}
          </div>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Questions</h4>
          <div className="space-y-2">
            {question.questions?.map((q, index) => (
              <div key={index} className="p-3 border rounded">
                <span className="font-medium">{q.number || (index + 1)}.</span> {q.text}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Features</h4>
          <div className="space-y-2">
            {question.features?.map((feature, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {feature.text}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Input
        type="text"
        value={answer || ''}
        onChange={(e) => handleAnswerUpdate(e.target.value)}
        placeholder="Enter your answers (e.g., A, C, B)"
        className="w-full"
      />
    </div>
  );

  const renderFlowchartCompletion = () => (
    <div className="space-y-4">
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="prose prose-sm max-w-none">
            {question.passage}
          </div>
        </div>
      )}
      
      <div className="border rounded-lg p-6 bg-white">
        <h4 className="font-semibold mb-4">Complete the flowchart</h4>
        {question.flowchart && (
          <div dangerouslySetInnerHTML={{ __html: question.flowchart }} />
        )}
      </div>
      
      <div className="space-y-3">
        {question.blanks?.map((blank, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Label className="w-20 text-right font-medium">
              {blank.number || (index + 1)}.
            </Label>
            <Input
              type="text"
              value={(Array.isArray(answer) ? answer[index] : '') || ''}
              onChange={(e) => {
                const newAnswers = Array.isArray(answer) ? [...answer] : [];
                newAnswers[index] = e.target.value;
                handleAnswerUpdate(newAnswers);
              }}
              placeholder="Enter answer"
              className="flex-1"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMapLabelling = () => (
    <div className="space-y-4">
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="prose prose-sm max-w-none">
            {question.passage}
          </div>
        </div>
      )}
      
      <div className="border rounded-lg p-4 bg-white text-center">
        {question.mapImage ? (
          <img 
            src={question.mapImage} 
            alt="Map for labelling" 
            className="max-w-full h-auto mx-auto"
          />
        ) : (
          <div className="p-8 bg-gray-100 rounded">
            <p className="text-gray-600">[Map Image]</p>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {question.labels?.map((label, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Label className="w-20 text-right font-medium">
              {label.number || (index + 1)}.
            </Label>
            <Input
              type="text"
              value={(Array.isArray(answer) ? answer[index] : '') || ''}
              onChange={(e) => {
                const newAnswers = Array.isArray(answer) ? [...answer] : [];
                newAnswers[index] = e.target.value;
                handleAnswerUpdate(newAnswers);
              }}
              placeholder="Enter label"
              className="flex-1"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderWritingTask1 = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Writing Task 1</h4>
        <p className="text-sm text-blue-800">
          You should spend about 20 minutes on this task. Write at least 150 words.
        </p>
      </div>
      
      {question.chart && (
        <div className="border rounded-lg p-4 bg-white text-center">
          <img 
            src={question.chart} 
            alt="Chart for Task 1" 
            className="max-w-full h-auto mx-auto"
          />
        </div>
      )}
      
      <Textarea
        value={answer || ''}
        onChange={(e) => handleAnswerUpdate(e.target.value)}
        placeholder="Write your response here..."
        className="min-h-[300px] resize-none"
        maxLength={1000}
      />
      
      <div className="flex justify-between text-sm text-gray-600">
        <span>Minimum 150 words</span>
        <span>{(answer || '').split(' ').filter(w => w.trim()).length} words</span>
      </div>
    </div>
  );

  const renderWritingTask2 = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-900 mb-2">Writing Task 2</h4>
        <p className="text-sm text-purple-800">
          You should spend about 40 minutes on this task. Write at least 250 words.
        </p>
      </div>
      
      <Textarea
        value={answer || ''}
        onChange={(e) => handleAnswerUpdate(e.target.value)}
        placeholder="Write your essay here..."
        className="min-h-[400px] resize-none"
        maxLength={2000}
      />
      
      <div className="flex justify-between text-sm text-gray-600">
        <span>Minimum 250 words</span>
        <span>{(answer || '').split(' ').filter(w => w.trim()).length} words</span>
      </div>
    </div>
  );

  const renderDefaultQuestion = () => (
    <div className="space-y-4">
      {question.passage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="prose prose-sm max-w-none">
            {question.passage}
          </div>
        </div>
      )}
      
      <Input
        type="text"
        value={answer || ''}
        onChange={(e) => handleAnswerUpdate(e.target.value)}
        placeholder="Enter your answer"
        className="w-full"
      />
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getSectionIcon()}
            <div>
              <CardTitle className="text-xl">
                Question {question.number || question.id}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {question.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                {sectionName && (
                  <Badge variant="outline" className="text-xs">
                    {sectionName}
                  </Badge>
                )}
                {question.points && (
                  <Badge variant="outline" className="text-xs">
                    {question.points} {question.points === 1 ? 'point' : 'points'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {question.text && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="prose prose-sm max-w-none">
              {question.text}
            </div>
          </div>
        )}
        
        {renderQuestionByType()}
      </CardContent>
    </Card>
  );
};

export default QuestionRenderer;