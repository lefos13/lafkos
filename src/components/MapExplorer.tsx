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
  type GeoJSONSource,
  type MapMouseEvent,
  type StyleSpecification,
} from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import type {
  Category,
  Coordinate,
  MapData,
  MapFeature,
  MapFeatureProperties,
} from '../lib/content';
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
const mapStyleUrl =
  import.meta.env.PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';

function featureCollection(features: MapFeature[]) {
  return { type: 'FeatureCollection', features } as const;
}

function detailUrl(locale: Locale, properties: MapFeatureProperties) {
  const kind = properties.kind === 'place' ? 'places' : 'trails';
  return `/${locale}/${kind}/${properties.slug}`;
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
  const markerRefs = useRef<MapMarker[]>([]);
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

  function selectFeature(feature: MapFeature, scrollList = false) {
    setSelected(feature);
    setPopupTrigger((prev) => prev + 1);
    const next = {
      ...state,
      place: feature.properties.kind === 'place' ? feature.properties.entityKey : undefined,
      trail: feature.properties.kind === 'trail' ? feature.properties.entityKey : undefined,
    };
    writeState(next);
    if (mapRef.current) {
      const geometry = feature.geometry;
      const coordinates =
        geometry.type === 'Point'
          ? geometry.coordinates
          : geometry.type === 'LineString'
            ? geometry.coordinates[Math.floor(geometry.coordinates.length / 2)]
            : geometry.coordinates[0][0];
      mapRef.current.flyTo({
        center: coordinates,
        zoom: Math.max(mapRef.current.getZoom(), 15),
        duration: 650,
      });
    }
    if (scrollList && listRef.current) {
      const list = listRef.current;
      const itemElem = document.getElementById(`map-item-${feature.properties.entityKey}`);
      if (itemElem) {
        const itemTop = itemElem.offsetTop - list.offsetTop;
        const itemBottom = itemTop + itemElem.offsetHeight;
        if (itemTop < list.scrollTop) {
          list.scrollTo({ top: itemTop, behavior: 'smooth' });
        } else if (itemBottom > list.scrollTop + list.clientHeight) {
          list.scrollTo({ top: itemBottom - list.clientHeight, behavior: 'smooth' });
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
          duration: 850,
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

      if (!map.getSource('lafkos-places')) {
        map.addSource('lafkos-places', {
          type: 'geojson',
          data: featureCollection(mapData.places) as never,
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
          paint: { 'line-color': '#f7f0df', 'line-width': 6, 'line-opacity': 0.88 },
        });
      }
      if (!map.getLayer('lafkos-trails-line')) {
        map.addLayer({
          id: 'lafkos-trails-line',
          type: 'line',
          source: 'lafkos-trails',
          paint: {
            'line-color': '#b9654a',
            'line-width': 3,
            'line-dasharray': [1, 1.5],
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
      }
    });

    map.on('style.load', setupLayers);
    map.once('load', () => {
      setupLayers();
      map.on('click', 'lafkos-trails-line', (event: MapMouseEvent) => {
        const feature = map.queryRenderedFeatures(event.point, {
          layers: ['lafkos-trails-line'],
        })[0];
        const match = mapDataRef.current.trails.find(
          (trail) => trail.properties.entityKey === feature?.properties?.entityKey,
        );
        if (match) selectFeature(match, true);
      });
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
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
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
    const placesSource = map.getSource('lafkos-places') as GeoJSONSource | undefined;
    if (placesSource) placesSource.setData(featureCollection(mapData.places) as never);
    const trailsSource = map.getSource('lafkos-trails') as GeoJSONSource | undefined;
    if (trailsSource) trailsSource.setData(featureCollection(mapData.trails) as never);
  }, [mapData, status]);

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
    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    interface MarkerLabelItem {
      key: string;
      coordinates: Coordinate;
      labelElem: HTMLElement;
      title: string;
      priority: number;
    }

    const labelItems: MarkerLabelItem[] = [];

    mapData.places
      .filter((feature) => feature.geometry.type === 'Point')
      .forEach((feature) => {
        if (state.categories.length > 0 && !state.categories.includes(feature.properties.category))
          return;
        const category = categories.find((cat) => cat.id === feature.properties.category);
        const isSelected = selected?.properties.entityKey === feature.properties.entityKey;

        const markerButton = document.createElement('button');
        markerButton.type = 'button';
        markerButton.className = `map-marker-btn ${isSelected ? 'is-selected' : ''}`;
        markerButton.setAttribute('aria-label', feature.properties.title);

        const pinElem = document.createElement('span');
        pinElem.className = `map-marker ${isSelected ? 'is-selected' : ''}`;
        if (category?.color) {
          pinElem.style.setProperty('--marker-bg', category.color);
          if (!isSelected) pinElem.style.backgroundColor = category.color;
        }
        pinElem.innerHTML = `<span aria-hidden="true">${category?.icon || '✦'}</span>`;

        const labelElem = document.createElement('span');
        labelElem.className = `map-marker-label ${isSelected ? 'is-visible' : ''}`;
        labelElem.setAttribute('aria-hidden', 'true');
        labelElem.textContent = feature.properties.title;

        markerButton.appendChild(pinElem);
        markerButton.appendChild(labelElem);

        markerButton.addEventListener('click', () => selectFeature(feature, true));
        const coordinates =
          feature.geometry.type === 'Point' ? feature.geometry.coordinates : defaultCenter;
        markerRefs.current.push(
          new MapMarker({ element: markerButton, anchor: 'bottom' })
            .setLngLat(coordinates)
            .addTo(map),
        );

        labelItems.push({
          key: feature.properties.entityKey,
          coordinates,
          labelElem,
          title: feature.properties.title,
          priority: isSelected ? 0 : 1,
        });
      });

    if (trailVisible) {
      mapData.waypoints.forEach((feature) => {
        if (feature.geometry.type !== 'Point') return;
        const isSelected = selected?.properties.entityKey === feature.properties.entityKey;

        const markerButton = document.createElement('button');
        markerButton.type = 'button';
        markerButton.className = `map-marker-btn map-marker-btn--waypoint ${isSelected ? 'is-selected' : ''}`;
        markerButton.setAttribute(
          'aria-label',
          `${feature.properties.title} — ${feature.properties.summary}`,
        );

        const pinElem = document.createElement('span');
        pinElem.className = `map-marker map-marker--waypoint ${isSelected ? 'is-selected' : ''}`;
        pinElem.innerHTML = '<span aria-hidden="true">●</span>';

        const labelElem = document.createElement('span');
        labelElem.className = `map-marker-label map-marker-label--waypoint ${isSelected ? 'is-visible' : ''}`;
        labelElem.setAttribute('aria-hidden', 'true');
        labelElem.textContent = feature.properties.title;

        markerButton.appendChild(pinElem);
        markerButton.appendChild(labelElem);

        markerButton.addEventListener('click', () => setSelected(feature));
        markerRefs.current.push(
          new MapMarker({ element: markerButton, anchor: 'center' })
            .setLngLat(feature.geometry.coordinates)
            .addTo(map),
        );

        labelItems.push({
          key: feature.properties.entityKey,
          coordinates: feature.geometry.coordinates,
          labelElem,
          title: feature.properties.title,
          priority: isSelected ? 0 : 2,
        });
      });
    }

    const MIN_LABEL_ZOOM = 14.6;

    function updateLabels() {
      if (!mapRef.current) return;
      const map = mapRef.current;
      const zoom = map.getZoom();
      const selectedKey = selected?.properties.entityKey;
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
          x1: point.x - 18,
          y1: point.y - 36,
          x2: point.x + 18,
          y2: point.y + 4,
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

    let frameId: number | null = null;
    function onMove() {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateLabels);
    }

    map.on('move', onMove);
    updateLabels();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      map.off('move', onMove);
    };
  }, [
    categories,
    mapData.places,
    mapData.waypoints,
    selected?.properties.entityKey,
    state.categories,
    status,
    trailVisible,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined' || initialState) return;
    setState(parseMapState(window.location.search));
  }, [initialState]);

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
    const coordinates =
      geometry.type === 'Point'
        ? geometry.coordinates
        : geometry.type === 'LineString'
          ? geometry.coordinates[Math.floor(geometry.coordinates.length / 2)]
          : geometry.coordinates[0][0];

    const category = categories.find((c) => c.id === selected.properties.category);
    const link = detailUrl(locale, selected.properties);

    const popupDiv = document.createElement('div');
    popupDiv.className = 'map-popover-content';
    popupDiv.innerHTML = `
      ${selected.properties.thumbnail ? `<div class="map-popover-media"><img src="${selected.properties.thumbnail}" alt="${selected.properties.title}" /></div>` : ''}
      <div class="map-popover-body">
        <span class="map-popover-badge" style="background-color: ${category?.color || '#b66c45'}">
          ${selected.properties.kind === 'place' ? category?.label[locale] || '' : selected.properties.kind === 'trail' ? (locale === 'el' ? 'Διαδρομή' : 'Trail') : locale === 'el' ? 'Στάση διαδρομής' : 'Trail stop'}
        </span>
        <h4 class="map-popover-title">${selected.properties.title}</h4>
        <p class="map-popover-summary">${selected.properties.summary}</p>
        <a class="map-popover-link" href="${link}">
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
          >
            <span aria-hidden="true">⌖</span>{' '}
            {locationState === 'locating' ? ui.locating : ui.locate}
          </button>
          <button
            className={`fullscreen-button ${isFullscreen ? 'is-active' : ''}`}
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? ui.exitFullscreen : ui.fullscreen}
            title={isFullscreen ? ui.exitFullscreen : ui.fullscreen}
          >
            <span aria-hidden="true">{isFullscreen ? '✕' : '⛶'}</span>{' '}
            {isFullscreen ? ui.exitFullscreen : ui.fullscreen}
          </button>
        </div>
      </div>
      <div className="map-filter-row" aria-label={ui.categories}>
        <button
          className={`filter-chip ${state.categories.length === 0 ? 'is-active' : ''}`}
          type="button"
          onClick={() => writeState({ ...state, categories: [] })}
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
              {visibleFeatures.length} {locale === 'el' ? 'σημεία' : 'features'}
            </span>
            <div className="map-results-actions">
              <span className="map-hint">{ui.mapHint}</span>
              <button
                className="list-toggle-button"
                type="button"
                onClick={() => setIsListHidden((prev) => !prev)}
                aria-label={isListHidden ? ui.showList : ui.hideList}
                title={isListHidden ? ui.showList : ui.hideList}
              >
                <span aria-hidden="true">{isListHidden ? '▼' : '▲'}</span>
              </button>
            </div>
          </div>
          <div className="map-result-list" ref={listRef}>
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
