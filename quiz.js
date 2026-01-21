const quizQuestions = [
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
        options: [
            "Vitaminer, mineraler og vand",
            "Kulhydrater, proteiner og fedt",
            "Glukose, fruktose og laktose",
            "Calcium, jern og natrium"
        ],
        correct: 1
    },
    {
        question: "Hvad er et monosakkarid?",
        options: [
            "Et fedtstof med én fedtsyre",
            "Et protein med én aminosyre",
            "Et kulhydrat bestående af én sukkerring",
            "Et vitamin der opløses i vand"
        ],
        correct: 2
    },
    {
        question: "Hvad er glukose også kendt som?",
        options: ["Mælkesukker", "Frugtsukker", "Druesukker", "Rørsukker"],
        correct: 2
    },
    {
        question: "Hvad består sakkarose (køkkensukker) af?",
        options: [
            "To glukosemolekyler",
            "Glukose og galaktose",
            "Glukose og fruktose",
            "Fruktose og galaktose"
        ],
        correct: 2
    },
    {
        question: "Hvor lagres glykogen i menneskets krop?",
        options: [
            "I fedtvævet",
            "I lever og muskler",
            "I knoglerne",
            "I hjernen"
        ],
        correct: 1
    },
    {
        question: "Hvorfor kan mennesker ikke fordøje cellulose?",
        options: [
            "Fordi det er giftigt",
            "Fordi vi mangler de specifikke enzymer",
            "Fordi det opløses i vand",
            "Fordi det nedbrydes for hurtigt"
        ],
        correct: 1
    },
    {
        question: "Hvor mange aminosyrer findes der i alt?",
        options: ["8", "11", "15", "20"],
        correct: 3
    },
    {
        question: "Hvad er essentielle aminosyrer?",
        options: [
            "Aminosyrer kroppen selv kan producere",
            "Aminosyrer der skal tilføres via kosten",
            "Aminosyrer der kun findes i kød",
            "Aminosyrer der bruges til energi"
        ],
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
        options: [
            "Tre aminosyrer og ét glycerol",
            "Ét glycerolmolekyle og tre fedtsyrer",
            "Tre glukosemolekyler",
            "Ét fedtsyre og tre glycerol"
        ],
        correct: 1
    },
    {
        question: "Hvad kendetegner mættede fedtsyrer?",
        options: [
            "De har mange dobbeltbindinger",
            "De er flydende ved stuetemperatur",
            "De har ingen dobbeltbindinger",
            "De findes kun i planteolie"
        ],
        correct: 2
    },
    {
        question: "Hvad transporterer LDL-kolesterol?",
        options: [
            "Fedt væk fra blodårerne til leveren",
            "Fedt til arterierne (kan give aflejringer)",
            "Ilt til musklerne",
            "Glukose til hjernen"
        ],
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
        options: [
            "At give kroppen energi hurtigt",
            "At øge blodsukkeret",
            "At give mæthed og være føde for tarmbakterier",
            "At transportere ilt"
        ],
        correct: 2
    },
    {
        question: "Hvilket enzym starter nedbrydningen af stivelse i munden?",
        options: ["Lipase", "Pepsin", "Amylase", "Trypsin"],
        correct: 2
    },
    {
        question: "Hvad anbefaler '6 om dagen'?",
        options: [
            "6 liter vand dagligt",
            "6 måltider dagligt",
            "600 g frugt og grønt dagligt",
            "6 timer mellem måltider"
        ],
        correct: 2
    },
    {
        question: "Hvad er antioxidanters funktion?",
        options: [
            "At øge energiniveauet",
            "At beskytte mod frie radikaler",
            "At nedbryde fedt",
            "At opbygge muskler"
        ],
        correct: 1
    },
    {
        question: "Hvor dannes D-vitamin primært?",
        options: [
            "I leveren",
            "I tarmene",
            "I huden ved sollys",
            "I knoglerne"
        ],
        correct: 2
    },
    {
        question: "Hvilket hormon sænker blodsukkeret?",
        options: ["Glukagon", "Adrenalin", "Kortisol", "Insulin"],
        correct: 3
    },
    {
        question: "Hvor meget energi indeholder protein pr. gram?",
        options: ["9 kJ/g", "17 kJ/g", "29 kJ/g", "38 kJ/g"],
        correct: 1
    },
    {
        question: "Hvad er laktose?",
        options: ["Frugtsukker", "Mælkesukker", "Druesukker", "Rørsukker"],
        correct: 1
    },
    {
        question: "Hvad er maltose sammensat af?",
        options: [
            "Glukose og fruktose",
            "To glukosemolekyler",
            "Glukose og galaktose",
            "To fruktosemolekyler"
        ],
        correct: 1
    },
    {
        question: "Hvad er stivelse?",
        options: [
            "Et monosakkarid",
            "Et disakkarid",
            "Et polysakkarid (planters energilager)",
            "Et protein"
        ],
        correct: 2
    },
    {
        question: "Hvilket hormon hæver blodsukkeret?",
        options: ["Insulin", "Glukagon", "Østrogen", "Testosteron"],
        correct: 1
    },
    {
        question: "Hvor mange essentielle aminosyrer findes der?",
        options: ["4", "8-9", "15", "20"],
        correct: 1
    },
    {
        question: "Hvad er kollagen?",
        options: [
            "Et transportprotein",
            "Et strukturprotein i hud og bindevæv",
            "Et hormon",
            "Et enzym"
        ],
        correct: 1
    },
    {
        question: "Hvad er keratin?",
        options: [
            "Et protein i hår og negle",
            "Et kulhydrat",
            "Et fedtstof",
            "Et vitamin"
        ],
        correct: 0
    },
    {
        question: "Hvad kendetegner umættede fedtsyrer?",
        options: [
            "De har ingen dobbeltbindinger",
            "De er faste ved stuetemperatur",
            "De har én eller flere dobbeltbindinger",
            "De findes kun i animalske produkter"
        ],
        correct: 2
    },
    {
        question: "Hvad er HDL-kolesterol kendt som?",
        options: [
            "Det dårlige kolesterol",
            "Det gode kolesterol",
            "Plantkolesterol",
            "Animalsk kolesterol"
        ],
        correct: 1
    },
    {
        question: "Hvilken fedtsyretype findes især i olivenolie?",
        options: [
            "Mættede fedtsyrer",
            "Monoumættede fedtsyrer",
            "Transfedtsyrer",
            "Omega-3 fedtsyrer"
        ],
        correct: 1
    },
    {
        question: "Hvad er fosfolipider?",
        options: [
            "Byggesten i cellemembraner",
            "Energilagrende molekyler",
            "Hormoner",
            "Vitaminer"
        ],
        correct: 0
    },
    {
        question: "Hvilket enzym nedbryder fedt?",
        options: ["Amylase", "Pepsin", "Lipase", "Laktase"],
        correct: 2
    },
    {
        question: "Hvor produceres galde?",
        options: ["I bugspytkirtlen", "I maven", "I leveren", "I tyndtarmen"],
        correct: 2
    },
    {
        question: "Hvad er galdens funktion?",
        options: [
            "At nedbryde proteiner",
            "At emulgere (finfordele) fedt",
            "At neutralisere mavesyre",
            "At absorbere vitaminer"
        ],
        correct: 1
    },
    {
        question: "Hvilke mineraler er vigtige for knogleopbygning?",
        options: [
            "Natrium og kalium",
            "Calcium og fosfat",
            "Jern og zink",
            "Magnesium og selen"
        ],
        correct: 1
    },
    {
        question: "Hvad er natrium og kalium vigtige for?",
        options: [
            "Knogleopbygning",
            "Nerveimpulser og muskelsammentrækning",
            "Ilttransport",
            "Fordøjelse"
        ],
        correct: 1
    },
    {
        question: "Hvad er symptomer på jernmangel?",
        options: [
            "Kvalme og hovedpine",
            "Træthed og bleg hud",
            "Muskelkramper",
            "Synsforstyrrelser"
        ],
        correct: 1
    },
    {
        question: "Hvilket vitamin hjælper med optagelse af jern?",
        options: ["A-vitamin", "B-vitamin", "C-vitamin", "D-vitamin"],
        correct: 2
    },
    {
        question: "Hvad er jod vigtigt for?",
        options: [
            "Knogleopbygning",
            "Skjoldbruskkirtlens hormoner",
            "Blodets iltkapacitet",
            "Muskelkontraktion"
        ],
        correct: 1
    },
    {
        question: "Hvilke vitaminer er vandopløselige?",
        options: ["A og D", "E og K", "B og C", "A, D, E og K"],
        correct: 2
    },
    {
        question: "Hvad er frie radikaler?",
        options: [
            "Gavnlige bakterier",
            "Reaktive molekyler der kan skade celler",
            "Essentielle næringsstoffer",
            "Hormoner"
        ],
        correct: 1
    },
    {
        question: "Hvilke vitaminer er antioxidanter?",
        options: ["B og D", "A, C og E", "Kun C", "Kun E"],
        correct: 1
    },
    {
        question: "Hvad er vands vigtigste funktioner i kroppen?",
        options: [
            "Kun at slukke tørst",
            "Transport, temperaturregulering og kemiske processer",
            "Kun energiproduktion",
            "Kun fordøjelse"
        ],
        correct: 1
    },
    {
        question: "Hvor meget vand får kroppen fra mad og respiration?",
        options: ["Ca. 0,5 liter", "Ca. 1 liter", "Ca. 2 liter", "Ca. 3 liter"],
        correct: 1
    },
    {
        question: "Hvad sker der med overskydende glukose i kroppen?",
        options: [
            "Det udskilles med urinen",
            "Det lagres som glykogen eller omdannes til fedt",
            "Det omdannes til protein",
            "Det nedbrydes straks"
        ],
        correct: 1
    },
    {
        question: "Hvilken sukkertype smager sødest?",
        options: ["Glukose", "Fruktose", "Laktose", "Maltose"],
        correct: 1
    },
    {
        question: "Hvad er amylose og amylopektin?",
        options: [
            "Typer af proteiner",
            "Typer af stivelse",
            "Typer af fedtsyrer",
            "Typer af vitaminer"
        ],
        correct: 1
    },
    {
        question: "Hvorfor giver fuldkorn langsommere blodsukkerstigning?",
        options: [
            "Fordi det indeholder mere sukker",
            "Fordi det nedbrydes langsommere pga. fibre",
            "Fordi det indeholder fedt",
            "Fordi det indeholder protein"
        ],
        correct: 1
    },
    {
        question: "Hvad er den anbefalede daglige mængde kostfibre?",
        options: ["10-15 g", "25-35 g", "50-60 g", "75-100 g"],
        correct: 1
    },
    {
        question: "Hvad producerer tarmbakterier når de nedbryder fibre?",
        options: [
            "Alkohol",
            "K-vitamin",
            "Kolesterol",
            "Insulin"
        ],
        correct: 1
    },
    {
        question: "Hvor meget protein anbefales dagligt pr. kg kropsvægt?",
        options: ["0,4 g", "0,8 g", "1,5 g", "2,5 g"],
        correct: 1
    },
    {
        question: "Hvad er alfa-helix og beta-foldeblad?",
        options: [
            "Typer af kulhydrater",
            "Sekundære proteinstrukturer",
            "Typer af fedtsyrer",
            "Vitaminer"
        ],
        correct: 1
    },
    {
        question: "Hvad er enzymer?",
        options: [
            "Hormoner der regulerer stofskiftet",
            "Biologiske katalysatorer der speeder kemiske reaktioner",
            "Antistoffer i immunforsvaret",
            "Transportproteiner i blodet"
        ],
        correct: 1
    },
    {
        question: "Hvad er antistoffer?",
        options: [
            "Proteiner der bekæmper sygdom",
            "Kulhydrater der giver energi",
            "Fedtstoffer der beskytter organer",
            "Vitaminer der styrker knogler"
        ],
        correct: 0
    },
    {
        question: "Hvor meget energi indeholder alkohol pr. gram?",
        options: ["17 kJ/g", "29 kJ/g", "38 kJ/g", "45 kJ/g"],
        correct: 1
    },
    {
        question: "Hvad er den anbefalede energifordeling fra fedt?",
        options: ["Maksimalt 10%", "Minimum 25%", "Præcis 50%", "Over 60%"],
        correct: 1
    },
    {
        question: "Hvad er den anbefalede energifordeling fra protein?",
        options: ["5-10%", "10-20%", "30-40%", "50-60%"],
        correct: 1
    },
    {
        question: "Hvad er omega-3 fedtsyrer?",
        options: [
            "Mættede fedtsyrer",
            "Essentielle flerumættede fedtsyrer",
            "Transfedtsyrer",
            "Syntetiske fedtsyrer"
        ],
        correct: 1
    },
    {
        question: "Hvor optages fedt primært efter fordøjelse?",
        options: [
            "Direkte i blodet",
            "Gennem lymfesystemet",
            "I maven",
            "I tyktarmen"
        ],
        correct: 1
    },
    {
        question: "Hvad bruges kolesterol til i kroppen?",
        options: [
            "Kun som energikilde",
            "Cellemembraner, D-vitamin og kønshormoner",
            "Kun til fordøjelse",
            "Kun til nerveimpulser"
        ],
        correct: 1
    },
    {
        question: "Hvad binder fedtsyrer til glycerol med?",
        options: ["Peptidbindinger", "Hydrogenbindinger", "Esterbindinger", "Ionbindinger"],
        correct: 2
    },
    {
        question: "Hvilken gruppe har særligt risiko for jernmangel?",
        options: [
            "Ældre mænd",
            "Unge kvinder",
            "Børn under 5 år",
            "Gravide kvinder over 40"
        ],
        correct: 1
    },
    {
        question: "Hvorfor tilsættes jod til salt i Danmark?",
        options: [
            "For at forbedre smagen",
            "For at forebygge jodmangel",
            "For at konservere saltet",
            "For at gøre det sundere generelt"
        ],
        correct: 1
    },
    {
        question: "Hvad er fytokemikalier?",
        options: [
            "Syntetiske tilsætningsstoffer",
            "Gavnlige stoffer i frugt og grønt der giver farve",
            "Skadelige pesticider",
            "Kunstige vitaminer"
        ],
        correct: 1
    },
    {
        question: "Hvad sker der med vandopløselige vitaminer i overskud?",
        options: [
            "De lagres i fedtvævet",
            "De udskilles med urinen",
            "De omdannes til fedt",
            "De lagres i knoglerne"
        ],
        correct: 1
    },
    {
        question: "Hvilken fisk er en god kilde til D-vitamin?",
        options: ["Torsk", "Laks", "Rødspætte", "Sild"],
        correct: 1
    },
    {
        question: "Hvad er kroppens primære energikilde for hjernen?",
        options: ["Fedt", "Protein", "Glukose", "Alkohol"],
        correct: 2
    }
];

