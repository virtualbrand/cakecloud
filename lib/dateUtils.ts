/**
 * Utilitários de data configurados para o fuso horário de Brasília (America/Sao_Paulo)
 * Pode ser configurado globalmente para outros fusos horários no futuro
 */

const TIMEZONE = 'America/Sao_Paulo'
const LOCALE = 'pt-BR'

/**
 * Retorna a data e hora atual no fuso horário de Brasília
 */
export function getNow(): Date {
  // Cria uma data com o timestamp atual já ajustado para o fuso horário de Brasília
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
}

/**
 * Retorna a data de hoje (00:00:00) no fuso horário de Brasília
 */
export function getToday(): Date {
  const now = getNow()
  // Zera as horas para ter apenas a data
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * Retorna o primeiro dia da semana atual (segunda-feira) no fuso horário de Brasília
 */
export function getStartOfWeek(): Date {
  const today = getToday()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return monday
}

/**
 * Retorna o último dia da semana atual (domingo) no fuso horário de Brasília
 */
export function getEndOfWeek(): Date {
  const monday = getStartOfWeek()
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

/**
 * Retorna o primeiro dia do mês atual no fuso horário de Brasília
 */
export function getStartOfMonth(): Date {
  const today = getToday()
  return new Date(today.getFullYear(), today.getMonth(), 1)
}

/**
 * Retorna o último dia do mês atual no fuso horário de Brasília
 */
export function getEndOfMonth(): Date {
  const today = getToday()
  return new Date(today.getFullYear(), today.getMonth() + 1, 0)
}

/**
 * Formata uma data no formato brasileiro (DD/MM/YYYY)
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString(LOCALE)
}

/**
 * Formata uma data e hora no formato brasileiro (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Retorna o nome do mês atual em português
 */
export function getCurrentMonthName(): string {
  const today = getToday()
  return today.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })
}

/**
 * Converte uma data para o início do dia (00:00:00)
 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * Converte uma data para o fim do dia (23:59:59)
 */
export function endOfDay(date: Date): Date {
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Formata uma data no formato YYYY-MM-DD para uso em APIs
 * Garante que a data seja formatada no fuso horário local (Brasília)
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
