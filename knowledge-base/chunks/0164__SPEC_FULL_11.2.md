# 11.2 — D2 — Sprzeciwomat EPU (159 zł)

_source: SPEC_FULL · tags: frontend, ai-engine, ocr, payments, notifications, modules, brand, strategy · line 2110 · 2026 chars_

Cel: flagowy produkt Długomatu. Generowanie profesjonalnego sprzeciwu od nakazu zapłaty wydanego w elektronicznym postępowaniu upominawczym (EPU).
Workflow (wizard 6 kroków):
Krok 1 — Upload dokumentu: użytkownik uploaduje skan/zdjęcie nakazu zapłaty lub wezwania do zapłaty. OCR parsuje dane. Jeśli brak dokumentu → ręczne wypełnienie.
Krok 2 — Dane sprawy: auto-fill z OCR. Pola: sygnatura, sąd, data wydania nakazu, data doręczenia (krytyczna — liczy termin 14 dni), powód (nazwa, adres), pozwany (imię, nazwisko, adres, PESEL opcjonalnie), kwota główna, odsetki, koszty. Walidacja: sygnatura w formacie EPU, data doręczenia nie może być w przyszłości, kwota > 0.
Krok 3 — Wybór zarzutów: dynamiczna lista checkboxów z opisami. Każdy zarzut ma ikonę i tooltip wyjaśniający w prostym języku. Domyślnie pre-selected zarzuty wykryte przez AI Analyzer (D1). Użytkownik może dodać dodatkowe okoliczności w polu tekstowym.
Krok 4 — Dane dodatkowe: pola kontekstowe zależne od wybranych zarzutów. Przedawnienie → „Kiedy powstało zobowiązanie? (data umowy/faktury)“. Cesja → „Czy otrzymałeś zawiadomienie o cesji? Nazwa pierwotnego wierzyciela.” Spełnienie świadczenia → „Ile zapłaciłeś? Kiedy? Sposób płatności?"
Krok 5 — Podgląd i edycja: AI generuje sprzeciw (loading ~3-8s z typewriter animation). Wyświetlony w edytowalnym polu (rich text editor lub Markdown editor z preview). Użytkownik może modyfikować treść. Validation score badge w rogu.
Krok 6 — Płatność i pobranie: podsumowanie (typ pisma, sygnatura, cena). Przycisk „Zapłać 159 zł" → Stripe Checkout. Po płatności: PDF odblokowany, przycisk „Pobierz PDF", e-mail z PDF i instrukcją wysłania do sądu. Ustawienie deadline’u D-14 (od daty doręczenia) z powiadomieniami.
Generowane pisma: Sprzeciw od nakazu zapłaty w postępowaniu upominawczym (1 pismo, 2–5 stron).
Termin procesowy: 14 dni od doręczenia nakazu (art. 505¹ § 1 KPC). Konsekwencja przekroczenia: nakaz staje się prawomocny → egzekucja.
Cena: 159 zł (podstawowy) / 199 zł (z dodatkową analizą prawną Opus).
