import { toDate } from 'date-fns-tz';
import { format, isSameMonth, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import nlp from 'compromise';
import { ConstantesGenerales } from './constants';

export class Functions {
  static buildNameHome(item: any): string {
    if (item.esYape) {
      return 'Pago YAPE de ' + item.operacion.slice(0, 5);
    } else if (item.esServicio) {
      return (item.titular + item.operacion).replace(/\s+/g, '').toUpperCase();
    } else {
      return 'TRAN.CTAS.TER.BM';
    }
  }

  static buildDateHome(date: string | Date): string {
    const capitalize = (str: string): string => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const normalizedDate = toDate(date, { timeZone: 'America/Lima' });
    const dia = format(normalizedDate, 'dd', { locale: es });
    const mes = format(normalizedDate, 'MMMM', { locale: es });
    const fechaFormateada = `${dia} ${capitalize(mes)}`;
    return fechaFormateada;
  }

  static buildDateVoucher(date: string | Date): { dia: string; fecha: string; hora: string } {
    const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

    const safeDate = typeof date === 'string' ? date.replace(' ', 'T') : date;

    const normalizedDate = toDate(safeDate, { timeZone: 'America/Lima' });

    const diaSemana = format(normalizedDate, 'EEEE', { locale: es });
    const dia = format(normalizedDate, 'dd', { locale: es });
    const mes = format(normalizedDate, 'MMMM', { locale: es });
    const anio = format(normalizedDate, 'yyyy', { locale: es });
    const hora = format(normalizedDate, 'hh:mm a', { locale: es }).replace('am', 'a. m.').replace('pm', 'p. m.').toLowerCase();

    return {
      dia: capitalize(diaSemana),
      fecha: `${dia} ${capitalize(mes)} ${anio}`,
      hora,
    };
  }

  static filterMovements(movements: any[], accountId: number): any[] {
    return movements
      .filter((item) => item.idCuenta === accountId)
      .map((item) => ({
        ...item,
        nameMask: this.buildNameHome(item),
        fechaMask: this.buildDateHome(item.fecha),
        montoMask: item.selfTransaction ? Math.abs(item.monto) : -Math.abs(item.monto),
      }));
  }

  static reorganizeMovements(movimientos: any[]) {
    const hoy = new Date();

    const array1: any[] = [];
    const array2: any[] = [];
    const array3: any[] = [];

    for (const mov of movimientos) {
      const fecha = toDate(mov.fecha);

      if (isToday(fecha)) {
        mov.list = 1;
        array1.push(mov);
      } else if (isSameMonth(fecha, hoy)) {
        mov.list = 2;
        array2.push(mov);
      } else {
        mov.list = 3;
        array3.push(mov);
      }
    }

    const ordenarPorFechaDesc = (a: any, b: any) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime();
    array1.sort(ordenarPorFechaDesc);
    array2.sort(ordenarPorFechaDesc);
    array3.sort(ordenarPorFechaDesc);

    return { hoy: array1, mes: array2, antiguos: array3 };
  }

  static formatMaskAccount(nro: string): string {
    nro = nro || '';

    if (nro.length === 3) {
      return '*** **';
    }

    if (nro.length <= 4) {
      const last4 = nro.padStart(4, '0').slice(-4);
      return '**** ' + last4;
    }

    const len = nro.length;
    const last4 = nro.slice(-4);
    const masked = '*'.repeat(Math.max(0, len - 4)) + last4;

    let groupSize = 0;
    if (masked.length % 4 === 0) {
      groupSize = 4;
    } else if (masked.length % 3 === 0) {
      groupSize = 3;
    }

    if (groupSize) {
      const groups = [];
      for (let i = 0; i < masked.length; i += groupSize) {
        groups.push(masked.slice(i, i + groupSize));
      }
      return groups.join(' ');
    }

    return masked;
  }

  static formatNumberAccount(number: string): string {
    if (!number || number.length < 4) return number;
    return '**** ' + number.slice(-4);
  }

  static parseMontoInput(rawValue: string | null, currentMonto: number): { valid: boolean; value: number } {
    let value = rawValue || '';

    if (value === '') {
      return { valid: true, value: 0 };
    }

    value = value.replace(/,/g, '.');

    const validNumberRegex = /^-?\d*\.?\d*$/;
    if (!validNumberRegex.test(value)) {
      return { valid: false, value: currentMonto };
    }

    if (value.endsWith('.')) {
      return { valid: true, value: currentMonto };
    }

    const parts = value.split('.');
    if (parts.length === 2) {
      parts[1] = parts[1].substring(0, 2);
      value = `${parts[0]}.${parts[1]}`;
    }

    return { valid: true, value: +value };
  }

  static restoreCursor(element: HTMLElement, position: number) {
    const selection = window.getSelection();
    const range = document.createRange();

    const textNode = element.firstChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode as Text;
      range.setStart(text, Math.min(position, text.length));
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  static arraysAreEqualByIdAndOrder(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id || a[i].order !== b[i].order) {
        return false;
      }
    }
    return true;
  }

  // YAPE
  static formatMovements(movements: any[]): any[] {
    return movements
      .slice()
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .map((x) => {
        return {
          ...x,
          montoAgo: x.payment ? Math.abs(x.monto) : x.monto * -1,
          fechaAgo: this.builDateHome(x.fecha),
          celularMask: x.celular?.replace(/(\d{3})(?=\d)/g, '$1 ').trim(),
        };
      });
  }

  static builDateHome(date: Date | string): string {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    if (isToday(parsedDate)) {
      return `Hoy ${format(parsedDate, 'h:mm a', { locale: es }).toLowerCase()}`;
    }

    if (isYesterday(parsedDate)) {
      return `Ayer ${format(parsedDate, 'h:mm a', { locale: es }).toLowerCase()}`;
    }

    return format(parsedDate, 'dd MMM. yyyy - h:mm a', { locale: es }).toLowerCase();
  }

  static buildDateYape(date: string | Date) {
    const timeZone = 'America/Lima';
    let input: Date;

    try {
      input = this.parseDateSafe(date);
    } catch {
      input = new Date(String(date));
    }

    if (isNaN(input.getTime())) {
      input = new Date();
    }

    const partes = new Intl.DateTimeFormat('es-PE', { timeZone, day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(input);

    const dia = partes.find((p) => p.type === 'day')?.value ?? '';
    const mesIndex = +(partes.find((p) => p.type === 'month')?.value ?? '1') - 1;
    const anio = partes.find((p) => p.type === 'year')?.value ?? '';

    const meses = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
    const mes = meses[mesIndex] ?? '???';

    const fecha = `${dia} ${mes} ${anio}`;

    const hora = new Intl.DateTimeFormat('es-PE', { timeZone, hour: '2-digit', minute: '2-digit', hour12: true })
      .format(input)
      .toLowerCase()
      .replace('a. m.', 'a. m.')
      .replace('p. m.', 'p. m.');

    return { fecha, hora };
  }

  static parseDateSafe(date: string | Date): Date {
    if (date instanceof Date) return date;

    const trimmed = date.trim();

    if (/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/.test(trimmed)) {
      return new Date(trimmed.replace(/\//g, '-').replace(' ', 'T') + ':00');
    }

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(trimmed)) {
      return new Date(trimmed.replace(' ', 'T') + ':00');
    }

    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('-');
      return new Date(`${year}-${month}-${day}T00:00:00`);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;

    throw new Error('Formato de fecha inválido');
  }

  static trimCellPhoneNumber(criterio: string): string {
    const digitos = criterio.match(/\d/g) || [];
    let digitosSinPrefijo: string[] = [];

    if (digitos.length >= 9) {
      digitosSinPrefijo = digitos.filter((d) => d !== ' ');

      if (digitosSinPrefijo[0] === '9') {
        digitosSinPrefijo = digitosSinPrefijo.slice(0, 9);
      } else {
        const indexOf9 = digitosSinPrefijo.indexOf('9');
        if (indexOf9 !== -1) {
          digitosSinPrefijo = digitosSinPrefijo.slice(indexOf9, indexOf9 + 9);
        }
      }
    }

    return digitosSinPrefijo.join('');
  }

  static formatPrice(price: number | string): string {
    const num = Number(price);

    if (isNaN(num)) return '0';

    if (Number.isInteger(num)) {
      return num.toString();
    }

    const result = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    });

    return result;
  }

  static extractText(texto: string) {
    const lineas = texto
      .split('\n')
      .map((linea) => linea.trim())
      .filter((linea) => linea.length > 6 && /^[A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\.\&]+$/.test(linea) && linea.split(' ').length >= 2);

    const candidatos: { linea: string; puntaje: number }[] = [];

    for (const linea of lineas) {
      let puntaje = 0;

      if (/PAGA|YAPE|QR|ESCANEA|CÓDIGO/i.test(linea)) continue;
      if (linea.split(' ').length >= 3) puntaje += 1;
      if (/S\.?A\.?C\.?|E\.?I\.?R\.?L\.?|S\.?A\.?/i.test(linea)) puntaje += 2;

      const letras = linea.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
      const mayus = (letras.match(/[A-ZÁÉÍÓÚÑ]/g) || []).length;
      if (mayus / (letras.length || 1) > 0.6) puntaje += 1;

      const doc = nlp(linea);
      if (doc.people().out('array').length > 0) puntaje += 2;
      else if (doc.nouns().out('array').length > 0) puntaje += 1;

      candidatos.push({ linea, puntaje });
    }

    const mejor = candidatos.sort((a, b) => b.puntaje - a.puntaje)[0];
    const resultado = mejor?.linea || 'Yape';

    let numeroFinal = '000000000';
    const todasLineas = texto.split('\n').map((l) => l.trim().toLowerCase());
    const idx = todasLineas.findIndex((l) => l.includes('yapear a'));

    if (idx !== -1) {
      // miramos las siguientes 8 líneas para cubrir espacios/blank lines
      for (let i = idx + 1; i < Math.min(idx + 9, todasLineas.length); i++) {
        // busca tokens de exactamente 3 dígitos separados de otros dígitos
        for (const m of todasLineas[i].matchAll(/(^|[^0-9])(\d{3})(?!\d)/g)) {
          const num = m[2]; // <-- SOLO el grupo con los 3 dígitos

          // omitir "000"
          if (num === '000') continue;

          // texto antes del número, para descartar montos tipo "S/ 500"
          const start = (m.index ?? 0) + (m[1]?.length || 0);
          const antes = todasLineas[i].slice(0, start);

          if (!/(s\/\s*)$/i.test(antes.trim())) {
            numeroFinal = `000000${num}`;
            break;
          }
        }
        if (numeroFinal !== '000000000') break;
      }
    }

    return {
      numero: numeroFinal,
      nombre: resultado,
      metodo: 'Yape',
    };
  }

  static extractTextBCP(texto: string) {
    const lineas = texto
      .split('\n')
      .map((linea) => linea.trim())
      .filter((linea) => linea.length > 0);

    let titular = 'Desconocido';
    let nrocuenta = '0000';
    let destino = 'BCP';

    const regexCelular = /\b(9\d{2})\s+(\d{3})\s+(\d{3})\b/;
    const regexUltimos4 = /\b\d{4}\b/;

    const ARRAY_DESTINOS = ['Yape', ...ConstantesGenerales.ARRAY_DESTINOS];

    // Detectar método escaneando todo el texto
    const textoLower = texto.toLowerCase();
    for (const item of ARRAY_DESTINOS) {
      if (textoLower.includes(item.toLowerCase())) {
        destino = item;
        break;
      }
    }

    for (let i = 1; i < lineas.length; i++) {
      const actual = lineas[i];
      const anterior = lineas[i - 1];

      const matchCel = actual.match(regexCelular);
      if (matchCel) {
        nrocuenta = `${matchCel[1]}${matchCel[2]}${matchCel[3]}`;
        titular = anterior;
        break;
      }

      const match4 = actual.match(regexUltimos4);
      if (match4 && nrocuenta === '0000') {
        nrocuenta = match4[0];
        titular = anterior;
        break;
      }
    }

    return {
      titular,
      nrocuenta,
      destino,
    };
  }
}
