
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
const PMTILES_URL = 'https://test-bucket-jace.s3.us-east-2.amazonaws.com/lightning/1.pmtiles'
const p = new pmtiles.PMTiles(PMTILES_URL)
protocol.add(p)

const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://demotiles.maplibre.org/style.json', // style URL
    center: [0, 0], // starting position [lng, lat]
    zoom: 1 // starting zoom
});


map.on('load', async () => {

    await loadMapAssets();

    addHighwaySource();
    addHighwayLayer();

    addLightningSource();
    addLightningLayer();

    console.log(map.getStyle().layers)
})

async function loadMapAssets() {
    const image = await map.loadImage('https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png');
    map.addImage('lightning-image', image.data);
}

function addHighwaySource() {
    map.addSource({
        type: 'vector',
        // url: 'https://maps-vector.pelmorex.com/data/highwayconditions.json',
        tiles: ['https://maps-vector.tech.pelmorex.com/data/highwayconditions/{z}/{x}/{y}.pbf']
    });
}

function addHighwayLayer() {
    map.addLayer({
        id: 'dry',
        type: 'line',
        source: 'HWY_HC',
        'source-layer': 'BD',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#ff69b4',
            'line-width': 1
        },
    })
}

function addLightningSource() {
    map.addSource("pm", {
        type: 'vector',
        url: `pmtiles://${PMTILES_URL}`
    })
}

function addLightningLayer() {
    map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source-layer': 'lightningstokes',
        'source': 'pm',
        'layout': {
            'icon-image': 'lightning-image',
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 0.6],
            'text-anchor': 'top',
            'icon-size': 0.1
        }
    });
}

map.on('error', (e) => { 
    console.log(e)
})

