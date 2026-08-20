/*
 * The map is an island: the page remains useful as an accessible content list
 * when WebGL, network tiles, or geolocation are unavailable. Visitor position
 * is used only for a local camera move and is never persisted or transmitted.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { addProtocol, Map as MapLibreMap, Marker as MapMarker, NavigationControl, removeProtocol, type MapMouseEvent } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Category, MapData, MapFeature, MapFeatureProperties } from '../lib/content';
import type { Locale } from '../lib/locales';
import { parseMapState, serializeMapState, type MapState } from '../lib/map-state';
import { getCopy } from '../lib/ui-copy';

interface Props {
  locale: Locale;
  mapData: MapData;
  categories: Category[];
  initialState?: MapState;
  compact?: boolean;
}

type MapStatus = 'idle' | 'loading' | 'ready' | 'error';
const defaultCenter: [number, number] = [23.24665, 39.17795];
const defaultZoom = 13.6;
const mapStyleUrl = import.meta.env.PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';

function featureCollection(features: MapFeature[]) {
  return { type: 'FeatureCollection', features } as const;
}

function detailUrl(locale: Locale, properties: MapFeatureProperties) {
  const kind = properties.kind === 'place' ? 'places' : 'trails';
  return `/${locale}/${kind}/${properties.slug}`;
}

function buildPmtilesStyle(url: string) {
  return {
    version: 8,
    glyphs: 'https://cdn.protomaps.com/fonts/{fontstack}/{range}.pbf',
    sources: { protomaps: { type: 'vector', url: `pmtiles://${url}` } },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#e8e3d8' } },
      { id: 'landuse', type: 'fill', source: 'protomaps', 'source-layer': 'landuse', paint: { 'fill-color': '#dce1d4', 'fill-opacity': 0.75 } },
      { id: 'water', type: 'fill', source: 'protomaps', 'source-layer': 'water', paint: { 'fill-color': '#b7d9d4' } },
      { id: 'roads', type: 'line', source: 'protomaps', 'source-layer': 'roads', paint: { 'line-color': '#c6b9a5', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.4, 15, 2] } },
      { id: 'buildings', type: 'fill', source: 'protomaps', 'source-layer': 'buildings', paint: { 'fill-color': '#e4d8c8', 'fill-opacity': 0.75 } },
      { id: 'places', type: 'symbol', source: 'protomaps', 'source-layer': 'places', layout: { 'text-field': ['get', 'name'], 'text-size': 12 }, paint: { 'text-color': '#40534e', 'text-halo-color': '#f4efe4', 'text-halo-width': 1 } },
    ],
  };
}

export default function MapExplorer({ locale, mapData, categories, initialState, compact = false }: Props) {
  const ui = getCopy(locale);
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRefs = useRef<MapMarker[]>([]);
  const stateRef = useRef<MapState>(initialState ?? { categories: [] });
  const [status, setStatus] = useState<MapStatus>('idle');
  const [state, setState] = useState<MapState>(initialState ?? { categories: [] });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MapFeature | undefined>();
  const [locationState, setLocationState] = useState<'idle' | 'locating' | 'denied'>('idle');
  stateRef.current = state;

  const allFeatures = useMemo(() => [...mapData.places, ...mapData.trails], [mapData]);
  const visibleFeatures = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale === 'el' ? 'el-GR' : 'en-GB');
    return allFeatures.filter((feature) => {
      const categoryMatch = state.categories.length === 0 || state.categories.includes(feature.properties.category);
      const textMatch = !query || `${feature.properties.title} ${feature.properties.summary}`.toLocaleLowerCase().includes(query);
      return categoryMatch && textMatch;
    });
  }, [allFeatures, locale, search, state.categories]);

  function writeState(next: MapState) {
    setState(next);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}${serializeMapState(next)}`);
    }
  }

  function selectFeature(feature: MapFeature) {
    setSelected(feature);
    const next = { ...state, place: feature.properties.kind === 'place' ? feature.properties.entityKey : undefined, trail: feature.properties.kind === 'trail' ? feature.properties.entityKey : undefined };
    writeState(next);
    if (mapRef.current) {
      const geometry = feature.geometry;
      const coordinates = geometry.type === 'Point' ? geometry.coordinates : geometry.type === 'LineString' ? geometry.coordinates[0] : geometry.coordinates[0][0];
      mapRef.current.flyTo({ center: coordinates, zoom: Math.max(mapRef.current.getZoom(), 15), duration: 650 });
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationState('denied');
      return;
    }
    setLocationState('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 16, duration: 850 });
        setLocationState('idle');
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8_000 },
    );
  }

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return undefined;
    setStatus('loading');
    const pmtilesUrl = import.meta.env.PUBLIC_MAP_PMTILES_URL;
    if (pmtilesUrl) addProtocol('pmtiles', new Protocol().tile);
    const map = new MapLibreMap({
      container: mapElement.current,
      style: pmtilesUrl ? buildPmtilesStyle(pmtilesUrl) : mapStyleUrl,
      center: initialState?.view?.center ?? defaultCenter,
      zoom: initialState?.view?.zoom ?? defaultZoom,
      maxBounds: [[23.08, 39.04], [23.42, 39.32]],
      cooperativeGestures: true,
    });
    // The map canvas and controls are usable while remote style tiles stream in.
    // Keeping the content list interactive avoids an indefinite loading veil.
    setStatus('ready');
    /* The map is created while Astro/React is hydrating and the surrounding
     * grid may still be resolving its final height. Keep the WebGL canvas in
     * sync with that layout so it cannot remain at MapLibre's 300px fallback. */
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.resize()) : undefined;
    resizeObserver?.observe(mapElement.current);
    requestAnimationFrame(() => map.resize());
    map.addControl(new NavigationControl({ showCompass: true }), 'top-right');
    map.on('error', () => setStatus('error'));
    map.once('load', () => {
      setStatus('ready');
      map.addSource('lafkos-places', { type: 'geojson', data: featureCollection(mapData.places) as never });
      map.addSource('lafkos-trails', { type: 'geojson', data: featureCollection(mapData.trails) as never });
      map.addLayer({ id: 'lafkos-trails-casing', type: 'line', source: 'lafkos-trails', paint: { 'line-color': '#f7f0df', 'line-width': 6, 'line-opacity': 0.88 } });
      map.addLayer({ id: 'lafkos-trails-line', type: 'line', source: 'lafkos-trails', paint: { 'line-color': '#b9654a', 'line-width': 3, 'line-dasharray': [1, 1.5] } });
      map.addLayer({ id: 'lafkos-place-fill', type: 'fill', source: 'lafkos-places', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': '#d1a758', 'fill-opacity': 0.22, 'fill-outline-color': '#b9654a' } });
      map.on('click', 'lafkos-trails-line', (event: MapMouseEvent) => {
        const feature = map.queryRenderedFeatures(event.point, { layers: ['lafkos-trails-line'] })[0];
        const match = mapData.trails.find((trail) => trail.properties.entityKey === feature?.properties?.entityKey);
        if (match) selectFeature(match);
      });
      map.on('click', 'lafkos-place-fill', (event: MapMouseEvent) => {
        const feature = map.queryRenderedFeatures(event.point, { layers: ['lafkos-place-fill'] })[0];
        const match = mapData.places.find((place) => place.properties.entityKey === feature?.properties?.entityKey);
        if (match) selectFeature(match);
      });
      map.on('moveend', () => {
        const center = map.getCenter();
        writeState({ ...stateRef.current, view: { center: [center.lng, center.lat], zoom: map.getZoom() } });
      });
    });
    mapRef.current = map;
    return () => {
      resizeObserver?.disconnect();
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
      if (pmtilesUrl) removeProtocol('pmtiles');
    };
  }, [initialState, mapData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];
    mapData.places.filter((feature) => feature.geometry.type === 'Point').forEach((feature) => {
      if (state.categories.length > 0 && !state.categories.includes(feature.properties.category)) return;
      const markerButton = document.createElement('button');
      markerButton.type = 'button';
      markerButton.className = `map-marker ${selected?.properties.entityKey === feature.properties.entityKey ? 'is-selected' : ''}`;
      markerButton.setAttribute('aria-label', feature.properties.title);
      markerButton.innerHTML = '<span aria-hidden="true">✦</span>';
      markerButton.addEventListener('click', () => selectFeature(feature));
      const coordinates = feature.geometry.type === 'Point' ? feature.geometry.coordinates : defaultCenter;
      markerRefs.current.push(new MapMarker({ element: markerButton, anchor: 'bottom' }).setLngLat(coordinates).addTo(map));
    });
  }, [mapData.places, selected?.properties.entityKey, state.categories, status]);

  useEffect(() => {
    if (typeof window === 'undefined' || initialState) return;
    setState(parseMapState(window.location.search));
  }, [initialState]);

  useEffect(() => {
    const selectedKey = state.place ?? state.trail;
    setSelected(allFeatures.find((feature) => feature.properties.entityKey === selectedKey));
  }, [allFeatures, state.place, state.trail]);

  return (
    <section className={`map-explorer ${compact ? 'map-explorer--compact' : ''}`} aria-label={ui.explore}>
      <div className="map-toolbar">
        <div className="map-search-wrap">
          <label className="sr-only" htmlFor="map-search">{ui.search}</label>
          <input id="map-search" className="map-search" type="search" placeholder={ui.search} value={search} onChange={(event) => setSearch(event.target.value)} />
          <span aria-hidden="true">⌕</span>
        </div>
        <button className="location-button" type="button" onClick={requestLocation} disabled={locationState === 'locating'}>
          <span aria-hidden="true">⌖</span> {locationState === 'locating' ? ui.locating : ui.locate}
        </button>
      </div>
      <div className="map-filter-row" aria-label={ui.categories}>
        <button className={`filter-chip ${state.categories.length === 0 ? 'is-active' : ''}`} type="button" onClick={() => writeState({ ...state, categories: [] })}>{ui.all}</button>
        {categories.map((category) => (
          <button className={`filter-chip ${state.categories.includes(category.id) ? 'is-active' : ''}`} type="button" key={category.id} onClick={() => writeState({ ...state, categories: state.categories.includes(category.id) ? state.categories.filter((id) => id !== category.id) : [...state.categories, category.id] })}>
            <span aria-hidden="true">{category.icon}</span> {category.label[locale]}
          </button>
        ))}
      </div>
      <div className="map-grid">
        <div className="map-canvas-wrap">
          <div className="map-canvas" ref={mapElement} aria-label={ui.explore} />
          {status === 'loading' && <div className="map-status" role="status"><span className="map-loader" /> {locale === 'el' ? 'Φόρτωση χάρτη…' : 'Loading map…'}</div>}
          {status === 'error' && <div className="map-status map-status--error" role="status">{ui.mapFallback}</div>}
          {locationState === 'denied' && <div className="map-location-note" role="status">{ui.locateDenied}</div>}
          <div className="map-credit">© OpenStreetMap contributors · MapLibre</div>
        </div>
        <aside className="map-results" aria-label={locale === 'el' ? 'Αποτελέσματα χάρτη' : 'Map results'}>
          <div className="map-results-head"><span>{visibleFeatures.length} {locale === 'el' ? 'σημεία' : 'features'}</span><span className="map-hint">{ui.mapHint}</span></div>
          <div className="map-result-list">
            {visibleFeatures.map((feature) => {
              const active = selected?.properties.entityKey === feature.properties.entityKey;
              const category = categories.find((item) => item.id === feature.properties.category);
              return <article className={`map-result ${active ? 'is-active' : ''}`} key={feature.properties.entityKey}>
                <button type="button" className="map-result-button" onClick={() => selectFeature(feature)}>
                  <span className="map-result-icon" style={{ backgroundColor: category?.color }}>{feature.properties.kind === 'trail' ? '⌁' : category?.icon}</span>
                  <span><strong>{feature.properties.title}</strong><small>{feature.properties.summary}</small></span>
                </button>
                <a className="map-result-link" href={detailUrl(locale, feature.properties)} aria-label={`${feature.properties.title} — ${locale === 'el' ? 'περισσότερα' : 'more'}`}>↗</a>
              </article>;
            })}
            {visibleFeatures.length === 0 && <p className="map-empty">{locale === 'el' ? 'Δεν βρέθηκαν σημεία.' : 'No features found.'}</p>}
          </div>
          {selected && <div className="map-selected-card"><p className="eyebrow">{selected.properties.kind === 'trail' ? ui.trailsOnly : ui.places}</p><h3>{selected.properties.title}</h3><p>{selected.properties.summary}</p><a className="button button-primary" href={detailUrl(locale, selected.properties)}>{locale === 'el' ? 'Άνοιξε τη σελίδα' : 'Open detail'}</a></div>}
        </aside>
      </div>
    </section>
  );
}
