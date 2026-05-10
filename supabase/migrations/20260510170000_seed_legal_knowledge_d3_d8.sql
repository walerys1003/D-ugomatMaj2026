-- =============================================================================
-- Długomat — Tier 3 / Migration — Seed legal_knowledge for D3, D4, D6, D7, D8
-- (zad. 8 — RAG knowledge base seeding)
--
-- Strategia:
--   - Wstawiamy chunks bez `embedding` (NULL). Embeddingi generujemy
--     w post-deploy job (`scripts/embed-knowledge.ts`) który czyta wszystkie
--     wiersze z `embedding IS NULL` i wywołuje `embedText()`.
--   - Każdy chunk ma `category` (kpc/kc/pb/pe/upadlosc/orzecznictwo/praktyka)
--     oraz `subcategory` z konwencji `<module>:<topic>` (np. 'd3:art_833_kpc').
--   - Retriever może filtrować po `category` (np. category='upadlosc' dla D8)
--     lub po `subcategory` LIKE 'd7:%' dla ugód.
--
-- Idempotencja: ON CONFLICT DO NOTHING bazuje na (subcategory, source) który
-- jest unikatowy w obrębie modułu. Stąd dodajemy unique index defensywnie.
-- =============================================================================

create unique index if not exists uq_legal_knowledge_subcat_source
  on public.legal_knowledge(subcategory, source);

-- ===========================================================================
-- D3 — Komornik (skarga na czynności komornika, ograniczenia egzekucji)
-- Podstawa: art. 767, 833 KPC; art. 8 ustawy o komornikach sądowych.
-- ===========================================================================

insert into public.legal_knowledge (category, subcategory, title, content, source, source_url, effective_date)
values
('kpc', 'd3:art_767_kpc', 'Skarga na czynności komornika — art. 767 KPC',
 E'Art. 767 § 1 KPC. Na czynności komornika przysługuje skarga do sądu rejonowego, jeżeli ustawa nie stanowi inaczej. Dotyczy to także zaniechania przez komornika dokonania czynności. Do rozpoznania skargi właściwy jest sąd, przy którym działa komornik.\n\n§ 2. Skargę może złożyć strona lub inna osoba, której prawa zostały przez czynności lub zaniechanie komornika naruszone bądź zagrożone.\n\n§ 3¹. Skargę wnosi się do komornika, który dokonał zaskarżonej czynności lub zaniechał jej dokonania. Do skargi stosuje się odpowiednio przepisy o pozwie.\n\n§ 4. Skargę wnosi się w terminie tygodniowym od dnia czynności, gdy strona lub osoba, której prawo zostało przez czynność komornika naruszone bądź zagrożone, była przy czynności obecna lub była o jej terminie zawiadomiona; w innych wypadkach – od dnia zawiadomienia o dokonaniu czynności strony lub osoby, której prawo zostało przez czynność komornika naruszone bądź zagrożone, a w braku zawiadomienia – od dnia, w którym czynność powinna być dokonana.\n\n§ 5. Odpis skargi sąd przesyła komornikowi, który w terminie trzech dni na piśmie sporządza uzasadnienie dokonania zaskarżonej czynności lub przyczyn jej zaniechania oraz przekazuje je wraz z aktami sprawy do sądu, do którego skargę wniesiono, chyba że skargę w całości uwzględnia, o czym zawiadamia sąd i skarżącego oraz zainteresowanych, których uwzględnienie skargi dotyczy.',
 'Dz.U. 1964 nr 43 poz. 296 (KPC, tekst jednolity)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640430296',
 '1965-01-01'),

('kpc', 'd3:art_833_kpc', 'Ograniczenia egzekucji z wynagrodzenia — art. 833 KPC',
 E'Art. 833 § 1 KPC. Wynagrodzenie ze stosunku pracy podlega egzekucji w zakresie określonym w przepisach Kodeksu pracy.\n\n§ 1¹. Przepis § 1 stosuje się odpowiednio do zasiłków dla bezrobotnych, dodatków aktywizacyjnych, stypendiów oraz dodatków szkoleniowych, wypłacanych na podstawie przepisów o promocji zatrudnienia i instytucjach rynku pracy.\n\n§ 4. Świadczenia pieniężne przewidziane w przepisach o zaopatrzeniu emerytalnym podlegają egzekucji w zakresie określonym w tych przepisach.\n\n§ 6. Nie podlegają egzekucji świadczenia alimentacyjne, świadczenia pieniężne wypłacane w przypadku bezskuteczności egzekucji alimentów, świadczenia rodzinne, dodatki rodzinne, pielęgnacyjne, porodowe, dla sierot zupełnych, zasiłki dla opiekunów, świadczenia z pomocy społecznej, świadczenia integracyjne, świadczenie wychowawcze, jednorazowe świadczenie, o którym mowa w art. 10 ustawy z dnia 4 listopada 2016 r. o wsparciu kobiet w ciąży i rodzin "Za życiem", świadczenie, o którym mowa w art. 8a ust. 1 ustawy z dnia 7 września 2007 r. o Karcie Polaka oraz świadczenie pieniężne i pomoc, o których mowa w art. 8b ust. 1 i ust. 2 ustawy z dnia 9 listopada 2000 r. o repatriacji.\n\n§ 7. Nie podlegają egzekucji świadczenia, dodatki i inne kwoty, o których mowa w art. 31 ust. 1, art. 80 ust. 1 i 1a, art. 81, art. 83 ust. 1 i 4, art. 84 pkt 2 i 3 i art. 140 ust. 1 pkt 1 ustawy z dnia 9 czerwca 2011 r. o wspieraniu rodziny i systemie pieczy zastępczej.',
 'Dz.U. 1964 nr 43 poz. 296 (KPC)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640430296',
 '1965-01-01'),

