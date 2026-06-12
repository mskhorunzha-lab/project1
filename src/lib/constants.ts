export const SYSTEM_LABELS: Record<string, string> = {
  UPS: "ИБП / Электропитание",
  ACS: "СКУД",
  CCTV: "Видеонаблюдение",
  LAN: "ЛВС / СКС",
  HVAC: "Кондиционирование",
  TELECOM: "Связь",
  OTHER: "Прочее",
};

export const TYPE_LABELS: Record<string, string> = {
  UPS: "ИБП",
  ACS_DOOR: "Дверь СКУД",
  CAMERA: "Камера",
  CABINET: "Шкаф СКС",
  CONDITIONER: "Кондиционер",
  SWITCH: "Коммутатор",
  OTHER: "Прочее",
};

export const STATUS_LABELS: Record<string, string> = {
  OK: "Исправно",
  FAULTY: "Неисправно",
  LIMITED: "Ограниченно исправно",
  DECOMMISSIONED: "Выведено",
};

export const CRITICALITY_LABELS: Record<string, string> = {
  HIGH: "Высокая",
  MEDIUM: "Средняя",
  LOW: "Низкая",
};

export const WORK_TYPE_LABELS: Record<string, string> = {
  TICKET: "Заявка",
  MAINTENANCE: "ТО",
  REPAIR: "Ремонт",
  INSPECTION: "Осмотр",
  INSTALLATION: "Монтаж",
  PROJECT: "Проект",
  CONTRACTOR: "Подрядчик",
  DOCUMENTATION: "Документация",
  PURCHASE: "Закупка",
  WAREHOUSE: "Склад",
  ORGANIZATIONAL: "Организационная",
};

export const WORK_STATUS_LABELS: Record<string, string> = {
  NEW: "Новая",
  ASSIGNED: "Назначена",
  IN_PROGRESS: "В работе",
  WAITING_ACCESS: "Ожидает доступ",
  WAITING_MATERIALS: "Ожидает материалы",
  WAITING_CONTRACTOR: "Ожидает подрядчика",
  WAITING_APPROVAL: "Ожидает согласование",
  DONE: "Выполнена",
  ON_REVIEW: "На проверке",
  CLOSED: "Закрыта",
  CANCELLED: "Отменена",
};

export const PRIORITY_LABELS: Record<string, string> = {
  P1: "P1 — критичный",
  P2: "P2 — высокий",
  P3: "P3 — средний",
  P4: "P4 — низкий",
  PLANNED: "Плановый",
};

export const MOVEMENT_LABELS: Record<string, string> = {
  RECEIPT: "Приход",
  ISSUE: "Выдача в работу",
  WRITE_OFF: "Списание на работу",
  RETURN: "Возврат",
  REMOVAL: "Снятие с объекта",
  TO_GOOD: "Перевод в БУ исправное",
  TO_FAULTY: "Перевод в БУ неисправное",
  RESERVE: "Резервирование",
  DISPOSAL: "Списание в утиль",
};

export const ROLE_LABELS: Record<string, string> = {
  MANAGER: "Главный менеджер",
  LEAD_SPECIALIST: "Главный специалист",
  SPECIALIST: "Специалист",
  WAREHOUSE: "Ответственный за склад",
  DISPATCHER: "Диспетчер Service Desk",
  CONTRACTOR: "Подрядчик",
  ADMIN: "Администратор",
};
