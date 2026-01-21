pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFReader {
    static async extractText(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        return fullText;
    }
}

class OpenAIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    }

    async generateQuestions(text, numQuestions = 10) {
        const prompt = `Du er en ekspert i at lave quizspørgsmål på dansk. Baseret på følgende tekst, generer ${numQuestions} multiple choice spørgsmål.

TEKST:
${text.substring(0, 8000)}

REGLER:
1. Hvert spørgsmål skal have præcis 4 svarmuligheder
2. Kun ét svar må være korrekt
3. Svarmulighederne skal være plausible
4. Spørgsmålene skal teste forståelse, ikke bare hukommelse
5. Svar på dansk

Returner KUN et JSON array med dette format (ingen anden tekst):
[
  {
    "question": "Spørgsmålet her?",
    "options": ["Svar A", "Svar B", "Svar C", "Svar D"],
    "correct": 0
  }
]

Hvor "correct" er index (0-3) for det korrekte svar.`;

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API fejl');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Kunne ikke parse AI-svar');
        }
        
        return JSON.parse(jsonMatch[0]);
    }
}

class QuestionManager {
    constructor() {
        this.questions = this.loadQuestions();
    }

    loadQuestions() {
        const stored = localStorage.getItem('quizQuestions');
        return stored ? JSON.parse(stored) : [];
    }

    saveQuestions() {
        localStorage.setItem('quizQuestions', JSON.stringify(this.questions));
    }

    addQuestions(newQuestions) {
        const questionsWithIds = newQuestions.map(q => ({
            ...q,
            id: this.generateId()
        }));
        this.questions = [...this.questions, ...questionsWithIds];
        this.saveQuestions();
        return questionsWithIds.length;
    }

    addQuestion(question) {
        const questionWithId = {
            ...question,
            id: this.generateId()
        };
        this.questions.push(questionWithId);
        this.saveQuestions();
        return questionWithId;
    }

    updateQuestion(id, updatedQuestion) {
        const index = this.questions.findIndex(q => q.id === id);
        if (index !== -1) {
            this.questions[index] = { ...updatedQuestion, id };
            this.saveQuestions();
            return true;
        }
        return false;
    }

    deleteQuestion(id) {
        this.questions = this.questions.filter(q => q.id !== id);
        this.saveQuestions();
    }

    deleteAllQuestions() {
        this.questions = [];
        this.saveQuestions();
    }

    getQuestion(id) {
        return this.questions.find(q => q.id === id);
    }

    getAllQuestions() {
        return this.questions;
    }