('kpc', 'd3:art_829_kpc', 'Wyłączenia spod egzekucji — art. 829 KPC',
 E'Art. 829 KPC. Nie podlegają egzekucji:\n1) przedmioty urządzenia domowego niezbędne dla dłużnika i jego domowników, w szczególności lodówka, pralka, odkurzacz, piekarnik lub kuchenka mikrofalowa, płyta grzewcza służąca podgrzewaniu i przygotowywaniu posiłków, łóżka, stół i krzesła w liczbie niezbędnej dla dłużnika i jego domowników oraz po jednym źródle oświetlenia na izbę, chyba że są to przedmioty, których wartość znacznie przekracza przeciętną wartość nowych przedmiotów danego rodzaju;\n2) pościel, bielizna i ubranie codzienne, niezbędne dla dłużnika i będących na jego utrzymaniu członków jego rodziny, a także ubranie niezbędne do pełnienia służby lub wykonywania zawodu;\n3) zapasy żywności i opału niezbędne dla dłużnika i będących na jego utrzymaniu członków jego rodziny na okres jednego miesiąca;\n4) jedna krowa lub dwie kozy albo trzy owce potrzebne do wyżywienia dłużnika i będących na jego utrzymaniu członków jego rodziny wraz z zapasem paszy i ściółki do najbliższych zbiorów;\n5) narzędzia i inne przedmioty niezbędne do osobistej pracy zarobkowej dłużnika oraz surowce niezbędne dla niego do produkcji na okres jednego tygodnia, z wyłączeniem jednak pojazdów mechanicznych;\n6) u dłużnika pobierającego periodyczną stałą płacę – pieniądze w kwocie, która odpowiada niepodlegającej egzekucji części płacy za czas do najbliższego terminu wypłaty, a u dłużnika nieotrzymującego stałej płacy lub u dłużnika będącego osobą fizyczną wykonującą działalność gospodarczą – pieniądze niezbędne dla niego i jego rodziny na utrzymanie przez dwa tygodnie;\n7) przedmioty niezbędne do nauki, papiery osobiste, odznaczenia i przedmioty służące do wykonywania praktyk religijnych oraz przedmioty codziennego użytku, które mogą być sprzedane tylko znacznie poniżej ich wartości, a dla dłużnika mają znaczną wartość użytkową.',
 'Dz.U. 1964 nr 43 poz. 296 (KPC)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640430296',
 '1965-01-01'),

('kp', 'd3:art_87_kp', 'Potrącenia z wynagrodzenia — art. 87 KP',
 E'Art. 87 § 1 KP. Z wynagrodzenia za pracę – po odliczeniu składek na ubezpieczenia społeczne, zaliczki na podatek dochodowy od osób fizycznych oraz wpłat dokonywanych do pracowniczego planu kapitałowego, jeżeli pracownik nie zrezygnował z ich dokonywania – podlegają potrąceniu tylko następujące należności:\n1) sumy egzekwowane na mocy tytułów wykonawczych na zaspokojenie świadczeń alimentacyjnych;\n2) sumy egzekwowane na mocy tytułów wykonawczych na pokrycie należności innych niż świadczenia alimentacyjne;\n3) zaliczki pieniężne udzielone pracownikowi;\n4) kary pieniężne przewidziane w art. 108.\n\n§ 3. Potrącenia mogą być dokonywane w następujących granicach:\n1) w razie egzekucji świadczeń alimentacyjnych – do wysokości trzech piątych wynagrodzenia;\n2) w razie egzekucji innych należności lub potrącania zaliczek pieniężnych – do wysokości połowy wynagrodzenia.',
 'Dz.U. 1974 nr 24 poz. 141 (Kodeks Pracy)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141',
 '1975-01-01'),

