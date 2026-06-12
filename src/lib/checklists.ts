export type ChecklistItem = {
  id: string;
  label: string;
  type: "yesno" | "text" | "number" | "select";
  options?: string[];
  required?: boolean;
};

export type ChecklistTemplate = {
  type: string;
  title: string;
  items: ChecklistItem[];
  requiredOutcomes: string[];
};

export const CHECKLIST_TEMPLATES: Record<string, ChecklistTemplate> = {
  UPS_MAINTENANCE: {
    type: "UPS_MAINTENANCE",
    title: "Чек-лист ТО ИБП",
    items: [
      { id: "1", label: "Внешний осмотр ИБП выполнен", type: "yesno", required: true },
      { id: "2", label: "Проверено отсутствие повреждений корпуса", type: "yesno", required: true },
      { id: "3", label: "Проверена индикация и наличие ошибок", type: "yesno", required: true },
      { id: "4", label: "Проверена текущая нагрузка, %", type: "number", required: true },
      { id: "5", label: "Проверена температура в месте установки", type: "number" },
      { id: "6", label: "Проверено состояние АКБ", type: "select", options: ["Норма", "Замена", "Проверить"], required: true },
      { id: "7", label: "Выполнен тест автономии", type: "select", options: ["Да", "Нет", "Не применимо"] },
      { id: "8", label: "Проверены подключённые потребители", type: "yesno" },
      { id: "9", label: "Проверено состояние кабелей питания", type: "yesno" },
      { id: "10", label: "Выполнена очистка от пыли", type: "yesno" },
      { id: "11", label: "Замечания", type: "text" },
      { id: "12", label: "Указаны использованные материалы", type: "select", options: ["Да", "Нет", "Не применимо"] },
      { id: "13", label: "Приложено фото после ТО", type: "yesno", required: true },
      { id: "14", label: "Дата следующего ТО", type: "text", required: true },
    ],
    requiredOutcomes: [
      "Состояние ИБП после ТО",
      "Состояние АКБ",
      "Необходимость ремонта или замены",
      "Потребность в ЗИП",
    ],
  },
  ACS_MAINTENANCE: {
    type: "ACS_MAINTENANCE",
    title: "Чек-лист ТО двери СКУД",
    items: [
      { id: "1", label: "Проверена работа считывателя на вход", type: "yesno", required: true },
      { id: "2", label: "Проверена работа считывателя на выход", type: "select", options: ["Да", "Нет", "Не применимо"] },
      { id: "3", label: "Проверена кнопка выхода", type: "yesno", required: true },
      { id: "4", label: "Проверена работа замка", type: "yesno", required: true },
      { id: "5", label: "Проверена работа доводчика", type: "yesno" },
      { id: "6", label: "Проверено корректное закрытие двери", type: "yesno", required: true },
      { id: "7", label: "Проверено прохождение события в СКУД", type: "yesno", required: true },
      { id: "8", label: "Проверено резервное питание", type: "yesno", required: true },
      { id: "9", label: "Осмотрены кабельные соединения", type: "yesno" },
      { id: "10", label: "Проверено состояние блока питания", type: "yesno" },
      { id: "11", label: "Проверено состояние контроллера", type: "yesno" },
      { id: "12", label: "Замечания", type: "text" },
      { id: "13", label: "Указаны использованные материалы", type: "select", options: ["Да", "Нет", "Не применимо"] },
      { id: "14", label: "Приложено фото двери/узла", type: "yesno", required: true },
    ],
    requiredOutcomes: [
      "Узел СКУД исправен / неисправен / ограниченно исправен",
      "Требуется повторный ремонт",
      "Требуется закупка ЗИП",
    ],
  },
};

export function getChecklistTypeForEquipment(
  system: string,
  workType: string
): string | null {
  if (workType !== "MAINTENANCE") return null;
  if (system === "UPS") return "UPS_MAINTENANCE";
  if (system === "ACS") return "ACS_MAINTENANCE";
  return null;
}
