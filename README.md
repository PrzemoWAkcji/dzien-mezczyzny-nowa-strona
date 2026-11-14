# Dzień Mężczyzny — prototyp nowej strony

Statyczny podgląd nowej strony głównej i szablonu artykułu dla [dzienmezczyzny.pl](https://www.dzienmezczyzny.pl/). To projekt koncepcyjny, niezależny od działającego WordPressa.

## Co działa

- układ dostosowany do telefonu i komputera,
- filtrowanie i wyszukiwanie ośmiu przykładowych artykułów,
- widok artykułu z odsyłaczem do pełnej publikacji,
- treści i zoptymalizowane zdjęcia pobrane z publicznego WordPress API.
- oryginalne logo w wariantach desktopowym i mobilnym oraz kroje Open Sans i Lora używane przez obecny serwis.

Pliki są statyczne i nadają się do publikacji bez procesu budowania. Aktualizację próbki treści uruchamia się przez `python3 scripts/build_content.py` (wymaga Pillow).