('praktyka', 'd3:skarga_struktura',
 'Struktura skargi na czynności komornika',
 E'Skarga na czynności komornika powinna zawierać:\n1) Oznaczenie sądu (sądu rejonowego, przy którym działa komornik) — art. 767 § 1 KPC.\n2) Sygnaturę akt komorniczych (Km/GKm/Kmp).\n3) Oznaczenie stron — wierzyciel, dłużnik, komornik (z imienia i nazwiska oraz nazwą kancelarii).\n4) Określenie zaskarżonej czynności (data + opis: zajęcie wynagrodzenia, rachunku bankowego, ruchomości; umorzenie postępowania; odmowa zwrotu nadpłaty itp.) lub zaniechania.\n5) Wniosek skargowy — uchylenie / zmiana czynności, ewentualnie zwrot nadpłaty z odsetkami.\n6) Uzasadnienie z podaniem konkretnych przepisów (art. 767 KPC + przepis materialny np. art. 833 § 6 KPC dla zajęcia świadczenia 500+).\n7) Datę i podpis dłużnika.\n8) Załączniki — kopia zawiadomienia o czynności, dowody (np. wyciąg bankowy z którego wynika charakter świadczenia).\n\nTermin: 7 dni od dnia czynności (gdy obecny) lub od dnia zawiadomienia (art. 767 § 4 KPC). Skargę wnosi się DO KOMORNIKA, który w 3 dni przekazuje sądowi (§ 5).\n\nOpłata: 50 zł (art. 25 ust. 1 pkt 1 ustawy o kosztach sądowych w sprawach cywilnych).',
 'wew_komentarz_d3', null, '2024-01-01');

-- ===========================================================================
-- D4 — Potrącenia z wynagrodzenia / świadczeń (skarga + wniosek do pracodawcy)
-- ===========================================================================

insert into public.legal_knowledge (category, subcategory, title, content, source, source_url, effective_date)
values
('kp', 'd4:art_871_kp', 'Kwota wolna od potrąceń — art. 87¹ KP',
 E'Art. 87¹ § 1 KP. Wolna od potrąceń jest kwota wynagrodzenia za pracę w wysokości:\n1) minimalnego wynagrodzenia za pracę, ustalanego na podstawie odrębnych przepisów, przysługującego pracownikom zatrudnionym w pełnym wymiarze czasu pracy, po odliczeniu składek na ubezpieczenia społeczne, zaliczki na podatek dochodowy od osób fizycznych oraz wpłat dokonywanych do pracowniczego planu kapitałowego, jeżeli pracownik nie zrezygnował z ich dokonywania – przy potrącaniu sum egzekwowanych na mocy tytułów wykonawczych na pokrycie należności innych niż świadczenia alimentacyjne;\n2) 75% wynagrodzenia określonego w pkt 1 – przy potrącaniu zaliczek pieniężnych udzielonych pracownikowi;\n3) 90% wynagrodzenia określonego w pkt 1 – przy potrącaniu kar pieniężnych przewidzianych w art. 108.\n\n§ 2. Jeżeli pracownik jest zatrudniony w niepełnym wymiarze czasu pracy, kwoty określone w § 1 ulegają zmniejszeniu proporcjonalnie do wymiaru czasu pracy.\n\nUWAGA praktyczna: minimalne wynagrodzenie w 2025 r. = 4 666 zł brutto (≈3 510 zł netto). Komornik nie może zająć kwoty NETTO mniejszej niż minimalna płaca po odliczeniach.',
 'Dz.U. 1974 nr 24 poz. 141 (KP)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141',
 '1996-06-02'),

('kp', 'd4:art_91_kp', 'Potrącenia za zgodą pracownika — art. 91 KP',
 E'Art. 91 § 1 KP. Należności inne niż wymienione w art. 87 § 1 i 7 mogą być potrącane z wynagrodzenia pracownika tylko za jego zgodą wyrażoną na piśmie.\n\n§ 2. W przypadkach określonych w § 1 wolna od potrąceń jest kwota wynagrodzenia za pracę w wysokości:\n1) określonej w art. 87¹ § 1 pkt 1 – przy potrącaniu należności na rzecz pracodawcy;\n2) 80% kwoty określonej w art. 87¹ § 1 pkt 1 – przy potrącaniu innych należności niż wymienione w pkt 1.',
 'Dz.U. 1974 nr 24 poz. 141 (KP)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141',
 '1975-01-01'),

