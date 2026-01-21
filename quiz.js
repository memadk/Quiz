pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class DocumentReader {
    static getSupportedExtensions() {
        return ['.pdf', '.txt', '.md', '.docx'];
    }

    static async extractTextWithPages(file) {
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        switch (extension) {
            case '.pdf':
                return await this.extractFromPDF(file);
            case '.txt':
            case '.md':
                return await this.extractFromText(file);
            case '.docx':
                return await this.extractFromDocx(file);
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    }

    static async extractFromPDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            pages.push({
                pageNumber: i,
                text: pageText
            });
        }
        
        return {
            fileName: file.name,
            totalPages: pdf.numPages,
            pages: pages,
            fullText: pages.map(p => `[Side ${p.pageNumber}] ${p.text}`).join('\n\n')
        };
    }

    static async extractFromText(file) {
        const text = await file.text();
        const lines = text.split('\n');
        const linesPerPage = 50;
        const pages = [];
        
        for (let i = 0; i < lines.length; i += linesPerPage) {
            const pageNumber = Math.floor(i / linesPerPage) + 1;
            const pageText = lines.slice(i, i + linesPerPage).join('\n');
            pages.push({
                pageNumber: pageNumber,
                text: pageText
            });
        }
        
        return {
            fileName: file.name,
            totalPages: pages.length,
            pages: pages,
            fullText: pages.map(p => `[Side ${p.pageNumber}] ${p.text}`).join('\n\n')
        };
    }

    static async extractFromDocx(file) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        const text = result.value;
        const lines = text.split('\n');
        const linesPerPage = 50;
        const pages = [];
        
        for (let i = 0; i < lines.length; i += linesPerPage) {
            const pageNumber = Math.floor(i / linesPerPage) + 1;
            const pageText = lines.slice(i, i + linesPerPage).join('\n');
            pages.push({
                pageNumber: pageNumber,
                text: pageText
            });
        }
        
        return {
            fileName: file.name,
            totalPages: pages.length,
            pages: pages,
            fullText: pages.map(p => `[Side ${p.pageNumber}] ${p.text}`).join('\n\n')
        };
    }
}

// Keep PDFReader as alias for backward compatibility
const PDFReader = {
    extractTextWithPages: (file) => DocumentReader.extractTextWithPages(file)
};

class OpenAIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    }

    async generateQuestions(text, numQuestions = 10, pdfInfo = null, difficulty = 'medium') {
        const lang = i18n.t('promptLanguage');
        
        const difficultyInstructions = {
            easy: `DIFFICULTY: Easy
- Focus on basic facts and definitions
- Questions should be answerable by someone who read the text once
- Distractors (wrong answers) should be clearly distinguishable from the correct answer
- Prioritize "What is...?" and "Which...?" style questions`,
            medium: `DIFFICULTY: Medium
- Mix of factual recall and understanding questions
- Include some "Why...?" and "How...?" questions that require connecting concepts
- Distractors should be plausible but distinguishable with good understanding
- Balance between terminology and conceptual understanding`,
            hard: `DIFFICULTY: Hard
- Focus on deep understanding and application
- Include "What would happen if...?" and "How does X relate to Y?" questions
- Require connecting multiple concepts from the text
- Distractors should be sophisticated and require careful thinking to eliminate
- Test ability to apply knowledge to new situations`
        };

        const prompt = `You are an expert at creating educational quiz questions in ${lang}. Based on the following text, generate ${numQuestions} high-quality multiple choice questions.

${difficultyInstructions[difficulty] || difficultyInstructions.medium}

TEXT:
${text.substring(0, 8000)}

CRITICAL RULES - Questions MUST focus on the SUBJECT MATTER:
1. ONLY create questions about the actual educational content (concepts, facts, processes, definitions)
2. NEVER create questions about:
   - Document structure (figures, tables, chapters, sections, page numbers)
   - Metadata (copyright, publication dates, authors, publishers, URLs)
   - UI elements (buttons, links, navigation, "fokustilstand", comments sections)
   - References to "the text" itself ("What does the text say about...?")
   - Visual elements that cannot be seen (figures, images, diagrams)
3. Questions should stand alone - a student should be able to answer without having the PDF

QUESTION FORMAT RULES:
4. Each question must have exactly 4 answer options
5. Only one answer may be correct
6. All distractors (wrong answers) must be plausible within the subject domain
7. Vary question types: factual ("What is...?"), conceptual ("Why does...?"), and application ("If X happens, what...?")
8. Answer in ${lang}
9. For each question, indicate the page number (look for [Side X] or [Page X] markers)
10. Include a short excerpt (1-2 sentences) from the text that supports the correct answer

Return ONLY a JSON array with this format (no other text):
[
  {
    "question": "The question here?",
    "options": ["Answer A", "Answer B", "Answer C", "Answer D"],
    "correct": 0,
    "sourcePage": 1,
    "sourceExcerpt": "The relevant excerpt from the text that explains the answer..."
  }
]

Where "correct" is the index (0-3) of the correct answer.`;

        this.currentPdfInfo = pdfInfo;

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
        
        const questions = JSON.parse(jsonMatch[0]);
        
        if (pdfInfo) {
            questions.forEach(q => {
                q.sourceFile = pdfInfo.fileName;
            });
        }
        
        return questions;
    }
}