    getQuestionCount() {
        return this.questions.length;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

class QuizApp {
    constructor() {
        this.questionManager = new QuestionManager();
        this.selectedFiles = [];
        this.editingQuestionId = null;
        this.init();
    }

    init() {
        this.setupScreen = document.getElementById('setup-screen');
        this.startScreen = document.getElementById('start-screen');
        this.questionScreen = document.getElementById('question-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.manageScreen = document.getElementById('manage-screen');
        this.editScreen = document.getElementById('edit-screen');
        
        this.apiKeyInput = document.getElementById('api-key');
        this.pdfInput = document.getElementById('pdf-input');
        this.fileList = document.getElementById('file-list');
        this.generateBtn = document.getElementById('generate-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.generationStatus = document.getElementById('generation-status');
        this.questionCount = document.getElementById('question-count');

        const savedApiKey = localStorage.getItem('openai_api_key');
        if (savedApiKey) {
            this.apiKeyInput.value = savedApiKey;
        }

        this.pdfInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.generateBtn.addEventListener('click', () => this.generateQuestions());
        this.skipBtn.addEventListener('click', () => this.goToStartScreen());
        this.apiKeyInput.addEventListener('input', () => this.updateGenerateButton());
        
        document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('manage-btn').addEventListener('click', () => this.showManageScreen());
        document.getElementById('back-to-setup-btn').addEventListener('click', () => this.showScreen(this.setupScreen));

        document.getElementById('add-question-btn').addEventListener('click', () => this.showAddQuestionForm());
        document.getElementById('delete-all-btn').addEventListener('click', () => this.deleteAllQuestions());
        document.getElementById('back-from-manage-btn').addEventListener('click', () => this.goToStartScreen());

        document.getElementById('save-question-btn').addEventListener('click', () => this.saveQuestion());
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.showManageScreen());

        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restart-btn').addEventListener('click', () => this.goToStartScreen());
        
        this.updateGenerateButton();
        this.updateSkipButton();
    }

    handleFileSelect(e) {
        this.selectedFiles = Array.from(e.target.files);
        this.fileList.innerHTML = this.selectedFiles.map(f => 
            `<div class="file-item">${f.name}</div>`
        ).join('');
        this.updateGenerateButton();
    }

    updateGenerateButton() {
        const hasApiKey = this.apiKeyInput.value.trim().length > 0;
        const hasFiles = this.selectedFiles.length > 0;
        this.generateBtn.disabled = !(hasApiKey && hasFiles);
    }

    updateSkipButton() {
        const hasQuestions = this.questionManager.getQuestionCount() > 0;
        this.skipBtn.textContent = hasQuestions ? 'Fortsæt til quiz' : 'Start uden spørgsmål';
    }

    showStatus(message, type) {
        this.generationStatus.className = `generation-status active ${type}`;
        this.generationStatus.innerHTML = message;
    }

    hideStatus() {
        this.generationStatus.className = 'generation-status';
    }

    async generateQuestions() {
        const apiKey = this.apiKeyInput.value.trim();
        localStorage.setItem('openai_api_key', apiKey);
        
        const openai = new OpenAIService(apiKey);
        let allNewQuestions = [];
        
        this.generateBtn.disabled = true;
        
        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i];
            this.showStatus(
                `<span class="spinner"></span>Behandler ${file.name} (${i + 1}/${this.selectedFiles.length})...`,
                'loading'
            );
            
            try {
                const text = await PDFReader.extractText(file);
                const questions = await openai.generateQuestions(text, 10);
                allNewQuestions = allNewQuestions.concat(questions);
                
                this.showStatus(
                    `✓ ${file.name}: ${questions.length} spørgsmål genereret`,
                    'success'
                );
            } catch (error) {
                this.showStatus(
                    `✗ Fejl ved ${file.name}: ${error.message}`,
                    'error'
                );
                this.generateBtn.disabled = false;
                return;
            }
        }
        
        const addedCount = this.questionManager.addQuestions(allNewQuestions);
        
        this.showStatus(
            `✓ Færdig! ${addedCount} nye spørgsmål tilføjet. Total: ${this.questionManager.getQuestionCount()} spørgsmål.`,
            'success'
        );
        
        this.updateSkipButton();
        
        setTimeout(() => {
            this.goToStartScreen();
        }, 1500);
    }

    goToStartScreen() {
        this.hideStatus();
        const count = this.questionManager.getQuestionCount();
        const startBtn = document.getElementById('start-btn');
        
        if (count === 0) {
            this.questionCount.textContent = 'Ingen spørgsmål endnu. Upload PDF-filer for at generere spørgsmål.';
            startBtn.disabled = true;
        } else {
            const quizSize = Math.min(count, 20);
            this.questionCount.textContent = `${count} spørgsmål tilgængelige (${quizSize} tilfældige vælges)`;
            startBtn.disabled = false;
        }
        
        this.showScreen(this.startScreen);
    }

    showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    showManageScreen() {
        this.renderQuestionList();
        this.showScreen(this.manageScreen);
    }

    renderQuestionList() {
        const container = document.getElementById('questions-list');
        const questions = this.questionManager.getAllQuestions();
        
        if (questions.length === 0) {
            container.innerHTML = '<p class="no-questions">Ingen spørgsmål endnu. Tilføj spørgsmål manuelt eller generer fra PDF.</p>';
            return;
        }

        container.innerHTML = questions.map((q, index) => `
            <div class="question-item" data-id="${q.id}">
                <div class="question-item-content">
                    <span class="question-number">${index + 1}.</span>
                    <span class="question-preview">${this.truncate(q.question, 60)}</span>
                </div>
                <div class="question-item-actions">
                    <button class="btn-icon edit-btn" title="Rediger" data-id="${q.id}">✏️</button>
                    <button class="btn-icon delete-btn" title="Slet" data-id="${q.id}">🗑️</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditQuestionForm(btn.dataset.id);
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteQuestion(btn.dataset.id);
            });
        });
    }

    truncate(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    showAddQuestionForm() {
        this.editingQuestionId = null;
        document.getElementById('edit-title').textContent = 'Tilføj nyt spørgsmål';
        document.getElementById('edit-question').value = '';
        document.getElementById('edit-option-0').value = '';
        document.getElementById('edit-option-1').value = '';
        document.getElementById('edit-option-2').value = '';
        document.getElementById('edit-option-3').value = '';
        document.getElementById('edit-correct').value = '0';
        this.showScreen(this.editScreen);
    }

    showEditQuestionForm(id) {
        const question = this.questionManager.getQuestion(id);
        if (!question) return;

        this.editingQuestionId = id;
        document.getElementById('edit-title').textContent = 'Rediger spørgsmål';
        document.getElementById('edit-question').value = question.question;
        document.getElementById('edit-option-0').value = question.options[0];
        document.getElementById('edit-option-1').value = question.options[1];
        document.getElementById('edit-option-2').value = question.options[2];
        document.getElementById('edit-option-3').value = question.options[3];
        document.getElementById('edit-correct').value = question.correct.toString();
        this.showScreen(this.editScreen);
    }

    saveQuestion() {
        const question = {
            question: document.getElementById('edit-question').value.trim(),
            options: [
                document.getElementById('edit-option-0').value.trim(),
                document.getElementById('edit-option-1').value.trim(),
                document.getElementById('edit-option-2').value.trim(),
                document.getElementById('edit-option-3').value.trim()
            ],
            correct: parseInt(document.getElementById('edit-correct').value)
        };

        if (!question.question) {
            alert('Indtast venligst et spørgsmål');
            return;
        }
        if (question.options.some(opt => !opt)) {
            alert('Alle svarmuligheder skal udfyldes');
            return;
        }

        if (this.editingQuestionId) {
            this.questionManager.updateQuestion(this.editingQuestionId, question);
        } else {
            this.questionManager.addQuestion(question);
        }

        this.showManageScreen();
    }

    deleteQuestion(id) {
        if (confirm('Er du sikker på, at du vil slette dette spørgsmål?')) {
            this.questionManager.deleteQuestion(id);
            this.renderQuestionList();
        }
    }

    deleteAllQuestions() {
        if (confirm('Er du sikker på, at du vil slette ALLE spørgsmål? Dette kan ikke fortrydes.')) {
            this.questionManager.deleteAllQuestions();
            this.renderQuestionList();
        }
    }

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    startQuiz() {
        const allQuestions = this.questionManager.getAllQuestions();
        if (allQuestions.length === 0) {
            alert('Du skal have mindst ét spørgsmål for at starte quizzen.');
            return;
        }

        this.quizQuestions = this.shuffleArray(allQuestions).slice(0, 20);
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];
        
        document.querySelector('.score-total').textContent = `/ ${this.quizQuestions.length}`;
        
        this.showScreen(this.questionScreen);
        this.displayQuestion();
    }

    displayQuestion() {
        const question = this.quizQuestions[this.currentIndex];
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const nextBtn = document.getElementById('next-btn');

        questionText.textContent = question.question;
        
        const progress = (this.currentIndex / this.quizQuestions.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Spørgsmål ${this.currentIndex + 1} af ${this.quizQuestions.length}`;

        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.addEventListener('click', () => this.selectOption(index, button));
            optionsContainer.appendChild(button);
        });

        nextBtn.disabled = true;
    }