('kpc', 'd4:art_8331_kpc', 'Kwota wolna od egzekucji z rachunku bankowego — art. 54 PB / art. 833¹ KPC',
 E'Zgodnie z art. 54 ust. 1 ustawy z dnia 29 sierpnia 1997 r. – Prawo bankowe, środki pieniężne znajdujące się na rachunkach oszczędnościowych, rachunkach oszczędnościowo-rozliczeniowych oraz na rachunkach terminowych lokat oszczędnościowych jednej osoby, niezależnie od liczby zawartych umów, są wolne od zajęcia na podstawie sądowego lub administracyjnego tytułu wykonawczego, w każdym miesiącu kalendarzowym, w którym obowiązuje zajęcie, do wysokości 75% minimalnego wynagrodzenia za pracę, ustalanego na podstawie ustawy z dnia 10 października 2002 r. o minimalnym wynagrodzeniu za pracę.\n\nW 2025 r. (minimalne wynagrodzenie 4 666 zł brutto) kwota wolna ≈ 3 499,50 zł / m-c.\n\nW przypadku rachunku wspólnego — kwota wolna przysługuje każdemu ze współposiadaczy z osobna.',
 'Dz.U. 1997 nr 140 poz. 939 (Prawo bankowe)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19971400939',
 '1998-01-01'),

('praktyka', 'd4:wniosek_struktura',
 'Struktura wniosku do pracodawcy o przestrzeganie kwoty wolnej',
 E'Wniosek do pracodawcy (działu kadr/płac) o uwzględnienie kwoty wolnej od potrąceń — używany gdy pracodawca błędnie potrąca pełne wynagrodzenie zamiast jedynie nadwyżki ponad minimalną krajową.\n\nElementy:\n1) Dane pracownika (imię, nazwisko, PESEL, dział).\n2) Wskazanie tytułu wykonawczego i komornika (sygnatura Km).\n3) Powołanie podstawy prawnej: art. 87¹ § 1 KP — kwota wolna w wysokości minimalnego wynagrodzenia netto.\n4) Aktualna minimalna kwota netto (na bieżący rok kalendarzowy).\n5) Żądanie: ustalenie potrąceń wyłącznie z nadwyżki ponad minimalne wynagrodzenie netto; zwrot zatrzymanej kwoty wolnej z poprzednich miesięcy (jeśli zaistniała).\n6) Termin odpowiedzi (zwykle 14 dni).\n7) Pouczenie o odpowiedzialności pracodawcy z art. 282 KP (wykroczenie przeciwko prawom pracownika — kara grzywny do 30 000 zł) gdy nie respektuje kwoty wolnej.\n\nKopia: do komornika oraz do PIP (Państwowa Inspekcja Pracy) dla wzmocnienia.',
 'wew_komentarz_d4', null, '2024-01-01');

-- ===========================================================================
-- D6 — Cesja wierzytelności / fundusze sekurytyzacyjne (zarzut przedawnienia)
-- ===========================================================================

insert into public.legal_knowledge (category, subcategory, title, content, source, source_url, effective_date)
values
('kc', 'd6:art_117_kc', 'Przedawnienie roszczeń — art. 117 KC',
 E'Art. 117 § 1 KC. Z zastrzeżeniem wyjątków przewidzianych w ustawie, roszczenia majątkowe ulegają przedawnieniu.\n\n§ 2. Po upływie terminu przedawnienia ten, przeciwko komu przysługuje roszczenie, może uchylić się od jego zaspokojenia, chyba że zrzeka się korzystania z zarzutu przedawnienia. Jednakże zrzeczenie się zarzutu przedawnienia przed upływem terminu jest nieważne.\n\n§ 2¹. Po upływie terminu przedawnienia nie można domagać się zaspokojenia roszczenia przysługującego przeciwko konsumentowi.\n\n(WAŻNE: § 2¹ — z urzędu! Sąd bada przedawnienie z urzędu w sprawach przeciwko konsumentom, niezależnie od podniesienia zarzutu.)',
 'Dz.U. 1964 nr 16 poz. 93 (KC)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093',
 '2018-07-09'),

('kc', 'd6:art_118_kc', 'Terminy przedawnienia — art. 118 KC',
 E'Art. 118 KC. Jeżeli przepis szczególny nie stanowi inaczej, termin przedawnienia wynosi sześć lat, a dla roszczeń o świadczenia okresowe oraz roszczeń związanych z prowadzeniem działalności gospodarczej – trzy lata. Jednakże koniec terminu przedawnienia przypada na ostatni dzień roku kalendarzowego, chyba że termin przedawnienia jest krótszy niż dwa lata.\n\nPRAKTYCZNIE:\n- Roszczenia z umowy pożyczki / kredytu konsumenckiego = 3 lata (związane z działalnością gospodarczą banku).\n- Faktury, raty, abonamenty = 3 lata (świadczenia okresowe).\n- Reszta = 6 lat.\n- Bieg liczymy od dnia wymagalności.\n- Termin przedłuża się do końca roku kalendarzowego (od 9.07.2018 r.).',
 'Dz.U. 1964 nr 16 poz. 93 (KC)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093',
 '2018-07-09'),

