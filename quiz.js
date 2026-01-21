const DEFAULT_QUESTIONS = [
    {
        question: "Hvor meget energi indeholder kulhydrater pr. gram?",
        options: ["9 kJ/g", "17 kJ/g", "29 kJ/g", "38 kJ/g"],
        correct: 1
    },
    {
        question: "Hvor meget energi indeholder fedt pr. gram?",
        options: ["17 kJ/g", "29 kJ/g", "38 kJ/g", "45 kJ/g"],
        correct: 2
    },
    {
        question: "Hvad er de tre makronæringsstoffer?",
        options: ["Vitaminer, mineraler og vand", "Kulhydrater, proteiner og fedt", "Glukose, fruktose og laktose", "Calcium, jern og natrium"],
        correct: 1
    },
    {
        question: "Hvad er et monosakkarid?",
        options: ["Et fedtstof med én fedtsyre", "Et protein med én aminosyre", "Et kulhydrat bestående af én sukkerring", "Et vitamin der opløses i vand"],
        correct: 2
    },
    {
        question: "Hvad er glukose også kendt som?",
        options: ["Mælkesukker", "Frugtsukker", "Druesukker", "Rørsukker"],
        correct: 2
    },
    {
        question: "Hvad består sakkarose (køkkensukker) af?",
        options: ["To glukosemolekyler", "Glukose og galaktose", "Glukose og fruktose", "Fruktose og galaktose"],
        correct: 2
    },
    {
        question: "Hvor lagres glykogen i menneskets krop?",
        options: ["I fedtvævet", "I lever og muskler", "I knoglerne", "I hjernen"],
        correct: 1
    },
    {
        question: "Hvorfor kan mennesker ikke fordøje cellulose?",
        options: ["Fordi det er giftigt", "Fordi vi mangler de specifikke enzymer", "Fordi det opløses i vand", "Fordi det nedbrydes for hurtigt"],
        correct: 1
    },
    {
        question: "Hvor mange aminosyrer findes der i alt?",
        options: ["8", "11", "15", "20"],
        correct: 3
    },
    {
        question: "Hvad er essentielle aminosyrer?",
        options: ["Aminosyrer kroppen selv kan producere", "Aminosyrer der skal tilføres via kosten", "Aminosyrer der kun findes i kød", "Aminosyrer der bruges til energi"],
        correct: 1
    },
    {
        question: "Hvad binder aminosyrer sammen i proteiner?",
        options: ["Hydrogenbindinger", "Esterbindinger", "Peptidbindinger", "Ionbindinger"],
        correct: 2
    },
    {
        question: "Hvilket protein transporterer ilt i blodet?",
        options: ["Insulin", "Kollagen", "Hæmoglobin", "Keratin"],
        correct: 2
    },
    {
        question: "Hvad består et triglycerid af?",
        options: ["Tre aminosyrer og ét glycerol", "Ét glycerolmolekyle og tre fedtsyrer", "Tre glukosemolekyler", "Ét fedtsyre og tre glycerol"],
        correct: 1
    },
    {
        question: "Hvad kendetegner mættede fedtsyrer?",
        options: ["De har mange dobbeltbindinger", "De er flydende ved stuetemperatur", "De har ingen dobbeltbindinger", "De findes kun i planteolie"],
        correct: 2
    },
    {
        question: "Hvad transporterer LDL-kolesterol?",
        options: ["Fedt væk fra blodårerne til leveren", "Fedt til arterierne (kan give aflejringer)", "Ilt til musklerne", "Glukose til hjernen"],
        correct: 1
    },
    {
        question: "Hvilke vitaminer er fedtopløselige?",
        options: ["B og C", "A, D, E og K", "Kun D-vitamin", "A, B, C og D"],
        correct: 1
    },
    {
        question: "Hvilket mineral er vigtigt for ilttransport i blodet?",
        options: ["Calcium", "Natrium", "Jern", "Kalium"],
        correct: 2
    },
    {
        question: "Hvor stor en andel af kroppens vægt udgør vand?",
        options: ["20-30%", "30-40%", "45-65%", "70-80%"],
        correct: 2
    },
    {
        question: "Hvor meget væske anbefales det at drikke dagligt?",
        options: ["0,5 liter", "1,5 liter", "3 liter", "4 liter"],
        correct: 1
    },
    {
        question: "Hvad er funktionen af kostfibre?",
        options: ["At give kroppen energi hurtigt", "At øge blodsukkeret", "At give mæthed og være føde for tarmbakterier", "At transportere ilt"],
        correct: 2
    },
    {
        question: "Hvilket enzym starter nedbrydningen af stivelse i munden?",
        options: ["Lipase", "Pepsin", "Amylase", "Trypsin"],
        correct: 2
    },
    {
        question: "Hvad anbefaler '6 om dagen'?",
        options: ["6 liter vand dagligt", "6 måltider dagligt", "600 g frugt og grønt dagligt", "6 timer mellem måltider"],
        correct: 2
    },
    {
        question: "Hvad er antioxidanters funktion?",
        options: ["At øge energiniveauet", "At beskytte mod frie radikaler", "At nedbryde fedt", "At opbygge muskler"],
        correct: 1
    },
    {
        question: "Hvor dannes D-vitamin primært?",
        options: ["I leveren", "I tarmene", "I huden ved sollys", "I knoglerne"],
        correct: 2
    },
    {
        question: "Hvilket hormon sænker blodsukkeret?",
        options: ["Glukagon", "Adrenalin", "Kortisol", "Insulin"],
        correct: 3
    }
];

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
        const prompt = `Du er en ekspert i at lave quizspørgsmål på dansk. Baseret på følgende tekst fra en biologibog, generer ${numQuestions} multiple choice spørgsmål.

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

class QuizApp {
    constructor() {
        this.questions = [...DEFAULT_QUESTIONS];
        this.generatedQuestions = this.loadGeneratedQuestions();
        this.selectedFiles = [];
        this.quiz = null;
        this.init();
    }

    loadGeneratedQuestions() {
        const stored = localStorage.getItem('generatedQuestions');
        return stored ? JSON.parse(stored) : [];
    }

    saveGeneratedQuestions() {
        localStorage.setItem('generatedQuestions', JSON.stringify(this.generatedQuestions));
    }

    getAllQuestions() {
        return [...this.questions, ...this.generatedQuestions];
    }

    init() {
        this.setupScreen = document.getElementById('setup-screen');
        this.startScreen = document.getElementById('start-screen');
        this.questionScreen = document.getElementById('question-screen');
        this.resultScreen = document.getElementById('result-screen');
        
        this.apiKeyInput = document.getElementById('api-key');
        this.pdfInput = document.getElementById('pdf-input');
        this.fileList = document.getElementById('file-list');
        this.generateBtn = document.getElementById('generate-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.generationStatus = document.getElementById('generation-status');
        this.questionCount = document.getElementById('question-count');
        this.backToSetupBtn = document.getElementById('back-to-setup-btn');

        const savedApiKey = localStorage.getItem('openai_api_key');
        if (savedApiKey) {
            this.apiKeyInput.value = savedApiKey;
        }

        this.pdfInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.generateBtn.addEventListener('click', () => this.generateQuestions());
        this.skipBtn.addEventListener('click', () => this.skipToQuiz());
        this.backToSetupBtn.addEventListener('click', () => this.showScreen(this.setupScreen));
        
        this.apiKeyInput.addEventListener('input', () => this.updateGenerateButton());
        
        this.updateGenerateButton();
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
        
        this.generatedQuestions = [...this.generatedQuestions, ...allNewQuestions];
        this.saveGeneratedQuestions();
        
        this.showStatus(
            `✓ Færdig! ${allNewQuestions.length} nye spørgsmål tilføjet. Total: ${this.getAllQuestions().length} spørgsmål.`,
            'success'
        );
        
        setTimeout(() => {
            this.skipToQuiz();
        }, 1500);
    }

    skipToQuiz() {
        this.hideStatus();
        const total = this.getAllQuestions().length;
        this.questionCount.textContent = `${total} spørgsmål tilgængelige (20 tilfældige vælges)`;
        this.showScreen(this.startScreen);
        this.initQuiz();
    }

    initQuiz() {
        const startBtn = document.getElementById('start-btn');
        const nextBtn = document.getElementById('next-btn');
        const restartBtn = document.getElementById('restart-btn');

        startBtn.onclick = () => this.startQuiz();
        nextBtn.onclick = () => this.nextQuestion();
        restartBtn.onclick = () => this.restartQuiz();
    }

    showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
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
        this.quizQuestions = this.shuffleArray(this.getAllQuestions()).slice(0, 20);
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];
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
            message = 'Perfekt! Du er en ekspert i kost og sundhed!';
        } else if (percentage >= 80) {
            message = 'Fantastisk! Du har styr på det meste!';
        } else if (percentage >= 60) {
            message = 'Godt klaret! Du har en god forståelse.';
        } else if (percentage >= 40) {
            message = 'Ikke dårligt, men der er plads til forbedring.';
        } else {
            message = 'Læs kapitlerne igen og prøv en gang til!';
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

    restartQuiz() {
        this.showScreen(this.startScreen);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
