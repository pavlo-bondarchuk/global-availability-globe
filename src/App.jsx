import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Clock3,
  Code2,
  ExternalLink,
  Globe2,
  Mail,
  Mouse,
  MousePointerClick,
  Network,
  Sun,
  Triangle,
  Truck,
  Users,
  Zap
} from "lucide-react";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const GLOBE_R = 0.8;
const MARKER_ELEVATION = 0.035;
const MAX_THETA = 1.12;
const DEMO_NOW = new Date("2026-05-29T10:56:00Z");
const CONTACT_EMAIL = "bonddesign85@gmail.com";
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
    workingHours: [8, 17],
    email: "pacific@company.com",
    markerColor: [1, 0.72, 0.16],
    statusTone: "soon",
    panelStatus: "Available now"
  },
  {
    id: "los-angeles",
    city: "Los Angeles",
    region: "West Coast",
    country: "United States",
    timeZone: "America/Los_Angeles",
    location: [34.0522, -118.2437],
    size: 0.045,
    workingHours: [9, 18],
    email: "west@company.com",
    markerColor: [1, 0.72, 0.16],
    statusTone: "soon"
  },
  {
    id: "new-york",
    city: "New York",
    region: "North America",
    country: "United States",
    timeZone: "America/New_York",
    location: [40.7128, -74.006],
    size: 0.049,
    workingHours: [9, 18],
    email: "na@company.com",
    markerColor: [1, 0.72, 0.16],
    statusTone: "soon"
  },
  {
    id: "london",
    city: "London",
    region: "United Kingdom",
    country: "United Kingdom",
    timeZone: "Europe/London",
    location: [51.5074, -0.1278],
    size: 0.049,
    workingHours: [9, 17],
    email: "uk@company.com",
    markerColor: [0.25, 0.9, 0.58],
    statusTone: "open"
  },
  {
    id: "kyiv",
    city: "Kyiv",
    region: "Eastern Europe",
    country: "Ukraine",
    timeZone: "Europe/Kyiv",
    location: [50.4501, 30.5234],
    size: 0.052,
    workingHours: [10, 19],
    email: "delivery@company.com",
    markerColor: [0.25, 0.9, 0.58],
    statusTone: "open"
  },
  {
    id: "dubai",
    city: "Dubai",
    region: "Middle East",
    country: "United Arab Emirates",
    timeZone: "Asia/Dubai",
    location: [25.2048, 55.2708],
    size: 0.049,
    workingHours: [9, 18],
    email: "mea@company.com",
    markerColor: [0.25, 0.9, 0.58],
    statusTone: "open"
  },
  {
    id: "delhi",
    city: "Delhi",
    region: "South Asia",
    country: "India",
    timeZone: "Asia/Kolkata",
    location: [28.6139, 77.209],
    size: 0.047,
    workingHours: [10, 19],
    email: "india@company.com",
    markerColor: [0.25, 0.9, 0.58],
    statusTone: "open"
  },
  {
    id: "singapore",
    city: "Singapore",
    region: "Southeast Asia",
    country: "Singapore",
    timeZone: "Asia/Singapore",
    location: [1.3521, 103.8198],
    size: 0.045,
    workingHours: [9, 18],
    email: "apac@company.com",
    markerColor: [0.56, 0.62, 0.7],
    statusTone: "closed"
  },
  {
    id: "tokyo",
    city: "Tokyo",
    region: "Japan",
    country: "Japan",
    timeZone: "Asia/Tokyo",
    location: [35.6762, 139.6503],
    size: 0.052,
    workingHours: [9, 18],
    email: "jp@company.com",
    markerColor: [0.55, 0.38, 0.96],
    statusTone: "closed"
  },
  {
    id: "sydney",
    city: "Sydney",
    region: "Australia",
    country: "Australia",
    timeZone: "Australia/Sydney",
    location: [-33.8688, 151.2093],
    size: 0.049,
    workingHours: [9, 17],
    email: "anz@company.com",
    markerColor: [0.45, 0.78, 1],
    statusTone: "closed"
  }
];

const FEATURE_INDICATORS = [
  { icon: Globe2, tone: "blue", title: "Real-time", detail: "Local Time" },
  { icon: Sun, tone: "yellow", title: "Timezone", detail: "Boundaries" },
  { icon: Network, tone: "purple", title: "Office & Team", detail: "Availability" }
];