('kc', 'd6:art_509_kc', 'Cesja wierzytelności — art. 509 KC',
 E'Art. 509 § 1 KC. Wierzyciel może bez zgody dłużnika przenieść wierzytelność na osobę trzecią (przelew), chyba że sprzeciwiałoby się to ustawie, zastrzeżeniu umownemu albo właściwości zobowiązania.\n\n§ 2. Wraz z wierzytelnością przechodzą na nabywcę wszelkie związane z nią prawa, w szczególności roszczenie o zaległe odsetki.\n\nArt. 513 § 1 KC. Dłużnikowi przysługują przeciwko nabywcy wierzytelności wszelkie zarzuty, które miał przeciwko zbywcy w chwili powzięcia wiadomości o przelewie.\n\nUWAGA: Cesja NIE PRZERYWA biegu przedawnienia. Fundusz sekurytyzacyjny "kupuje" wierzytelność z całym dotychczasowym stażem przedawnienia. Jeżeli pierwotny wierzyciel nie przerwał biegu — fundusz "przejmuje" zegar w punkcie, w jakim go zostawiono.',
 'Dz.U. 1964 nr 16 poz. 93 (KC)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093',
 '1965-01-01'),

('orzecznictwo', 'd6:sn_iii_czp_29_17',
 'Uchwała SN III CZP 29/17 — przedawnienie a EPU',
 E'Uchwała Sądu Najwyższego z dnia 23 sierpnia 2017 r. (III CZP 29/17): "Wniosek o nadanie klauzuli wykonalności bankowemu tytułowi egzekucyjnemu nie przerywa biegu przedawnienia roszczenia objętego tym tytułem wobec cesjonariusza niebędącego bankiem."\n\nKluczowe wnioski:\n- Czynności poprzedniego wierzyciela (banku) nie wiążą cesjonariusza, jeśli ten nie ma statusu banku (np. fundusz sekurytyzacyjny).\n- Stąd w sprzeciwie / zarzucie przedawnienia warto powołać tę uchwałę gdy fundusz powołuje się na czynności pierwotnego wierzyciela jako przerywające bieg przedawnienia.\n- Stosowane analogicznie do EPU: pozew złożony przez bank przerywa bieg przedawnienia wobec banku, ale nie wobec cesjonariusza, który dopiero potem wstąpił w stosunek prawny.',
 'III CZP 29/17 (SN, IC 2018/1/3)',
 'https://www.sn.pl/orzecznictwo/SitePages/Najnowsze_orzeczenia.aspx',
 '2017-08-23'),

('praktyka', 'd6:zarzut_struktura',
 'Struktura zarzutu przedawnienia w sprzeciwie / piśmie procesowym',
 E'Zarzut przedawnienia powinien być sformułowany jednoznacznie i zawierać:\n1) Twierdzenie: "Podnoszę zarzut przedawnienia roszczenia."\n2) Oznaczenie roszczenia (kwota główna, odsetki, koszty) z umowy pierwotnej.\n3) Określenie daty wymagalności (np. data ostatniej raty + 1 dzień, lub data wypowiedzenia umowy + termin wypowiedzenia).\n4) Powołanie terminu z art. 118 KC (3 lata dla roszczeń z dz. gospodarczej; 6 lat dla pozostałych).\n5) Wskazanie, że pomiędzy datą wymagalności a wniesieniem pozwu upłynął termin przedawnienia.\n6) Powołanie art. 117 § 2¹ KC (przy konsumentach — sąd bada z urzędu; podniesienie wzmacnia obronę).\n7) Wykazanie, że bieg przedawnienia nie został skutecznie przerwany — w szczególności (jeśli pozew złożył fundusz cesjonariusz) powołanie uchwały SN III CZP 29/17.\n8) Wniosek: oddalenie powództwa w całości / uchylenie nakazu zapłaty.',
 'wew_komentarz_d6', null, '2024-01-01');

-- ===========================================================================
-- D7 — Ugoda z wierzycielem (negocjacja, struktura ugody, oddłużanie)
-- ===========================================================================

insert into public.legal_knowledge (category, subcategory, title, content, source, source_url, effective_date)
values
('kc', 'd7:art_917_kc', 'Ugoda — art. 917 KC',
 E'Art. 917 KC. Przez ugodę strony czynią sobie wzajemne ustępstwa w zakresie istniejącego między nimi stosunku prawnego w tym celu, aby uchylić niepewność co do roszczeń wynikających z tego stosunku lub zapewnić ich wykonanie albo by uchylić spór istniejący lub mogący powstać.\n\nElementy ugody pozasądowej:\n- Wzajemne ustępstwa stron (kluczowe — bez ustępstw obu stron NIE ma ugody w rozumieniu KC; jednostronne uznanie długu to "uznanie", art. 123 § 1 pkt 2 KC).\n- Określenie istniejącego stosunku prawnego (umowa pożyczki, kredyt, faktura).\n- Cel: uchylenie niepewności / sporu.',
 'Dz.U. 1964 nr 16 poz. 93 (KC)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093',
 '1965-01-01'),

