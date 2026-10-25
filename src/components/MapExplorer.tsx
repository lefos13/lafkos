/*
 * The map is an island: the page remains useful as an accessible content list
 * when WebGL, network tiles, or geolocation are unavailable. Visitor position
 * is used only for a local camera move and is never persisted or transmitted.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addProtocol,
  Map as MapLibreMap,
  Marker as MapMarker,
  NavigationControl,
  Popup as MapLibrePopup,
  removeProtocol,
  setWorkerUrl,
  type GeoJSONSource,
  type MapMouseEvent,
  type PointLike,
  type StyleSpecification,
} from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
/* MapLibre 6 loads its tile worker from a separate ESM chunk and resolves it
 * with `new URL('./maplibre-gl-worker.mjs', import.meta.url)`. Rollup cannot
 * see that string, so the file is never emitted next to the hashed bundle and
 * the worker 404s in any built output — vector sources then never finish
 * loading and the map hangs on its spinner without raising an error. Importing
 * it through Vite's worker pipeline emits a real, self-contained asset. */
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(maplibreWorkerUrl);
import type {
  Category,
  Coordinate,
  MapData,
  MapFeature,
  MapFeatureProperties,
} from '../lib/content';
import type { Locale } from '../lib/locales';
import { parseMapState, serializeMapState, type MapState } from '../lib/map-state';
import {
  buildVisiblePointFeatures,
  CLUSTER_MAX_ZOOM,
  CLUSTER_RADIUS,
  POINT_FOCUS_ZOOM,
} from '../lib/map-points';
import { getCopy } from '../lib/ui-copy';
import { getGeometryBounds, haversineDistanceMeters } from '../lib/geometry';
import { escapeHtml } from '../lib/html';
import { buildSrcSet, getOptimizedImageUrl, IMAGE_PRESETS } from '../lib/images';

interface Props {
  locale: Locale;
  mapData: MapData;
  categories: Category[];
  initialState?: MapState;
  compact?: boolean;
}

type MapStatus = 'idle' | 'loading' | 'ready' | 'error';
const defaultCenter: [number, number] = [23.24665, 39.17795];
const LAFKOS_VILLAGE_CENTER: Coordinate = [23.24665, 39.17795];
const DISTANT_PLACE_THRESHOLD_METERS = 1200;
const defaultZoom = 13.6;
const mapStyleUrl =
  import.meta.env.PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';

function featureCollection(features: MapFeature[]) {
  return { type: 'FeatureCollection', features } as const;
}

function detailUrl(locale: Locale, properties: MapFeatureProperties) {
  const kind = properties.kind === 'place' ? 'places' : 'trails';
  return `/${locale}/${kind}/${properties.slug}/`;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function sanitizeFilter(expr: unknown): unknown {
  if (Array.isArray(expr)) {
    if (
      expr.length === 3 &&
      (expr[0] === '<=' || expr[0] === '<' || expr[0] === '>=' || expr[0] === '>')
    ) {
      const op = expr[0];
      const left = expr[1];
      const right = expr[2];
      if (
        Array.isArray(left) &&
        left.length === 2 &&
        left[0] === 'get' &&
        typeof right === 'number'
      ) {
        const fallback = op === '<=' || op === '<' ? 999999 : -999999;
        return [op, ['to-number', left, fallback], right];
      }
      if (
        typeof left === 'number' &&
        Array.isArray(right) &&
        right.length === 2 &&
        right[0] === 'get'
      ) {
        const fallback = op === '<=' || op === '<' ? -999999 : 999999;
        return [op, left, ['to-number', right, fallback]];
      }
    }
    return expr.map((item) => sanitizeFilter(item));
  }
  if (expr && typeof expr === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(expr)) {
      result[key] = sanitizeFilter(value);
    }
    return result;
  }
  return expr;
}

function isNativePoiOrLegacyPlaceLayer(layer: StyleSpecification['layers'][number]): boolean {
  const id = layer.id || '';
  const sourceLayer = (layer as { 'source-layer'?: string })['source-layer'] || '';
  if (sourceLayer === 'poi' || sourceLayer === 'poi_label' || sourceLayer === 'aerodrome_label')
    return true;
  if (id.startsWith('poi_') || id.includes('poi') || id === 'airport') return true;
  if (
    sourceLayer === 'place' &&
    (id === 'label_other' ||
      id.includes('neighbourhood') ||
      id.includes('suburb') ||
      id.includes('hamlet') ||
      id.includes('quarter'))
  )
    return true;
  return false;
}

function sanitizeStyle(style: StyleSpecification): StyleSpecification {
  if (!style || !Array.isArray(style.layers)) return style;
  return {
    ...style,
    layers: style.layers
      .filter((layer) => !isNativePoiOrLegacyPlaceLayer(layer))
      .map((layer) => {
        if (!('filter' in layer) || !layer.filter) return layer;
        return {
          ...layer,
          filter: sanitizeFilter(layer.filter) as never,
        };
      }),
  };
}

function buildPmtilesStyle(url: string): StyleSpecification {
  return sanitizeStyle({
    version: 8,
    glyphs: 'https://cdn.protomaps.com/fonts/{fontstack}/{range}.pbf',
    sources: { protomaps: { type: 'vector', url: `pmtiles://${url}` } },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#e8e3d8' } },
      {
        id: 'landuse',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'landuse',
        paint: { 'fill-color': '#dce1d4', 'fill-opacity': 0.75 },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'water',
        paint: { 'fill-color': '#b7d9d4' },
      },
      {
        id: 'roads',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        paint: {
          'line-color': '#c6b9a5',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.4, 15, 2],
        },
      },
      {
        id: 'buildings',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'buildings',
        paint: { 'fill-color': '#e4d8c8', 'fill-opacity': 0.75 },
      },
    ],
  });
}
function findNearbyMarker(
  screenPoint: { x: number; y: number },
  map: MapLibreMap,
  places: MapFeature[],
  waypoints: MapFeature[],
  categories: string[],
  isTrailVisible: boolean,
  visibleLeafKeys: ReadonlySet<string>,
): MapFeature | null {
  let bestMatch: MapFeature | null = null;
  let minDistance = Infinity;

  // 1. Check visible place markers
  const activePlaces = places.filter(
    (p) =>
      p.geometry.type === 'Point' &&
      visibleLeafKeys.has(p.properties.entityKey) &&
      (categories.length === 0 || categories.includes(p.properties.category)),
  );

  for (const place of activePlaces) {
    if (place.geometry.type !== 'Point') continue;
    const coords = place.geometry.coordinates;
    const pt = map.project(coords);
    const isDistant =
      haversineDistanceMeters(coords, LAFKOS_VILLAGE_CENTER) > DISTANT_PLACE_THRESHOLD_METERS;

    // Pin is bottom-anchored; height is 26px (distant) or 35px (village)
    const pinHeight = isDistant ? 26 : 35;
    const pinCenterY = pt.y - pinHeight / 2;

    const distCenter = Math.hypot(screenPoint.x - pt.x, screenPoint.y - pinCenterY);
    const distBase = Math.hypot(screenPoint.x - pt.x, screenPoint.y - pt.y);
    const dist = Math.min(distCenter, distBase);

    // Generous hit tolerance around place markers so clicking on/near a marker always focuses the place over overlapping route lines
    const threshold = isDistant ? 34 : 38;
    if (dist <= threshold && dist < minDistance) {
      minDistance = dist;
      bestMatch = place;
    }
  }

  // 2. Check visible waypoints (if trails are active)
  if (isTrailVisible) {
    for (const wp of waypoints) {
      if (wp.geometry.type !== 'Point' || !visibleLeafKeys.has(wp.properties.entityKey)) continue;
      const coords = wp.geometry.coordinates;
      const pt = map.project(coords);
      const dist = Math.hypot(screenPoint.x - pt.x, screenPoint.y - pt.y);
      const threshold = 26;
      if (dist <= threshold && dist < minDistance) {
        minDistance = dist;
        bestMatch = wp;
      }
    }
  }

  return bestMatch;
}

