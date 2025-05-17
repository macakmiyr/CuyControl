const apiKey = "E28KLTSVYXILPXL2";
const channelID = 2944850;
const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${apiKey}&results=1`;
const historialURL = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${apiKey}&results=100`;

async function actualizarDatos() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudo conectar a ThingSpeak");
    const data = await response.json();
    const feed = data.feeds[0];

    const amon = parseFloat(feed.field1).toFixed(1);
    const temp = parseFloat(feed.field2).toFixed(1);
    const hum = parseFloat(feed.field3).toFixed(1);

    document.getElementById("amon").textContent = `Amoníaco: ${amon} ppm`;
    document.getElementById("temp").textContent = `Temperatura: ${temp} °C`;
    document.getElementById("hum").textContent = `Humedad: ${hum} %`;

    const alerta = document.getElementById("alerta");
    const sonido = document.getElementById("alarmaSonido");
    if (amon > 40) {
      alerta.textContent = "¡PELIGRO! Nivel alto de amoníaco";
      sonido.play();
    } else if (amon > 20) {
      alerta.textContent = "Advertencia: Amoníaco elevado";
    } else {
      alerta.textContent = "";
    }

    const hora = new Date(feed.created_at);
    const horaLocal = hora.toLocaleString("es-ES", { timeZone: "America/Lima" });
    document.getElementById("hora").textContent = `Última actualización: ${horaLocal}`;
  } catch (error) {
    console.error("Error al obtener datos:", error);
    document.getElementById("alerta").textContent = "Error al obtener datos de ThingSpeak.";
  }
}

async function mostrarHistorial() {
  try {
    const response = await fetch(historialURL);
    const data = await response.json();
    const tabla = document.getElementById("tablaHistorial");
    tabla.textContent = "";
    data.feeds.forEach((item, index) => {
      const linea = `${index + 1}. ${item.created_at} | Amoníaco: ${item.field1} ppm | Temp: ${item.field2} °C | Humedad: ${item.field3} %\n`;
      tabla.textContent += linea;
    });
  } catch (error) {
    document.getElementById("tablaHistorial").textContent = "No se pudo cargar el historial.";
  }
  document.getElementById("modalHistorial").style.display = "block";
}

function cerrarHistorial() {
  document.getElementById("modalHistorial").style.display = "none";
}

async function descargarCSV() {
  try {
    const response = await fetch(historialURL);
    const data = await response.json();
    let csv = "Fecha, Amoníaco (ppm), Temperatura (°C), Humedad (%)\n";
    data.feeds.forEach(item => {
      csv += `${item.created_at},${item.field1},${item.field2},${item.field3}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos_cuycontrol.csv';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert("Error al descargar historial.");
  }
}

actualizarDatos();
setInterval(actualizarDatos, 15000);
