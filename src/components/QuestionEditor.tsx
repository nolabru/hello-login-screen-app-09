import React, { useState } from 'react';
import { type QuestionOption } from '@/services/questionnaireService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';

interface QuestionEditorProps {
    questions: QuestionOption[];
    onChange: (questions: QuestionOption[]) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ questions, onChange }) => {
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionType] = useState<'scale'>('scale'); // ONLY SCALE TYPE ALLOWED

    const handleAddQuestion = () => {
        if (newQuestionText.trim() === '') return;

        const newQuestion: QuestionOption = {
            id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
            question: newQuestionText,
            type: 'scale', // ALWAYS SCALE
            required: true,
            scale_min: 1,
            scale_max: 5,
            scale_labels: ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente']
        };

        onChange([...questions, newQuestion]);
        setNewQuestionText('');
    };

    const handleRemoveQuestion = (id: number) => {
        onChange(questions.filter(q => q.id !== id));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Editor de Perguntas</h3>

            {/* Lista de Perguntas Adicionadas */}
            <div className="space-y-3">
                {questions.map((q, index) => (
                    <div key={q.id} className="p-4 border bg-gray-50 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-medium">{index + 1}. {q.question}</p>
                            <span className="text-xs text-gray-500 uppercase">{q.type}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestion(q.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                {questions.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma pergunta adicionada ainda.</p>
                )}
            </div>

            {/* Formulário para Adicionar Nova Pergunta */}
            <div className="p-4 border-t mt-4">
                <h4 className="font-medium mb-2">Adicionar Nova Pergunta</h4>
                <div className="flex items-end gap-3">
                    <div className="flex-grow">
                        <Label htmlFor="new-question-text">Texto da Pergunta</Label>
                        <Input
                            id="new-question-text"
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            placeholder="Ex: Como você avalia o clima de trabalho?"
                        />
                    </div>
                    <div>
                        <Label htmlFor="question-type-info">Tipo</Label>
                        <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-gray-50">
                            <span className="text-sm text-gray-600">Escala (1-5)</span>
                        </div>
                    </div>
                    <Button onClick={handleAddQuestion} className="bg-amber-600 hover:bg-amber-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QuestionEditor;
