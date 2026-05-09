import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  MessageCircle,
  HeartPulse,
  Camera,
  ShieldCheck,
  Target,
  FlaskConical,
  Lock,
  UserRound,
  Dna,
  Activity,
  AlertCircle,

} from "lucide-react";
import { supabase } from "./supabaseClient";
import "./App.css";
import darling from './assets/darling.png'

const availability = {
  1: ["18:00", "19:00", "20:00"],
  3: ["16:00", "17:00", "18:00", "19:00", "20:00"],
  4: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  5: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  6: ["09:00", "10:00", "11:00"],
};

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSlotDate(date, time) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
}

function App() {
  const initialToday = new Date();

  const [selectedMode, setSelectedMode] = useState("Online");
  const [currentMonth, setCurrentMonth] = useState(initialToday.getMonth());
  const [currentYear, setCurrentYear] = useState(initialToday.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [patient, setPatient] = useState({ name: "", phone: "", email: "" });

  const price = selectedMode === "Presencial" ? "$40.000" : "$30.000";
  const priceNumber = selectedMode === "Presencial" ? 40000 : 30000;

  const isFormValid =
    patient.name.trim() &&
    patient.phone.trim() &&
    patient.email.trim() &&
    selectedDate &&
    selectedTime;

  const loadBookedSlots = async () => {
    setLoadingBookings(true);

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("appointments")
      .select("date,time,mode,status,expires_at");

    if (error) {
      console.error(error);
      alert("No pude cargar las horas ocupadas desde Supabase.");
    } else {
      const activeBookings = data.filter((booking) => {
        if (booking.status === "confirmed") return true;

        if (
          booking.status === "pending_payment" &&
          booking.expires_at &&
          booking.expires_at > now
        ) {
          return true;
        }

        return false;
      });

      setBookedSlots(activeBookings);
    }

    setLoadingBookings(false);
  };

  const calendarDays = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const firstWeekDayMondayFirst = (firstDay.getDay() + 6) % 7;
    const days = [];

    for (let i = 0; i < firstWeekDayMondayFirst; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = formatDateKey(date);
      const times = availability[date.getDay()] || [];

      const isPastDate = date < todayStart;

const bufferMinutes = 120; // 2 horas
const bufferLimit = new Date(now.getTime() + bufferMinutes * 60000);

const availableTimes = times.filter((time) => {
  const slotDate = getSlotDate(date, time);

  if (isPastDate) return false;

  // 🔥 NUEVO: aplica buffer
  if (slotDate <= bufferLimit) return false;

  const isBooked = bookedSlots.some(
    (slot) => slot.date === dateKey && slot.time === time
  );

  return !isBooked;
});


      days.push({
        date,
        dateKey,
        dayNumber: day,
        fullDay: dayNames[date.getDay()],
        times,
        availableTimes,
        isAvailable: availableTimes.length > 0,
      });
    }

    return days;
  }, [currentMonth, currentYear, bookedSlots]);

  useEffect(() => {
    loadBookedSlots();
  }, []);

  useEffect(() => {
    const firstAvailableDay = calendarDays.find((day) => day?.isAvailable);

    if (!selectedDate || !selectedDate.isAvailable) {
      setSelectedDate(firstAvailableDay || null);
      setSelectedTime(firstAvailableDay?.availableTimes[0] || "");
      return;
    }

    const updatedSelectedDate = calendarDays.find(
      (day) => day?.dateKey === selectedDate.dateKey
    );

    if (updatedSelectedDate) {
      setSelectedDate(updatedSelectedDate);

      if (!updatedSelectedDate.availableTimes.includes(selectedTime)) {
        setSelectedTime(updatedSelectedDate.availableTimes[0] || "");
      }
    }
  }, [calendarDays, selectedDate, selectedTime]);

  const changeMonth = (direction) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
    setSelectedDate(null);
    setSelectedTime("");
  };

  const handleDaySelection = (day) => {
    if (!day?.isAvailable) return;
    setSelectedDate(day);
    setSelectedTime(day.availableTimes[0]);
  };

  const handlePatientChange = (event) => {
    const { name, value } = event.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const selectedDateLabel = selectedDate
    ? `${selectedDate.fullDay}, ${selectedDate.dayNumber} de ${monthNames[currentMonth]} ${currentYear}`
    : "Selecciona una fecha";

  const whatsappMessage = encodeURIComponent(
    `Hola, ya pagué mi evaluación metabólica ${selectedMode} para el ${selectedDateLabel} a las ${selectedTime} hrs. Mi nombre es ${patient.name || "____"}. Te envío mi comprobante para confirmar la reserva.`
  );

  const saveAppointment = async () => {
    if (!isFormValid) {
      alert("Completa tus datos y selecciona fecha/hora antes de continuar.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient: {
            name: patient.name.trim(),
            phone: patient.phone.trim(),
            email: patient.email.trim(),
          },
          selectedMode,
          selectedDate: {
            dateKey: selectedDate.dateKey,
            label: selectedDateLabel,
          },
          selectedTime,
          price: priceNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear el pago.");
      }

      await loadBookedSlots();
      window.location.href = data.init_point;
    } catch (error) {
      console.error(error);
      alert("No se pudo iniciar el pago. Intenta nuevamente o escríbeme por WhatsApp.");
    } finally {
      setIsSaving(false);
    }
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
              Entiende qué está afectando tu <span> metabolismo</span>
            </h1>
            <p>
              Evaluación personalizada para personas con fatiga, resistencia a la insulina, ansiedad alimentaria, dificultad para bajar de peso y  síntomas relacionados con tu metabolismo.
            </p>

            <div className="featuresTop">
              <div>
                <FlaskConical size={24} />
                <strong>Enfoque integral</strong>
                <small>Ciencia + evidencia</small>
              </div>
              <div>
                <Target size={24} />
                <strong>Plan personalizado</strong>
                <small>Basado en tus síntomas y objetivos</small>
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
      <section className="aboutSection">
  <div className="aboutImage">
    <img src={darling} alt="Darling - Enfermera metabólica" />
  </div>

  <div className="aboutContent">
    <span className="aboutBadge">Sobre mí</span>

    <h2>Hola, soy Darling 👋</h2>

    <p>
      Enfermera con enfoque en salud metabólica y prevención.
      Mi objetivo es ayudarte a entender qué está ocurriendo en tu cuerpo desde una mirada integral, basada en evidencia y adaptada a tu realidad.
    </p>

    <div className="aboutPoints">
      <div>✓ Enfermera con Magíster en Gestión del Cuidado</div>
      <div>✓ Docente clínica universitaria</div>
      <div>✓ Atención online personalizada</div>
      <div>✓ Enfoque en hábitos y salud metabólica</div>
    </div>
  </div>
</section>

<section className="includesSection">
  <div className="includesHeader">
    <span>Tu evaluación</span>
    <h2>¿Qué incluye?</h2>

    <p>
      Una atención enfocada en entender tu salud metabólica desde una mirada integral y personalizada.
    </p>
  </div>

  <div className="includesGrid">

    <div className="includeCard">
      <h3>Revisión de síntomas y hábitos</h3>
      <p>
        Analizamos señales como fatiga, ansiedad alimentaria, sueño, energía y estilo de vida.
      </p>
    </div>

    <div className="includeCard">
      <h3>Interpretación de exámenes</h3>
      <p>
        Revisamos tus exámenes metabólicos para ayudarte a entender qué está ocurriendo en tu cuerpo.
      </p>
    </div>

    <div className="includeCard">
      <h3>Orientación personalizada</h3>
      <p>
        Recomendaciones adaptadas a tus síntomas, objetivos y contexto personal.
      </p>
    </div>

    <div className="includeCard">
      <h3>Enfoque basado en evidencia</h3>
      <p>
        Información clara y respaldada científicamente, sin planes extremos ni soluciones mágicas.
      </p>
    </div>

  </div>
</section>
<section className="symptomsSection">
  <div className="symptomsHeader">
    <span>Señales frecuentes</span>

    <h2>¿Te identificas con esto?</h2>

    <p>
      Muchas veces el cuerpo da señales antes de que aparezcan enfermedades más avanzadas.
    </p>
  </div>

  <div className="symptomsGrid">
    <div className="symptomItem">Cansancio constante</div>
    <div className="symptomItem">Ansiedad por comer</div>
    <div className="symptomItem">Dificultad para bajar de peso</div>
    <div className="symptomItem">Sueño poco reparador</div>
    <div className="symptomItem">Inflamación abdominal</div>
    <div className="symptomItem">Hambre frecuente</div>
    <div className="symptomItem">Estrés constante</div>
    <div className="symptomItem">Resistencia a la insulina</div>
  </div>
</section>

<section className="transitionSection">
  <div className="transitionContent">
    <h2>Tu cuerpo está intentando decirte algo.</h2>

    <p>
      Entender tu metabolismo puede ser el primer paso para mejorar tu energía,
      tus hábitos y tu salud a largo plazo.
    </p>
  </div>
</section>
      <section className="bookingGrid">
        <div className="bookingCard">
          <div className="stepHeader">
            <span>1</span>
            <h2>Elige modalidad</h2>
          </div>

          <div className="modeGrid">
            <button className={`modeCard ${selectedMode === "Online" ? "active" : ""}`} onClick={() => setSelectedMode("Online")}>
              <div className="check">✓</div>
              <div className="iconBubble"><Video size={28} /></div>
              <h3>Online</h3>
              <strong>$30.000</strong>
              <p>Evaluación por videollamada</p>
            </button>

            <button className={`modeCard ${selectedMode === "Presencial" ? "active" : ""}`} onClick={() => setSelectedMode("Presencial")}>
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
              <button className="monthButton" onClick={() => changeMonth(-1)}>‹</button>
              <div>
                <strong>{monthNames[currentMonth]} {currentYear}</strong>
                <small>{loadingBookings ? "Cargando horas ocupadas..." : "Haz click en un día disponible"}</small>
              </div>
              <button className="monthButton" onClick={() => changeMonth(1)}>›</button>
            </div>

            <div className="weekDays">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>

            <div className="calendarGrid">
              {calendarDays.map((day, index) => (
                day ? (
                  <button
                    key={day.dateKey}
                    disabled={!day.isAvailable}
                    onClick={() => handleDaySelection(day)}
                    className={`calendarDay ${day.isAvailable ? "available" : ""} ${selectedDate?.dateKey === day.dateKey ? "active" : ""}`}
                  >
                    <span>{day.dayNumber}</span>
                    {day.isAvailable && <small>{day.availableTimes.length} hrs</small>}
                  </button>
                ) : (
                  <div key={`empty-${index}`} className="emptyDay" />
                )
              ))}
            </div>
          </div>

          <div className="divider" />

          <div className="stepHeader">
            <span>3</span>
            <h2>Elige hora disponible</h2>
          </div>

          <div className="selectedDateTitle">
            <Calendar size={20} /> {selectedDateLabel}
          </div>
          
          {selectedDate?.availableTimes?.length > 0 &&
          selectedDate.availableTimes.length <= 2 && (
          <div className="lowAvailabilityWarning">
           ⚠️ Solo quedan {selectedDate.availableTimes.length} horas disponibles
          </div>
           )}
          <div className="timeGrid">
            {selectedDate?.availableTimes?.length ? (
              selectedDate.availableTimes.map((time) => (
                
                <button key={time} onClick={() => setSelectedTime(time)} className={`timeCard ${selectedTime === time ? "active" : ""}`}>
                  <Clock size={16} /> {time}
                </button>
              ))
            ) : (
              <p className="noSlotsText">No hay horas disponibles para este día.</p>
            )}
          </div>

          <div className="divider" />

          <div className="stepHeader">
            <span>4</span>
            <h2>Completa tus datos</h2>
          </div>

          <div className="patientForm">
            <input name="name" value={patient.name} onChange={handlePatientChange} placeholder="Nombre completo" />
            <input name="phone" value={patient.phone} onChange={handlePatientChange} placeholder="WhatsApp" />
            <input name="email" value={patient.email} onChange={handlePatientChange} placeholder="Correo electrónico" type="email" />
          </div>

          <div className="infoBox importantBox">
            <AlertCircle size={22} />
            <p>
             Al presionar “Reservar y pagar”, tu hora queda reservada por 30 minutos.

⚠️ Si no completas el pago en ese tiempo, el cupo se libera automáticamente.
            </p>
          </div>
        </div>

        <aside className="summaryCard">
          <h2>Resumen de tu reserva</h2>

     <div className="summaryList">

  <div className="summaryItem">
    <Video size={22} />
    <div className="summaryText">
      <strong>Modalidad</strong>
      <p>{selectedMode}</p>
    </div>
  </div>

  <div className="summaryItem">
    <Calendar size={22} />
    <div className="summaryText">
      <strong>Fecha</strong>
      <p>{selectedDateLabel}</p>
    </div>
  </div>

  <div className="summaryItem">
    <Clock size={22} />
    <div className="summaryText">
      <strong>Horario</strong>
      <p>{selectedTime} hrs</p>
    </div>
  </div>

</div>

          <div className="totalBox">
            <span>Total a pagar</span>
            <strong>{price}</strong>
          </div>

          <p className="ctaText">
            Completa tus datos y presiona el botón para reservar tu hora y continuar al pago.
          </p>

          <button onClick={saveAppointment} disabled={!isFormValid || isSaving} className="payButton">
            <Lock size={19} />
            {isSaving ? "Reservando..." : !isFormValid ? "Completa tus datos" : "Comenzar mi evaluación"}
          </button>

          <p className="secureText">
  🔒 Pago seguro con Mercado Pago
</p>

          <p className="secureText">Luego envía el comprobante para confirmar tu cupo</p>

      <div className="infoBox">
  <ShieldCheck size={24} />
  <div className="infoText">
    <strong>Tu hora queda pre-reservada</strong>
    <p>
      La reserva se confirma automáticamente cuando el pago queda aprobado.
    </p>
  </div>
</div>
          <div className="whatsappBox highlightedWhatsapp">
            <strong>Paso final recomendado</strong>
            <p>Después del pago, también puedes enviar el comprobante por WhatsApp.</p>
            <a href={`https://wa.me/56977415299?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
              <MessageCircle size={20} /> Enviar comprobante
            </a>
          </div>
        </aside>
      </section>

      <section className="faqSection">
  <div className="faqHeader">
    <span>Preguntas frecuentes</span>
    <h2>Resolvamos tus dudas</h2>
  </div>

  <div className="faqGrid">
    <div className="faqItem">
      <h3>¿Necesito tener exámenes?</h3>
      <p>
        No necesariamente. Si tienes exámenes recientes podemos analizarlos, pero también puedes agendar aunque aún no tengas.
      </p>
    </div>

    <div className="faqItem">
      <h3>¿La atención es online?</h3>
      <p>
        Sí. Puedes atenderte desde cualquier ciudad de Chile mediante videollamada.
      </p>
    </div>

    <div className="faqItem">
      <h3>¿Cuánto dura la evaluación?</h3>
      <p>
        La atención tiene una duración aproximada de 60 minutos.
      </p>
    </div>

    <div className="faqItem">
      <h3>¿La evaluación reemplaza una consulta médica?</h3>
      <p>
        No. La evaluación tiene un enfoque educativo y preventivo complementario al seguimiento médico.
      </p>
    </div>
  </div>
</section>

<section className="testimonialsSection">
  <div className="testimonialsHeader">
    <span>Experiencias</span>
    <h2>Lo que más valoran las personas</h2>
    <p>
      Acompañamiento claro, cercano y enfocado en entender lo que está pasando en tu cuerpo.
    </p>
  </div>

  <div className="testimonialsGrid">
    <div className="testimonialCard">
      <p>
        “Por primera vez sentí que alguien me explicó mis exámenes de forma clara y sin juzgarme.”
      </p>
     
    </div>

    <div className="testimonialCard">
      <p>
        “Me ayudó a entender que no era solo falta de voluntad, sino que había señales metabólicas importantes.”
      </p>
      
    </div>

    <div className="testimonialCard">
      <p>
        “Me sentí escuchada y con un plan mucho más realista para empezar a mejorar mis hábitos.”
      </p>
   
    </div>
  </div>
</section>
<footer className="footer">

  <div className="footerLeft">
    <div className="footerLogo">
      <HeartPulse size={78} strokeWidth={2.2} />

      <h3>
        Enfermera<br />
        Metabólica
      </h3>
    </div>

    <div className="footerDivider"></div>

    <p className="footerDescription">
      Salud metabólica,<br />
      prevención y educación<br />
      basada en evidencia.
    </p>
  </div>

  <div className="footerCard">

    <div className="footerSocials">

      <a
        href="https://instagram.com/enfermera.metabolica"
        target="_blank"
        rel="noreferrer"
      >
        <Camera size={24} />
        Instagram
      </a>

      <a
        href="https://wa.me/56977415299"
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={24} />
        WhatsApp
      </a>

    </div>

    <p>Atención online para todo Chile</p>

    <div className="footerLine"></div>

    <small>© 2026 Enfermera Metabólica</small>

  </div>

</footer>







<a
  className="floatingWhatsapp"
  href="https://wa.me/56977415299?text=Hola%20Darling%2C%20quiero%20informaci%C3%B3n%20sobre%20la%20evaluaci%C3%B3n%20metab%C3%B3lica"
  target="_blank"
  rel="noreferrer"
>
  <MessageCircle size={24} />
  <span>WhatsApp</span>
</a>
    </main>
  );
}

export default App;