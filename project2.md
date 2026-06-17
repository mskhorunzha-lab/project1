# Project2: журнал работ, запуск и инструкция пользователя

Документ фиксирует, что было сделано в проекте, с какими проблемами столкнулись
при запуске, как быстро поднять портал и как пользоваться основными разделами.

## 1. Что изменили в проекте

### 1.1. Безопасность и контроль доступа

- Добавлены RBAC-проверки для mutation API.
- Добавлен helper авторизации `src/lib/auth.ts`.
- Мутации API теперь проверяют роль пользователя.
- Для локального/demo режима можно использовать:
  - cookie `infra_user_id`
  - header `x-user-id`
  - header `x-user-email`
  - переменную окружения `INFRA_PORTAL_DEFAULT_USER_EMAIL`
- В `prisma/seed.ts` добавлен demo-пользователь с ролью `ADMIN`.

### 1.2. Аудит действий

- Добавлен helper `src/lib/audit.ts`.
- Критичные действия пишутся в таблицу `AuditLog`:
  - создание оборудования
  - создание работ
  - смена статуса работ
  - сохранение чек-листов
  - генерация задач ТО
  - складские движения
  - импорт данных

### 1.3. Валидация API

- Добавлен файл `src/lib/validation.ts`.
- Для входных данных API подключены Zod-схемы.
- Валидация добавлена для:
  - создания работ
  - создания оборудования
  - смены статуса работ
  - чек-листов
  - складских движений
  - импорта

### 1.4. Плановое ТО

- Генерация задач ТО переведена с `GET` на `POST`.
- Убрана опасная мутация по ссылке `/maintenance/generate`.
- Кнопки на дашборде и странице ТО теперь отправляют POST-форму.
- Добавлено правило: ТО ИБП/СКУД нельзя закрыть без завершенного чек-листа.
- Генерация номеров работ переведена на PostgreSQL advisory lock, чтобы снизить
  риск коллизий при параллельном создании задач.

### 1.5. Склад ЗИП

- Складские движения переведены на транзакционную обработку.
- Остаток повторно проверяется внутри транзакции.
- Для выдачи и списания требуется основание: работа или текстовое основание.
- Автор операции записывается в поле `givenById`.
- Добавлены helper-функции складских правил в `src/lib/services/warehouse.ts`.

### 1.6. Импорт данных

- Удалена зависимость `xlsx`, по которой был high security advisory.
- Для XLSX-импорта используется `read-excel-file`.
- Формат XLS больше не принимается.
- Поддерживаются:
  - CSV
  - XLSX
  - UTF-8
  - Windows-1251
  - разделители `;` и `,`
- Добавлены ограничения:
  - размер файла до 5 МБ
  - до 5000 строк
- В UI импорта теперь отображаются ошибки сервера.

### 1.7. UI-улучшения

- Форма импорта показывает ошибку, если сервер отклонил файл.
- Форма смены статуса работы показывает ошибку, например если попытаться закрыть
  ТО без чек-листа.
- Кнопки генерации ТО больше не используют обычный переход по GET-ссылке.

### 1.8. Тесты и CI

- Добавлен Vitest.
- Добавлены unit-тесты:
  - генерация номеров работ
  - правила складских движений
