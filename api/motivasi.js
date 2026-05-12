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
    
    if (!nama || !mood) {
      res.status(400).json({ error: 'nama dan mood diperlukan' });
      return;
    }

    const apiKey = process.env.SUMOPOD_API_KEY;
    if (!apiKey) {
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

    console.log('[GoodDay API] Request from', nama);

    const response = await fetch('https://api.sumopod.com/v1/messages', {
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
      console.error('[GoodDay API] Sumopod Error:', response.status);
      res.status(response.status).json({ 
        error: `API Error ${response.status}`
      });
      return;
    }

    const result = await response.json();
    const message = result.content?.[0]?.text || result.content || '';

    if (!message) {
      res.status(502).json({ error: 'Empty response from API' });
      return;
    }

    // Extract JSON from response
    const jsonMatch = message.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[GoodDay API] No JSON in response');
      res.status(502).json({ error: 'Invalid response format' });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.arabic || !parsed.translation || !parsed.source || !parsed.narrative || !parsed.type) {
      res.status(502).json({ error: 'Invalid response structure' });
      return;
    }

    console.log('[GoodDay API] Success for', nama);
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json(parsed);

  } catch (error) {
    console.error('[GoodDay API] Error:', error.message);
    res.status(500).json({ 
      error: 'Server Error',
      message: error.message 
    });
  }
}