('kc', 'd7:art_123_kc', 'Przerwanie biegu przedawnienia — art. 123 KC',
 E'Art. 123 § 1 KC. Bieg przedawnienia przerywa się:\n1) przez każdą czynność przed sądem lub innym organem powołanym do rozpoznawania spraw lub egzekwowania roszczeń danego rodzaju albo przed sądem polubownym, przedsięwziętą bezpośrednio w celu dochodzenia lub ustalenia albo zaspokojenia lub zabezpieczenia roszczenia;\n2) przez uznanie roszczenia przez osobę, przeciwko której roszczenie przysługuje;\n3) przez wszczęcie mediacji.\n\nPRAKTYCZNIE: Podpisanie ugody z wierzycielem = uznanie roszczenia → PRZERYWA bieg przedawnienia. Po tym dniu liczy się termin od nowa. Z tego powodu NIE wolno podpisywać ugody na PRZEDAWNIONY dług bez świadomej decyzji.\n\nNawet częściowa wpłata na podstawie ugody = uznanie roszczenia w pozostałym zakresie (orzecznictwo).',
 'Dz.U. 1964 nr 16 poz. 93 (KC)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093',
 '1965-01-01'),

('praktyka', 'd7:ugoda_struktura',
 'Struktura ugody pozasądowej',
 E'Wzór ugody pozasądowej powinien zawierać:\n1) Oznaczenie stron — wierzyciel (firma, NIP, adres) i dłużnik (imię, nazwisko, PESEL, adres).\n2) Preambuła — opis stosunku prawnego (umowa nr X z dnia Y, saldo zadłużenia na dzień Z).\n3) Uzgodnione kwoty:\n   - kapitał wyjściowy,\n   - odsetki naliczone do dnia ugody,\n   - koszty windykacji,\n   - kwota uzgodniona po obniżce (np. umorzenie 30% odsetek + koszty),\n   - sposób spłaty (jednorazowo / raty: liczba × kwota / pierwszy termin).\n4) Klauzula umorzenia pozostałej części (warunkowa — pod warunkiem terminowej spłaty).\n5) Klauzula natychmiastowej wymagalności w razie zwłoki (3-7 dni opóźnienia).\n6) Klauzula braku odsetek za okres po podpisaniu ugody (warto walczyć).\n7) Klauzula wycofania pozwu / wniosku egzekucyjnego po wpłacie ostatniej raty.\n8) Klauzula RODO — cel i okres przetwarzania danych po wykonaniu ugody.\n9) Data, podpisy, świadkowie (opcjonalnie).\n\nNEGOCJACJA: Realny target obniżki dla funduszy sekurytyzacyjnych = 30-70% kapitału. Dla pierwotnych wierzycieli (banki) = 10-30%. Jeśli sprawa jest w EPU bez nakazu uprawomocnionego — pozycja negocjacyjna dłużnika silniejsza.',
 'wew_komentarz_d7', null, '2024-01-01'),

('praktyka', 'd7:taktyka_negocjacji',
 'Taktyka negocjacyjna z funduszem / kancelarią windykacyjną',
 E'Zasady taktyki:\n1) NIGDY nie potwierdzaj długu w mailu / SMS-ie zanim podejmiesz decyzję — uznanie = przerwanie przedawnienia.\n2) Komunikacja TYLKO pisemna (e-mail / list polecony) — daje dowód.\n3) Rozpoczęcie: oferta 20-30% kwoty głównej, jednorazowo, w zamian za pełne umorzenie. Fundusze często akceptują 30-50%.\n4) Argumenty obniżki:\n   - przedawnienie roszczenia (jeśli sprawdzone);\n   - błędy formalne wierzyciela (brak ksero ważności umowy, brak wypowiedzenia, błędne wyliczenie odsetek);\n   - brak tytułu wykonawczego (przed nakazem zapłaty);\n   - sytuacja życiowa (utrata pracy, choroba) — argument empatyczny.\n5) Dokumentuj zawsze stan zadłużenia w momencie negocjacji (saldo z BIK / od wierzyciela).\n6) NIE ZGADZAJ SIĘ na rozliczenia "tylko odsetki najpierw" — zawsze proporcjonalnie kapitał + odsetki.\n7) Po podpisaniu — ZAPŁAĆ na wskazany rachunek z oznaczeniem tytułu, ZACHOWAJ potwierdzenie.\n8) Po ostatniej wpłacie — zażądaj listu o spłacie i wykreślenia z BIK (jeśli był wpis).',
 'wew_komentarz_d7', null, '2024-01-01');

