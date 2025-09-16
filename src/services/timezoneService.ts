export class TimezoneService {
  /**
   * Convertit une heure d'une timezone vers une autre
   * @param time - Heure au format "HH:MM" (ex: "10:00")
   * @param date - Date au format "YYYY-MM-DD" (ex: "2024-09-17")
   * @param fromTimezone - Timezone source (ex: "America/Toronto")
   * @param toTimezone - Timezone destination (ex: "Europe/Zurich")
   * @returns Heure convertie au format "HH:MM"
   */
  static convertTime(time: string, date: string, fromTimezone: string, toTimezone: string): string {
    try {
      // Créer un objet Date dans la timezone source
      const sourceDateTime = new Date(`${date}T${time}:00`);

      // Créer un formatter pour la timezone source
      const sourceFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: fromTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // Créer un formatter pour la timezone destination
      const targetFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: toTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // Convertir l'heure en utilisant les formatters
      const sourceString = `${date}T${time}:00`;
      const sourceDate = new Date(sourceString);

      // Ajuster pour la timezone source
      const sourceOffset = this.getTimezoneOffset(fromTimezone, sourceDate);
      const targetOffset = this.getTimezoneOffset(toTimezone, sourceDate);

      const offsetDiff = targetOffset - sourceOffset;
      const targetDate = new Date(sourceDate.getTime() + offsetDiff * 60000);

      // Retourner l'heure formatée
      return targetDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Erreur lors de la conversion de timezone:', error);
      return time; // Retourne l'heure originale en cas d'erreur
    }
  }

  /**
   * Obtient l'offset en minutes pour une timezone donnée
   */
  private static getTimezoneOffset(timezone: string, date: Date): number {
    const utc1 = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const utc2 = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (utc2.getTime() - utc1.getTime()) / 60000;
  }

  /**
   * Convertit une heure vers la timezone locale de l'utilisateur
   * @param time - Heure au format "HH:MM"
   * @param date - Date au format "YYYY-MM-DD"
   * @param sourceTimezone - Timezone source
   * @returns Heure convertie dans la timezone locale
   */
  static convertToLocalTime(time: string, date: string, sourceTimezone: string): string {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.convertTime(time, date, sourceTimezone, userTimezone);
  }

  /**
   * Formate une heure avec indication de timezone
   * @param time - Heure au format "HH:MM"
   * @param timezone - Timezone
   * @returns Heure formatée avec timezone (ex: "10:00 EST")
   */
  static formatTimeWithTimezone(time: string, timezone: string): string {
    const date = new Date();
    const timezoneName = date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    }).split(' ')[2] || timezone;

    return `${time} ${timezoneName}`;
  }

  /**
   * Obtient la timezone de l'utilisateur
   */
  static getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Liste des timezones populaires
   */
  static getPopularTimezones(): { value: string; label: string }[] {
    return [
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Denver', label: 'Mountain Time (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'America/Toronto', label: 'Toronto (ET)' },
      { value: 'Europe/London', label: 'London (GMT)' },
      { value: 'Europe/Paris', label: 'Paris (CET)' },
      { value: 'Europe/Zurich', label: 'Zurich (CET)' },
      { value: 'Europe/Berlin', label: 'Berlin (CET)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
      { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
      { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
    ];
  }
}