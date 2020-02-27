const renderer = function(data) {

    let lista = '';
    data.forEach(element => {
        lista += `<li>${element}</li>
        `;
    });
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
            body {
                text-align: center;
            }
            </style>
        </head>

        <body>
            <h1>Plague spreading</h1>

            <form id="contact-form" method="POST" action="/intermediate-search">
                <label for="city1"> source </label>
                <input type="text" name="city1"><br><br>
                <label for="city2"> destination </label>
                <input type="text" name="city2">
                <input type="submit" value="submit" />
            </form>

            <ul style="list-style-type:none;">
                ${lista}
            </ul>
        </body>
        </html>`
}

module.exports = renderer;