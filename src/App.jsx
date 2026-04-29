import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  MessageCircle,
  HeartPulse,
  ShieldCheck,
  Target,
  FlaskConical,
  Lock,
  UserRound,
  Dna,
  Activity,
  AlertCircle,
} from "lucide-react";
import "./App.css";

const monthDays = [
  { day: "Vie", fullDay: "Viernes", date: "1 mayo", number: 1, times: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { day: "Sáb", fullDay: "Sábado", date: "2 mayo", number: 2, times: ["09:00", "10:00", "11:00"] },
  { day: "Lun", fullDay: "Lunes", date: "4 mayo", number: 4, times: ["18:00", "19:00", "20:00"] },
  { day: "Mié", fullDay: "Miércoles", date: "6 mayo", number: 6, times: ["16:00", "17:00", "18:00", "19:00", "20:00"] },
  { day: "Jue", fullDay: "Jueves", date: "7 mayo", number: 7, times: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { day: "Vie", fullDay: "Viernes", date: "8 mayo", number: 8, times: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { day: "Sáb", fullDay: "Sábado", date: "9 mayo", number: 9, times: ["09:00", "10:00", "11:00"] },
  { day: "Lun", fullDay: "Lunes", date: "11 mayo", number: 11, times: ["18:00", "19:00", "20:00"] },
  { day: "Mié", fullDay: "Miércoles", date: "13 mayo", number: 13, times: ["16:00", "17:00", "18:00", "19:00", "20:00"] },
  { day: "Jue", fullDay: "Jueves", date: "14 mayo", number: 14, times: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { day: "Vie", fullDay: "Viernes", date: "15 mayo", number: 15, times: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { day: "Sáb", fullDay: "Sábado", date: "16 mayo", number: 16, times: ["09:00", "10:00", "11:00"] },
  { day: "Lun", fullDay: "Lunes", date: "18 mayo", number: 18, times: ["18:00", "19:00", "20:00"] },
  { day: "Mié", fullDay: "Miércoles", date: "20 mayo", number: 20, times: ["16:00", "17:00", "18:00", "19:00", "20:00"] },
  { day: "Jue", fullDay: "Jueves", date: "21 mayo", number: 21, times: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { day: "Vie", fullDay: "Viernes", date: "22 mayo", number: 22, times: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { day: "Sáb", fullDay: "Sábado", date: "23 mayo", number: 23, times: ["09:00", "10:00", "11:00"] },
  { day: "Lun", fullDay: "Lunes", date: "25 mayo", number: 25, times: ["18:00", "19:00", "20:00"] },
  { day: "Mié", fullDay: "Miércoles", date: "27 mayo", number: 27, times: ["16:00", "17:00", "18:00", "19:00", "20:00"] },
  { day: "Jue", fullDay: "Jueves", date: "28 mayo", number: 28, times: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { day: "Vie", fullDay: "Viernes", date: "29 mayo", number: 29, times: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { day: "Sáb", fullDay: "Sábado", date: "30 mayo", number: 30, times: ["09:00", "10:00", "11:00"] },
];

const calendarDays = Array.from({ length: 35 }, (_, index) => index + 1);

const paymentLinks = {
  Online: "https://mpago.la/2put31d",
  Presencial: "https://mpago.la/1iQ4Suq",
};

function App() {
  const [selectedMode, setSelectedMode] = useState("Online");
  const [selectedDay, setSelectedDay] = useState(monthDays[0]);
  const [selectedTime, setSelectedTime] = useState(monthDays[0].times[0]);

  const price = selectedMode === "Presencial" ? "$40.000" : "$30.000";
  const paymentUrl = paymentLinks[selectedMode];

  const whatsappMessage = encodeURIComponent(
    `Hola, ya pagué mi evaluación metabólica ${selectedMode} para el ${selectedDay.fullDay} ${selectedDay.date} a las ${selectedTime} hrs. Te envío mi comprobante para confirmar la reserva.`
  );

  const handleDaySelection = (dayInfo) => {
    setSelectedDay(dayInfo);
    setSelectedTime(dayInfo.times[0]);
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="brand">
          <HeartPulse size={22} />
          <span>Enfermera Metabólica</span>
        </div>

        <div className="heroGrid">
          <div className="heroText">
            <h1>
              Agenda tu evaluación <span>metabólica</span>
            </h1>
            <p>
              Una evaluación personalizada para entender qué puede estar influyendo en tu peso,
              energía, ansiedad, sueño y salud cardiometabólica.
            </p>

            <div className="featuresTop">
              <div>
                <FlaskConical size={24} />
                <strong>Enfoque integral</strong>
                <small>Ciencia + evidencia</small>
              </div>
              <div>
                <Target size={24} />
                <strong>Evaluación completa</strong>
                <small>Personalizada para ti</small>
              </div>
              <div>
                <ShieldCheck size={24} />
                <strong>Acompañamiento real</strong>
                <small>Antes, durante y después</small>
              </div>
            </div>
          </div>

          <div className="metabolicVisual">
            <div className="circleOrbit">
              <UserRound className="bodyIcon" size={95} />
              <div className="orbitIcon one"><Dna size={26} /></div>
              <div className="orbitIcon two"><Activity size={26} /></div>
              <div className="orbitIcon three"><HeartPulse size={26} /></div>
              <div className="orbitIcon four"><FlaskConical size={26} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bookingGrid">
        <div className="bookingCard">
          <div className="stepHeader">
            <span>1</span>
            <h2>Elige modalidad</h2>
          </div>

          <div className="modeGrid">
            <button
              className={`modeCard ${selectedMode === "Online" ? "active" : ""}`}
              onClick={() => setSelectedMode("Online")}
            >
              <div className="check">✓</div>
              <div className="iconBubble"><Video size={28} /></div>
              <h3>Online</h3>
              <strong>$30.000</strong>
              <p>Evaluación por videollamada</p>
            </button>

            <button
              className={`modeCard ${selectedMode === "Presencial" ? "active" : ""}`}
              onClick={() => setSelectedMode("Presencial")}
            >
              <div className="check">✓</div>
              <div className="iconBubble"><MapPin size={28} /></div>
              <h3>Presencial en Temuco</h3>
              <strong>$40.000</strong>
              <p>Incluye bioimpedancia</p>
            </button>
          </div>

          <div className="divider" />

          <div className="stepHeader">
            <span>2</span>
            <h2>Elige fecha</h2>
          </div>

          <div className="calendarBox">
            <div className="calendarHeader">
              <strong>Mayo 2026</strong>
              <small>Haz click en un día disponible</small>
            </div>

            <div className="weekDays">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>

            <div className="calendarGrid">
              <div className="emptyDay"></div>
              <div className="emptyDay"></div>
              <div className="emptyDay"></div>
              <div className="emptyDay"></div>
              {calendarDays.slice(0, 31).map((number) => {
                const dayInfo = monthDays.find((item) => item.number === number);
                return (
                  <button
                    key={number}
                    disabled={!dayInfo}
                    onClick={() => dayInfo && handleDaySelection(dayInfo)}
                    className={`calendarDay ${dayInfo ? "available" : ""} ${selectedDay.number === number ? "active" : ""}`}
                  >
                    <span>{number}</span>
                    {dayInfo && <small>{dayInfo.times.length} hrs</small>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="divider" />

          <div className="stepHeader">
            <span>3</span>
            <h2>Elige hora disponible</h2>
          </div>

          <div className="selectedDateTitle">
            <Calendar size={20} /> {selectedDay.fullDay}, {selectedDay.date}
          </div>

          <div className="timeGrid">
            {selectedDay.times.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`timeCard ${selectedTime === time ? "active" : ""}`}
              >
                <Clock size={16} /> {time}
              </button>
            ))}
          </div>

          <div className="infoBox importantBox">
            <AlertCircle size={22} />
            <p>
              Importante: después de pagar, toca el botón “Enviar comprobante”. El mensaje ya irá
              con la fecha, hora y modalidad seleccionada para que pueda confirmar tu reserva.
            </p>
          </div>
        </div>

        <aside className="summaryCard">
          <h2>Resumen de tu reserva</h2>

          <div className="summaryList">
            <div>
              {selectedMode === "Online" ? <Video size={22} /> : <MapPin size={22} />}
              <section>
                <strong>Modalidad</strong>
                <p>{selectedMode}</p>
              </section>
            </div>
            <div>
              <Calendar size={22} />
              <section>
                <strong>Fecha</strong>
                <p>{selectedDay.fullDay}, {selectedDay.date}</p>
              </section>
            </div>
            <div>
              <Clock size={22} />
              <section>
                <strong>Horario</strong>
                <p>{selectedTime} hrs</p>
              </section>
            </div>
          </div>

          <div className="totalBox">
            <span>Total a pagar</span>
            <strong>{price}</strong>
          </div>

          <a href={paymentUrl} target="_blank" rel="noreferrer" className="payButton">
            <Lock size={19} /> Pagar y reservar hora
          </a>
          <p className="secureText">Luego envía el comprobante para confirmar tu cupo</p>

          <div className="safeBox">
            <ShieldCheck size={30} />
            <div>
              <strong>Tu hora queda pre-reservada</strong>
              <p>La reserva se confirma cuando envías el comprobante por WhatsApp.</p>
            </div>
          </div>

          <div className="whatsappBox highlightedWhatsapp">
            <strong>Paso final obligatorio</strong>
            <p>Después del pago, envía el comprobante para que pueda registrar tu fecha y hora.</p>
            <a
              href={`https://wa.me/56977415299?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={20} /> Enviar comprobante y confirmar
            </a>
          </div>
        </aside>
      </section>

      <section className="whySection">
        <div>
          <UserRound size={34} />
          <strong>Atención personalizada</strong>
          <p>Cada evaluación es única y adaptada a ti.</p>
        </div>
        <div>
          <Dna size={34} />
          <strong>Basado en ciencia</strong>
          <p>Enfoque en salud metabólica y estilo de vida.</p>
        </div>
        <div>
          <ShieldCheck size={34} />
          <strong>Espacio seguro</strong>
          <p>Escucha activa y sin juicios.</p>
        </div>
        <div>
          <Target size={34} />
          <strong>Resultados reales</strong>
          <p>Plan de acción claro y sostenible para ti.</p>
        </div>
      </section>

      <footer>
        <div><HeartPulse size={22} /> Enfermera Metabólica</div>
        <div>¿Dudas? Escríbeme por WhatsApp: +569 XXXXXXXX</div>
        <div>Instagram: @enfermera.metabolica</div>
      </footer>
    </main>
  );
}

export default App;