class QuizManager {
    constructor() {
        this.quizzes = this.loadQuizzes();
    }

    loadQuizzes() {
        const stored = localStorage.getItem('quizzes');
        return stored ? JSON.parse(stored) : [];
    }

    saveQuizzes() {
        localStorage.setItem('quizzes', JSON.stringify(this.quizzes));
    }

    createQuiz(name, description = '') {
        const quiz = {
            id: this.generateId(),
            name,
            description,
            questions: [],
            createdAt: new Date().toISOString()
        };
        this.quizzes.push(quiz);
        this.saveQuizzes();
        return quiz;
    }

    updateQuiz(id, updates) {
        const index = this.quizzes.findIndex(q => q.id === id);
        if (index !== -1) {
            this.quizzes[index] = { ...this.quizzes[index], ...updates };
            this.saveQuizzes();
            return this.quizzes[index];
        }
        return null;
    }

    deleteQuiz(id) {
        this.quizzes = this.quizzes.filter(q => q.id !== id);
        this.saveQuizzes();
    }

    getQuiz(id) {
        return this.quizzes.find(q => q.id === id);
    }

    getAllQuizzes() {
        return this.quizzes;
    }

    addQuestionToQuiz(quizId, question) {
        const quiz = this.getQuiz(quizId);
        if (quiz) {
            const questionWithId = { ...question, id: this.generateId() };
            quiz.questions.push(questionWithId);
            this.saveQuizzes();
            return questionWithId;
        }
        return null;
    }

    addQuestionsToQuiz(quizId, questions) {
        const quiz = this.getQuiz(quizId);
        if (quiz) {
            const questionsWithIds = questions.map(q => ({ ...q, id: this.generateId() }));
            quiz.questions = [...quiz.questions, ...questionsWithIds];
            this.saveQuizzes();
            return questionsWithIds.length;
        }
        return 0;
    }

    updateQuestion(quizId, questionId, updatedQuestion) {
        const quiz = this.getQuiz(quizId);
        if (quiz) {
            const index = quiz.questions.findIndex(q => q.id === questionId);
            if (index !== -1) {
                quiz.questions[index] = { ...updatedQuestion, id: questionId };
                this.saveQuizzes();
                return true;
            }
        }
        return false;
    }

    deleteQuestion(quizId, questionId) {
        const quiz = this.getQuiz(quizId);
        if (quiz) {
            quiz.questions = quiz.questions.filter(q => q.id !== questionId);
            this.saveQuizzes();
        }
    }

    deleteAllQuestions(quizId) {
        const quiz = this.getQuiz(quizId);
        if (quiz) {
            quiz.questions = [];
            this.saveQuizzes();
        }
    }