-- ===========================================================================
-- D8 — Upadłość konsumencka (wniosek, plan spłaty)
-- ===========================================================================

insert into public.legal_knowledge (category, subcategory, title, content, source, source_url, effective_date)
values
('upadlosc', 'd8:art_4914_pu', 'Wniosek o ogłoszenie upadłości konsumenta — art. 491⁴ PU',
 E'Art. 491⁴ Prawa upadłościowego. Wniosek o ogłoszenie upadłości konsumenta może zgłosić dłużnik. Wniosek powinien zawierać:\n1) imię i nazwisko, miejsce zamieszkania, adres oraz PESEL dłużnika, a jeśli dłużnik nie posiada numeru PESEL – dane umożliwiające jego jednoznaczną identyfikację;\n2) NIP dłużnika, jeżeli dłużnik miał taki numer w ciągu ostatnich dziesięciu lat przed dniem złożenia wniosku;\n3) wskazanie miejsc, w których znajduje się majątek dłużnika;\n4) wskazanie okoliczności, które uzasadniają wniosek i ich uprawdopodobnienie;\n5) aktualny i zupełny wykaz majątku z szacunkową wyceną jego składników;\n6) spis wierzycieli z podaniem ich adresów i wysokości wierzytelności każdego z nich oraz terminów zapłaty;\n7) spis wierzytelności spornych z zaznaczeniem zakresu, w jakim dłużnik kwestionuje istnienie wierzytelności;\n8) listę zabezpieczeń ustanowionych na majątku dłużnika wraz z datami ich ustanowienia, w szczególności hipotek, zastawów i zastawów rejestrowych;\n9) oświadczenie dłużnika, że nie zachodzą okoliczności wskazane w art. 491⁴ ust. 2 i 3 (przesłanki negatywne).',
 'Dz.U. 2003 nr 60 poz. 535 (Prawo upadłościowe)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20030600535',
 '2020-03-24'),

('upadlosc', 'd8:przesłanki_4914',
 'Przesłanki ogłoszenia upadłości konsumenckiej',
 E'Po nowelizacji z 24.03.2020 r. (tzw. "łatwa upadłość konsumencka"):\n\nPRZESŁANKI POZYTYWNE:\n- Dłużnik jest osobą fizyczną nieprowadzącą działalności gospodarczej (lub przedsiębiorcą wpisanym do CEIDG, ale w trybie odrębnym — art. 491¹ PU).\n- Dłużnik jest niewypłacalny (art. 11 PU) — utracił zdolność do wykonywania wymagalnych zobowiązań pieniężnych. Niewypłacalność domniemywa się gdy opóźnienie w wykonaniu zobowiązań przekracza 3 miesiące.\n\nPRZESŁANKI NEGATYWNE (już NIEAKTUALNE od 24.03.2020):\n- Wcześniej art. 491⁴ ust. 2 i 3 wymagał, by dłużnik nie doprowadził do niewypłacalności w sposób umyślny lub rażąco niedbały. Po nowelizacji TEN TEST ZNIESIONO — sąd ogłasza upadłość niezależnie od stopnia winy.\n- Wina ma jednak znaczenie później — przy ustalaniu PLANU SPŁATY (art. 491¹⁵ PU). Przy umyślności — plan może trwać 36-84 miesiące; przy braku umyślności — do 36 miesięcy.\n\nW PRAKTYCE: w 2024 r. ogłoszono w Polsce ponad 21 000 upadłości konsumenckich (rekord). Próg "wystarczająco" niewypłacalny = brak realnej zdolności spłaty co najmniej 3 wymagalnych zobowiązań przez ponad 3 miesiące.',
 'Dz.U. 2003 nr 60 poz. 535 + ustawa zmieniająca z 30.08.2019',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20030600535',
 '2020-03-24'),

('upadlosc', 'd8:art_49115_pu', 'Plan spłaty wierzycieli — art. 491¹⁵ PU',
 E'Art. 491¹⁵ ust. 1 PU. Po wykonaniu ostatecznego planu podziału, a gdy z uwagi na brak majątku upadłego plan podziału nie zostanie sporządzony – po zatwierdzeniu listy wierzytelności, sąd wydaje postanowienie o ustaleniu planu spłaty wierzycieli upadłego albo umorzeniu zobowiązań upadłego bez ustalenia planu spłaty wierzycieli, lub warunkowym umorzeniu zobowiązań upadłego bez ustalenia planu spłaty wierzycieli.\n\nDługość planu spłaty:\n- Maks. 36 miesięcy — gdy upadły nie doprowadził do niewypłacalności umyślnie ani rażąco niedbale.\n- 36 do 84 miesięcy — gdy doprowadził umyślnie / rażąco niedbale (art. 491¹⁵ ust. 1a).\n\nBezwarunkowe umorzenie bez planu spłaty:\n- Trwała niezdolność do spłaty z uwagi na osobistą sytuację upadłego (art. 491¹⁶ PU).\n\nWarunkowe umorzenie bez planu spłaty:\n- Niezdolność niemająca charakteru trwałego — sąd umarza, ale upadły musi przez 5 lat informować o sytuacji finansowej; gdy się polepszy — sąd ustala plan retrospektywnie.',
 'Dz.U. 2003 nr 60 poz. 535 (PU)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20030600535',
 '2020-03-24'),

