const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
//  const path = require('path'); // Import the path module

const app = express();

// Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

async function scrapeAndyEvents(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const events = [];

        $('.mec-calendar-events-sec').each((index, element) => {
            const date = $(element).find('.mec-table-side-day').text().trim();
            const name = $(element).find('.mec-event-title a').text().trim();
            const time = $(element).find('.mec-event-time').text().trim();
            events.push({ date, name, time });
        });

        return events;
    } catch (error) {
        throw new Error('Error scraping events:', error.message);
    }
}

async function scrapeRecordShopEvents(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const events = [];

        $('.details').each((index, element) => {
            const date = $(element).find('.date-time').text().trim();
            const name = $(element).find('.title').text().trim();
            const description = $(element).find('.description').text().trim();
            // Extract time information from the description
            const timeMatch = description.match(/Live at (\d{1,2}(?::\d{2})?\s*(?:AM|PM))/);
            const time = timeMatch ? timeMatch[1] : 'Time not available';
            events.push({ date, name, time });
        });

        return events;
    } catch (error) {
        throw new Error('Error scraping events:', error.message);
    }
}

async function scrapeHungryBrainEvents(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const events = [];

        $('.seetickets-list-event-container').each((index, element) => {
            const date = $(element).find('.date').text().trim();
            const name = $(element).find('.title a').text().trim();
            const time = $(element).find('.doortime-showtime').text().trim();
            events.push({ date, name, time });
        });

        return events;
    } catch (error) {
        throw new Error('Error scraping events:', error.message);
    }
}

app.get('/', async (req, res) => {
    try {
        const andyUrl = 'https://andysjazzclub.com/music-calendar/';
        const recordShopUrl = 'https://throughtherecordshop.com/events/';
        const hungryBrainUrl = 'https://hungrybrainchicago.com/calendar/';

        const andyEvents = await scrapeAndyEvents(andyUrl);
        const recordShopEvents = await scrapeRecordShopEvents(recordShopUrl);
        const hungryBrainEvents = await scrapeHungryBrainEvents(hungryBrainUrl);

        let html = `
            <html>
            <head>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body class="bg-gray-100 font-sans">
                <div class="container mx-auto p-4">
                    <h1 class="text-3xl font-bold text-center mb-8">Event Listings</h1>
        `;
        
        html += `
                <div>
                    <h2 class="text-2xl font-bold mb-4">Andy's Jazz Club Events</h2>
                    <table class="w-full border-collapse border border-gray-300">
                        <thead class="bg-gray-200">
                            <tr>
                                <th class="px-4 py-2">Date</th>
                                <th class="px-4 py-2">Time</th>
                                <th class="px-4 py-2">Event Name</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        andyEvents.forEach(event => {
            html += `
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">${event.date}</td>
                                <td class="border border-gray-300 px-4 py-2">${event.time}</td>
                                <td class="border border-gray-300 px-4 py-2">${event.name}</td>
                            </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
        `;

        html += `
                <div class="mt-8">
                    <h2 class="text-2xl font-bold mb-4">Through the Record Shop Events</h2>
                    <table class="w-full border-collapse border border-gray-300">
                        <thead class="bg-gray-200">
                            <tr>
                                <th class="px-4 py-2">Date</th>
                                <th class="px-4 py-2">Time</th>
                                <th class="px-4 py-2">Event Name</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        recordShopEvents.forEach(event => {
            html += `
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">${event.date}</td>
                                <td class="border border-gray-300 px-4 py-2">${event.time}</td>
                                <td class="border border-gray-300 px-4 py-2">${event.name}</td>
                            </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
        `;

        html += `
                <div class="mt-8">
                    <h2 class="text-2xl font-bold mb-4">Hungry Brain Chicago Events</h2>
                    <table class="w-full border-collapse border border-gray-300">
                        <thead class="bg-gray-200">
                            <tr>
                                <th class="px-4 py-2">Date</th>
                                <th class="px-4 py-2">Time</th>
                                <th class="px-4 py-2">Event Name</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        hungryBrainEvents.forEach(event => {
            html += `
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">${event.date}</td>
                                <td class="border border-gray-300 px-4 py-2">${event.time}</td>
                                <td class="border border-gray-300 px-4 py-2">${event.name}</td>
                            </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
        `;

        html += `
                </div>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        res.status(500).send('Error scraping events');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
