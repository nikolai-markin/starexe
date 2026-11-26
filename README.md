# STAR.exe

Сайт для подготовки к ЕГЭ по информатике. Актуальный исходный код четырёх самостоятельных частей.

| Папка | Назначение | Опубликованная версия |
| --- | --- | --- |
| apps/home | Главная страница | https://star-exe.namarkingpt.chatgpt.site/ |
| apps/word-game | Водогрязеторфопарафинолечение: срезы, индексация, комнаты | https://slice-pop-ege.namarkingpt.chatgpt.site/ |
| apps/turtle | Тренажёр Черепахи | https://star-exe-turtle.namarkingpt.chatgpt.site/ |
| apps/ip13 | Интерактивная запись «13 задание. TCP/IP» | https://star-exe-ip13.namarkingpt.chatgpt.site/ |

## Главная и запись TCP/IP

Готовые HTML/CSS/JS и изображения лежат в `dist/`. Сборка не требуется.

```sh
python -m http.server 8080 --directory apps/home/dist
# или
python -m http.server 8081 --directory apps/ip13/dist
```

## Черепаха

Исходники TypeScript/React находятся в `apps/turtle/src`, готовая версия — в `apps/turtle/dist`.

```sh
cd apps/turtle
npm install
npm run build
python -m http.server 8082 --directory dist
```

Это учебное подмножество Python, а не полноценный интерпретатор. Поддерживаются команды движения, goto/dot, скорость, tracer/update/done, арифметика, переменные и вложенные for/range. Лимит 500 000 операций. Фото черепахи имеет прозрачный фон.

## Игра со словами

React/Vinext + Cloudflare D1 для комнат двух игроков. Без регистрации внутри игры.

```sh
cd apps/word-game
npm install
npm run dev
```

Серверные комнаты требуют D1 binding `DB` и применения SQL-миграций из `drizzle/`. Данные локальной и опубликованной D1 раздельны. Конфигурация Sites сохранена в `.openai/hosting.json`; секретов в ней нет. Сборка: `npm run build`.

Начисление очков: 10 за букву и 10 за каждый срез, давший минимум две буквы. Повторы слова не засчитываются. Словарь: `lib/russian-dictionary.ts`; MIT-лицензия и описание исходного словаря в `data/` (исходный большой файл не дублируется).

В `apps/word-game/app/turtle` сохранена ранняя встроенная версия Черепахи; актуальный тренажёр находится в `apps/turtle`.

## Проверки

```sh
node --experimental-strip-types apps/turtle/check.mts
node --experimental-strip-types apps/turtle/regression.mts
python apps/ip13/verify.py
```

Все текущие переходы между частями используют опубликованные адреса Sites. При переносе на единый домен эти адреса нужно заменить на локальные маршруты.
