// --- FUNCIONES AUXILIARES ---
function pickParts(conv) {
    const parts = [];
    if (conv?.source) parts.push(conv.source);
    if (conv?.conversation_parts?.conversation_parts) {
        parts.push(...conv.conversation_parts.conversation_parts);
    }
    return parts;
}

function ext(name = '') {
    const m = String(name).toLowerCase().match(/\.(\w+)$/);
    return m ? m[1] : '';
}

function isPdf(att) {
    const ct = (att.content_type || '').toLowerCase();
    const e = ext(att.name || att.filename);
    return ct.includes('pdf') || e === 'pdf';
}

function isTextLike(att) {
    const ct = (att.content_type || '').toLowerCase();
    const e = ext(att.name || att.filename);
    return ct.includes('csv') || ct.includes('text/plain') || ct.includes('text/csv')
        || e === 'csv' || e === 'txt' || e === 'tsv';
}

function isSpreadsheet(att) {
    const ct = (att.content_type || '').toLowerCase();
    const e = ext(att.name || att.filename);
    return ct.includes('vnd.ms-excel')
        || ct.includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        || ct.includes('vnd.oasis.opendocument.spreadsheet')
        || e === 'xls' || e === 'xlsx' || e === 'ods';
}

function isZip(att) {
    const ct = (att.content_type || '').toLowerCase();
    const e = ext(att.name || att.filename);
    return ct.includes('zip') || ct.includes('compressed') || e === 'zip';
}

function isImage(att) {
    const ct = (att.content_type || '').toLowerCase();
    const e = ext(att.name || att.filename);
    return ct.includes('image/')
        || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(e);
}

function classifyAttachment(att) {
    const ct = (att.content_type || '').toLowerCase();
    const genericTypes = [
        'application/force-download',
        'application/octet-stream',
        'application/download',
        'binary/octet-stream',
    ];
    if (!genericTypes.includes(ct)) {
        if (isPdf(att)) return 'pdf';
        if (isTextLike(att)) return 'text';
        if (isSpreadsheet(att)) return 'spreadsheet';
        if (isZip(att)) return 'zip';
        if (isImage(att)) return 'image';
        return 'unknown';
    }
    const e = ext(att.name || att.filename);
    if (e === 'pdf') return 'pdf';
    if (['csv', 'txt', 'tsv'].includes(e)) return 'text';
    if (['xls', 'xlsx', 'ods'].includes(e)) return 'spreadsheet';
    if (e === 'zip') return 'zip';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(e)) return 'image';
    return 'unknown';
}

async function fetchBuffer(url) {
    const res = await this.helpers.httpRequest({
        method: 'GET',
        url,
        json: false,
        encoding: null,
    });
    return Buffer.isBuffer(res) ? res : Buffer.from(res);
}

async function fetchText(url) {
    const buf = await fetchBuffer.call(this, url);
    let txt = buf.toString('utf8');
    const MAX = 200000;
    if (txt.length > MAX) {
        txt = txt.slice(0, MAX) + '\n[TRUNCADO]';
    }
    return txt;
}

function inflateRaw(compressed) {
    const zlib = require('zlib');
    return zlib.inflateRawSync(Buffer.from(compressed));
}

async function processZip(url, zipName) {
    const results = [];
    try {
        const buf = await fetchBuffer.call(this, url);
        let offset = 0;
        const entries = [];
        while (offset < buf.length - 4) {
            if (buf.readUInt32LE(offset) !== 0x04034b50) break;
            const compressionMethod = buf.readUInt16LE(offset + 8);
            const compressedSize = buf.readUInt32LE(offset + 18);
            const nameLen = buf.readUInt16LE(offset + 26);
            const extraLen = buf.readUInt16LE(offset + 28);
            const fileName = buf.toString('utf8', offset + 30, offset + 30 + nameLen);
            const dataStart = offset + 30 + nameLen + extraLen;
            const dataEnd = dataStart + compressedSize;
            const rawData = buf.slice(dataStart, dataEnd);
            let fileData;
            if (compressionMethod === 0) {
                fileData = rawData;
            } else if (compressionMethod === 8) {
                try { fileData = inflateRaw(rawData); } catch (e) { fileData = null; }
            } else {
                fileData = null;
            }
            if (fileData && !fileName.endsWith('/')) {
                entries.push({ name: fileName, data: fileData });
            }
            offset = dataEnd;
        }
        for (const entry of entries) {
            const e = ext(entry.name);
            if (['csv', 'txt', 'tsv'].includes(e)) {
                const txt = entry.data.toString('utf8');
                const sampled = sampleCsvLines(txt, 30);
                results.push({ type: 'text', text: `Contenido '${zipName} -> ${entry.name}':\n---\n${sampled}` });
            } else if (['xls', 'xlsx', 'ods'].includes(e)) {
                results.push({ type: 'text', text: `METADATOS (EXCEL dentro de ZIP): ${JSON.stringify({ zip: zipName, nombre: entry.name, extension: e, size: entry.data.length })}` });
            } else if (e === 'pdf') {
                results.push({ type: 'text', text: `Archivo PDF dentro de ZIP '${zipName}': ${entry.name} [NO SE PUEDE PREVISUALIZAR DESDE ZIP]` });
            } else {
                results.push({ type: 'text', text: `Archivo dentro de ZIP '${zipName}': ${entry.name} [FORMATO: .${e}]` });
            }
        }
        if (entries.length === 0) {
            results.push({ type: 'text', text: `ZIP '${zipName}': [NO SE PUDIERON EXTRAER ARCHIVOS]` });
        }
    } catch (e) {
        results.push({ type: 'text', text: `ZIP '${zipName}': [ERROR AL DESCOMPRIMIR: ${e.message}]` });
    }
    return results;
}

