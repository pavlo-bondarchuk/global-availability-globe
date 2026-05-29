import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Clock3, Globe2, Mail, MapPin, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const GLOBE_R = 0.8;
const MARKER_ELEVATION = 0.035;
const MAX_THETA = 1.12;
const INACTIVE_MARKER_COLOR = [0.55, 0.6, 0.66];
const OFFSET_RE = new RegExp("GMT([+-])([0-9]{1,2})(?::([0-9]{2}))?");

const TIMEZONE_BOUNDARY_SOURCES = [
  {
    label: "Local with-oceans GeoJSON ZIP",
    url: "/data/timezones-with-oceans-now.geojson.zip",
    type: "zip"
  },
  {
    label: "Timezone Boundary Builder 2026b with oceans",
    url: "https://github.com/evansiroky/timezone-boundary-builder/releases/download/2026b/timezones-with-oceans-now.geojson.zip",
    type: "zip"
  },
  {
    label: "Timezone Boundary Builder 2026b land only",
    url: "https://github.com/evansiroky/timezone-boundary-builder/releases/download/2026b/timezones-now.geojson.zip",
    type: "zip"
  }
];

const OFFICE_MARKERS = [
  {
    id: "honolulu",
    city: "Honolulu",
    region: "Pacific Desk",
    country: "United States",
    timeZone: "Pacific/Honolulu",
    location: [21.3069, -157.8583],
    size: 0.044,
    team: "Customer onboarding",
    workingHours: [8, 16],
    email: "pacific@example.com"
  },
  {
    id: "los-angeles",
    city: "Los Angeles",
    region: "West Coast",
    country: "United States",
    timeZone: "America/Los_Angeles",
    location: [34.0522, -118.2437],
    size: 0.045,
    team: "Sales engineering",
    workingHours: [9, 18],
    email: "west@example.com"
  },
  {
    id: "new-york",
    city: "New York",
    region: "North America",
    country: "United States",
    timeZone: "America/New_York",
    location: [40.7128, -74.006],
    size: 0.049,
    team: "Enterprise sales",
    workingHours: [9, 18],
    email: "na@example.com"
  },
  {
    id: "london",
    city: "London",
    region: "United Kingdom",
    country: "United Kingdom",
    timeZone: "Europe/London",
    location: [51.5074, -0.1278],
    size: 0.049,
    team: "Partnerships",
    workingHours: [9, 17],
    email: "uk@example.com"
  },
  {
    id: "kyiv",
    city: "Kyiv",
    region: "Eastern Europe",
    country: "Ukraine",
    timeZone: "Europe/Kyiv",
    location: [50.4501, 30.5234],
    size: 0.052,
    team: "Product delivery",
    workingHours: [10, 19],
    email: "delivery@example.com"
  },
  {
    id: "dubai",
    city: "Dubai",
    region: "Middle East",
    country: "United Arab Emirates",
    timeZone: "Asia/Dubai",
    location: [25.2048, 55.2708],
    size: 0.049,
    team: "Regional operations",
    workingHours: [9, 18],
    email: "mea@example.com"
  },
  {
    id: "delhi",
    city: "Delhi",
    region: "South Asia",
    country: "India",
    timeZone: "Asia/Kolkata",
    location: [28.6139, 77.209],
    size: 0.047,
    team: "Implementation",
    workingHours: [10, 19],
    email: "india@example.com"
  },
  {
    id: "singapore",
    city: "Singapore",
    region: "Southeast Asia",
    country: "Singapore",
    timeZone: "Asia/Singapore",
    location: [1.3521, 103.8198],
    size: 0.045,
    team: "APAC support",
    workingHours: [9, 18],
    email: "apac@example.com"
  },
  {
    id: "tokyo",
    city: "Tokyo",
    region: "Japan",
    country: "Japan",
    timeZone: "Asia/Tokyo",
    location: [35.6762, 139.6503],
    size: 0.052,
    team: "Strategic accounts",
    workingHours: [9, 18],
    email: "jp@example.com"
  },
  {
    id: "sydney",
    city: "Sydney",
    region: "Australia",
    country: "Australia",
    timeZone: "Australia/Sydney",
    location: [-33.8688, 151.2093],
    size: 0.049,
    team: "Client success",
    workingHours: [9, 17],
    email: "anz@example.com"
  }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatOffset(hours) {
  const sign = hours >= 0 ? "+" : "-";
  const abs = Math.abs(hours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${pad(h)}${m ? `:${pad(m)}` : ""}`;
}

function getOffsetHours(timeZone, date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
      hour: "2-digit",
      minute: "2-digit"
    }).formatToParts(date);
    const name = parts.find((part) => part.type === "timeZoneName")?.value || "GMT";
    const match = name.match(OFFSET_RE);
    if (!match) return 0;
    const sign = match[1] === "+" ? 1 : -1;
    const hours = Number(match[2] || 0);
    const minutes = Number(match[3] || 0);
    return sign * (hours + minutes / 60);
  } catch {
    return 0;
  }
}

function getLocalDateParts(timeZone, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23"
  }).formatToParts(date);

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value || 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value || 0),
    weekday: parts.find((part) => part.type === "weekday")?.value || "Mon"
  };
}

function getLocalTime(timeZone, date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(date);
}

function getAvailability(marker, now = new Date()) {
  const local = getLocalDateParts(marker.timeZone, now);
  const [start, end] = marker.workingHours;
  const isWeekend = local.weekday === "Sat" || local.weekday === "Sun";
  const isOpen = !isWeekend && local.hour >= start && local.hour < end;

  if (isOpen) {
    return {
      state: "open",
      label: "Available now",
      detail: `Open until ${pad(end)}:00`
    };
  }

  if (isWeekend) {
    return {
      state: "closed",
      label: "Weekend",
      detail: `Next window ${pad(start)}:00–${pad(end)}:00`
    };
  }

  if (local.hour < start) {
    return {
      state: "soon",
      label: "Opening soon",
      detail: `Opens at ${pad(start)}:00`
    };
  }

  return {
    state: "closed",
    label: "After hours",
    detail: `Next window ${pad(start)}:00–${pad(end)}:00`
  };
}

function latLonTo3D([lat, lon]) {
  const latRad = lat * DEG;
  const lonRad = lon * DEG - Math.PI;
  const cosLat = Math.cos(latRad);
  return [-cosLat * Math.cos(lonRad), Math.sin(latRad), cosLat * Math.sin(lonRad)];
}

function getCenteredRotation(location) {
  const [x, y, z] = latLonTo3D(location);
  const horizontal = Math.hypot(x, z);
  return {
    phi: Math.atan2(-x, z),
    theta: clamp(Math.atan2(y, horizontal), -MAX_THETA, MAX_THETA)
  };
}

function projectPoint(lat, lon, phi, theta, size, elevation = 0, frontOnly = true) {
  const p = latLonTo3D([lat, lon]);
  const r = GLOBE_R + elevation;
  const x = p[0] * r;
  const y = p[1] * r;
  const z = p[2] * r;
  const cx = Math.cos(theta);
  const cy = Math.cos(phi);
  const sx = Math.sin(theta);
  const sy = Math.sin(phi);
  const rx = cy * x + sy * z;
  const ry = sy * sx * x + cx * y - cy * sx * z;
  const rz = -sy * cx * x + sx * y + cy * cx * z;
  const visible = rz >= 0 || rx * rx + ry * ry >= GLOBE_R * GLOBE_R;

  if (frontOnly && rz < -0.012) return null;
  if (!frontOnly && !visible) return null;

  return {
    x: ((rx + 1) / 2) * size,
    y: ((-ry + 1) / 2) * size,
    z: rz,
    visible
  };
}

function drawGeoLine(ctx, points, phi, theta, size, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();

  let active = false;
  let previousProjected = null;
  let previousPoint = null;

  for (const point of points) {
    const projected = projectPoint(point[0], point[1], phi, theta, size);

    if (!projected) {
      active = false;
      previousProjected = null;
      previousPoint = null;
      continue;
    }

    const projectedJump = previousProjected ? Math.hypot(projected.x - previousProjected.x, projected.y - previousProjected.y) : 0;
    const geoJump = previousPoint ? Math.abs(point[0] - previousPoint[0]) + Math.abs(point[1] - previousPoint[1]) : 0;
    const shouldBreak = projectedJump > size * 0.16 || geoJump > 42;

    if (!active || shouldBreak) {
      ctx.moveTo(projected.x, projected.y);
      active = true;
    } else {
      ctx.lineTo(projected.x, projected.y);
    }

    previousProjected = projected;
    previousPoint = point;
  }

  ctx.stroke();
}

function buildReferenceSegments() {
  const segments = [];
  for (let lon = -172.5; lon <= 172.5; lon += 15) {
    const points = [];
    for (let lat = -76; lat <= 76; lat += 2) points.push([lat, lon]);
    segments.push({ tzid: "Etc/UTC", offset: Math.round(lon / 15), points });
  }
  return segments;
}

function buildParallel(lat) {
  const points = [];
  for (let lon = -180; lon <= 180; lon += 1.5) points.push([lat, lon]);
  return points;
}

function buildMeridian(lon) {
  const points = [];
  for (let lat = -72; lat <= 72; lat += 1.5) points.push([lat, lon]);
  return points;
}

function isGeoJsonFile(name) {
  const lower = name.toLowerCase();
  return lower.endsWith(".geojson") || lower.endsWith(".json");
}

async function fetchJsonOrZip(source) {
  const response = await fetch(source.url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`${source.label}: ${response.status}`);

  if (source.type === "json") {
    return response.json();
  }

  const JSZipModule = await import("jszip");
  const JSZip = JSZipModule.default || JSZipModule;
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  const files = Object.values(zip.files).filter((file) => !file.dir);
  const target =
    files.find((file) => file.name.toLowerCase().endsWith("combined.geojson")) ||
    files.find((file) => file.name.toLowerCase().includes("timezones") && isGeoJsonFile(file.name)) ||
    files.find((file) => isGeoJsonFile(file.name));

  if (!target) throw new Error(`${source.label}: GeoJSON file not found`);
  return JSON.parse(await target.async("text"));
}

async function loadTimezoneBoundaries() {
  const errors = [];

  for (const source of TIMEZONE_BOUNDARY_SOURCES) {
    try {
      const geojson = await fetchJsonOrZip(source);
      const segments = buildTimezoneSegmentsFromGeoJson(geojson);
      if (!segments.length) throw new Error(`${source.label}: no drawable segments`);
      return { source: source.label, segments };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(errors.join(" | "));
}

function buildTimezoneSegmentsFromGeoJson(geojson) {
  if (!geojson || geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) return [];

  const segments = [];
  const seen = new Set();

  for (const feature of geojson.features) {
    const tzid = feature?.properties?.tzid || feature?.properties?.TZID || feature?.properties?.zoneName || "Etc/UTC";
    if (tzid.startsWith("Antarctica/")) continue;

    const offset = getOffsetHours(tzid);
    const rings = extractRings(feature.geometry);

    for (const ring of rings) {
      const parts = splitAntimeridian(ring);
      for (const part of parts) {
        const simplified = simplifyRing(part, 0.24);
        if (simplified.length < 2) continue;
        const key = makeSegmentKey(simplified);
        if (seen.has(key)) continue;
        seen.add(key);
        segments.push({
          tzid,
          offset,
          points: simplified.map(([lon, lat]) => [lat, lon])
        });
      }
    }
  }

  return segments;
}

function extractRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates || [];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flatMap((polygon) => polygon || []);
  if (geometry.type === "GeometryCollection") return (geometry.geometries || []).flatMap(extractRings);
  return [];
}

function normalizeLon(lon) {
  if (lon > 180) return lon - 360;
  if (lon < -180) return lon + 360;
  return lon;
}

function isValidCoord(coord) {
  return Array.isArray(coord) && Number.isFinite(coord[0]) && Number.isFinite(coord[1]);
}

function splitAntimeridian(ring) {
  const parts = [];
  let current = [];
  let previous = null;

  for (const coord of ring) {
    if (!isValidCoord(coord)) continue;
    const point = [normalizeLon(coord[0]), clamp(coord[1], -76, 76)];
    if (previous && Math.abs(point[0] - previous[0]) > 180) {
      if (current.length > 1) parts.push(current);
      current = [];
    }
    current.push(point);
    previous = point;
  }

  if (current.length > 1) parts.push(current);
  return parts;
}

function simplifyRing(points, tolerance) {
  if (points.length <= 2) return points;
  const output = [points[0]];
  let last = points[0];

  for (let i = 1; i < points.length - 1; i += 1) {
    const current = points[i];
    const dx = current[0] - last[0];
    const dy = current[1] - last[1];
    if (Math.sqrt(dx * dx + dy * dy) >= tolerance) {
      output.push(current);
      last = current;
    }
  }

  output.push(points[points.length - 1]);
  return output;
}

function makeSegmentKey(points) {
  const first = points[0];
  const last = points[points.length - 1];
  const a = `${Math.round(first[0] * 10)},${Math.round(first[1] * 10)}`;
  const b = `${Math.round(last[0] * 10)},${Math.round(last[1] * 10)}`;
  return a < b ? `${a}-${b}-${points.length}` : `${b}-${a}-${points.length}`;
}

function getZoneColor(segment) {
  if (segment.tzid?.startsWith("Etc/")) return "rgba(245, 178, 42, 0.38)";
  return "rgba(245, 178, 42, 0.55)";
}

function StatusBadge({ availability }) {
  return <span className={`status-badge status-${availability.state}`}>{availability.label}</span>;
}

export default function App() {
  const wrapRef = useRef(null);
  const globeRef = useRef(null);
  const overlayRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const rafRef = useRef(0);
  const rotationRafRef = useRef(0);
  const sizeRef = useRef(720);
  const phiRef = useRef(-0.55);
  const thetaRef = useRef(0.02);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const zoneSegmentsRef = useRef(buildReferenceSegments());
  const [size, setSize] = useState(720);
  const [now, setNow] = useState(new Date());
  const [activeMarkerId, setActiveMarkerId] = useState("kyiv");
  const [boundaryStatus, setBoundaryStatus] = useState({ state: "loading", text: "Loading timezone-boundary-builder GeoJSON" });

  const markers = useMemo(() => {
    return OFFICE_MARKERS.map((marker) => {
      const offset = getOffsetHours(marker.timeZone, now);
      const availability = getAvailability(marker, now);
      return {
        ...marker,
        offset,
        availability,
        localTime: getLocalTime(marker.timeZone, now),
        label: `${formatOffset(offset)} ${marker.city}`
      };
    }).sort((a, b) => {
      if (a.offset !== b.offset) return a.offset - b.offset;
      return a.city.localeCompare(b.city);
    });
  }, [now]);

  const activeMarker = useMemo(() => {
    return markers.find((marker) => marker.id === activeMarkerId) || markers[0];
  }, [activeMarkerId, markers]);

  const coverage = useMemo(() => {
    const open = markers.filter((marker) => marker.availability.state === "open").length;
    return {
      open,
      total: markers.length,
      regions: new Set(markers.map((marker) => marker.region)).size
    };
  }, [markers]);

  const graticule = useMemo(() => {
    const lines = [];
    for (let lat = -60; lat <= 60; lat += 15) lines.push(buildParallel(lat));
    for (let lon = -180; lon < 180; lon += 15) lines.push(buildMeridian(lon));
    return lines;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!wrapRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.max(360, Math.floor(Math.min(entry.contentRect.width, 820)));
      sizeRef.current = next;
      setSize(next);
    });
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mounted = true;

    loadTimezoneBoundaries()
      .then(({ source, segments }) => {
        if (!mounted) return;
        zoneSegmentsRef.current = segments;
        setBoundaryStatus({
          state: "ready",
          text: `${source}: ${segments.length.toLocaleString("en-US")} boundary segments`
        });
      })
      .catch((error) => {
        if (!mounted) return;
        zoneSegmentsRef.current = buildReferenceSegments();
        setBoundaryStatus({
          state: "fallback",
          text: error instanceof Error ? error.message : "Fallback UTC meridians"
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const canvas = globeRef.current;
    if (!canvas || !size) return undefined;

    let disposed = false;
    let activeGlobe = null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    import("cobe").then((mod) => {
      if (disposed) return;
      const createGlobe = mod.default || mod;

      globeInstanceRef.current?.destroy?.();
      activeGlobe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: size * dpr,
        height: size * dpr,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark: 0,
        diffuse: 1.28,
        mapSamples: 38000,
        mapBrightness: 4.8,
        mapBaseBrightness: 0.04,
        baseColor: [1, 1, 1],
        markerColor: INACTIVE_MARKER_COLOR,
        glowColor: [1, 1, 1],
        markerElevation: MARKER_ELEVATION,
        opacity: 1,
        scale: 1,
        offset: [0, 0],
        markers: markers.map((marker) => ({
          id: marker.id,
          location: marker.location,
          size: marker.size,
          color: INACTIVE_MARKER_COLOR
        })),
        arcs: [],
        onRender: (state) => {
          state.phi = phiRef.current;
          state.theta = thetaRef.current;
        }
      });

      globeInstanceRef.current = activeGlobe;

      const render = () => {
        if (disposed) return;
        activeGlobe?.update?.({ phi: phiRef.current, theta: thetaRef.current });
        drawOverlay();
        rafRef.current = requestAnimationFrame(render);
      };

      render();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(rotationRafRef.current);
      activeGlobe?.destroy?.();
      if (globeInstanceRef.current === activeGlobe) globeInstanceRef.current = null;
    };
  }, [size, markers]);

  useEffect(() => {
    if (activeMarker) focusMarker(activeMarker, false);
  }, []);

  function focusMarker(marker, shouldScroll = true) {
    setActiveMarkerId(marker.id);
    if (shouldScroll) wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    cancelAnimationFrame(rotationRafRef.current);

    const target = getCenteredRotation(marker.location);
    const startPhi = phiRef.current;
    const startTheta = thetaRef.current;
    const deltaPhi = normalizeAngle(target.phi - startPhi);
    const deltaTheta = target.theta - startTheta;
    const start = performance.now();
    const duration = 850;

    const animate = (timestamp) => {
      const progress = clamp((timestamp - start) / duration, 0, 1);
      const eased = easeOutCubic(progress);
      phiRef.current = startPhi + deltaPhi * eased;
      thetaRef.current = startTheta + deltaTheta * eased;

      if (progress < 1) {
        rotationRafRef.current = requestAnimationFrame(animate);
        return;
      }

      phiRef.current = target.phi;
      thetaRef.current = target.theta;
      rotationRafRef.current = 0;
    };

    rotationRafRef.current = requestAnimationFrame(animate);
  }

  function drawOverlay() {
    const canvas = overlayRef.current;
    const displaySize = sizeRef.current;
    if (!canvas || !displaySize) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== displaySize * dpr || canvas.height !== displaySize * dpr) {
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
    }

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, displaySize, displaySize);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    drawSphereRim(ctx, displaySize);

    for (const line of graticule) {
      drawGeoLine(ctx, line, phiRef.current, thetaRef.current, displaySize, "rgba(81, 174, 232, 0.34)", 0.82);
    }

    for (const segment of zoneSegmentsRef.current) {
      drawGeoLine(ctx, segment.points, phiRef.current, thetaRef.current, displaySize, getZoneColor(segment), 0.82);
    }

    drawActiveMarkerDot(ctx, displaySize);
  }

  function drawSphereRim(ctx, displaySize) {
    const radius = displaySize * 0.407;
    const center = displaySize / 2;
    const rim = ctx.createRadialGradient(center - radius * 0.25, center - radius * 0.25, radius * 0.2, center, center, radius * 1.08);
    rim.addColorStop(0, "rgba(255, 255, 255, 0)");
    rim.addColorStop(0.72, "rgba(255, 255, 255, 0)");
    rim.addColorStop(0.91, "rgba(225, 231, 235, 0.28)");
    rim.addColorStop(1, "rgba(190, 199, 207, 0.36)");
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(center, center, radius * 1.04, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(210, 218, 226, 0.58)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, radius * 1.015, 0, TAU);
    ctx.stroke();
  }

  function drawActiveMarkerDot(ctx, displaySize) {
    if (!activeMarker) return;
    const projected = projectPoint(
      activeMarker.location[0],
      activeMarker.location[1],
      phiRef.current,
      thetaRef.current,
      displaySize,
      MARKER_ELEVATION,
      false
    );

    if (!projected || !projected.visible) return;

    ctx.save();
    ctx.fillStyle = "#ffb829";
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, 7.5, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 184, 41, 0.25)";
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, 7.5, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function handlePointerDown(event) {
    cancelAnimationFrame(rotationRafRef.current);
    rotationRafRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    dragRef.current.x = event.clientX;
    dragRef.current.y = event.clientY;
    phiRef.current = (phiRef.current + dx * 0.006) % TAU;
    thetaRef.current = clamp(thetaRef.current + dy * 0.0048, -MAX_THETA, MAX_THETA);
  }

  function handlePointerUp(event) {
    dragRef.current.active = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
  }

  function resetView() {
    cancelAnimationFrame(rotationRafRef.current);
    rotationRafRef.current = 0;
    focusMarker(markers.find((marker) => marker.id === "kyiv") || markers[0], false);
  }

  return (
    <main className="page-shell">
      <section className="hero-grid">
        <aside className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            Global availability layer
          </div>
          <h1>Show customers when and where your global team is available</h1>
          <p className="lead">
            A commercial WebGL widget for international companies: live office status, local time, timezone boundaries, and clickable regional contact points in one premium interface.
          </p>

          <div className="hero-actions">
            <a className="primary-action" href={`mailto:${activeMarker.email}`}>
              Contact active region
              <ArrowRight size={17} />
            </a>
            <button type="button" className="secondary-action" onClick={resetView}>
              <RotateCcw size={17} />
              Reset view
            </button>
          </div>

          <div className="stats-grid">
            <div>
              <strong>{coverage.total}</strong>
              <span>Global nodes</span>
            </div>
            <div>
              <strong>{coverage.open}</strong>
              <span>Available now</span>
            </div>
            <div>
              <strong>{coverage.regions}</strong>
              <span>Service regions</span>
            </div>
          </div>
        </aside>

        <section className="globe-card">
          <div
            ref={wrapRef}
            className="globe-wrap"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="globe-sphere" />
            <canvas ref={globeRef} className="globe-canvas" />
            <canvas ref={overlayRef} className="globe-overlay" />

            {activeMarker ? (
              <div
                className="active-tooltip"
                style={{
                  positionAnchor: `--cobe-${activeMarker.id}`,
                  opacity: `var(--cobe-visible-${activeMarker.id}, 0)`,
                  filter: `blur(calc((1 - var(--cobe-visible-${activeMarker.id}, 0)) * 2px))`
                }}
              >
                <span>{activeMarker.region}</span>
                <strong>{activeMarker.city}</strong>
                <small>{activeMarker.localTime} · {formatOffset(activeMarker.offset)}</small>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="control-panel">
          <div className="active-office-card">
            <div className="panel-kicker">
              <MapPin size={15} />
              Active region
            </div>
            <h2>{activeMarker.city}</h2>
            <p>{activeMarker.region} · {activeMarker.country}</p>

            <div className="active-meta">
              <div>
                <Clock3 size={16} />
                <span>{activeMarker.localTime}</span>
              </div>
              <div>
                <Globe2 size={16} />
                <span>{formatOffset(activeMarker.offset)}</span>
              </div>
            </div>

            <StatusBadge availability={activeMarker.availability} />
            <p className="availability-detail">{activeMarker.availability.detail}</p>

            <a className="email-action" href={`mailto:${activeMarker.email}`}>
              <Mail size={16} />
              {activeMarker.email}
            </a>
          </div>

          <div className="boundary-status">
            <div>
              <span className={`source-dot source-${boundaryStatus.state}`} />
              Boundary source
            </div>
            <p>{boundaryStatus.text}</p>
          </div>

          <div className="locations-list">
            <div className="list-head">
              <span>Timezone nodes</span>
              <span>Local time</span>
            </div>

            {markers.map((marker) => (
              <button
                type="button"
                key={marker.id}
                onClick={() => focusMarker(marker)}
                className={`location-row ${activeMarkerId === marker.id ? "is-active" : ""}`}
              >
                <span className="location-main">
                  <span className={`location-dot ${marker.availability.state}`} />
                  <span>
                    <strong>{marker.city}</strong>
                    <small>{formatOffset(marker.offset)} · {marker.region}</small>
                  </span>
                </span>
                <span className="location-time">
                  {marker.localTime}
                </span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="commercial-strip">
        <div>
          <ShieldCheck size={18} />
          <span>Use case</span>
          <strong>Global offices, SaaS support, logistics, enterprise teams</strong>
        </div>
        <div>
          <Clock3 size={18} />
          <span>Business value</span>
          <strong>Reduces timezone friction before contact or booking</strong>
        </div>
        <div>
          <Globe2 size={18} />
          <span>Integration</span>
          <strong>React component, WordPress block, or embedded widget</strong>
        </div>
      </section>
    </main>
  );
}
