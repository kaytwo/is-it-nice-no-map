import type { APIRoute } from 'astro';
export const prerender = false;

const PROMPT = "tell the user whether the weather at the provided location is nice or not. in a complete single sentence, make your best guess. don't provide context or description of the conditions just let me know if it's nice, normal, not nice, etc."
export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { place } = data;
        const weatherRequest = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=imperial&q=${place}&appid=${import.meta.env.OWM_APIKEY}`)
        const weatherData = await weatherRequest.json();
        const weatherSentence = `The weather in ${place} is ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp}°F on ${new Date(weatherData.dt * 1000).toLocaleDateString()}`
        console.log(weatherSentence)
        const aiRequest = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.AISTUDIO_APIKEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                { "contents": [{ "parts": [{ "text": `${PROMPT} ${weatherSentence}` }] }] })
        })
        const aiData = await aiRequest.json();
        const howNice = aiData.candidates[0].content.parts[0].text
        // Process the data here
        return new Response(JSON.stringify({ message: 'Data received', data: howNice }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid data' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};