function sampleCsvLines(csvText, sampleSize = 30) {
    const lines = csvText.split("\n").filter(l => l.trim());
    if (lines.length <= sampleSize) return lines.join("\n");
    const head = lines.slice(0, Math.ceil(sampleSize / 3));
    const midStart = Math.floor(lines.length / 2) - Math.floor(sampleSize / 6);
    const mid = lines.slice(midStart, midStart + Math.ceil(sampleSize / 3));
    const tail = lines.slice(-Math.ceil(sampleSize / 3));
    return [...head, ...mid, ...tail].join("\n");
}

function htmlToPlain(s = '') {
    return String(s)
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<br[^>]*>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim();
}

function stripEmailQuotes(text) {
    const patterns = [
        /.+escribi[oó]:\s*$/m,
        /.+wrote:\s*$/m,
        /-{3,}\s*(?:Forwarded|Reenviad).+/i,
    ];
    let earliest = text.length;
    for (const pat of patterns) {
        const match = text.match(pat);
        if (match && match.index < earliest) earliest = match.index;
    }
    return text.slice(0, earliest).trim();
}

const conv = items[0].json;
const parts = pickParts(conv);
const userEmail = conv?.source?.author?.email || '';
const userId = conv?.contacts?.contacts?.[0]?.external_id || '';

let lastBotWithBodyIndex = -1;
for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    const isBot = p.author && p.author.type !== 'user';
    const rawBody = p.body || '';
    const cleanBody = htmlToPlain(rawBody);
    if (isBot && cleanBody.length > 0) { lastBotWithBodyIndex = i; break; }
}

let chatHistoryText = "";
for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const partType = p.part_type || '';
    if (partType !== 'comment' && partType !== '' && partType !== 'conversation' && partType !== 'open') continue;
    const isUser = p.author && p.author.type === 'user';
    const role = isUser ? 'Usuario' : 'Agente';
    const rawBody = p.body || p.source?.body || '';
    let cleanBody = htmlToPlain(rawBody);
    if (isUser) cleanBody = stripEmailQuotes(cleanBody);
    if (cleanBody) chatHistoryText += `${role}: ${cleanBody}\n`;
}

const userMessagesPending = [];
for (let i = lastBotWithBodyIndex + 1; i < parts.length; i++) {
    const p = parts[i];
    if (p.author && p.author.type === 'user') {
        const rawBody = p.body || '';
        let cleanBody = htmlToPlain(rawBody);
        cleanBody = stripEmailQuotes(cleanBody);
        if (cleanBody) userMessagesPending.push(cleanBody);
        const atts = Array.isArray(p.attachments) ? p.attachments : [];
        for (const a of atts) {
            const nombre = a.name || a.filename || 'archivo';
            userMessagesPending.push(`[Attachment: "${nombre}"]`);
        }
    }
}

let lastMessageContent = userMessagesPending.join('\n');
if (!lastMessageContent) {
    lastMessageContent = $('Webhook1').first().json.body.message || '';
}

const attachmentsList = [];
const contentBlocks = [];
const seenUrls = new Set();
for (let i = lastBotWithBodyIndex + 1; i < parts.length; i++) {
    const p = parts[i];
    if (p.author && p.author.type === 'user') {
        const atts = Array.isArray(p.attachments) ? p.attachments : [];
        for (const a of atts) {
            const url = a.url || a.download_url;
            if (!url || seenUrls.has(url)) continue;
            seenUrls.add(url);
            const nombre = a.name || a.filename || 'archivo';
            attachmentsList.push({ name: nombre, url });
            const tipo = classifyAttachment(a);
            switch (tipo) {
                case 'pdf':
                    contentBlocks.push({ type: 'image_url', image_url: { url } });
                    break;
                case 'spreadsheet':
                    contentBlocks.push({ type: 'text', text: `METADATOS (EXCEL): ${JSON.stringify({ nombre, content_type: a.content_type || '', extension: ext(nombre) })}` });
                    break;
                case 'text':
                    try {
                        const txt = await fetchText.call(this, url);
                        const sampled = sampleCsvLines(txt, 30);
                        contentBlocks.push({ type: 'text', text: `Contenido '${nombre}':\n---\n${sampled}` });
                    } catch (e) {
                        contentBlocks.push({ type: 'text', text: `Contenido '${nombre}': [NO ACCESIBLE: ${e.message}]` });
                    }
                    break;
                case 'zip':
                    try {
                        const zipBlocks = await processZip.call(this, url, nombre);
                        contentBlocks.push(...zipBlocks);
                    } catch (e) {
                        contentBlocks.push({ type: 'text', text: `ZIP '${nombre}': [ERROR: ${e.message}]` });
                    }
                    break;
                case 'image':
                    contentBlocks.push({ type: 'image_url', image_url: { url } });
                    break;
                default:
                    contentBlocks.push({ type: 'text', text: `Archivo '${nombre}' (${a.content_type || 'tipo desconocido'}): [FORMATO NO SOPORTADO]` });
                    break;
            }
        }
    }
}

return [{
    json: {
        last_message_content: lastMessageContent,
        chat_history: chatHistoryText,
        user_email: userEmail,
        user_id: userId,
        attachments_list: attachmentsList,
        files_analysis_blocks: contentBlocks
    }
}];
