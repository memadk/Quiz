# PDF Quiz Generator

A web application for creating quizzes from PDF documents using OpenAI.

En webapplikation til at oprette quizzer fra PDF-dokumenter ved hjælp af OpenAI.

## Features / Funktioner

- **Multiple quizzes** - Create and manage multiple quizzes, each with its own name and description
- **AI-generated questions** - Upload PDF, Word, TXT or Markdown files and automatically generate multiple choice questions
- **Difficulty levels** - Choose between easy, medium or hard questions
- **Manual question management** - Add, edit and delete questions manually
- **Source references** - Wrong answers show the source (file name, page, text excerpt)
- **Import/Export** - Export quizzes to JSON files and import them on other devices
- **Dark mode** - Switch between light and dark theme (auto-detects system preference)
- **Bilingual UI** - Switch between Danish and English interface
- **Settings panel** - Centralized settings for API key, language and theme
- **Multiple AI providers** - OpenAI, Google Gemini, or GitHub Copilot for question generation
- **Local storage** - All data is stored in the browser's localStorage

---

- **Flere quizzer** - Opret og administrer flere quizzer, hver med eget navn og beskrivelse
- **AI-genererede spørgsmål** - Upload PDF, Word, TXT eller Markdown-filer og få automatisk genereret multiple choice spørgsmål
- **Sværhedsgrader** - Vælg mellem let, medium eller svær
- **Manuel spørgsmålshåndtering** - Tilføj, rediger og slet spørgsmål manuelt
- **Kildehenvisninger** - Ved forkerte svar vises kilde (filnavn, side, tekstuddrag)
- **Import/Eksport** - Eksporter quizzer til JSON-filer og importer dem på andre enheder
- **Mørkt tema** - Skift mellem lyst og mørkt tema (registrerer automatisk systemindstilling)
- **Tosproget brugerflade** - Skift mellem dansk og engelsk grænseflade
- **Indstillingspanel** - Samlet indstillinger for API-nøgle, sprog og tema
- **Flere AI-udbydere** - OpenAI, Google Gemini eller GitHub Copilot til spørgsmål
- **Lokal lagring** - Alle data gemmes i browserens localStorage

## Getting Started / Kom i gang

1. Open `index.html` in a browser (or start a local server)
2. Click the settings icon (⚙️) and enter your API key for OpenAI, Google Gemini, or GitHub Copilot
3. Create a new quiz
4. Upload files (PDF, Word, TXT, Markdown) and generate questions
5. Start the quiz

---

1. Åbn `index.html` i en browser (eller start en lokal server)
2. Klik på indstillinger (⚙️) og indtast din API-nøgle til OpenAI, Google Gemini eller GitHub Copilot
3. Opret en ny quiz
4. Upload filer (PDF, Word, TXT, Markdown) og generer spørgsmål
5. Start quizzen

## Import/Export

### Export
- Click the menu (⋮) on any quiz and select "Export" to save as JSON
- Click "Export all" to export all quizzes in a single file

### Import
- Click "Import" and select a previously exported JSON file
- Supports both single quiz and multi-quiz export files

### Export Format
```json
{
  "version": 1,
  "exportedAt": "2024-01-01T12:00:00.000Z",
  "quiz": {
    "name": "Quiz Name",
    "description": "Description",
    "questions": [
      {
        "question": "What is...?",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "sourceFile": "document.pdf",
        "sourcePage": 1,
        "sourceExcerpt": "Relevant text..."
      }
    ]
  }
}
```

## Technology / Teknologi

- Vanilla JavaScript (no frameworks / ingen frameworks)
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF text extraction / til PDF-tekstudtræk
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) for Word document extraction / til Word-dokumentudtræk
- OpenAI, Google Gemini, or GitHub Copilot APIs for question generation / til spørgsmålsgenerering

## Local Server / Lokal server

```bash
python3 -m http.server 8080
```

Then open / Åbn derefter: http://localhost:8080

## Live Demo

https://memadk.github.io/Quiz/
