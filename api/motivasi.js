export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { nama, usia, gender, profesi, mood, waktu } = req.body;
    
    // Validasi required fields
    if (!nama || !mood) {
      console.warn('[GoodDay API] Missing required fields:', { nama: !!nama, mood: !!mood });
      res.status(400).json({ error: 'nama dan mood diperlukan' });
      return;
    }

    const apiKey = process.env.SUMOPOD_API_KEY;
    if (!apiKey) {
      console.error('[GoodDay API] SUMOPOD_API_KEY tidak dikonfigurasi');
      res.status(500).json({ error: 'SUMOPOD_API_KEY tidak dikonfigurasi' });
      return;
    }

    const prompt = `Kamu adalah asisten spiritual Islami yang bijak dan hangat. Berikan pesan motivasi harian untuk ${nama} yang berusia ${usia} tahun, berprofesi sebagai ${profesi}, sedang merasakan ${mood}, pada waktu ${waktu}.

Pilih 1 ayat Al-Quran ATAU 1 Hadits shahih yang sangat relevan. Balas HANYA dalam format JSON VALID:
{
  "arabic": "teks arab asli",
  "translation": "terjemahan Indonesia yang natural",
  "source": "sumber lengkap (QS Al-Baqarah: 286 atau HR Bukhari)",
  "type": "quran atau hadits",
  "narrative": "pesan motivasi personal 2-3 kalimat menyebut nama ${nama}"
}`;

    console.log('[GoodDay API] Request from', nama, 'dengan mood:', mood, 'waktu:', waktu);

    const response = await fetch('https://ai.sumopod.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20250909',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[GoodDay API] Sumopod Error:', response.status, 'Message:', err.substring(0, 200));
      res.status(response.status).json({ 
        error: `API Error ${response.status}: ${response.statusText}`
      });
      return;
    }

    const result = await response.json();
    const message = result.content?.[0]?.text || result.content || '';

    if (!message) {
      console.error('[GoodDay API] Empty response from Claude API');
      res.status(502).json({ error: 'Empty response from API' });
      return;
    }

    // Extract JSON from response - improved regex with better error handling
    let jsonMatch = null;
    try {
      // Try to find JSON object in the message
      jsonMatch = message.match(/\{[\s\S]*\}/);
    } catch (regexErr) {
      console.error('[GoodDay API] Regex error:', regexErr.message);
    }

    if (!jsonMatch || !jsonMatch[0]) {
      console.error('[GoodDay API] No JSON found in response. Raw message:', message.substring(0, 300));
      res.status(502).json({ error: 'Invalid response format: no JSON found' });
      return;
    }

    // Parse JSON dengan proper error handling
    let parsed = null;
    try {
      const jsonString = jsonMatch[0];
      parsed = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error('[GoodDay API] JSON parse error:', parseErr.message);
      console.error('[GoodDay API] Failed to parse:', jsonMatch[0].substring(0, 200));
      res.status(502).json({ error: 'Invalid JSON in response: ' + parseErr.message });
      return;
    }

    // Validate required fields dengan trim check
    const requiredFields = ['arabic', 'translation', 'source', 'narrative', 'type'];
    const missingFields = requiredFields.filter(field => 
      !parsed[field] || (typeof parsed[field] === 'string' && parsed[field].trim() === '')
    );

    if (missingFields.length > 0) {
      console.error('[GoodDay API] Invalid response structure. Missing fields:', missingFields);
      console.error('[GoodDay API] Received:', JSON.stringify(parsed));
      res.status(502).json({ error: 'Invalid response structure: missing fields ' + missingFields.join(', ') });
      return;
    }

    // Validate type field
    if (!['quran', 'hadits'].includes(parsed.type)) {
      console.error('[GoodDay API] Invalid type:', parsed.type);
      res.status(502).json({ error: 'Invalid type: must be "quran" or "hadits"' });
      return;
    }

    console.log('[GoodDay API] ✓ Success for', nama, '| Type:', parsed.type, '| Source:', parsed.source);
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json(parsed);

  } catch (error) {
    console.error('[GoodDay API] ❌ Unhandled error:', error.message);
    console.error('[GoodDay API] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Server Error',
      message: error.message 
    });
  }
}
