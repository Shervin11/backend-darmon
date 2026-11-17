// Notification texts in the user's language (Tajik by default, Russian supported)
export type Lang = 'tj' | 'ru';

const formatDate = (date: string) => date.split('-').reverse().join('.');

interface Visit {
  doctorName: string;
  clientName: string;
  date: string;
  time: string;
  symptoms?: string;
  rejectReason?: string;
}

const when = (v: Visit) => `📅 ${formatDate(v.date)}, ${v.time}`;

export const texts = {
  tj: {
    newRequest: (v: Visit) =>
      `🆕 Дархости нав барои қабул\n${v.clientName}\n${when(v)}` +
      (v.symptoms ? `\n📝 ${v.symptoms}` : ''),
    approved: (v: Visit) =>
      `✅ Навбати шумо тасдиқ шуд\n${v.doctorName}\n${when(v)}`,
    rejected: (v: Visit) =>
      `❌ Навбати шумо рад шуд\n${v.doctorName}\n${when(v)}` +
      (v.rejectReason ? `\nСабаб: ${v.rejectReason}` : ''),
    cancelledByPatient: (v: Visit) =>
      `🚫 Бемор навбатро бекор кард\n${v.clientName}\n${when(v)}`,
    rescheduled: (v: Visit) =>
      `🔁 Вақти қабул иваз шуд\n${v.doctorName} — ${v.clientName}\n${when(v)}`,
    reminder24: (v: Visit) =>
      `🔔 Ёдрас: қабул дар назди ${v.doctorName}\n${when(v)}`,
    reminder1hPatient: (v: Visit) =>
      `⏰ Пас аз як соат қабул дар назди ${v.doctorName}\n${when(v)}`,
    reminder1hDoctor: (v: Visit) =>
      `⏰ Пас аз як соат қабули бемор ${v.clientName}\n${when(v)}`,
    resetCode: (code: string) =>
      `DARMON: рамзи барқарорсозии парол ${code}. Ба касе нагӯед. Муҳлат 15 дақиқа.`,
    linked: (name: string) =>
      `✅ ${name}, Telegram пайваст шуд. Мо дар бораи навбатҳои шумо хабар медиҳем.`,
    linkHelp: () =>
      'Салом! Барои гирифтани огоҳиҳо дар сомонаи DARMON ба профили худ дароед ва «Пайваст кардани Telegram»-ро пахш кунед.',
  },
  ru: {
    newRequest: (v: Visit) =>
      `🆕 Новая заявка на приём\n${v.clientName}\n${when(v)}` +
      (v.symptoms ? `\n📝 ${v.symptoms}` : ''),
    approved: (v: Visit) =>
      `✅ Ваша запись подтверждена\n${v.doctorName}\n${when(v)}`,
    rejected: (v: Visit) =>
      `❌ Ваша запись отклонена\n${v.doctorName}\n${when(v)}` +
      (v.rejectReason ? `\nПричина: ${v.rejectReason}` : ''),
    cancelledByPatient: (v: Visit) =>
      `🚫 Пациент отменил запись\n${v.clientName}\n${when(v)}`,
    rescheduled: (v: Visit) =>
      `🔁 Время приёма изменено\n${v.doctorName} — ${v.clientName}\n${when(v)}`,
    reminder24: (v: Visit) =>
      `🔔 Напоминание: приём у ${v.doctorName}\n${when(v)}`,
    reminder1hPatient: (v: Visit) =>
      `⏰ Через час приём у ${v.doctorName}\n${when(v)}`,
    reminder1hDoctor: (v: Visit) =>
      `⏰ Через час приём пациента ${v.clientName}\n${when(v)}`,
    resetCode: (code: string) =>
      `DARMON: код восстановления пароля ${code}. Никому не сообщайте. Действует 15 минут.`,
    linked: (name: string) =>
      `✅ ${name}, Telegram подключён. Мы будем сообщать о ваших записях.`,
    linkHelp: () =>
      'Здравствуйте! Чтобы получать уведомления, войдите в профиль на сайте DARMON и нажмите «Подключить Telegram».',
  },
};

export const textsFor = (lang?: string | null) =>
  texts[lang === 'ru' ? 'ru' : 'tj'];