('upadlosc', 'd8:opłaty', 'Opłaty i koszty postępowania upadłościowego konsumenckiego',
 E'Opłata sądowa od wniosku konsumenta = 30 zł (art. 76a ust. 1 pkt 1 ustawy o kosztach sądowych w sprawach cywilnych).\n\nKoszty syndyka:\n- Wynagrodzenie syndyka pokrywa się z masy upadłościowej. Gdy masa nie wystarcza — z funduszu Skarbu Państwa (art. 491⁷ ust. 4 PU).\n- W praktyce dłużnik bez majątku NIE PŁACI z własnej kieszeni za syndyka.\n\nKoszty pełnomocnika (radca / adwokat) — opcjonalne, niewymagane przez ustawę. Stawka minimalna w sprawach upadłościowych ok. 3 600 zł (rozporządzenie MS), ale dla wniosków konsumenckich kancelarie biorą 1 500-3 000 zł ryczałtem.\n\nINFO PRAKTYCZNE: Wniosek można złożyć samodzielnie. Oprócz formularza Krajowego Rejestru Zadłużonych (KRZ — od 1.12.2021 r. jedyny tryb składania wniosków konsumenckich) trzeba dołączyć: wykaz majątku, spis wierzycieli (wraz z ich adresami i kwotami), historię ostatnich 12 m-cy z rachunku bankowego, dokumenty potwierdzające niewypłacalność.',
 'Dz.U. 2005 nr 167 poz. 1398 (uksc) + Dz.U. 2003 nr 60 poz. 535 (PU)',
 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20030600535',
 '2021-12-01'),

('praktyka', 'd8:wniosek_struktura',
 'Struktura wniosku o upadłość konsumencką (KRZ)',
 E'Wniosek składany przez Krajowy Rejestr Zadłużonych (krz.ms.gov.pl) — od 1.12.2021 r. brak alternatywy papierowej dla dłużników.\n\nFormularz zawiera sekcje:\n1) Dane osobowe — PESEL (wymagany), imię, nazwisko, adres, telefon, e-mail.\n2) Sąd właściwy — sąd rejonowy wg miejsca zwykłego pobytu dłużnika.\n3) NIP — jeśli był prowadzony przez ostatnie 10 lat (np. zlikwidowana JDG).\n4) Wykaz majątku:\n   - nieruchomości (adres, KW, wartość szacunkowa);\n   - pojazdy (marka, rok, VIN, wartość);\n   - rachunki bankowe (bank, IBAN, saldo);\n   - inne wartościowe (akcje, obligacje, kryptowaluty, biżuteria > 5 000 zł).\n5) Spis wierzycieli — pełna nazwa, adres, kwota, termin zapłaty, sygnatura sprawy (jeśli sąd / komornik), tytuł zobowiązania.\n6) Spis wierzytelności spornych — kwoty kwestionowane.\n7) Lista zabezpieczeń (hipoteki, zastawy, poręczenia).\n8) Uzasadnienie niewypłacalności — opisz okoliczności (np. utrata pracy, rozwód, choroba, kumulacja kredytów ze spadającymi dochodami).\n9) Oświadczenia — w tym o prawdziwości danych pod rygorem odpowiedzialności karnej z art. 522 PU (do 5 lat pozbawienia wolności).\n\nZAŁĄCZNIKI ELEKTRONICZNE: skany umów, wypowiedzeń, dokumentów medycznych, zaświadczeń o dochodach z ostatnich 12 m-cy, historii rachunków.',
 'wew_komentarz_d8', null, '2024-01-01');

-- ===========================================================================
-- KOŃCOWY KOMENTARZ
-- ===========================================================================

comment on index uq_legal_knowledge_subcat_source is
  'Tier 3 — gwarantuje idempotencję seedów RAG (subcategory + source unikalne).';

-- Statystyka po seedzie (do logu migracji)
do $$
declare
  v_count int;
  v_with_emb int;
begin
  select count(*) into v_count from public.legal_knowledge;
  select count(*) into v_with_emb from public.legal_knowledge where embedding is not null;
  raise notice
    'legal_knowledge after seed: % chunks total, % with embeddings (run scripts/embed-knowledge.ts to backfill)',
    v_count, v_with_emb;
end$$;