const INTERACTION_FEATURES = [
  { icon: MousePointerClick, tone: "purple", title: "Click any location", detail: "to focus the globe" },
  { icon: Sun, tone: "blue", title: "See local time", detail: "for each region" },
  { icon: Clock3, tone: "yellow", title: "Understand team", detail: "availability instantly" },
  { icon: Zap, tone: "purple", title: "Reduce timezone", detail: "confusion" }
];

const BUSINESS_CARDS = [
  {
    icon: Users,
    tone: "purple",
    title: "Improve customer experience",
    detail: "Help customers know the best time to reach your team."
  },
  {
    icon: Globe2,
    tone: "blue",
    title: "Show your global presence",
    detail: "Visualize your offices and service regions beautifully."
  },
  {
    icon: Clock3,
    tone: "steel",
    title: "Reduce timezone friction",
    detail: "Eliminate back-and-forth emails to find the right meeting time."
  },
  {
    icon: BarChart3,
    tone: "yellow",
    title: "Increase trust and engagement",
    detail: "A modern, interactive experience builds credibility."
  }
];

const TECH_CARDS = [
  { icon: Code2, tone: "cyan", title: "React" },
  { icon: Zap, tone: "violet", title: "Vite" },
  { icon: Globe2, tone: "green", title: "COBE", detail: "WebGL Globe" },
  { icon: Network, tone: "lime", title: "Canvas", detail: "Overlay" },
  { icon: Clock3, tone: "yellow", title: "Timezone Boundary", detail: "Builder" },
  { icon: Triangle, tone: "white", title: "Vercel", detail: "Deployment" }
];