export default function MapExplorer({
  locale,
  mapData,
  categories,
  initialState,
  compact = false,
}: Props) {
  const ui = getCopy(locale);
  const containerRef = useRef<HTMLElement>(null);
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const markerCacheRef = useRef<Map<string, MapMarker>>(new Map());
  const visibleLeafKeysRef = useRef<Set<string>>(new Set());
  const popupRef = useRef<MapLibrePopup | null>(null);
  const stateRef = useRef<MapState>(initialState ?? { categories: [] });
  const mapDataRef = useRef<MapData>(mapData);
  const [status, setStatus] = useState<MapStatus>('idle');
  const [state, setState] = useState<MapState>(initialState ?? { categories: [] });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MapFeature | undefined>();
  const [popupTrigger, setPopupTrigger] = useState(0);
  const [locationState, setLocationState] = useState<'idle' | 'locating' | 'denied'>('idle');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isListHidden, setIsListHidden] = useState(false);
  const selectedRef = useRef<MapFeature | undefined>(selected);
  const popupCoordRef = useRef<Coordinate | undefined>(undefined);
  selectedRef.current = selected;
  stateRef.current = state;
  mapDataRef.current = mapData;

  const allFeatures = useMemo(() => [...mapData.places, ...mapData.trails], [mapData]);
  const trailVisible = state.categories.length === 0 || state.categories.includes('trail');
  const visibleFeatures = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale === 'el' ? 'el-GR' : 'en-GB');
    return allFeatures.filter((feature) => {
      const categoryMatch =
        state.categories.length === 0 || state.categories.includes(feature.properties.category);
      const textMatch =
        !query ||
        `${feature.properties.title} ${feature.properties.summary}`
          .toLocaleLowerCase()
          .includes(query);
      return categoryMatch && textMatch;
    });
  }, [allFeatures, locale, search, state.categories]);

  function writeState(next: MapState) {
    setState(next);
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${serializeMapState(next)}`,
      );
    }
  }

  function selectFeature(feature: MapFeature, scrollList = false, clickedCoord?: Coordinate) {
    setSelected(feature);
    popupCoordRef.current = clickedCoord;
    setPopupTrigger((prev) => prev + 1);
    const next = {
      ...state,
      place: feature.properties.kind === 'place' ? feature.properties.entityKey : undefined,
      trail: feature.properties.kind === 'trail' ? feature.properties.entityKey : undefined,
    };
    writeState(next);
    const motionDuration = prefersReducedMotion() ? 0 : 650;
    if (mapRef.current) {
      const map = mapRef.current;
      if (feature.geometry.type === 'Point') {
        map.flyTo({
          center: feature.geometry.coordinates,
          zoom: Math.max(map.getZoom(), POINT_FOCUS_ZOOM),
          duration: motionDuration,
        });
      } else {
        const bounds = getGeometryBounds(feature.geometry);
        if (bounds) {
          map.fitBounds(bounds, {
            padding: { top: 60, bottom: 60, left: 60, right: 60 },
            maxZoom: 15.5,
            duration: motionDuration,
          });
        } else {
          const coordinates =
            feature.geometry.type === 'LineString'
              ? feature.geometry.coordinates[Math.floor(feature.geometry.coordinates.length / 2)]
              : feature.geometry.coordinates[0][0];
          map.flyTo({
            center: coordinates,
            zoom: Math.max(map.getZoom(), 15),
            duration: motionDuration,
          });
        }
      }
    }
    if (scrollList && listRef.current) {
      const list = listRef.current;
      const itemElem = document.getElementById(`map-item-${feature.properties.entityKey}`);
      if (itemElem) {
        const itemTop = itemElem.offsetTop - list.offsetTop;
        const itemBottom = itemTop + itemElem.offsetHeight;
        const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
        if (itemTop < list.scrollTop) {
          list.scrollTo({ top: itemTop, behavior });
        } else if (itemBottom > list.scrollTop + list.clientHeight) {
          list.scrollTo({ top: itemBottom - list.clientHeight, behavior });
        }
      }
    }
  }
  function toggleFullscreen() {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        if (containerRef.current && document.fullscreenEnabled && !document.fullscreenElement) {
          containerRef.current.requestFullscreen?.().catch(() => {});
        }
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      }
      return next;
    });
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationState('denied');
      return;
    }
    setLocationState('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 16,
          duration: prefersReducedMotion() ? 0 : 850,
        });
        setLocationState('idle');
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8_000 },
    );
  }

  useEffect(() => {
    function handleFullscreenChange() {
      const isNative = Boolean(document.fullscreenElement);
      if (!isNative && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
        setIsFullscreen(false);
      }
    }

    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      mapRef.current?.resize();
    }, 60);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.resize();
    }, 60);
    return () => clearTimeout(timer);
  }, [isListHidden]);

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return undefined;
    setStatus('loading');
    const pmtilesUrl = import.meta.env.PUBLIC_MAP_PMTILES_URL;
    if (pmtilesUrl) {
      try {
        addProtocol('pmtiles', new Protocol().tile);
      } catch {
        // Protocol already registered
      }
    }
    const mapOptions = {
      container: mapElement.current,
      style: pmtilesUrl ? buildPmtilesStyle(pmtilesUrl) : mapStyleUrl,
      transformStyle: (
        _prev: StyleSpecification | undefined,
        next: StyleSpecification | undefined,
      ) => (next ? sanitizeStyle(next) : (next as unknown as StyleSpecification)),
      center: initialState?.view?.center ?? defaultCenter,
      zoom: initialState?.view?.zoom ?? defaultZoom,
      maxBounds: [
        [23.08, 39.04],
        [23.42, 39.32],
      ],
      cooperativeGestures: true,
    };
    const map = new MapLibreMap(mapOptions as never);
    /* The map is created while Astro/React is hydrating and the surrounding
     * grid may still be resolving its final height. Keep the WebGL canvas in
     * sync with that layout so it cannot remain at MapLibre's 300px fallback. */
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.resize()) : undefined;
    resizeObserver?.observe(mapElement.current);
    requestAnimationFrame(() => map.resize());
    setTimeout(() => map.resize(), 120);
    map.addControl(new NavigationControl({ showCompass: true }), 'top-right');
    const setupLayers = () => {
      if (!map.isStyleLoaded()) return;
      setStatus('ready');
      map.resize();

      // Remove any legacy native POI, transit, and micro-place layers
      const styleLayers = map.getStyle()?.layers || [];
      styleLayers.forEach((layer) => {
        if (isNativePoiOrLegacyPlaceLayer(layer as StyleSpecification['layers'][number])) {
          try {
            if (map.getLayer(layer.id)) map.removeLayer(layer.id);
          } catch {
            // Ignore
          }
        }
      });

      /* Keep every visible map point in one source so MapLibre can decide which
       * leaves remain individually interactive while the HTML layer follows it. */
      if (!map.getSource('lafkos-map-points')) {
        map.addSource('lafkos-map-points', {
          type: 'geojson',
          data: featureCollection(
            buildVisiblePointFeatures(mapDataRef.current, stateRef.current.categories),
          ) as never,
          cluster: true,
          clusterRadius: CLUSTER_RADIUS,
          clusterMaxZoom: CLUSTER_MAX_ZOOM,
          maxzoom: CLUSTER_MAX_ZOOM + 1,
        });
      }
      if (!map.getLayer('lafkos-map-points-loader')) {
        map.addLayer({
          id: 'lafkos-map-points-loader',
          type: 'circle',
          source: 'lafkos-map-points',
          paint: { 'circle-radius': 1, 'circle-opacity': 0 },
        });
      }
      if (!map.getSource('lafkos-trails')) {
        map.addSource('lafkos-trails', {
          type: 'geojson',
          data: featureCollection(mapData.trails) as never,
        });
      }
      if (!map.getLayer('lafkos-trails-casing')) {
        map.addLayer({
          id: 'lafkos-trails-casing',
          type: 'line',
          source: 'lafkos-trails',
          filter: ['==', ['get', 'routeType'], 'hiking'],
          paint: { 'line-color': '#f7f0df', 'line-width': 6, 'line-opacity': 0.88 },
        });
      }
      /* Keep drive and mixed routes visually subordinate to hiking routes and
       * place both solid layers below the hiking casing for clear hierarchy. */
      if (!map.getLayer('lafkos-drive-casing')) {
        map.addLayer(
          {
            id: 'lafkos-drive-casing',
            type: 'line',
            source: 'lafkos-trails',
            filter: ['in', ['get', 'routeType'], ['literal', ['drive', 'mixed']]],
            paint: { 'line-color': '#5b5548', 'line-width': 5, 'line-opacity': 0.85 },
          },
          'lafkos-trails-casing',
        );
      }
      if (!map.getLayer('lafkos-drive-line')) {
        map.addLayer(
          {
            id: 'lafkos-drive-line',
            type: 'line',
            source: 'lafkos-trails',
            filter: ['in', ['get', 'routeType'], ['literal', ['drive', 'mixed']]],
            paint: { 'line-color': '#8a7a5c', 'line-width': 2.5 },
          },
          'lafkos-trails-casing',
        );
      }
      if (!map.getLayer('lafkos-trails-line')) {
        map.addLayer({
          id: 'lafkos-trails-line',
          type: 'line',
          source: 'lafkos-trails',
          filter: ['==', ['get', 'routeType'], 'hiking'],
          paint: {
            'line-color': '#b9654a',
            'line-width': 3,
            'line-dasharray': [1, 1.5],
          },
        });
      }
      if (!map.getSource('lafkos-hovered-trail')) {
        map.addSource('lafkos-hovered-trail', {
          type: 'geojson',
          data: featureCollection([]) as never,
        });
      }
      if (!map.getLayer('lafkos-hovered-trail-glow')) {
        map.addLayer({
          id: 'lafkos-hovered-trail-glow',
          type: 'line',
          source: 'lafkos-hovered-trail',
          paint: {
            'line-color': '#ffffff',
            'line-width': 8,
            'line-opacity': 0.85,
          },
        });
      }
      if (!map.getLayer('lafkos-hovered-trail-line')) {
        map.addLayer({
          id: 'lafkos-hovered-trail-line',
          type: 'line',
          source: 'lafkos-hovered-trail',
          paint: {
            'line-color': '#2e7776',
            'line-width': 4,
            'line-opacity': 0.9,
          },
        });
      }
      if (!map.getSource('lafkos-selected-trail')) {
        map.addSource('lafkos-selected-trail', {
          type: 'geojson',
          data: featureCollection([]) as never,
        });
      }
      if (!map.getLayer('lafkos-selected-trail-glow')) {
        map.addLayer({
          id: 'lafkos-selected-trail-glow',
          type: 'line',
          source: 'lafkos-selected-trail',
          paint: {
            'line-color': '#ffffff',
            'line-width': 9,
            'line-opacity': 0.95,
          },
        });
      }
      if (!map.getLayer('lafkos-selected-trail-line')) {
        map.addLayer({
          id: 'lafkos-selected-trail-line',
          type: 'line',
          source: 'lafkos-selected-trail',
          paint: {
            'line-color': '#2e7776',
            'line-width': 5,
            'line-opacity': 1,
          },
        });
      }
      /* Wide invisible hit-target layer positioned at the top for effortless clicking and hover */
      if (!map.getLayer('lafkos-routes-hitbox')) {
        map.addLayer({
          id: 'lafkos-routes-hitbox',
          type: 'line',
          source: 'lafkos-trails',
          paint: {
            'line-color': '#000000',
            'line-opacity': 0.001,
            'line-width': 28,
          },
        });
      }
    };

    let fallbackApplied = false;
    map.on('error', (e) => {
      if (pmtilesUrl && !fallbackApplied) {
        fallbackApplied = true;
        console.warn('PMTiles archive unavailable, falling back to vector map style:', e);
        try {
          map.setStyle(mapStyleUrl);
        } catch {
          setStatus('error');
        }
        return;
      }
      /* Registering any error listener suppresses MapLibre's own console
       * reporting, so log here or map failures become invisible. */
      console.error('MapLibre error:', e.error ?? e);
    });

    map.on('style.load', setupLayers);
    map.once('load', () => {
      setupLayers();
      const ROUTE_INTERACTIVE_LAYERS = [
        'lafkos-routes-hitbox',
        'lafkos-trails-line',
        'lafkos-drive-line',
        'lafkos-trails-casing',
        'lafkos-drive-casing',
      ];

      const handleRouteEnter = (event: MapMouseEvent) => {
        const nearbyMarker = findNearbyMarker(
          event.point,
          map,
          mapDataRef.current.places,
          mapDataRef.current.waypoints,
          stateRef.current.categories,
          stateRef.current.categories.length === 0 || stateRef.current.categories.includes('trail'),
          visibleLeafKeysRef.current,
        );
        const hoveredSource = map.getSource('lafkos-hovered-trail') as GeoJSONSource | undefined;
        if (nearbyMarker) {
          if (hoveredSource) {
            hoveredSource.setData(featureCollection([]) as never);
          }
          map.getCanvas().style.cursor = 'pointer';
          return;
        }

        map.getCanvas().style.cursor = 'pointer';
        const feature = map.queryRenderedFeatures(event.point, {
          layers: ROUTE_INTERACTIVE_LAYERS,
        })[0];
        const entityKey = feature?.properties?.entityKey;
        if (!hoveredSource) return;
        if (entityKey && entityKey !== selectedRef.current?.properties.entityKey) {
          const match = mapDataRef.current.trails.find((t) => t.properties.entityKey === entityKey);
          if (match) {
            hoveredSource.setData(featureCollection([match]) as never);
            return;
          }
        }
        hoveredSource.setData(featureCollection([]) as never);
      };

      const handleRouteLeave = () => {
        map.getCanvas().style.cursor = '';
        const hoveredSource = map.getSource('lafkos-hovered-trail') as GeoJSONSource | undefined;
        if (hoveredSource) {
          hoveredSource.setData(featureCollection([]) as never);
        }
      };

      const handleRouteClick = (event: MapMouseEvent) => {
        // Priority: if click was near a place or waypoint marker, select the marker instead of the route
        const nearbyMarker = findNearbyMarker(
          event.point,
          map,
          mapDataRef.current.places,
          mapDataRef.current.waypoints,
          stateRef.current.categories,
          stateRef.current.categories.length === 0 || stateRef.current.categories.includes('trail'),
          visibleLeafKeysRef.current,
        );
        if (nearbyMarker) {
          if (nearbyMarker.properties.kind === 'place') {
            selectFeature(nearbyMarker, true);
          } else {
            setSelected(nearbyMarker);
          }
          return;
        }

        const buffer = 14;
        const bbox: [PointLike, PointLike] = [
          [event.point.x - buffer, event.point.y - buffer],
          [event.point.x + buffer, event.point.y + buffer],
        ];
        const features = map.queryRenderedFeatures(bbox, {
          layers: ROUTE_INTERACTIVE_LAYERS,
        });
        const feature = features[0];
        if (feature?.properties?.entityKey) {
          const match = mapDataRef.current.trails.find(
            (trail) => trail.properties.entityKey === feature.properties.entityKey,
          );
          if (match) {
            selectFeature(match, true, [event.lngLat.lng, event.lngLat.lat]);
          }
        }
      };

      const handleMapClick = (event: MapMouseEvent) => {
        const nearbyMarker = findNearbyMarker(
          event.point,
          map,
          mapDataRef.current.places,
          mapDataRef.current.waypoints,
          stateRef.current.categories,
          stateRef.current.categories.length === 0 || stateRef.current.categories.includes('trail'),
          visibleLeafKeysRef.current,
        );
        if (nearbyMarker) {
          if (nearbyMarker.properties.kind === 'place') {
            selectFeature(nearbyMarker, true);
          } else {
            setSelected(nearbyMarker);
          }
        }
      };

      ROUTE_INTERACTIVE_LAYERS.forEach((layerId) => {
        map.on('mouseenter', layerId, handleRouteEnter);
        map.on('mousemove', layerId, handleRouteEnter);
        map.on('mouseleave', layerId, handleRouteLeave);
        map.on('click', layerId, handleRouteClick);
      });
      map.on('click', handleMapClick);

      const targetTrailKey = stateRef.current?.trail ?? initialState?.trail;
      const targetPlaceKey = stateRef.current?.place ?? initialState?.place;
      const hasExplicitView = Boolean(stateRef.current?.view ?? initialState?.view);

      if (targetTrailKey && !hasExplicitView) {
        const targetTrail = mapDataRef.current.trails.find(
          (t) => t.properties.entityKey === targetTrailKey,
        );
        if (targetTrail) {
          const bounds = getGeometryBounds(targetTrail.geometry);
          if (bounds) {
            map.fitBounds(bounds, {
              padding: { top: 60, bottom: 60, left: 60, right: 60 },
              maxZoom: 15.5,
              duration: 0,
            });
          }
        }
      } else if (targetPlaceKey && !hasExplicitView) {
        const targetPlace = mapDataRef.current.places.find(
          (p) => p.properties.entityKey === targetPlaceKey,
        );
        if (targetPlace && targetPlace.geometry.type === 'Point') {
          map.setCenter(targetPlace.geometry.coordinates);
          map.setZoom(POINT_FOCUS_ZOOM);
        }
      }
      map.on('moveend', () => {
        const center = map.getCenter();
        writeState({
          ...stateRef.current,
          view: { center: [center.lng, center.lat], zoom: map.getZoom() },
        });
      });
    });
    mapRef.current = map;
    return () => {
      resizeObserver?.disconnect();
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      markerCacheRef.current.forEach((marker) => marker.remove());
      markerCacheRef.current.clear();
      visibleLeafKeysRef.current.clear();
      map.remove();
      mapRef.current = null;
      if (pmtilesUrl) {
        try {
          removeProtocol('pmtiles');
        } catch {
          // Protocol removal ignore
        }
      }
    };
  }, [initialState, mapData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    const pointsSource = map.getSource('lafkos-map-points') as GeoJSONSource | undefined;
    if (pointsSource) {
      pointsSource.setData(
        featureCollection(buildVisiblePointFeatures(mapData, state.categories)) as never,
      );
    }
    const trailsSource = map.getSource('lafkos-trails') as GeoJSONSource | undefined;
    if (trailsSource) {
      trailsSource.setData(featureCollection(trailVisible ? mapData.trails : []) as never);
    }
  }, [mapData, state.categories, status, trailVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    const selectedSource = map.getSource('lafkos-selected-trail') as GeoJSONSource | undefined;
    if (!selectedSource) return;
    if (selected && selected.properties.kind === 'trail') {
      selectedSource.setData(featureCollection([selected]) as never);
    } else {
      selectedSource.setData(featureCollection([]) as never);
    }
  }, [selected, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;
    const hoveredSource = map.getSource('lafkos-hovered-trail') as GeoJSONSource | undefined;
    if (hoveredSource) {
      hoveredSource.setData(featureCollection([]) as never);
    }
  }, [selected, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;

    interface MarkerLabelItem {
      key: string;
      coordinates: Coordinate;
      labelElem: HTMLElement;
      title: string;
      priority: number;
      isDistant: boolean;
    }

    const labelItems: MarkerLabelItem[] = [];
    if (!map.getSource('lafkos-map-points')) return;
    const featuresByKey = new Map<string, MapFeature>(
      [...mapData.places, ...mapData.waypoints].map(
        (feature) => [feature.properties.entityKey, feature] as [string, MapFeature],
      ),
    );

    /* Native clustering determines which leaves are on screen. HTML markers are
     * cached by stable source identity so render updates only add, move, or
     * remove the markers represented by the current source query. */
    const clusterSize = (count: number): 'small' | 'medium' | 'large' =>
      count < 10 ? 'small' : count < 50 ? 'medium' : 'large';

    let pendingFocusTransfer: (() => void) | null = null;

    function transferFocusAfterExpansion(center: Coordinate, expandedKey: string) {
      pendingFocusTransfer = null;
      requestAnimationFrame(() => {
        const activeMap = mapRef.current;
        if (!activeMap || activeMap !== map) return;
        const centerPoint = activeMap.project(center);
        let nearestElement: HTMLElement | null = null;
        let nearestDistance = Infinity;

        for (const [key, marker] of markerCacheRef.current) {
          if (key === expandedKey) continue;
          const point = activeMap.project(marker.getLngLat());
          const distance = Math.hypot(point.x - centerPoint.x, point.y - centerPoint.y);
          if (distance < nearestDistance) {
            nearestElement = marker.getElement();
            nearestDistance = distance;
          }
        }

        if (nearestElement) nearestElement.focus({ preventScroll: true });
        else activeMap.getCanvas().focus({ preventScroll: true });
      });
    }

    function updateLeafMarkerElement(
      markerButton: HTMLButtonElement,
      feature: MapFeature,
      category: Category | undefined,
      isSelected: boolean,
      isDistant: boolean,
    ): HTMLSpanElement {
      const isWaypoint = feature.properties.kind === 'waypoint';
      markerButton.classList.add('map-marker-btn');
      markerButton.classList.toggle('map-marker-btn--waypoint', isWaypoint);
      markerButton.classList.toggle('map-marker-btn--distant', !isWaypoint && isDistant);
      markerButton.classList.toggle('is-selected', isSelected);
      const accessibleLabel = isWaypoint
        ? `${feature.properties.title} — ${feature.properties.summary}`
        : feature.properties.title;
      if (markerButton.getAttribute('aria-label') !== accessibleLabel) {
        markerButton.setAttribute('aria-label', accessibleLabel);
      }

      let pinElem = markerButton.querySelector<HTMLSpanElement>('.map-marker');
      if (!pinElem) {
        pinElem = document.createElement('span');
        const iconElem = document.createElement('span');
        iconElem.setAttribute('aria-hidden', 'true');
        pinElem.appendChild(iconElem);
      }
      const pinClassName = `map-marker ${
        isWaypoint ? 'map-marker--waypoint' : isDistant ? 'map-marker--distant' : ''
      } ${isSelected ? 'is-selected' : ''}`;
      if (pinElem.className !== pinClassName) pinElem.className = pinClassName;
      pinElem.style.removeProperty('background-color');
      pinElem.style.removeProperty('--marker-bg');
      if (!isWaypoint && category?.color) {
        pinElem.style.setProperty('--marker-bg', category.color);
        if (!isSelected) pinElem.style.backgroundColor = category.color;
      }
      const iconElem = pinElem.firstElementChild as HTMLSpanElement;
      const icon = isWaypoint ? '●' : category?.icon || '✦';
      if (iconElem.textContent !== icon) iconElem.textContent = icon;

      let labelElem = markerButton.querySelector<HTMLSpanElement>('.map-marker-label');
      if (!labelElem) {
        labelElem = document.createElement('span');
        labelElem.setAttribute('aria-hidden', 'true');
      }
      const labelClassName = `map-marker-label ${
        isWaypoint ? 'map-marker-label--waypoint' : isDistant ? 'map-marker-label--distant' : ''
      } ${isSelected ? 'is-visible' : ''}`;
      if (labelElem.className !== labelClassName) labelElem.className = labelClassName;
      if (labelElem.textContent !== feature.properties.title) {
        labelElem.textContent = feature.properties.title;
      }
      if (pinElem.parentElement !== markerButton || labelElem.parentElement !== markerButton) {
        markerButton.replaceChildren(pinElem, labelElem);
      }
      return labelElem;
    }

    const syncMarkers = () => {
      labelItems.length = 0;
      if (!map.getSource('lafkos-map-points')) {
        markerCacheRef.current.forEach((marker) => marker.remove());
        markerCacheRef.current.clear();
        visibleLeafKeysRef.current.clear();
        return;
      }
      const sourceFeatures = map.querySourceFeatures('lafkos-map-points');
      const nextKeys = new Set<string>();
      const leafKeys = new Set<string>();
      const seenClusters = new Set<number>();
      const seenLeaves = new Set<string>();

      sourceFeatures.forEach((sourceFeature) => {
        const properties = sourceFeature.properties || {};
        const coordinates =
          sourceFeature.geometry.type === 'Point'
            ? (sourceFeature.geometry.coordinates as Coordinate)
            : undefined;
        if (!coordinates) return;
        if (properties.cluster) {
          const clusterId = Number(properties.cluster_id);
          if (!Number.isFinite(clusterId) || seenClusters.has(clusterId)) return;
          seenClusters.add(clusterId);
          const key = `cluster:${clusterId}`;
          nextKeys.add(key);
          const count = Number(properties.point_count) || 0;
          let marker = markerCacheRef.current.get(key);
          if (!marker) {
            const markerButton = document.createElement('button');
            markerButton.type = 'button';
            markerButton.className = 'map-cluster-btn';
            const countElem = document.createElement('span');
            countElem.className = 'map-cluster-count';
            markerButton.appendChild(countElem);
            const clusterMarker = new MapMarker({
              element: markerButton,
              anchor: 'center',
            }).setLngLat(coordinates);
            markerButton.addEventListener('click', (event) => {
              event.stopPropagation();
              const clusterSource = map.getSource('lafkos-map-points') as GeoJSONSource | undefined;
              if (!clusterSource) return;
              const center = clusterMarker.getLngLat().toArray() as Coordinate;
              void clusterSource
                .getClusterExpansionZoom(clusterId)
                .then((zoom) => {
                  if (mapRef.current !== map) return;
                  if (pendingFocusTransfer) map.off('moveend', pendingFocusTransfer);
                  pendingFocusTransfer = () => transferFocusAfterExpansion(center, key);
                  map.once('moveend', pendingFocusTransfer);
                  map.easeTo({
                    center,
                    zoom,
                    duration: prefersReducedMotion() ? 0 : 450,
                  });
                })
                .catch(() => {});
            });
            markerButton.addEventListener('mousedown', (event) => event.stopPropagation());
            markerButton.addEventListener('pointerdown', (event) => event.stopPropagation());
            markerButton.addEventListener('touchstart', (event) => event.stopPropagation());
            marker = clusterMarker.addTo(map);
            markerCacheRef.current.set(key, marker);
          }
          const button = marker.getElement() as HTMLButtonElement;
          button.dataset.size = clusterSize(count);
          button.setAttribute(
            'aria-label',
            locale === 'el'
              ? `Μεγέθυνση για προβολή ${count} σημείων`
              : `Zoom in to view ${count} points`,
          );
          const countElem = button.querySelector('.map-cluster-count');
          if (countElem) countElem.textContent = String(count);
          const currentPosition = marker.getLngLat();
          if (currentPosition.lng !== coordinates[0] || currentPosition.lat !== coordinates[1]) {
            marker.setLngLat(coordinates);
          }
          return;
        }

        const entityKey = String(properties.entityKey || '');
        const feature = featuresByKey.get(entityKey);
        if (!feature || feature.geometry.type !== 'Point' || seenLeaves.has(entityKey)) return;
        seenLeaves.add(entityKey);
        leafKeys.add(entityKey);
        nextKeys.add(`leaf:${entityKey}`);
        const leafCoordinates = feature.geometry.coordinates;
        const category = categories.find((cat) => cat.id === feature.properties.category);
        const isSelected = selectedRef.current?.properties.entityKey === entityKey;
        const isWaypoint = feature.properties.kind === 'waypoint';
        const isDistant =
          !isWaypoint &&
          haversineDistanceMeters(leafCoordinates, LAFKOS_VILLAGE_CENTER) >
            DISTANT_PLACE_THRESHOLD_METERS;
        let marker = markerCacheRef.current.get(`leaf:${entityKey}`);
        if (!marker) {
          const markerButton = document.createElement('button');
          markerButton.type = 'button';
          markerButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (feature.properties.kind === 'place') selectFeature(feature, true);
            else setSelected(feature);
          });
          const stopEvent = (event: Event) => event.stopPropagation();
          markerButton.addEventListener('mousedown', stopEvent);
          markerButton.addEventListener('pointerdown', stopEvent);
          markerButton.addEventListener('touchstart', stopEvent);
          marker = new MapMarker({
            element: markerButton,
            anchor: isWaypoint ? 'center' : 'bottom',
          })
            .setLngLat(leafCoordinates)
            .addTo(map);
          markerCacheRef.current.set(`leaf:${entityKey}`, marker);
        }
        const markerButton = marker.getElement() as HTMLButtonElement;
        const labelElem = updateLeafMarkerElement(
          markerButton,
          feature,
          category,
          isSelected,
          isDistant,
        );
        labelItems.push({
          key: entityKey,
          coordinates: leafCoordinates,
          labelElem: labelElem as HTMLElement,
          title: feature.properties.title,
          priority: isSelected ? 0 : isWaypoint ? 2 : 1,
          isDistant,
        });
      });

      visibleLeafKeysRef.current = leafKeys;
      markerCacheRef.current.forEach((marker, key) => {
        if (!nextKeys.has(key)) {
          marker.remove();
          markerCacheRef.current.delete(key);
        }
      });
      updateLabels();
    };

    const MIN_LABEL_ZOOM = 14.6;

    function updateLabels() {
      if (!map || mapRef.current !== map) return;
      const zoom = map.getZoom();
      const selectedKey = selectedRef.current?.properties.entityKey;
      const container = map.getContainer();
      const mapWidth = container.clientWidth || 800;
      const mapHeight = container.clientHeight || 600;

      if (zoom < MIN_LABEL_ZOOM) {
        labelItems.forEach((item) => {
          if (item.key === selectedKey) {
            item.labelElem.dataset.placement = 'bottom';
            item.labelElem.classList.add('is-visible');
          } else {
            item.labelElem.classList.remove('is-visible');
          }
        });
        return;
      }

      const sorted = [...labelItems].sort((a, b) => {
        if (a.key === selectedKey) return -1;
        if (b.key === selectedKey) return 1;
        return a.priority - b.priority;
      });

      // Pre-calculate screen points and pin footprints for all visible markers
      const itemPoints: {
        item: MarkerLabelItem;
        point: { x: number; y: number };
        pinBox: { x1: number; y1: number; x2: number; y2: number };
      }[] = [];
      const occupiedBoxes: { x1: number; y1: number; x2: number; y2: number; ownerKey?: string }[] =
        [];

      sorted.forEach((item) => {
        const point = map.project(item.coordinates);
        if (point.x < -60 || point.x > mapWidth + 60 || point.y < -60 || point.y > mapHeight + 60)
          return;

        const pinBox = {
          x1: point.x - (item.isDistant ? 14 : 18),
          y1: point.y - (item.isDistant ? 28 : 36),
          x2: point.x + (item.isDistant ? 14 : 18),
          y2: point.y,
          ownerKey: item.key,
        };
        itemPoints.push({ item, point, pinBox });
        occupiedBoxes.push(pinBox);
      });

      itemPoints.forEach(({ item, point }) => {
        const labelWidth = Math.min(180, Math.max(60, item.title.length * 6.8 + 20));
        const labelHeight = 22;
        const padX = 8;
        const padY = 6;

        const candidates: {
          placement: 'bottom' | 'top' | 'right' | 'left';
          box: { x1: number; y1: number; x2: number; y2: number; ownerKey?: string };
        }[] = [
          {
            placement: 'bottom',
            box: {
              x1: point.x - labelWidth / 2 - padX,
              y1: point.y + 3 - padY,
              x2: point.x + labelWidth / 2 + padX,
              y2: point.y + labelHeight + 3 + padY,
              ownerKey: item.key,
            },
          },
          {
            placement: 'top',
            box: {
              x1: point.x - labelWidth / 2 - padX,
              y1: point.y - 38 - labelHeight - padY,
              x2: point.x + labelWidth / 2 + padX,
              y2: point.y - 38 + padY,
              ownerKey: item.key,
            },
          },
          {
            placement: 'right',
            box: {
              x1: point.x + 18 - padX,
              y1: point.y - 28 - padY,
              x2: point.x + 18 + labelWidth + padX,
              y2: point.y - 28 + labelHeight + padY,
              ownerKey: item.key,
            },
          },
          {
            placement: 'left',
            box: {
              x1: point.x - 18 - labelWidth - padX,
              y1: point.y - 28 - padY,
              x2: point.x - 18 + padX,
              y2: point.y - 28 + labelHeight + padY,
              ownerKey: item.key,
            },
          },
        ];

        const chosen = candidates.find((cand) => {
          return !occupiedBoxes.some((occ) => {
            if (occ.ownerKey === item.key) return false;
            return !(
              cand.box.x2 < occ.x1 ||
              cand.box.x1 > occ.x2 ||
              cand.box.y2 < occ.y1 ||
              cand.box.y1 > occ.y2
            );
          });
        });

        if (chosen) {
          item.labelElem.dataset.placement = chosen.placement;
          item.labelElem.classList.add('is-visible');
          occupiedBoxes.push(chosen.box);
        } else {
          item.labelElem.classList.remove('is-visible');
        }
      });
    }

    /* MapLibre emits `render` for every animation frame. Reconciling cluster
     * leaves, HTML markers, and label collisions that often forces layout work
     * during pan and zoom, so coalesce updates to at most one every 100ms. */
    const SYNC_INTERVAL_MS = 100;
    let syncTimer: number | undefined;
    let lastSyncAt = 0;
    const syncMarkersThrottled = () => {
      if (syncTimer !== undefined) return;
      const elapsed = performance.now() - lastSyncAt;
      if (elapsed >= SYNC_INTERVAL_MS) {
        lastSyncAt = performance.now();
        syncMarkers();
        return;
      }
      syncTimer = window.setTimeout(() => {
        syncTimer = undefined;
        if (mapRef.current !== map) return;
        lastSyncAt = performance.now();
        syncMarkers();
      }, SYNC_INTERVAL_MS - elapsed);
    };

    map.on('render', syncMarkersThrottled);
    syncMarkers();

    return () => {
      if (pendingFocusTransfer) map.off('moveend', pendingFocusTransfer);
      window.clearTimeout(syncTimer);
      map.off('render', syncMarkersThrottled);
      markerCacheRef.current.forEach((marker) => marker.remove());
      markerCacheRef.current.clear();
      visibleLeafKeysRef.current.clear();
    };
  }, [
    categories,
    locale,
    mapData,
    selected?.properties.entityKey,
    state.categories,
    status,
    trailVisible,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.search) {
      const parsed = parseMapState(window.location.search);
      setState(parsed);
      stateRef.current = parsed;
      if (parsed.trail || parsed.place) {
        setPopupTrigger((prev) => prev + 1);
        if (mapRef.current && status === 'ready' && !parsed.view) {
          const map = mapRef.current;
          const targetKey = parsed.trail ?? parsed.place;
          const targetFeature = allFeatures.find((f) => f.properties.entityKey === targetKey);
          if (targetFeature) {
            if (targetFeature.geometry.type === 'Point') {
              map.setCenter(targetFeature.geometry.coordinates);
              map.setZoom(POINT_FOCUS_ZOOM);
            } else {
              const bounds = getGeometryBounds(targetFeature.geometry);
              if (bounds) {
                map.fitBounds(bounds, {
                  padding: { top: 60, bottom: 60, left: 60, right: 60 },
                  maxZoom: 15.5,
                  duration: 0,
                });
              }
            }
          }
        }
      }
    }
  }, [allFeatures, status]);

  useEffect(() => {
    const selectedKey = state.place ?? state.trail;
    setSelected(allFeatures.find((feature) => feature.properties.entityKey === selectedKey));
  }, [allFeatures, state.place, state.trail]);

  useEffect(() => {
    const map = mapRef.current;
    if (popupRef.current) {
      const oldPopup = popupRef.current;
      popupRef.current = null;
      oldPopup.remove();
    }
    if (!map || status !== 'ready' || !selected) return;
    const geometry = selected.geometry;
    let coordinates: Coordinate;
    if (popupCoordRef.current && selected.properties.kind === 'trail') {
      coordinates = popupCoordRef.current;
    } else if (geometry.type === 'Point') {
      coordinates = geometry.coordinates;
    } else if (geometry.type === 'LineString') {
      coordinates = geometry.coordinates[Math.floor(geometry.coordinates.length / 2)];
    } else {
      coordinates = geometry.coordinates[0][0];
    }
    const category = categories.find((c) => c.id === selected.properties.category);
    const link = detailUrl(locale, selected.properties);

    const thumbRaw = selected.properties.thumbnail;
    const thumbUrl = thumbRaw
      ? getOptimizedImageUrl(thumbRaw, IMAGE_PRESETS.mapThumbnail.defaultWidth)
      : '';
    const thumbSrcset = thumbRaw
      ? buildSrcSet(thumbRaw, IMAGE_PRESETS.mapThumbnail.widths)
      : undefined;

    const popupDiv = document.createElement('div');
    popupDiv.className = 'map-popover-content';
    const badgeLabel =
      selected.properties.kind === 'place'
        ? category?.label[locale] || ''
        : selected.properties.kind === 'trail'
          ? selected.properties.routeType === 'drive'
            ? locale === 'el'
              ? 'Οδική διαδρομή'
              : 'Drive route'
            : selected.properties.routeType === 'mixed'
              ? locale === 'el'
                ? 'Μικτή διαδρομή'
                : 'Drive & walk'
              : locale === 'el'
                ? 'Διαδρομή'
                : 'Trail'
          : locale === 'el'
            ? 'Στάση διαδρομής'
            : 'Trail stop';
    popupDiv.innerHTML = `
      ${
        thumbUrl
          ? `<div class="map-popover-media"><img src="${escapeHtml(thumbUrl)}"${thumbSrcset ? ` srcset="${escapeHtml(thumbSrcset)}" sizes="${escapeHtml(IMAGE_PRESETS.mapThumbnail.sizes)}"` : ''} alt="${escapeHtml(selected.properties.title)}" loading="lazy" decoding="async" /></div>`
          : ''
      }
      <div class="map-popover-body">
        <span class="map-popover-badge" style="background-color: ${escapeHtml(category?.color || '#b66c45')}">
          ${escapeHtml(badgeLabel)}
        </span>
        <h4 class="map-popover-title">${escapeHtml(selected.properties.title)}</h4>
        <p class="map-popover-summary">${escapeHtml(selected.properties.summary)}</p>
        <a class="map-popover-link" href="${escapeHtml(link)}" target="_blank" rel="noreferrer">
          <span>${locale === 'el' ? 'Περισσότερα' : 'Learn more'}</span>
          <span class="map-popover-arrow">↗</span>
        </a>
      </div>
    `;

    const popup = new MapLibrePopup({
      offset: 18,
      closeButton: true,
      closeOnClick: false,
      focusAfterOpen: false,
      maxWidth: '260px',
      className: 'map-popover-wrap',
    })
      .setLngLat(coordinates)
      .setDOMContent(popupDiv)
      .addTo(map);

    const onClose = () => {
      if (popupRef.current === popup) {
        popupRef.current = null;
        setSelected(undefined);
        writeState({ ...stateRef.current, place: undefined, trail: undefined });
      }
    };
    popup.on('close', onClose);

    popupRef.current = popup;
  }, [categories, locale, selected, status, popupTrigger]);

  return (
    <section
      ref={containerRef}
      className={`map-explorer ${compact ? 'map-explorer--compact' : ''} ${isFullscreen ? 'is-fullscreen' : ''}`}
      aria-label={ui.explore}
    >
      <div className="map-toolbar">
        <div className="map-search-wrap">
          <label className="sr-only" htmlFor="map-search">
            {ui.search}
          </label>
          <input
            id="map-search"
            className="map-search"
            type="search"
            placeholder={ui.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span aria-hidden="true">⌕</span>
        </div>
        <div className="map-toolbar-actions">
          <button
            className="location-button"
            type="button"
            onClick={requestLocation}
            disabled={locationState === 'locating'}
            aria-label={locationState === 'locating' ? ui.locating : ui.locate}
            title={locationState === 'locating' ? ui.locating : ui.locate}
          >
            <span className="btn-icon" aria-hidden="true">
              ⌖
            </span>
            <span className="btn-label">
              {locationState === 'locating' ? ui.locating : ui.locate}
            </span>
          </button>
          <button
            className={`fullscreen-button ${isFullscreen ? 'is-active' : ''}`}
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? ui.exitFullscreen : ui.fullscreen}
            aria-pressed={isFullscreen}
            title={isFullscreen ? ui.exitFullscreen : ui.fullscreen}
          >
            <span className="btn-icon" aria-hidden="true">
              {isFullscreen ? '✕' : '⛶'}
            </span>
            <span className="btn-label">{isFullscreen ? ui.exitFullscreen : ui.fullscreen}</span>
          </button>
        </div>
      </div>
      <div className="map-filter-row" aria-label={ui.categories}>
        <button
          className={`filter-chip ${state.categories.length === 0 ? 'is-active' : ''}`}
          type="button"
          onClick={() => writeState({ ...state, categories: [] })}
          aria-pressed={state.categories.length === 0}
        >
          {ui.all}
        </button>
        {categories.map((category) => (
          <button
            className={`filter-chip ${state.categories.includes(category.id) ? 'is-active' : ''}`}
            type="button"
            key={category.id}
            onClick={() =>
              writeState({
                ...state,
                categories: state.categories.includes(category.id)
                  ? state.categories.filter((id) => id !== category.id)
                  : [...state.categories, category.id],
              })
            }
            aria-pressed={state.categories.includes(category.id)}
          >
            <span aria-hidden="true">{category.icon}</span> {category.label[locale]}
          </button>
        ))}
      </div>
      <div className="map-grid">
        <div className="map-canvas-wrap">
          <div className="map-canvas" ref={mapElement} aria-label={ui.explore} />
          {status === 'loading' && (
            <div className="map-status" role="status">
              <span className="map-loader" /> {locale === 'el' ? 'Φόρτωση χάρτη…' : 'Loading map…'}
            </div>
          )}
          {status === 'error' && (
            <div className="map-status map-status--error" role="status">
              {ui.mapFallback}
            </div>
          )}
          {locationState === 'denied' && (
            <div className="map-location-note" role="status">
              {ui.locateDenied}
            </div>
          )}
          <div className="map-credit">© OpenStreetMap contributors · MapLibre</div>
        </div>
        <aside
          className={`map-results ${isListHidden ? 'is-collapsed' : ''}`}
          aria-label={locale === 'el' ? 'Αποτελέσματα χάρτη' : 'Map results'}
        >
          <div className="map-results-head">
            <span>
              {visibleFeatures.length}{' '}
              {visibleFeatures.length === 1 ? ui.mapFeatureSingular : ui.mapFeaturePlural}
            </span>
            <div className="map-results-actions">
              <span className="map-hint">{ui.mapHint}</span>
              <button
                className="list-toggle-button"
                type="button"
                onClick={() => setIsListHidden((prev) => !prev)}
                aria-label={isListHidden ? ui.showList : ui.hideList}
                aria-expanded={!isListHidden}
                aria-controls="map-result-list"
                title={isListHidden ? ui.showList : ui.hideList}
              >
                <span aria-hidden="true">{isListHidden ? '▼' : '▲'}</span>
              </button>
            </div>
          </div>
          <div className="map-result-list" id="map-result-list" ref={listRef}>
            {visibleFeatures.map((feature) => {
              const active = selected?.properties.entityKey === feature.properties.entityKey;
              const category = categories.find((item) => item.id === feature.properties.category);
              return (
                <article
                  id={`map-item-${feature.properties.entityKey}`}
                  className={`map-result ${active ? 'is-active' : ''}`}
                  key={feature.properties.entityKey}
                >
                  <button
                    type="button"
                    className="map-result-button"
                    onClick={() => selectFeature(feature)}
                  >
                    <span className="map-result-icon" style={{ backgroundColor: category?.color }}>
                      {feature.properties.kind === 'trail' ? '⌁' : category?.icon}
                    </span>
                    <span>
                      <strong>{feature.properties.title}</strong>
                      <small>{feature.properties.summary}</small>
                    </span>
                  </button>
                  <a
                    className="map-result-link"
                    href={detailUrl(locale, feature.properties)}
                    aria-label={`${feature.properties.title} — ${locale === 'el' ? 'περισσότερα' : 'more'}`}
                  >
                    ↗
                  </a>
                </article>
              );
            })}
            {visibleFeatures.length === 0 && (
              <p className="map-empty">
                {locale === 'el' ? 'Δεν βρέθηκαν σημεία.' : 'No features found.'}
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