class Quiz {
    constructor(questions) {
        this.questions = this.shuffleArray([...questions]).slice(0, 20);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        this.init();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    init() {
        this.startScreen = document.getElementById('start-screen');
        this.questionScreen = document.getElementById('question-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.startBtn = document.getElementById('start-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.scoreNumber = document.getElementById('score-number');
        this.resultMessage = document.getElementById('result-message');
        this.resultSummary = document.getElementById('result-summary');

        this.startBtn.addEventListener('click', () => this.startQuiz());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.restartBtn.addEventListener('click', () => this.restartQuiz());
    }

    startQuiz() {
        this.showScreen(this.questionScreen);
        this.displayQuestion();
    }

    showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        this.questionText.textContent = question.question;
        
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `Spørgsmål ${this.currentQuestionIndex + 1} af ${this.questions.length}`;

        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.addEventListener('click', () => this.selectOption(index, button));
            this.optionsContainer.appendChild(button);
        });

        this.nextBtn.disabled = true;
    }

    selectOption(index, button) {
        const question = this.questions[this.currentQuestionIndex];
        const options = this.optionsContainer.querySelectorAll('.option');
        
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

        this.nextBtn.disabled = false;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.showScreen(this.resultScreen);
        
        const progress = 100;
        this.progressFill.style.width = `${progress}%`;
        
        this.scoreNumber.textContent = this.score;
        
        const percentage = (this.score / this.questions.length) * 100;
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
        
        this.resultMessage.textContent = message;

        this.resultSummary.innerHTML = this.answers.map((answer, index) => `
            <div class="summary-item ${answer.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                <strong>${index + 1}. ${answer.question}</strong><br>
                Dit svar: ${answer.userAnswer}
                ${!answer.isCorrect ? `<br>Korrekt svar: ${answer.correctAnswer}` : ''}
            </div>
        `).join('');
    }

    restartQuiz() {
        this.questions = this.shuffleArray([...quizQuestions]).slice(0, 20);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        this.showScreen(this.startScreen);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Quiz(quizQuestions);
});