    selectOption(index, button) {
        const question = this.quizQuestions[this.currentIndex];
        const optionsContainer = document.getElementById('options-container');
        const options = optionsContainer.querySelectorAll('.option');
        const nextBtn = document.getElementById('next-btn');
        
        options.forEach(opt => {
            opt.classList.add('disabled');
            opt.classList.remove('selected');
        });

        const isCorrect = index === question.correct;
        
        if (isCorrect) {
            button.classList.add('correct');
            this.score++;
        } else {
            button.classList.add('incorrect');
            options[question.correct].classList.add('correct');
        }

        this.answers.push({
            question: question.question,
            userAnswer: question.options[index],
            correctAnswer: question.options[question.correct],
            isCorrect: isCorrect
        });

        nextBtn.disabled = false;
    }

    nextQuestion() {
        this.currentIndex++;
        
        if (this.currentIndex < this.quizQuestions.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.showScreen(this.resultScreen);
        
        const progressFill = document.getElementById('progress-fill');
        const scoreNumber = document.getElementById('score-number');
        const resultMessage = document.getElementById('result-message');
        const resultSummary = document.getElementById('result-summary');

        progressFill.style.width = '100%';
        scoreNumber.textContent = this.score;
        
        const percentage = (this.score / this.quizQuestions.length) * 100;
        let message = '';
        
        if (percentage === 100) {
            message = 'Perfekt! Du har svaret rigtigt på alle spørgsmål!';
        } else if (percentage >= 80) {
            message = 'Fantastisk! Du har styr på det meste!';
        } else if (percentage >= 60) {
            message = 'Godt klaret! Du har en god forståelse.';
        } else if (percentage >= 40) {
            message = 'Ikke dårligt, men der er plads til forbedring.';
        } else {
            message = 'Prøv at gennemgå materialet igen og tag quizzen en gang til!';
        }
        
        resultMessage.textContent = message;

        resultSummary.innerHTML = this.answers.map((answer, index) => `
            <div class="summary-item ${answer.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                <strong>${index + 1}. ${answer.question}</strong><br>
                Dit svar: ${answer.userAnswer}
                ${!answer.isCorrect ? `<br>Korrekt svar: ${answer.correctAnswer}` : ''}
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
