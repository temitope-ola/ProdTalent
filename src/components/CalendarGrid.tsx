import React, { useMemo } from 'react';
import { CalendarEvent } from '../services/googleCalendarGISService';

interface CalendarGridProps {
  events: CalendarEvent[];
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDateClick?: (date: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onDateClick
}) => {
  // Générer les jours du calendrier
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Premier jour de la semaine (lundi = 1, dimanche = 0)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Convertir pour que lundi = 0
    
    // Date de début du calendrier (peut être du mois précédent)
    const startDate = new Date(firstDay);
    startDate.setDate(1 - firstDayOfWeek);
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Générer 6 semaines (42 jours)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = events.filter(event => {
        if (!event.start?.dateTime) return false;
        const eventDate = new Date(event.start.dateTime);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents
      });
    }

    return days;
  }, [currentDate, events]);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      borderRadius: '8px', 
      padding: '20px',
      border: '1px solid #333'
    }}>
      {/* En-tête du calendrier */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={onPreviousMonth}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #555',
            color: '#f5f5f7',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ‹ Précédent
        </button>
        
        <h3 style={{ 
          color: '#ffcc00', 
          margin: 0,
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={onNextMonth}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #555',
            color: '#f5f5f7',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Suivant ›
        </button>
      </div>

      {/* Jours de la semaine */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        marginBottom: '1px'
      }}>
        {dayNames.map(dayName => (
          <div
            key={dayName}
            style={{
              padding: '12px 8px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#888',
              backgroundColor: '#222',
              fontSize: '12px'
            }}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: '#333'
      }}>
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => onDateClick?.(day.date)}
            style={{
              backgroundColor: day.isCurrentMonth ? '#1a1a1a' : '#111',
              padding: '8px',
              minHeight: '80px',
              cursor: onDateClick ? 'pointer' : 'default',
              border: day.isToday ? '2px solid #ffcc00' : 'none',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Numéro du jour */}
            <div style={{
              color: day.isCurrentMonth 
                ? (day.isToday ? '#ffcc00' : '#f5f5f7')
                : '#666',
              fontSize: '14px',
              fontWeight: day.isToday ? 'bold' : 'normal',
              marginBottom: '4px'
            }}>
              {day.date.getDate()}
            </div>

            {/* Événements du jour */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {day.events.slice(0, 3).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  style={{
                    backgroundColor: '#4285f4',
                    color: '#fff',
                    fontSize: '10px',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  title={`${event.summary}\n${formatTime(event.start.dateTime)} - ${formatTime(event.end.dateTime)}`}
                >
                  {formatTime(event.start.dateTime)} {event.summary}
                </div>
              ))}
              
              {/* Indicateur s'il y a plus d'événements */}
              {day.events.length > 3 && (
                <div style={{
                  fontSize: '10px',
                  color: '#888',
                  fontStyle: 'italic'
                }}>
                  +{day.events.length - 3} autres
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#222',
        borderRadius: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#4285f4',
              borderRadius: '2px'
            }}></div>
            <span style={{ color: '#888' }}>Événements Google Calendar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              border: '2px solid #ffcc00',
              borderRadius: '2px'
            }}></div>
            <span style={{ color: '#888' }}>Aujourd'hui</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;