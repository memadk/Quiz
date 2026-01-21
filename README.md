# PDF Quiz Generator

En webapplikation til at oprette quizzer fra PDF-dokumenter ved hjælp af OpenAI.

## Funktioner

- **Opret flere quizzer** - Hver quiz gemmes separat med eget navn og beskrivelse
- **Generer spørgsmål fra PDF** - Upload PDF-filer og få automatisk genereret multiple choice spørgsmål
- **Manuel spørgsmålshåndtering** - Tilføj, rediger og slet spørgsmål manuelt
- **Kildehenvisninger** - Ved forkerte svar vises kilde (PDF-navn, side, tekstuddrag)
- **Lokal lagring** - Alle data gemmes i browserens localStorage

## Kom i gang

1. Åbn `index.html` i en browser (eller start en lokal server)
2. Opret en ny quiz
3. Indtast din OpenAI API-nøgle
4. Upload PDF-filer og generer spørgsmål
5. Start quizzen

## Teknologi

- Vanilla JavaScript (ingen frameworks)
- [PDF.js](https://mozilla.github.io/pdf.js/) til PDF-tekstudtræk
- OpenAI API (gpt-4o-mini) til spørgsmålsgenerering

## Lokal server

```bash
python3 -m http.server 8080
```

Åbn derefter http://localhost:8080
