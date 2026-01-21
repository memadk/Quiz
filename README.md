# PDF Quiz Generator

A web application for creating quizzes from PDF documents using OpenAI.

En webapplikation til at oprette quizzer fra PDF-dokumenter ved hjælp af OpenAI.

## Features / Funktioner

- **Multiple quizzes** - Create and manage multiple quizzes, each with its own name and description
- **AI-generated questions** - Upload PDF files and automatically generate multiple choice questions
- **Manual question management** - Add, edit and delete questions manually
- **Source references** - Wrong answers show the source (PDF name, page, text excerpt)
- **Import/Export** - Export quizzes to JSON files and import them on other devices
- **Bilingual UI** - Switch between Danish and English interface
- **Local storage** - All data is stored in the browser's localStorage

---

- **Flere quizzer** - Opret og administrer flere quizzer, hver med eget navn og beskrivelse
- **AI-genererede spørgsmål** - Upload PDF-filer og få automatisk genereret multiple choice spørgsmål
- **Manuel spørgsmålshåndtering** - Tilføj, rediger og slet spørgsmål manuelt
- **Kildehenvisninger** - Ved forkerte svar vises kilde (PDF-navn, side, tekstuddrag)
- **Import/Eksport** - Eksporter quizzer til JSON-filer og importer dem på andre enheder
- **Tosproget brugerflade** - Skift mellem dansk og engelsk grænseflade
- **Lokal lagring** - Alle data gemmes i browserens localStorage

## Getting Started / Kom i gang

1. Open `index.html` in a browser (or start a local server)
2. Create a new quiz
3. Enter your OpenAI API key
4. Upload PDF files and generate questions
5. Start the quiz

---

1. Åbn `index.html` i en browser (eller start en lokal server)
2. Opret en ny quiz
3. Indtast din OpenAI API-nøgle
4. Upload PDF-filer og generer spørgsmål
5. Start quizzen

## Import/Export

### Export
- Click the 📤 button on any quiz to export it as a JSON file
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
- OpenAI API (gpt-4o-mini) for question generation / til spørgsmålsgenerering

## Local Server / Lokal server

```bash
python3 -m http.server 8080
```

Then open / Åbn derefter: http://localhost:8080

## Live Demo

https://memadk.github.io/Quiz/
