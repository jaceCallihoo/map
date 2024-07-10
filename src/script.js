// call once
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

// call every time?
// Or not?
// const PMTILES_URL = 'https://test-bucket-jace.s3.us-east-2.amazonaws.com/lightning/1.pmtiles'
const p = new pmtiles.PMTiles('https://test-bucket-jace.s3.us-east-2.amazonaws.com/lightning/1.pmtiles')
p.getMetadata().then((data) => {
    console.log(data)
    let amplitudes = data.tilestats.layers[0].attributes[2].values
    console.log(amplitudes)
    amplitudes = amplitudes.map((a) => parseInt(a))
    amplitudes = amplitudes.sort((a, b) => a - b)
    console.log(amplitudes)
    const timelineSlider = document.getElementById('timeline-slider')
    timelineSlider.min = amplitudes[0]
    timelineSlider.max = amplitudes[amplitudes.length - 1]
    timelineSlider.addEventListener('input', () => {
        console.log(timelineSlider.value)
        map.setFilter('points', ['==', ['get', 'amplitude'], timelineSlider.value])
    })

    
})
// protocol.add(p)



const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://demotiles.maplibre.org/style.json', // style URL
    center: [0, 0], // starting position [lng, lat]
    zoom: 1 // starting zoom
});

function a() {
    setTimeout(() => {
        const add = 'incidents';
        map.removeLayer('points')
        map.removeSource('pm')
        addPMSource(add)
        addPMLayer(add)
        b()
    }, 2000)
}

function b() {
    setTimeout(() => {
        const add = 'lightning';
        map.removeLayer('points')
        map.removeSource('pm')
        addPMSource(add)
        addPMLayer(add)
        a()
    }, 2000)
}

map.on('load', async () => {
    await loadMapAssets();

    addHighwaySource();
    addHighwayLayer();

    // const layer = 'lightning';
    const layer = 'lightning';
    addPMSource(layer);
    addPMLayer(layer);

    /*
    setTimeout(() => {
        map.setFilter('points', ['all', ['>=', ['get', 'amplitude'], "-5"], ['<=', ['get', 'amplitude'], "5"]])
    }, 2000) 
    */

    console.log(map.getStyle().layers)



    map.on('sourcedata', (e) => {
        if (e.sourceId === 'pm') {
            // console.log('pm has event')
            // console.log(e)
            if (e.isSourceLoaded) {
                // console.log('pm is loaded')
                const x = map.querySourceFeatures('pm', {
                    // sourceLayer: 'points'
                    sourceLayer: 'lightningstokes'
                })
                // console.log(x)
            }
        }
    })
})

async function loadMapAssets() {
    const image = await map.loadImage('https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_11-64.png');
    map.addImage('lightning-image', image.data);
}

function addHighwaySource() {
    map.addSource("highway_source", {
        type: 'vector',
        // url: 'https://maps-vector.pelmorex.com/data/highwayconditions.json',
        tiles: ['https://maps-vector.tech.pelmorex.com/data/highwayconditions/{z}/{x}/{y}.pbf']
    });
}

function addHighwayLayer() {
    map.addLayer({
        id: 'dry',
        type: 'line',
        source: 'highway_source',
        'source-layer': 'BD',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#ff69b4',
            'line-width': 1,
        },
    })
}

function addPMSource(layer) {
    const sourceFile = {
        lightning: 1,
        incidents: 2,
    }[layer];
    console.assert(sourceFile)

    map.addSource("pm", {
        type: 'vector',
        url: `pmtiles://https://test-bucket-jace.s3.us-east-2.amazonaws.com/lightning/${sourceFile}.pmtiles`
    })
}

function addPMLayer(layer) {
    const sourceLayer = {
        lightning: 'lightningstokes',
        incidents: 'incidents',
    }[layer];
    console.assert(sourceLayer)

    map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source-layer': sourceLayer,
        'source': 'pm',
        'layout': {
            'icon-image': 'lightning-image',
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 0.6],
            'text-anchor': 'top',
            'icon-size': 0.5,
        },
        'paint': {
            'icon-opacity': 1,
            'icon-opacity-transition': {
                'duration': 0,
                // 'delay': 5000
            }
        }
    });
}

map.on('error', (e) => { 
    console.log(e)
})

