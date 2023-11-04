const CryptoCurrency = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";
const descriptionURL = "https://api.coingecko.com/api/v3/coins/";
const liveReportsURL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD`;
let top100Currencies = [];
let liveReports = [];
let currencyList = "";
var sentence = "";

$(async () => {
    top100Currencies = await $.get(CryptoCurrency);
    createCurrency(top100Currencies);
});
const createCurrency = (top100Currencies) => {
    // Hide the currency list
    $('#row').hide();
    // Create the HTML for the currency list
    currencyList = top100Currencies.map((currency) =>
        `
        <div class="col-sm-4">
            <div class="card border-dark currency-card" id="card-${currency.id}">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <h5 class="card-title mr-3">${currency.name}</h5>
                        <img alt="${currency.name} icon" src="${currency.image}" width="50" height="50">
                    </div>
                    <div class="form-check form-switch" id>
                        <input class="form-check-input" type="checkbox" id="${currency.id}" onclick="handleCheckboxClick(this, '${currency.id}')" ${liveReports.includes(currency.id) ? "checked" : "!checked"}>Add to live reports
                    </div>
                    <p class="currency-symbol">${currency.symbol.toUpperCase()} </p>
                    <p class="currency-price">$${currency.current_price.toLocaleString()}</p>
                    <p class="currency-market-cap">Market Cap:<br> $${currency.market_cap.toLocaleString()}</p>  
                    <button onclick="fetchCurrencySentence('${currency.id}')" id="button-${currency.id}" class="btn btn-primary btn-description" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${currency.id}" aria-expanded="false" aria-controls="collapse-${currency.id}">
                    More Info
                    </button>
                    <div class="collapse" id="collapse-${currency.id}">
                        <div class="card card-body">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `)
        .join('');
        
    // Add the HTML to the page and fade it in
    $('#row').html(currencyList).fadeIn();
}
$('#alphabetical').on('click', () => false), 
$('#currencyPriceSubMenu').on('click', () => false), 
$('#currencyCapSubMenu').on('click', () => false);
$('#alphabeticalAZ').on('click', (event) => {
    event.preventDefault();
    top100Currencies.sort((a, b) => a.name.localeCompare(b.name));
    createCurrency(top100Currencies);
});
$('#alphabeticalZA').on('click', (event) => {
    event.preventDefault();
    top100Currencies.sort((a, b) => b.name.localeCompare(a.name));
    createCurrency(top100Currencies);
});
$('#sortpriveHighToLow').click((event) => {
    event.preventDefault();
    const sortedCurrencies = top100Currencies.sort((a, b) => b.current_price - a.current_price);
    createCurrency(sortedCurrencies);
});
$('#sortpriveLowToHigh').click((event) => {
    event.preventDefault();
    const sortedCurrencies = top100Currencies.sort((a, b) => a.current_price - b.current_price);
    createCurrency(sortedCurrencies);
});
$('#caphighTolow').click((event) => {
    event.preventDefault();
    top100Currencies.sort((a, b) => b.market_cap - a.market_cap);
    createCurrency(top100Currencies);
});
$('#caplowTohigh').click((event) => {
    event.preventDefault();
    top100Currencies.sort((a, b) => a.market_cap - b.market_cap);
    createCurrency(top100Currencies);
});
$('form').submit((event) => {
    event.preventDefault();
    const searchCurrency = $('#search').val().trim().toUpperCase();
    let filteredCurrencies = top100Currencies.filter((currency) => {
        return currency.symbol.toUpperCase().indexOf(searchCurrency) === 0;
    });
    // console.log(filteredCurrencies);
    let filteredHtml = filteredCurrencies.map((currency) => `
        <div class="col-sm-4">
            <div class="card border-dark" id="card-${currency.id}">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <h5 class="card-title mr-3">${currency.name}</h5>
                        <img alt="${currency.name} icon" src="${currency.image}" width="50" height="50">
                    </div>
                    <div class="form-check form-switch" id>
                        <input class="form-check-input" type="checkbox" id="${currency.id}" onclick="handleCheckboxClick(this, '${currency.id}')" ${liveReports.includes(currency.id) ? "checked" : "!checked"}>Add to live reports
                    </div>         
                    <p class="currency-symbol">${currency.symbol.toUpperCase()} </p>
                    <p class="currency-price">$${currency.current_price.toLocaleString()}</p>
                    <p class="currency-market-cap">Market Cap:<br> $${currency.market_cap.toLocaleString()}</p>  
                    <button onclick="fetchCurrencySentence('${currency.id}')" id="button-${currency.id}" class="btn btn-primary btn-description" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${currency.id}" aria-expanded="false" aria-controls="collapse-${currency.id}">
                    More Info
                    </button>
                    <div class="collapse" id="collapse-${currency.id}">
                        <div class="card card-body">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `).join('');
    $('#row').html(filteredHtml);
});
const getAndSetItemWithExpiry = async (key, expiry) => {
    const sentenceApi = await $.get(descriptionURL + key);
    const expirationDate = new Date().getTime() + expiry;
    localStorage.setItem(
        `More Info-${key}`,
        JSON.stringify({
            value: sentenceApi,
            expDate: expirationDate,
        })
    );
    console.log(sentenceApi);
    return sentenceApi;
}
const fetchCurrencySentence = async (currencyId) => {
    // if the button has a class of collpased - get the data
    var isShown = $('#collapse-'+ currencyId).hasClass('show');
    if (!isShown) {
        // first, check if item is in localstorage
        var localStorageItemString = await localStorage.getItem(`More Info-${currencyId}`);
        var localStorageItem = JSON.parse(localStorageItemString);
        console.log("check for localstorage item with currencyId:", localStorageItem)
        let sentenceApi;
        if (localStorageItem) {
            // check if time has expired
            if (new Date().getTime() > localStorageItem.expDate) {
                console.log("there is an item, but it is expired! we will remove it")
                // yes?  - remove item from localstorage!
                localStorage.removeItem(`More Info-${currencyId}`);
                sentenceApi = await getAndSetItemWithExpiry(currencyId, 120000);
            } else {
                console.log("there is an item and it is not expired, let's re-use it. we don't need an api call");
                // if yes - just use the data from the local storage. no need for the api call
                sentenceApi = localStorageItem.value;
            }
        } else {
            // if not - get it from api and set it to localstorage
            sentenceApi = await getAndSetItemWithExpiry(currencyId, 120000);
        }
        let currencieName = sentenceApi.name;
        let currencyPriceEUR = sentenceApi.market_data.current_price.eur;
        let currencyPriceILS = sentenceApi.market_data.current_price.ils;
        let sentence = sentenceApi.description.en.split('. ')[0] + '.';
        let fullSentence = sentenceApi.description.en;
        if (sentence === '.' || sentence ==='') {
            sentence = 'No description available.';
        }
        const readMoreButton = `<button class="btn btn-primary read-more" data-currency-id="${currencyId}">Read More</button>`;
        const htmlString = `Price in EUR: ${currencyPriceEUR.toLocaleString()} &#8364;&nbsp;&nbsp;<br />
        Price in ILS: ${currencyPriceILS.toLocaleString()} &#8362; <hr/> 
        ${sentence}${readMoreButton}`;
        $(`#collapse-${currencyId} .card-body`).html(htmlString);
        const modalfullsentence =
        `
            <div class="modal fade" id="currency-modal-${currencyId}" tabindex="-1" role="dialog" aria-labelledby="currency-modal-${currencyId}-label" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="currency-modal-${currencyId}-label">${currencieName} - Currency Description</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>${fullSentence}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('body').append(modalfullsentence);
        $(`#collapse-${currencyId} .card-body .read-more`).click(() => {
            $(`#currency-modal-${currencyId}`).modal('show');
            
        });
    }
}
const buildModal = (arrayOfCurrencies) => {
    var liveReportCardsHtml = arrayOfCurrencies.map(currency =>
        `
        <div class="card border-dark" id="card-${currency.id}">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                    <h5 class="card-title mr-3">${currency.name}</h5>
                    <img alt="${currency.name} icon" src="${currency.image}" width="50" height="50">
                </div>
                <div class="form-check form-switch" id>
                <input class="form-check-input" type="checkbox" id="${currency.id}" onclick="handleCheckboxClick(this, '${currency.id}')" ${liveReports.includes(currency.id) ? "checked" : ""}>Remove from live reports
                </div>         
                <p class="currency-symbol">${currency.symbol.toUpperCase()} </p>
                <p class="currency-price">$${currency.current_price.toLocaleString()}</p>
                <p class="currency-market-cap">Market Cap:<br> $${currency.market_cap.toLocaleString()}</p>  
                <button onclick="fetchCurrencySentence('${currency.id}')" id="button-${currency.id}" class="btn btn-primary btn-description" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${currency.id}" aria-expanded="false" aria-controls="collapse-${currency.id}">
                More Info
                </button>
                <div class="collapse" id="collapse-${currency.id}">
                    <div class="card card-body">
                    </div>
                </div>
            </div>
        </div>
        `
    ).join('');
    $('#myModal .modal-body').html(liveReportCardsHtml);
    $('#myModal').modal('show'); // Show the modal
}
const handleCheckboxClick = (e, id) => {
    if (e.checked) {
        if (liveReports.length < 5) {
            liveReports.push(id);
        } else {
            e.checked = false;
            var liveReportCards = top100Currencies.filter(currency => {
                return liveReports.includes(currency.id);
            });
            buildModal(liveReportCards);
        }
    } else {
        const index = liveReports.indexOf(id);
        if (index > -1) {
            liveReports.splice(index, 1);
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = false;
            }
        }
    }
    console.log(liveReports);
    getLiveReportObjects(liveReports)
}
const getLiveReportObjects = async (liveReports) => {
    // console.log(liveReports.length)
    if (liveReports.length) {
        const symbolList = top100Currencies.filter(currency => {
            return liveReports.includes(currency.id);
        }).map(currency => currency.symbol).join(",");
        const liveReportsData = await $.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolList}&tsyms=USD`);
        return liveReportsData;
    } else {
        return;
    }
}
$('.navbar button#home').click(function () {
    const rowToReplace = $('#row');
    rowToReplace.html(createCurrency(top100Currencies));
});
$('.navbar button#live').click(async function () {
    let rawData = await getLiveReportObjects(liveReports);
    console.log(rawData);
    let chartData = [];
    for (const coin in rawData) {
        console.log(coin, rawData[coin]);
        chartData.push({
            type: "spline",
            name: coin,
            showInLegend: true,
            xValueFormatString: "HH:mm:ss",
            yValueFormatString: "$ #,##0",
            dataPoints: [{ x: new Date(), y: rawData[coin]["USD"] }]
        });
    }
    const rowToReplace = $('#row');
    rowToReplace.html('<div class="col-md-12" id="chartContainer"></div>').fadeIn();
    if (chartData.length) {
        var options = {
            exportEnabled: true,
            animationEnabled: true,
            title:{
                text: "Crypto Currencies in USD"
            },
            subtitles: [{
                text: "Click Legend to Hide or Unhide Data Series"
            }],
            axisX: {
                title: "Minutes"
            },
            axisY: {
                title: "Coin Value",
                titleFontColor: "#4F81BC",
                lineColor: "#4F81BC",
                labelFontColor: "#4F81BC",
                tickColor: "#4F81BC"
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: chartData
        };
        const chart = new CanvasJS.Chart("chartContainer", options);
        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
        chart.render(); // Render the chart after initializing it
        // Update the chart every 2 seconds
        setInterval(async function() {
            let rawData = await getLiveReportObjects(liveReports);
            // console.log(rawData);
            for (const coin in rawData) {
                chartData.forEach(data => {
                    if (data.name === coin) {
                        data.dataPoints.push({ x: new Date(), y: rawData[coin]["USD"] });
                    }
                });
            }
            chart.render();
        }, 2000);
    } else {
        const modalHtml = `
            <div class="modal fade" id="live-reports-modal" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title">Live Reports Error</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                    <p>You must choose at least 1 currency to activate live reports.</p>
                    </div>
                </div>
                </div>
            </div>
            `;
            rowToReplace.html(createCurrency(top100Currencies));
            $('body').append(modalHtml);
            $('#live-reports-modal').modal('show');
    }
});
$('.navbar button#about').click(function () {
    const rowToReplace = $('#row');
    $('#row').hide();
    const aboutContent = `
            <div class="section-title">
                <h2>About the project</h2>
                <p>This project showcases various crypto currencies, each accompanied by its distinct information. Additionally, users can select a specific currency and view its live reports, which exhibit a real-time graph reflecting its price fluctuations. The live reports are updated every two seconds. Furthermore, users can sort the displayed coins based on various criteria, which are accessible through the Sort by options in the navigation bar.</p>
            </div>
            <div class="col-lg-4" data-aos="fade-right">
                <img src="img/img for cv.jpeg" class="img-fluid" alt="">
            </div>
            <div class="col-lg-8 pt-4 pt-lg-0 content" data-aos="fade-left">
                <h3>About</h3>
                <p>My name is Barak Meyouhas and I am a skilled web developer with experience in building responsive and user-friendly websites. My expertise includes front-end development using HTML, CSS, and JavaScript, as well as back-end development with Node.js and Express.</p>
                <h3>I am a Web Developer</h3>
                <p class="fst-italic">
                    Graduated from John Bryce College
                    Bring to the table Amazing Web Development skills, creativity, Work ethic and Passion for the profession.
                </p>
                <div class="row">
                    <div class="col-lg-6">
                        <ul>
                            <li><i class="bi bi-chevron-right"></i> <strong>Birthday:</strong> <span>25 February 1998</span></li>
                            <li><i class="bi bi-chevron-right"></i> <strong>Website:</strong> <span>www.barakm25.com</span></li>
                            <li><i class="bi bi-chevron-right"></i> <strong>Phone:</strong> <span>054 334 2645</span></li>
                            <li><i class="bi bi-chevron-right"></i> <strong>City:</strong> <span>Kfar Yona, ISR</span></li>
                        </ul>
                    </div>
                    <div class="col-lg-6">
                        <ul>
                            <li><i class="bi bi-chevron-right"></i> <strong>Age:</strong> <span>25</span></li>
                            <li><i class="bi bi-chevron-right"></i> <strong>Email:</strong> <span>barakm25@gmail.com</span></li>
                            <li><i class="bi bi-chevron-right"></i> <strong>Freelance:</strong> <span>Available</span></li>
                        </ul>
                    </div>
                </div>
                <p>
                    As a web developer, I am passionate about creating high-quality, functional websites that meet the needs of users. With an experience in both front-end and back-end development, I am proficient in a variety of programming languages and tools. I have a keen eye for design and strive to create visually appealing websites that are easy to navigate and use. Whether working independently or as part of a team, I am dedicated to delivering top-notch results that exceed client expectations.
                </p>
            </div>
        
    `;
    rowToReplace.html(aboutContent).fadeIn();
});