const USE_CASES = [
  { icon: Briefcase, tone: "purple", title: "SaaS & Software", detail: "Show global teams and support hours" },
  { icon: Users, tone: "purple", title: "IT & Agencies", detail: "Highlight distributed teams worldwide" },
  { icon: Truck, tone: "yellow", title: "Logistics & Shipping", detail: "Visualize operations across timezones" },
  { icon: Users, tone: "yellow", title: "Consulting", detail: "Present global presence to enterprise clients" },
  { icon: BarChart3, tone: "pink", title: "Startups", detail: "Create a premium first impression" }
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

function getOffsetHours(timeZone, date = DEMO_NOW) {
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

function getLocalDateParts(timeZone, date = DEMO_NOW) {
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

function getLocalTime(timeZone, date = DEMO_NOW) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(date);
}

function getAvailability(marker, now = DEMO_NOW) {
  const local = getLocalDateParts(marker.timeZone, now);
  const [start, end] = marker.workingHours;
  const isWeekend = local.weekday === "Sat" || local.weekday === "Sun";
  const isOpen = marker.statusTone === "open" || (!isWeekend && local.hour >= start && local.hour < end);

  if (isOpen) {
    return {
      state: "open",
      label: marker.panelStatus || "Available now",
      detail: `Open until ${pad(end)}:00`
    };
  }

  if (marker.statusTone === "soon" || local.hour < start) {
    return {
      state: "soon",
      label: marker.panelStatus || "Opening soon",
      detail: `Opens at ${pad(start)}:00`
    };
  }

  return {
    state: "closed",
    label: marker.panelStatus || (isWeekend ? "Weekend" : "After hours"),
    detail: `Next window ${pad(start)}:00-${pad(end)}:00`
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

function createMailto(subject, body = "") {
  const params = new URLSearchParams({ subject });
  if (body) params.set("body", body);
  return `mailto:${CONTACT_EMAIL}?${params.toString()}`;
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
  for (const source of TIMEZONE_BOUNDARY_SOURCES) {
    try {
      const geojson = await fetchJsonOrZip(source);
      const segments = buildTimezoneSegmentsFromGeoJson(geojson);
      if (segments.length) return segments;
    } catch {}
  }

  return buildReferenceSegments();
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
  if (segment.tzid?.startsWith("Etc/")) return "rgba(245, 178, 42, 0.34)";
  return "rgba(245, 178, 42, 0.5)";
}

function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return undefined;

    const move = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
      setVisible(true);
      setInteractive(Boolean(event.target?.closest?.("a, button, input, textarea, select, [role='button'], .globe-wrap")));
    };

    const leave = () => setVisible(false);

    const animate = () => {
      const position = positionRef.current;
      const target = targetRef.current;
      position.x += (target.x - position.x) * 0.22;
      position.y += (target.y - position.y) * 0.22;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className={`custom-cursor ${visible ? "is-visible" : ""} ${interactive ? "is-interactive" : ""}`}>
        <span />
      </div>
      <div ref={dotRef} className={`custom-cursor-dot ${visible ? "is-visible" : ""}`} />
    </>
  );
}

function ProductLogo({ compact = false }) {
  return (
    <div className={`product-logo ${compact ? "is-compact" : ""}`}>
      <span className="logo-mark">
        <Globe2 size={compact ? 18 : 24} />
      </span>
      <span>
        <strong>Global Availability</strong>
        <em>Globe</em>
      </span>
    </div>
  );
}

function GlobeScene({ markers, activeMarker, onSelectMarker, variant = "hero" }) {
  const initialRotation = useMemo(() => getCenteredRotation(activeMarker?.location || markers[0]?.location || [0, 0]), []);
  const wrapRef = useRef(null);
  const globeRef = useRef(null);
  const overlayRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const rafRef = useRef(0);
  const rotationRafRef = useRef(0);
  const sizeRef = useRef(720);
  const phiRef = useRef(initialRotation.phi);
  const thetaRef = useRef(initialRotation.theta);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const zoneSegmentsRef = useRef(buildReferenceSegments());
  const [size, setSize] = useState(720);

  const graticule = useMemo(() => {
    const lines = [];
    for (let lat = -60; lat <= 60; lat += 15) lines.push(buildParallel(lat));
    for (let lon = -180; lon < 180; lon += 15) lines.push(buildMeridian(lon));
    return lines;
  }, []);

  useEffect(() => {
    let mounted = true;
    loadTimezoneBoundaries().then((segments) => {
      if (mounted) zoneSegmentsRef.current = segments;
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!wrapRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const max = variant === "hero" ? 760 : 650;
      const next = Math.max(320, Math.floor(Math.min(entry.contentRect.width, max)));
      sizeRef.current = next;
      setSize(next);
    });
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [variant]);

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
        dark: 1,
        diffuse: 1.18,
        mapSamples: variant === "hero" ? 54000 : 42000,
        mapBrightness: 6.6,
        mapBaseBrightness: 0.03,
        baseColor: [0.02, 0.13, 0.28],
        markerColor: [1, 0.72, 0.16],
        glowColor: [0.02, 0.28, 0.62],
        markerElevation: MARKER_ELEVATION,
        opacity: 1,
        scale: 1,
        offset: [0, 0],
        markers: markers.map((marker) => ({
          id: `${variant}-${marker.id}`,
          location: marker.location,
          size: marker.size,
          color: marker.markerColor
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
  }, [size, markers, variant]);

  useEffect(() => {
    if (activeMarker) focusMarker(activeMarker, false);
  }, [activeMarker?.id]);

  function focusMarker(marker, notify = true) {
    if (notify) onSelectMarker?.(marker.id);
    cancelAnimationFrame(rotationRafRef.current);

    const target = getCenteredRotation(marker.location);
    const startPhi = phiRef.current;
    const startTheta = thetaRef.current;
    const deltaPhi = normalizeAngle(target.phi - startPhi);
    const deltaTheta = target.theta - startTheta;
    const start = performance.now();
    const duration = 820;

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
      drawGeoLine(ctx, line, phiRef.current, thetaRef.current, displaySize, "rgba(81, 174, 232, 0.28)", 0.78);
    }

    for (const segment of zoneSegmentsRef.current) {
      drawGeoLine(ctx, segment.points, phiRef.current, thetaRef.current, displaySize, getZoneColor(segment), 0.78);
    }

    drawActiveMarkerDot(ctx, displaySize);
  }

  function drawSphereRim(ctx, displaySize) {
    const radius = displaySize * 0.407;
    const center = displaySize / 2;
    const rim = ctx.createRadialGradient(center - radius * 0.25, center - radius * 0.25, radius * 0.2, center, center, radius * 1.08);
    rim.addColorStop(0, "rgba(0, 140, 255, 0)");
    rim.addColorStop(0.72, "rgba(0, 140, 255, 0)");
    rim.addColorStop(0.91, "rgba(0, 140, 255, 0.16)");
    rim.addColorStop(1, "rgba(0, 112, 255, 0.42)");
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(center, center, radius * 1.04, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(90, 169, 255, 0.46)";
    ctx.lineWidth = 1.1;
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
    ctx.arc(projected.x, projected.y, variant === "hero" ? 8 : 7.5, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 184, 41, 0.28)";
    ctx.lineWidth = variant === "hero" ? 14 : 12;
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, variant === "hero" ? 8 : 7.5, 0, TAU);
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

  return (
    <div
      ref={wrapRef}
      className={`globe-wrap globe-wrap-${variant}`}
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
          className={`active-tooltip tooltip-${variant}`}
          style={{
            positionAnchor: `--cobe-${variant}-${activeMarker.id}`
          }}
        >
          <span>{activeMarker.region}</span>
          <strong>{activeMarker.city}</strong>
          <small>
            {activeMarker.localTime} · {formatOffset(activeMarker.offset)}
          </small>
        </div>
      ) : null}
    </div>
  );
}

function IconBubble({ icon: Icon, tone }) {
  return (
    <span className={`icon-bubble tone-${tone}`}>
      <Icon size={20} />
    </span>
  );
}

export default function App() {
  const [activeMarkerId, setActiveMarkerId] = useState("honolulu");

  const markers = useMemo(() => {
    return OFFICE_MARKERS.map((marker) => {
      const offset = getOffsetHours(marker.timeZone, DEMO_NOW);
      const availability = getAvailability(marker, DEMO_NOW);
      return {
        ...marker,
        offset,
        availability,
        localTime: getLocalTime(marker.timeZone, DEMO_NOW)
      };
    }).sort((a, b) => {
      if (a.offset !== b.offset) return a.offset - b.offset;
      return a.city.localeCompare(b.city);
    });
  }, []);

  const activeMarker = useMemo(() => {
    return markers.find((marker) => marker.id === activeMarkerId) || markers[0];
  }, [activeMarkerId, markers]);

  const coverage = useMemo(() => {
    return {
      total: markers.length,
      open: markers.filter((marker) => marker.statusTone === "open").length,
      regions: markers.length
    };
  }, [markers]);

  return (
    <main className="site-shell">
      <CustomCursor />
      <header className="site-header">
        <ProductLogo />
      </header>

      <section className="hero-section" aria-label="Global Availability Globe hero">
        <div className="hero-copy">
          <div className="eyebrow">Interactive WebGL Globe</div>
          <h1>
            Show customers
            <br />
            when and where
            <br />
            your <span>global team</span>
            <br />
            <span>is available</span>
          </h1>
          <p className="lead">
            An interactive globe that visualizes your offices, timezones, local time and team availability in real-time.
          </p>

          <div className="feature-indicators">
            {FEATURE_INDICATORS.map((item) => (
              <div className="mini-feature" key={item.title}>
                <IconBubble icon={item.icon} tone={item.tone} />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
              </div>
            ))}
          </div>

          <div className="hero-actions">
            <a
              className="primary-action"
              href={createMailto(
                `Global Availability Globe: ${activeMarker.city} region`,
                `Hi, I want to discuss a Global Availability Globe project inspired by the ${activeMarker.city} region view.`
              )}
            >
              Contact active region
              <ArrowRight size={17} />
            </a>
            <a className="secondary-action" href="#features">
              Explore features
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <GlobeScene markers={markers} activeMarker={activeMarker} onSelectMarker={setActiveMarkerId} variant="hero" />
        </div>
      </section>

      <section className="stats-strip" aria-label="Global statistics">
        <div className="stat-item">
          <IconBubble icon={Globe2} tone="blue" />
          <strong>{coverage.total}</strong>
          <span>Global nodes</span>
        </div>
        <div className="stat-item">
          <IconBubble icon={Sun} tone="green" />
          <strong>{coverage.open}</strong>
          <span>Available now</span>
        </div>
        <div className="stat-item">
          <IconBubble icon={Sun} tone="yellow" />
          <strong>{coverage.regions}</strong>
          <span>Service regions</span>
        </div>
        <div className="stat-item">
          <IconBubble icon={Users} tone="purple" />
          <strong>24/7</strong>
          <span>Global coverage</span>
        </div>
      </section>

      <section className="dashboard-card" aria-label="Interactive dashboard preview">
        <div className="locations-panel">
          <div className="panel-title">
            <strong>Global Availability</strong>
            <span>
              <i />
              Live
            </span>
          </div>

          <button type="button" className="select-control">
            Sort by timezone
            <span>⌄</span>
          </button>

          <div className="locations-list">
            {markers.map((marker) => (
              <button
                type="button"
                key={marker.id}
                onClick={() => setActiveMarkerId(marker.id)}
                className={`location-row ${activeMarkerId === marker.id ? "is-active" : ""}`}
              >
                <span className="location-main">
                  <span className={`location-dot ${marker.statusTone}`} />
                  <span>
                    <strong>{marker.city}</strong>
                    <small>
                      {formatOffset(marker.offset)} · {marker.region}
                    </small>
                  </span>
                </span>
                <span className="location-time">{marker.localTime}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-globe">
          <GlobeScene markers={markers} activeMarker={activeMarker} onSelectMarker={setActiveMarkerId} variant="demo" />
          <div className="drag-hint">
            <Mouse size={20} />
            Drag to rotate the globe
          </div>
        </div>

        <aside className="active-region-card">
          <div className="section-label">Active region</div>
          <h2>{activeMarker.city}</h2>
          <p>{activeMarker.region}</p>

          <div className="active-meta">
            <div>
              <Clock3 size={15} />
              <span>{activeMarker.localTime}</span>
            </div>
            <div>
              <Globe2 size={15} />
              <span>{formatOffset(activeMarker.offset)}</span>
            </div>
          </div>

          <div className="detail-block">
            <span>Status</span>
            <strong className="available">● {activeMarker.panelStatus || activeMarker.availability.label}</strong>
          </div>

          <div className="detail-block">
            <span>Working hours</span>
            <p>
              {pad(activeMarker.workingHours[0])}:00 - {pad(activeMarker.workingHours[1])}:00 (Local time)
            </p>
          </div>

          <div className="detail-block contact-block">
            <span>Contact</span>
            <a href={createMailto(`Global Availability Globe: contact developer`)}>
              <Mail size={15} />
              {CONTACT_EMAIL}
            </a>
          </div>

          <a
            className="region-action"
            href={createMailto(
              `Global Availability Globe: ${activeMarker.region}`,
              `Hi, I want a similar interactive globe experience for my website. Active region: ${activeMarker.city}, ${activeMarker.region}.`
            )}
          >
            Contact this region
            <ArrowRight size={16} />
          </a>
        </aside>

        <div className="feature-strip" id="features">
          {INTERACTION_FEATURES.map((item) => (
            <div className="strip-item" key={item.title}>
              <IconBubble icon={item.icon} tone={item.tone} />
              <span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-label centered">Business value</div>
        <h2>Why companies use it</h2>
        <div className="business-grid">
          {BUSINESS_CARDS.map((card) => (
            <article className="business-card" key={card.title}>
              <IconBubble icon={card.icon} tone={card.tone} />
              <h3>{card.title}</h3>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section tech-section">
        <div className="section-label centered">Technology stack</div>
        <h2>Built with modern technologies</h2>
        <div className="tech-grid">
          {TECH_CARDS.map((card) => (
            <article className="tech-card" key={`${card.title}-${card.detail || ""}`}>
              <IconBubble icon={card.icon} tone={card.tone} />
              <span>
                <strong>{card.title}</strong>
                {card.detail ? <small>{card.detail}</small> : null}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section use-cases">
        <div className="section-label centered">Perfect for</div>
        <h2>Use cases</h2>
        <div className="use-grid">
          {USE_CASES.map((card) => (
            <article className="use-card" key={card.title}>
              <IconBubble icon={card.icon} tone={card.tone} />
              <span>
                <strong>{card.title}</strong>
                <small>{card.detail}</small>
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <span className="cta-orbit">
          <Globe2 size={54} />
        </span>
        <h2>
          Want something
          <br />
          similar? <span>Contact the developer.</span>
        </h2>
        <p>If you want a premium interactive globe or a custom WebGL section for your website, send a short brief and let’s discuss the build.</p>
        <a
          className="primary-action"
          href={createMailto(
            "I want a similar WebGL globe",
            "Hi, I want something similar to the Global Availability Globe for my website."
          )}
        >
          Contact developer
          <ArrowRight size={17} />
        </a>
      </section>

      <footer className="site-footer">
        <div>
          <ProductLogo compact />
          <p>Interactive. Real-time. Global.</p>
        </div>
        <nav aria-label="Footer links">
          <a href="https://github.com/pavlo-bondarchuk/global-availability-globe" target="_blank" rel="noreferrer">
            <Code2 size={18} />
            View on GitHub
          </a>
          <a href="#top">
            <ExternalLink size={18} />
            Live Demo
          </a>
        </nav>
      </footer>
    </main>
  );
}
