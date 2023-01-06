require("dotenv").config();
const axios = require("axios");
const express = require("express");
const fs = require('fs');
const jsonFile = require('./randomArtists.json')

const app = express();


const apiKey = process.env.API_KEY;




app.get("/", (req, res) => {
    res.send("IncedoServices_BACKEND_CHALLENGE");
});

app.get("/:params", async(req, res, next) => {
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${req.params.params}&api_key=${apiKey}&format=json`;


    try {
        if (!process.env.API_KEY) {
            throw new Error("You forgot to set API_KEY");
        }

        const result = await axios.get(apiUrl, {
            headers: {
                "X-Api-Key": process.env.API_KEY,
            },
        });
        res.json(result.data.results.artistmatches.artist);
        const data = result.data.results.artistmatches.artist
        if (data.length === 0) {

            let ranArtists = []
            for (let i = 0; i < 3; i++) {
                const values = Object.values(jsonFile.artists)
                entry = values[Math.floor(Math.random() * jsonFile.artists.length)];
                ranArtists.push(entry.artistName)

            }
            console.log(ranArtists)
        }

        function writeToCsv(data) {
            // the name of our desired .csv file
            const filename = 'result.csv';

            // this will represent the header for said file
            const headers = ["NAME, MBID, URL, IMAGE_SMALL, IMAGE"];

            // the array we plan to store our final data in
            const list = [];

            // first we're going to chain some calls to create an array and then iterate over it
            // Object.values(): returns an array of values from the data object 
            // forEach(): iterates over the returned array
            Object.values(data).forEach(field => {
                // here we grab the description of the field
                list.push([field.name, field.mbid, field.url, Object.values(field.image[0])]);

            });

            // the inner function we're going to use to do our final formatting
            function extract(list) {
                console.log(`Your Search Results were successfully restored to ${filename}`);
                return headers.concat(list).join('\n');

            }

            // used to asynchronously write the specified data to a file
            // ex: fs.writeFile( file, data, options, callback )
            fs.writeFile(filename, extract(list), err => {
                // error handling 
                if (err) {
                    console.log('Error');
                }
            });

        }
        writeToCsv(data);
    } catch (err) {
        next(err);
    }
});



app.listen(process.env.PORT || 4000, () => {
    console.log(`Server started on PORT ${process.env.PORT}`)
});