    exportQuiz(quizId) {
        const quiz = this.getQuiz(quizId);
        if (!quiz) return null;
        
        const exportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            quiz: {
                name: quiz.name,
                description: quiz.description,
                questions: quiz.questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    correct: q.correct,
                    sourceFile: q.sourceFile || null,
                    sourcePage: q.sourcePage || null,
                    sourceExcerpt: q.sourceExcerpt || null
                }))
            }
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    exportAllQuizzes() {
        const exportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            quizzes: this.quizzes.map(quiz => ({
                name: quiz.name,
                description: quiz.description,
                questions: quiz.questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    correct: q.correct,
                    sourceFile: q.sourceFile || null,
                    sourcePage: q.sourcePage || null,
                    sourceExcerpt: q.sourceExcerpt || null
                }))
            }))
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    importQuizzes(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.version) {
                throw new Error('Invalid format');
            }
            
            let quizzesToImport = [];
            
            if (data.quiz) {
                quizzesToImport = [data.quiz];
            } else if (data.quizzes && Array.isArray(data.quizzes)) {
                quizzesToImport = data.quizzes;
            } else {
                throw new Error('Invalid format');
            }
            
            let importedCount = 0;
            
            for (const quizData of quizzesToImport) {
                if (!quizData.name || !Array.isArray(quizData.questions)) {
                    continue;
                }
                
                const quiz = this.createQuiz(quizData.name, quizData.description || '');
                
                const validQuestions = quizData.questions.filter(q => 
                    q.question && 
                    Array.isArray(q.options) && 
                    q.options.length === 4 &&
                    typeof q.correct === 'number' &&
                    q.correct >= 0 && 
                    q.correct <= 3
                );
                
                if (validQuestions.length > 0) {
                    this.addQuestionsToQuiz(quiz.id, validQuestions);
                }
                
                importedCount++;
            }
            
            return importedCount;
        } catch (error) {
            throw new Error('Invalid quiz file format');
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

class QuizApp {
    constructor() {
        this.quizManager = new QuizManager();
        this.currentQuizId = null;
        this.selectedFiles = [];
        this.editingQuestionId = null;
        this.editingQuizId = null;
        this.activeDropdown = null;
        this.init();
    }

    init() {
        this.quizListScreen = document.getElementById('quiz-list-screen');
        this.editQuizScreen = document.getElementById('edit-quiz-screen');
        this.setupScreen = document.getElementById('setup-screen');
        this.startScreen = document.getElementById('start-screen');
        this.questionScreen = document.getElementById('question-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.manageScreen = document.getElementById('manage-screen');
        this.editScreen = document.getElementById('edit-screen');
        this.settingsModal = document.getElementById('settings-modal');
        
        this.apiKeyInput = document.getElementById('api-key');
        this.pdfInput = document.getElementById('pdf-input');
        this.fileList = document.getElementById('file-list');
        this.generateBtn = document.getElementById('generate-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.generationStatus = document.getElementById('generation-status');
        this.questionCount = document.getElementById('question-count');
        this.languageSelect = document.getElementById('language-select');
        this.difficultySelect = document.getElementById('difficulty-select');

        const savedApiKey = localStorage.getItem('openai_api_key');
        if (savedApiKey) {
            this.apiKeyInput.value = savedApiKey;
        }

        this.languageSelect.value = i18n.getLanguage();
        this.languageSelect.addEventListener('change', (e) => {
            i18n.setLanguage(e.target.value);
            this.updateUI();
        });

        this.initTheme();
        this.initDropZone();
        this.initSettingsModal();

        document.addEventListener('click', (e) => this.closeDropdownOnClickOutside(e));

        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        document.getElementById('create-quiz-btn').addEventListener('click', () => this.showCreateQuizForm());
        document.getElementById('save-quiz-btn').addEventListener('click', () => this.saveQuiz());
        document.getElementById('cancel-quiz-btn').addEventListener('click', () => this.showQuizListScreen());

        document.getElementById('import-btn').addEventListener('click', () => this.triggerImport());
        document.getElementById('export-all-btn').addEventListener('click', () => this.exportAllQuizzes());
        document.getElementById('import-input').addEventListener('change', (e) => this.handleImport(e));

        this.pdfInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.generateBtn.addEventListener('click', () => this.generateQuestions());
        this.skipBtn.addEventListener('click', () => this.goToStartScreen());
        
        document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('manage-btn').addEventListener('click', () => this.showManageScreen());
        document.getElementById('back-to-setup-btn').addEventListener('click', () => this.showScreen(this.setupScreen));
        document.getElementById('back-to-list-btn').addEventListener('click', () => this.showQuizListScreen());

        document.getElementById('add-question-btn').addEventListener('click', () => this.showAddQuestionForm());
        document.getElementById('delete-all-btn').addEventListener('click', () => this.deleteAllQuestions());
        document.getElementById('back-from-manage-btn').addEventListener('click', () => this.goToStartScreen());

        document.getElementById('save-question-btn').addEventListener('click', () => this.saveQuestion());
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.showManageScreen());

        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restart-btn').addEventListener('click', () => this.goToStartScreen());
        document.getElementById('back-to-list-from-result-btn').addEventListener('click', () => this.showQuizListScreen());
        
        this.updateUI();
        this.showQuizListScreen();
    }

    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = i18n.t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = i18n.t(el.dataset.i18nPlaceholder);
        });
        this.renderQuizList();
    }

    showQuizListScreen() {
        this.currentQuizId = null;
        this.renderQuizList();
        this.showScreen(this.quizListScreen);
    }

    renderQuizList() {
        const container = document.getElementById('quizzes-list');
        const quizzes = this.quizManager.getAllQuizzes();
        
        if (quizzes.length === 0) {
            container.innerHTML = `<p class="no-items">${i18n.t('noQuizzes')}</p>`;
            return;
        }

        container.innerHTML = quizzes.map(quiz => `
            <div class="quiz-card" data-id="${quiz.id}">
                <div class="quiz-card-content">
                    <h3 class="quiz-card-title">${this.escapeHtml(quiz.name)}</h3>
                    <p class="quiz-card-description">${quiz.description ? this.escapeHtml(quiz.description) : i18n.t('noDescription')}</p>
                    <span class="quiz-card-count">${quiz.questions.length} ${i18n.t('questions')}</span>
                </div>
                <div class="quiz-card-actions">
                    <button class="btn btn-primary btn-small open-quiz-btn" data-id="${quiz.id}">${i18n.t('open')}</button>
                    <div class="dropdown">
                        <button class="dropdown-toggle" title="${i18n.t('more')}">⋮</button>
                        <div class="dropdown-menu">
                            <button class="dropdown-item export-quiz-btn" data-id="${quiz.id}">📤 ${i18n.t('export')}</button>
                            <button class="dropdown-item edit-quiz-btn" data-id="${quiz.id}">✏️ ${i18n.t('edit')}</button>
                            <button class="dropdown-item danger delete-quiz-btn" data-id="${quiz.id}">🗑️ ${i18n.t('delete')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.open-quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openQuiz(btn.dataset.id);
            });
        });

        container.querySelectorAll('.dropdown-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const menu = btn.nextElementSibling;
                this.toggleDropdown(menu);
            });
        });

        container.querySelectorAll('.export-quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.exportQuiz(btn.dataset.id);
            });
        });

        container.querySelectorAll('.edit-quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditQuizForm(btn.dataset.id);
            });
        });

        container.querySelectorAll('.delete-quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteQuiz(btn.dataset.id);
            });
        });

        container.querySelectorAll('.quiz-card').forEach(card => {
            card.addEventListener('click', () => {
                this.openQuiz(card.dataset.id);
            });
        });
    }

    showCreateQuizForm() {
        this.editingQuizId = null;
        document.getElementById('edit-quiz-title').textContent = i18n.t('createNewQuiz');
        document.getElementById('quiz-name').value = '';
        document.getElementById('quiz-description').value = '';
        this.showScreen(this.editQuizScreen);
    }

    showEditQuizForm(quizId) {
        const quiz = this.quizManager.getQuiz(quizId);
        if (!quiz) return;

        this.editingQuizId = quizId;
        document.getElementById('edit-quiz-title').textContent = i18n.t('editQuiz');
        document.getElementById('quiz-name').value = quiz.name;
        document.getElementById('quiz-description').value = quiz.description || '';
        this.showScreen(this.editQuizScreen);
    }

    saveQuiz() {
        const name = document.getElementById('quiz-name').value.trim();
        const description = document.getElementById('quiz-description').value.trim();

        if (!name) {
            alert(i18n.t('enterQuizName'));
            return;
        }

        if (this.editingQuizId) {
            this.quizManager.updateQuiz(this.editingQuizId, { name, description });
        } else {
            const quiz = this.quizManager.createQuiz(name, description);
            this.currentQuizId = quiz.id;
            document.getElementById('current-quiz-name').textContent = name;
            this.showScreen(this.setupScreen);
            this.updateGenerateButton();
            this.updateSkipButton();
            return;
        }

        this.showQuizListScreen();
    }

    deleteQuiz(quizId) {
        const quiz = this.quizManager.getQuiz(quizId);
        if (quiz && confirm(i18n.t('confirmDeleteQuiz', { name: quiz.name }))) {
            this.quizManager.deleteQuiz(quizId);
            this.renderQuizList();
        }
    }

    openQuiz(quizId) {
        this.currentQuizId = quizId;
        const quiz = this.quizManager.getQuiz(quizId);
        if (!quiz) return;

        document.getElementById('current-quiz-name').textContent = quiz.name;
        this.updateGenerateButton();
        this.updateSkipButton();
        this.showScreen(this.setupScreen);
    }

    handleFileSelect(e) {
        this.addFiles(Array.from(e.target.files));
    }

    addFiles(files) {
        const validExtensions = DocumentReader.getSupportedExtensions();
        const validFiles = files.filter(f => {
            const ext = f.name.toLowerCase().substring(f.name.lastIndexOf('.'));
            return validExtensions.includes(ext);
        });
        
        this.selectedFiles = [...this.selectedFiles, ...validFiles];
        this.renderFileList();
        this.updateGenerateButton();
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.renderFileList();
        this.updateGenerateButton();
    }

    renderFileList() {
        if (this.selectedFiles.length === 0) {
            this.fileList.innerHTML = '';
            return;
        }

        this.fileList.innerHTML = this.selectedFiles.map((f, index) => `
            <div class="file-item">
                <div class="file-item-info">
                    <span class="file-item-icon">${this.getFileIcon(f.name)}</span>
                    <span class="file-item-name">${this.escapeHtml(f.name)}</span>
                </div>
                <button class="file-item-remove" data-index="${index}" title="Remove">✕</button>
            </div>
        `).join('');

        this.fileList.querySelectorAll('.file-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(parseInt(btn.dataset.index));
            });
        });
    }

    getFileIcon(filename) {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        const icons = {
            '.pdf': '📕',
            '.docx': '📘',
            '.doc': '📘',
            '.txt': '📄',
            '.md': '📝'
        };
        return icons[ext] || '📄';
    }

    initTheme() {
        const savedTheme = localStorage.getItem('quiz_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        this.setTheme(theme);
        
        document.getElementById('theme-light').addEventListener('click', () => {
            this.setTheme('light');
            localStorage.setItem('quiz_theme', 'light');
        });

        document.getElementById('theme-dark').addEventListener('click', () => {
            this.setTheme('dark');
            localStorage.setItem('quiz_theme', 'dark');
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('quiz_theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    initSettingsModal() {
        const settingsBtn = document.getElementById('settings-btn');
        const closeBtn = document.getElementById('close-settings-btn');
        
        settingsBtn.addEventListener('click', () => this.openSettings());
        closeBtn.addEventListener('click', () => this.closeSettings());
        
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        this.apiKeyInput.addEventListener('change', () => {
            localStorage.setItem('openai_api_key', this.apiKeyInput.value.trim());
        });
    }

    openSettings() {
        this.settingsModal.classList.add('active');
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
    }

    closeDropdownOnClickOutside(e) {
        if (this.activeDropdown && !e.target.closest('.dropdown')) {
            this.activeDropdown.classList.remove('active');
            this.activeDropdown = null;
        }
    }

    toggleDropdown(menu) {
        if (this.activeDropdown && this.activeDropdown !== menu) {
            this.activeDropdown.classList.remove('active');
        }
        menu.classList.toggle('active');
        this.activeDropdown = menu.classList.contains('active') ? menu : null;
    }

    handleKeyboardShortcuts(e) {
        if (this.settingsModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                this.closeSettings();
            }
            return;
        }

        if (this.activeDropdown) {
            if (e.key === 'Escape') {
                this.activeDropdown.classList.remove('active');
                this.activeDropdown = null;
            }
            return;
        }

        if (this.questionScreen.classList.contains('active')) {
            const nextBtn = document.getElementById('next-btn');
            
            if (e.key >= '1' && e.key <= '4') {
                const optionIndex = parseInt(e.key) - 1;
                const options = document.querySelectorAll('#options-container .option');
                if (options[optionIndex] && !options[optionIndex].classList.contains('disabled')) {
                    options[optionIndex].click();
                }
                e.preventDefault();
            }
            
            if (e.key === 'Enter' && !nextBtn.disabled) {
                nextBtn.click();
                e.preventDefault();
            }
        }

        if (this.startScreen.classList.contains('active')) {
            if (e.key === 'Enter') {
                const startBtn = document.getElementById('start-btn');
                if (!startBtn.disabled) {
                    startBtn.click();
                    e.preventDefault();
                }
            }
        }

        if (this.resultScreen.classList.contains('active')) {
            if (e.key === 'Enter') {
                document.getElementById('restart-btn').click();
                e.preventDefault();
            }
            if (e.key === 'Escape') {
                document.getElementById('back-to-list-from-result-btn').click();
                e.preventDefault();
            }
        }
    }

    initDropZone() {
        const dropZone = document.getElementById('drop-zone');
        
        dropZone.addEventListener('click', () => {
            this.pdfInput.click();
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            this.addFiles(files);
        });
    }

    updateGenerateButton() {
        const apiKey = localStorage.getItem('openai_api_key') || '';
        const hasApiKey = apiKey.trim().length > 0;
        const hasFiles = this.selectedFiles.length > 0;
        this.generateBtn.disabled = !(hasApiKey && hasFiles);
    }

    updateSkipButton() {
        const quiz = this.quizManager.getQuiz(this.currentQuizId);
        const hasQuestions = quiz && quiz.questions.length > 0;
        this.skipBtn.textContent = hasQuestions ? i18n.t('continueToQuiz') : i18n.t('skip');
    }

    renderSkeletons() {
        const existing = document.querySelector('.skeleton-container');
        if (existing) return;

        const container = document.createElement('div');
        container.className = 'skeleton-container';
        
        for (let i = 0; i < 3; i++) {
            container.innerHTML += `
                <div class="skeleton-card">
                    <div class="skeleton-line title"></div>
                    <div class="skeleton-line option"></div>
                    <div class="skeleton-line option"></div>
                    <div class="skeleton-line option"></div>
                    <div class="skeleton-line option"></div>
                </div>
            `;
        }
        
        if (this.generationStatus && this.generationStatus.parentNode) {
            this.generationStatus.parentNode.insertBefore(container, this.generationStatus.nextSibling);
        }
    }

    removeSkeletons() {
        const container = document.querySelector('.skeleton-container');
        if (container) {
            container.remove();
        }
    }

    showStatus(message, type) {
        this.generationStatus.className = `generation-status active ${type}`;
        this.generationStatus.innerHTML = message;
        
        if (type === 'loading') {
            this.renderSkeletons();
        } else {
            this.removeSkeletons();
        }
    }

    hideStatus() {
        this.generationStatus.className = 'generation-status';
    }

    async generateQuestions() {
        const apiKey = localStorage.getItem('openai_api_key') || '';
        
        if (!apiKey.trim()) {
            alert(i18n.t('noApiKey'));
            this.openSettings();
            return;
        }
        
        const openai = new OpenAIService(apiKey);
        let allNewQuestions = [];
        
        this.generateBtn.disabled = true;
        
        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i];
            this.showStatus(
                `<span class="spinner"></span>${i18n.t('processing', { file: file.name, current: i + 1, total: this.selectedFiles.length })}`,
                'loading'
            );
            
            try {
                const pdfInfo = await PDFReader.extractTextWithPages(file);
                const difficulty = this.difficultySelect.value;
                const questions = await openai.generateQuestions(pdfInfo.fullText, 10, pdfInfo, difficulty);
                allNewQuestions = allNewQuestions.concat(questions);
                
                this.showStatus(
                    i18n.t('questionsGenerated', { file: file.name, count: questions.length }),
                    'success'
                );
            } catch (error) {
                this.showStatus(
                    i18n.t('errorProcessing', { file: file.name, error: error.message }),
                    'error'
                );
                this.generateBtn.disabled = false;
                return;
            }
        }
        
        const addedCount = this.quizManager.addQuestionsToQuiz(this.currentQuizId, allNewQuestions);
        const quiz = this.quizManager.getQuiz(this.currentQuizId);
        
        this.showStatus(
            i18n.t('done', { added: addedCount, total: quiz.questions.length }),
            'success'
        );
        
        this.selectedFiles = [];
        this.pdfInput.value = '';
        this.fileList.innerHTML = '';
        this.updateSkipButton();
        
        setTimeout(() => {
            this.goToStartScreen();
        }, 1500);
    }

    goToStartScreen() {
        this.hideStatus();
        const quiz = this.quizManager.getQuiz(this.currentQuizId);
        if (!quiz) {
            this.showQuizListScreen();
            return;
        }

        document.getElementById('start-quiz-name').textContent = quiz.name;
        const count = quiz.questions.length;
        const startBtn = document.getElementById('start-btn');
        
        if (count === 0) {
            this.questionCount.textContent = i18n.t('noQuestionsUpload');
            startBtn.disabled = true;
        } else {
            const quizSize = Math.min(count, 20);
            this.questionCount.textContent = i18n.t('questionsAvailable', { count: count, selected: quizSize });
            startBtn.disabled = false;
        }
        
        this.showScreen(this.startScreen);
    }

    showScreen(screen) {
        const currentScreen = document.querySelector('.screen.active');
        
        if (!currentScreen || currentScreen === screen) {
            document.querySelectorAll('.screen').forEach(s => {
                s.classList.remove('active', 'exiting');
            });
            screen.classList.add('active');
            return;
        }
        
        currentScreen.classList.add('exiting');
        
        setTimeout(() => {
            currentScreen.classList.remove('active', 'exiting');
            screen.classList.add('active');
        }, 200); // Must match .screen.exiting animation duration in CSS
    }

    showManageScreen() {
        const quiz = this.quizManager.getQuiz(this.currentQuizId);
        if (quiz) {
            document.getElementById('manage-quiz-name').textContent = quiz.name;
        }
        this.renderQuestionList();
        this.showScreen(this.manageScreen);
    }

    renderQuestionList() {
        const container = document.getElementById('questions-list');
        const quiz = this.quizManager.getQuiz(this.currentQuizId);
        
        if (!quiz || quiz.questions.length === 0) {
            container.innerHTML = `<p class="no-items">${i18n.t('noQuestionsYet')}</p>`;
            return;
        }

        container.innerHTML = quiz.questions.map((q, index) => `
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showAddQuestionForm() {
        this.editingQuestionId = null;
        document.getElementById('edit-title').textContent = i18n.t('addNewQuestion');
        document.getElementById('edit-question').value = '';
        document.getElementById('edit-option-0').value = '';
        document.getElementById('edit-option-1').value = '';
        document.getElementById('edit-option-2').value = '';
        document.getElementById('edit-option-3').value = '';
        document.getElementById('edit-correct').value = '0';
        this.showScreen(this.editScreen);
    }

    showEditQuestionForm(questionId) {
        const quiz = this.quizManager.getQuiz(this.currentQuizId);
        if (!quiz) return;
        
        const question = quiz.questions.find(q => q.id === questionId);
        if (!question) return;

        this.editingQuestionId = questionId;
        document.getElementById('edit-title').textContent = i18n.t('editQuestion');
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
            alert(i18n.t('enterQuestion'));
            return;
        }
        if (question.options.some(opt => !opt)) {
            alert(i18n.t('fillAllOptions'));
            return;
        }

        if (this.editingQuestionId) {
            this.quizManager.updateQuestion(this.currentQuizId, this.editingQuestionId, question);
        } else {
            this.quizManager.addQuestionToQuiz(this.currentQuizId, question);
        }

        this.showManageScreen();
    }

    deleteQuestion(questionId) {
        if (confirm(i18n.t('confirmDeleteQuestion'))) {
            this.quizManager.deleteQuestion(this.currentQuizId, questionId);
            this.renderQuestionList();
        }
    }

    deleteAllQuestions() {
        if (confirm(i18n.t('confirmDeleteAll'))) {
            this.quizManager.deleteAllQuestions(this.currentQuizId);
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
        const quiz = this.quizManager.getQuiz(this.currentQuizId);
        if (!quiz || quiz.questions.length === 0) {
            alert(i18n.t('needOneQuestion'));
            return;
        }

        this.quizQuestions = this.shuffleArray(quiz.questions).slice(0, 20);
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];
        
        document.querySelector('.score-total').textContent = `/ ${this.quizQuestions.length}`;
        
        this.showScreen(this.questionScreen);
        this.displayQuestion();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
        progressText.textContent = i18n.t('questionOf', { current: this.currentIndex + 1, total: this.quizQuestions.length });

        const indices = question.options.map((_, i) => i);
        const shuffledIndices = this.shuffleArray(indices);
        this.currentShuffledIndices = shuffledIndices;
        this.currentCorrectShuffledIndex = shuffledIndices.indexOf(question.correct);

        optionsContainer.innerHTML = '';
        shuffledIndices.forEach((originalIndex, shuffledIndex) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = question.options[originalIndex];
            button.addEventListener('click', () => this.selectOption(shuffledIndex, originalIndex, button));
            optionsContainer.appendChild(button);
        });

        nextBtn.disabled = true;
    }

    selectOption(shuffledIndex, originalIndex, button) {
        const question = this.quizQuestions[this.currentIndex];
        const optionsContainer = document.getElementById('options-container');
        const options = optionsContainer.querySelectorAll('.option');
        const nextBtn = document.getElementById('next-btn');
        
        options.forEach(opt => {
            opt.classList.add('disabled');
            opt.classList.remove('selected');
        });

        const isCorrect = originalIndex === question.correct;
        
        if (isCorrect) {
            button.classList.add('correct');
            this.score++;
        } else {
            button.classList.add('incorrect');
            options[this.currentCorrectShuffledIndex].classList.add('correct');
        }

        this.answers.push({
            question: question.question,
            userAnswer: question.options[originalIndex],
            correctAnswer: question.options[question.correct],
            isCorrect: isCorrect,
            sourceFile: question.sourceFile || null,
            sourcePage: question.sourcePage || null,
            sourceExcerpt: question.sourceExcerpt || null
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
        
        const quiz = this.quizManager.getQuiz(this.currentQuizId);
        document.getElementById('result-quiz-name').textContent = quiz ? quiz.name : '';
        
        const progressFill = document.getElementById('progress-fill');
        const scoreNumber = document.getElementById('score-number');
        const resultMessage = document.getElementById('result-message');
        const resultSummary = document.getElementById('result-summary');

        progressFill.style.width = '100%';
        scoreNumber.textContent = this.score;
        
        const percentage = (this.score / this.quizQuestions.length) * 100;
        let message = '';
        
        if (percentage === 100) {
            message = i18n.t('resultPerfect');
            this.launchConfetti();
        } else if (percentage >= 80) {
            message = i18n.t('resultGreat');
        } else if (percentage >= 60) {
            message = i18n.t('resultGood');
        } else if (percentage >= 40) {
            message = i18n.t('resultOk');
        } else {
            message = i18n.t('resultTryAgain');
        }
        
        resultMessage.textContent = message;

        resultSummary.innerHTML = this.answers.map((answer, index) => {
            let sourceHtml = '';
            if (!answer.isCorrect && (answer.sourceFile || answer.sourceExcerpt)) {
                const filePart = answer.sourceFile ? `<strong>${i18n.t('source')}</strong> ${this.escapeHtml(answer.sourceFile)}` : '';
                const pagePart = answer.sourcePage ? `, ${i18n.t('page')} ${answer.sourcePage}` : '';
                const excerptPart = answer.sourceExcerpt ? `<div class="source-excerpt">"${this.escapeHtml(answer.sourceExcerpt)}"</div>` : '';
                sourceHtml = `<div class="source-reference">${filePart}${pagePart}${excerptPart}</div>`;
            }
            
            return `
                <div class="summary-item ${answer.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                    <strong>${index + 1}. ${this.escapeHtml(answer.question)}</strong><br>
                    ${i18n.t('yourAnswer')} ${this.escapeHtml(answer.userAnswer)}
                    ${!answer.isCorrect ? `<br>${i18n.t('correctAnswerWas')} ${this.escapeHtml(answer.correctAnswer)}` : ''}
                    ${sourceHtml}
                </div>
            `;
        }).join('');
    }

    exportQuiz(quizId) {
        const quiz = this.quizManager.getQuiz(quizId);
        if (!quiz) return;
        
        const jsonData = this.quizManager.exportQuiz(quizId);
        if (!jsonData) return;
        
        this.downloadFile(jsonData, `${this.sanitizeFilename(quiz.name)}.json`);
    }

    exportAllQuizzes() {
        const quizzes = this.quizManager.getAllQuizzes();
        if (quizzes.length === 0) {
            alert(i18n.t('noQuizzesToExport'));
            return;
        }
        
        const jsonData = this.quizManager.exportAllQuizzes();
        this.downloadFile(jsonData, 'all-quizzes.json');
    }

    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    sanitizeFilename(name) {
        return name.replace(/[^a-z0-9æøåäöü\-_\s]/gi, '').replace(/\s+/g, '-').toLowerCase();
    }

    launchConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];
        const confettiCount = 150;

        container.innerHTML = '';

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = -10 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            const size = 5 + Math.random() * 10;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            container.appendChild(confetti);
            
            setTimeout(() => confetti.classList.add('active'), 10);
        }

        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    triggerImport() {
        document.getElementById('import-input').click();
    }

    handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const count = this.quizManager.importQuizzes(event.target.result);
                alert(i18n.t('importSuccess', { count }));
                this.renderQuizList();
            } catch (error) {
                alert(i18n.t('importError'));
            }
        };
        reader.readAsText(file);
        
        e.target.value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