- Добавлен `vitest.config.ts`.
- Добавлен GitHub Actions workflow `.github/workflows/ci.yml`.
- CI запускает:
  - `npm ci`
  - `npx prisma validate`
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`
  - `npm run build`

### 1.9. Cloud Agent / запуск без Docker

- Добавлен скрипт `scripts/setup-cloud-agent-postgres.sh`.
- Добавлена npm-команда:

```bash
npm run cloud:setup-db
```

- Скрипт:
  - устанавливает PostgreSQL через `apt-get`, если его нет
  - запускает локальный PostgreSQL service/cluster
  - создаёт роль `infra`
  - создаёт базу `infra_portal`
  - создаёт/обновляет `.env`
  - проверяет подключение к базе

### 1.10. Документация

- Обновлён `README.md`.
- Добавлена папка `project 3` с описанием реализованных улучшений.
- Добавлен этот файл `project2.md`.

## 2. Проблемы, с которыми столкнулись

### 2.1. Docker в Cloud Agent был недоступен

При попытке выполнить:

```bash
docker compose up -d
```

получили ошибку:

```text
docker: command not found
```

Решение:

- установили PostgreSQL локально через `apt-get`
- создали роль `infra`
- создали базу `infra_portal`
- применили Prisma schema
- загрузили seed-данные
- позже добавили скрипт `npm run cloud:setup-db`

### 2.2. `psql` не принимает Prisma-параметр `?schema=public`

Prisma использует URL:

```env
postgresql://infra:infra@localhost:5432/infra_portal?schema=public
```

Но `psql` не понимает query-параметр `schema=public`.

Решение:

- в setup-скрипте для проверки подключения используется URL без части
  `?schema=public`
- для Prisma в `.env` остаётся полный URL с `?schema=public`

### 2.3. В WSL запускался Windows npm/node

При `npm install` в WSL запускался Windows `cmd.exe`:

```text
C:\Windows\system32\cmd.exe
```

и путь проекта превращался в UNC:

```text
\\wsl.localhost\Ubuntu\home\maxim\project1
```

Из-за этого Prisma preinstall падал с ошибкой:

```text
CMD.EXE не поддерживает UNC пути
Cannot find module 'C:\Windows\scripts\preinstall-entry.js'
```

Решение:

- установить Node.js/npm внутри WSL
- проверять:

```bash
which node
which npm
node -v
npm -v
```

- запускать Linux npm явно:

```bash
/usr/bin/npm install
```

### 2.4. `nvm install 22` и NodeSource зависали

Команды:

```bash
nvm install 22
nvm ls-remote
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
```

зависали или падали из-за проблем доступа к `nodejs.org` / `deb.nodesource.com`.

Решение:

- удалить NodeSource repository
- поставить Node.js/npm из стандартного Ubuntu-репозитория
- в итоге заработали:

```text
node -v -> v18.19.1
npm -v
which node -> /usr/bin/node
which npm -> /usr/bin/npm
```

### 2.5. Конфликт NodeSource `nodejs` и Ubuntu `npm`

Появлялась ошибка:

```text
nodejs : Conflicts: npm
```

Решение:

```bash
sudo rm -f /etc/apt/sources.list.d/nodesource*.list
sudo rm -f /etc/apt/sources.list.d/*nodesource*
sudo rm -f /etc/apt/keyrings/nodesource.gpg
sudo rm -f /usr/share/keyrings/nodesource.gpg
sudo apt clean
sudo apt update
sudo apt install -y nodejs npm
```

### 2.6. Docker Compose на локальной машине был неполным

Команда:

```bash
docker compose up -d
```

дала ошибку:

```text
unknown shorthand flag: 'd' in -d
```

Причина: установлен не Docker Compose v2 или неполная docker-команда.

Решение:

- запускать без Docker через локальный PostgreSQL
- использовать `npm run cloud:setup-db` на доработанной ветке
- либо вручную установить и настроить PostgreSQL

### 2.7. Скрипт `cloud:setup-db` отсутствовал на ветке `main`

Ошибка:

```text
npm ERR! Missing script: "cloud:setup-db"
```

Причина: пользователь был на ветке `main`, а скрипт добавлен в ветке:

```bash
cursor/project3-improvements-b889
```

Решение:

```bash
git fetch origin cursor/project3-improvements-b889
git checkout cursor/project3-improvements-b889
```

Если checkout мешает из-за изменённого `package-lock.json`:

```bash
git restore package-lock.json
git checkout cursor/project3-improvements-b889
```

### 2.8. Не был задан `DATABASE_URL`

Prisma падал с ошибкой:

```text
Environment variable not found: DATABASE_URL
```

Решение:

создать `.env`:

```bash
cp .env.example .env
```

или вручную:

```bash
cat > .env <<'EOF'
DATABASE_URL="postgresql://infra:infra@localhost:5432/infra_portal?schema=public"
INFRA_PORTAL_DEFAULT_USER_EMAIL="admin@corp.local"
EOF
```

## 3. Краткая памятка по запуску портала

### 3.1. Рекомендуемый запуск доработанной версии

```bash
cd ~/project1
git fetch origin cursor/project3-improvements-b889
git checkout cursor/project3-improvements-b889
/usr/bin/npm install
```

Если checkout не даёт перейти из-за `package-lock.json`:

```bash
git restore package-lock.json
git checkout cursor/project3-improvements-b889
```

### 3.2. Запуск с Docker

Подходит, если Docker Compose работает корректно.

```bash
cp .env.example .env
docker compose up -d
/usr/bin/npm run db:push
/usr/bin/npm run db:seed
/usr/bin/npm run dev
```

Открыть:

```text
http://localhost:3000
```

### 3.3. Запуск без Docker на Ubuntu/WSL

На ветке `cursor/project3-improvements-b889`:

```bash
/usr/bin/npm run cloud:setup-db
/usr/bin/npm run db:push
/usr/bin/npm run db:seed
/usr/bin/npm run dev
```

Открыть:

```text
http://localhost:3000
```

### 3.4. Ручная настройка PostgreSQL без скрипта

Если вы на `main` или скрипта нет:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

Создать пользователя и базу:

```bash
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'infra') THEN CREATE ROLE infra LOGIN PASSWORD 'infra'; ELSE ALTER ROLE infra LOGIN PASSWORD 'infra'; END IF; END \$\$;"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = 'infra_portal'" | grep -q 1 || sudo -u postgres createdb -O infra infra_portal
```

Создать `.env`:

```bash
cat > .env <<'EOF'
DATABASE_URL="postgresql://infra:infra@localhost:5432/infra_portal?schema=public"
INFRA_PORTAL_DEFAULT_USER_EMAIL="admin@corp.local"
EOF
```

Применить схему и seed:

```bash
/usr/bin/npm run db:push
/usr/bin/npm run db:seed
/usr/bin/npm run dev
```

### 3.5. Проверка Node.js в WSL

Перед `npm install` проверить:

```bash
which node
which npm
node -v
npm -v
```

Правильно:

```text
/usr/bin/node
/usr/bin/npm
```

Неправильно:

```text
/mnt/c/...
C:\...
```

Если есть сомнения, запускать npm явно:

```bash
/usr/bin/npm install
```

## 4. Инструкция пользователя портала

Портал предназначен для управления ИТ-инфраструктурой предприятия: оборудованием,
работами, плановым ТО, чек-листами, складом ЗИП, импортом и отчётами.

### 4.1. Главная страница / Дашборд

Раздел: `Дашборд`

На дашборде отображаются:

- общее количество оборудования
- количество неисправного оборудования
- просроченные работы
- просроченное ТО
- ЗИП ниже минимального остатка
- список ближайших проблемных объектов

Что можно делать:

- быстро увидеть проблемные зоны
- перейти в отчёты по просроченным работам
- перейти в отчёт по складу
- создать задачи ТО кнопкой `Создать задачи ТО`

### 4.2. Оборудование

Раздел: `Оборудование`

Назначение:

- вести реестр оборудования
- смотреть карточки ИБП, СКУД и другого оборудования
- хранить место установки, серийные номера, статус, критичность и регламент ТО

Типовой сценарий:

1. Открыть `Оборудование`.
2. Нажать добавление оборудования.
3. Заполнить:
   - наименование
   - тип
   - систему
   - место установки
   - производителя/модель
   - серийный номер
   - внешний ID
   - статус
   - критичность
   - регламент ТО
4. Сохранить.

После сохранения оборудование появляется в реестре и может использоваться в
работах, ТО и складских движениях.

### 4.3. Работы

Раздел: `Работы`

Назначение:

- вести журнал инфраструктурных работ
- создавать задачи по заявкам, ремонтам, ТО, закупкам и организационным работам
- назначать ответственных
- менять статусы

Типовой сценарий создания работы:

1. Открыть `Работы`.
2. Создать новую работу.
3. Заполнить:
   - заголовок
   - тип работы
   - категорию
   - систему
   - приоритет
   - оборудование, если применимо
   - номер Service Desk, если есть
   - главного специалиста
   - исполнителя
   - плановую дату
   - описание
4. Сохранить.

Типовые статусы:

- `NEW` — новая
- `ASSIGNED` — назначена
- `IN_PROGRESS` — в работе
- `WAITING_ACCESS` — ожидание доступа
- `WAITING_MATERIALS` — ожидание материалов
- `WAITING_CONTRACTOR` — ожидание подрядчика
- `WAITING_APPROVAL` — ожидание согласования
- `DONE` — выполнена
- `ON_REVIEW` — на проверке
- `CLOSED` — закрыта
- `CANCELLED` — отменена

Для статусов ожидания нужно указывать причину ожидания.

### 4.4. Плановое ТО

Раздел: `ТО`

Назначение:

- смотреть регламенты обслуживания
- видеть график ТО по оборудованию
- автоматически создавать задачи ТО
- контролировать просроченное обслуживание

Типовой сценарий:

1. Открыть `ТО`.
2. Проверить список регламентов.
3. Проверить график по оборудованию.
4. Нажать `Создать задачи ТО`.
5. Перейти в созданные работы ТО.
6. Выполнить работу.
7. Заполнить чек-лист.
8. Закрыть работу.

Важно:

- ТО ИБП/СКУД нельзя закрыть без завершенного чек-листа.
- При закрытии ТО обновляются даты последнего и следующего обслуживания.

### 4.5. Чек-листы ТО

Чек-листы доступны в карточке работы ТО.

Назначение:

- фиксировать обязательные проверки
- сохранять результаты обслуживания
- подтверждать готовность ТО к закрытию

Типовой сценарий:

1. Открыть работу типа `MAINTENANCE`.
2. Заполнить пункты чек-листа.
3. Заполнить обязательные итоги.
4. Нажать `Завершить чек-лист`.
5. После этого работу можно перевести на проверку или закрыть.

### 4.6. Склад ЗИП

Раздел: `Склад`

Назначение:

- смотреть остатки ЗИП
- видеть позиции ниже минимума
- учитывать поступления, выдачи, возвраты и списания

Типовой сценарий движения:

1. Открыть `Склад`.
2. Перейти к регистрации движения.
3. Выбрать ТМЦ.
4. Выбрать тип операции.
5. Указать количество.
6. Указать основание.
7. При необходимости связать с работой и оборудованием.
8. Сохранить.

Важно:

- выдача и списание требуют основания
- нельзя выдать больше, чем есть на остатке
- операция и изменение остатка выполняются транзакционно

### 4.7. Импорт

Раздел: `Импорт`

Назначение:

- массово загрузить оборудование
- массово загрузить складские позиции

Поддерживаемые форматы:

- CSV
- XLSX

Не поддерживается:

- XLS

Ограничения:

- максимум 5 МБ
- максимум 5000 строк

Шаблоны:

- `public/templates/equipment.csv`
- `public/templates/warehouse.csv`

Типовой сценарий:

1. Скачать или открыть шаблон.
2. Заполнить данные.
3. Открыть раздел `Импорт`.
4. Выбрать тип импорта.
5. Загрузить файл.
6. Проверить количество успешных строк и ошибки.

### 4.8. Отчёты

Раздел: `Отчёты`

Доступные отчёты:

- просроченные работы
- просроченное ТО
- склад / потребность закупки
- KPI

Назначение:

- контролировать дисциплину выполнения работ
- видеть риски по ТО
- видеть дефицит ЗИП
- анализировать показатели эксплуатации

### 4.9. Администрирование

Раздел: `Администрирование`

Назначение:

- смотреть пользователей
- смотреть роли
- смотреть регламенты

Текущее ограничение:

- полноценное UI-управление пользователями, ролями и регламентами ещё не
  реализовано
- это задача следующей итерации

### 4.10. Роли

В системе предусмотрены роли:

- `ADMIN`
- `MANAGER`
- `LEAD_SPECIALIST`
- `SPECIALIST`
- `WAREHOUSE`
- `DISPATCHER`
- `CONTRACTOR`

В demo-режиме используется пользователь из `.env`:

```env
INFRA_PORTAL_DEFAULT_USER_EMAIL="admin@corp.local"
```

Для production нужно подключить полноценную авторизацию: SSO/OIDC/LDAP или другой
корпоративный механизм.

## 5. Полезные команды

Установка зависимостей:

```bash
/usr/bin/npm install
```

Запуск базы без Docker:

```bash
/usr/bin/npm run cloud:setup-db
```

Применить Prisma schema:

```bash
/usr/bin/npm run db:push
```

Загрузить demo-данные:

```bash
/usr/bin/npm run db:seed
```

Запустить портал:

```bash
/usr/bin/npm run dev
```

Проверить качество:

```bash
/usr/bin/npm run typecheck
/usr/bin/npm run lint
/usr/bin/npm test
/usr/bin/npm run build
```

Открыть портал:

```text
http://localhost:3000
```

## 6. Как получить этот файл на локальной машине

Если файл добавлен в удалённую ветку, на локальной машине выполнить:

```bash
cd ~/project1
git fetch origin cursor/project3-improvements-b889
git checkout cursor/project3-improvements-b889
git pull origin cursor/project3-improvements-b889
```

Файл будет находиться в корне проекта:

```text
project2.md
```
